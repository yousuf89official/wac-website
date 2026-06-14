# CI Campaign Publishing — Meta + TikTok (Design Spec)

**Date:** 2026-06-14
**App:** `apps/ci` (Collaborative Intelligence)
**Status:** Approved design — ready for implementation planning
**Author:** Yusuf Noor (with Claude)

## 1. Summary

Add a **write/publish path** to CI so users can create, launch, and manage live ad
campaigns on **Meta** (Facebook/Instagram) and **TikTok** directly from CI, using the
newly approved Marketing APIs.

The v1 loop is **agent proposes → human approves → durable system executes**:

> An AI agent drafts a campaign from a natural-language brief, reusing creatives that
> already exist in the connected ad account. An owner/admin approves it through CI's
> existing approval workflow. CI then publishes it live to Meta + TikTok with real
> budget via a durable, resumable workflow.

This is an **extension**, not a greenfield build: CI already has OAuth connect flows,
encrypted token storage, the `Integration` / `CampaignIntegration` mapping, read-only
metric sync adapters, the approval workflow, and the Claude Agent SDK. The genuinely
new work is the write path and the agent draft loop.

## 2. Scope (decided)

| Decision | Choice |
|----------|--------|
| v1 capability | **Full launch** — build campaign → ad set/group → ad → creative and publish LIVE with real spend |
| Build UX | **AI agent-driven** — NL brief → agent proposes a full structured draft; user edits/approves |
| Creatives | **Reuse platform assets only** — pull existing creatives from connected accounts (no upload, no AI generation in v1) |
| Launch gate | **Reuse approval workflow** — owner/admin approval required before any publish |
| Execution | **Approach B — durable workflow** (Vercel Workflow DevKit) with checkpointed, retryable, resumable steps |
| Activation | **Per-platform independent** — a TikTok failure never blocks a valid Meta launch (`partial` job state) |
| Budget caps | Enforced at **both brand level and account level** |

### Out of scope for v1 (YAGNI)
- Creative upload or AI creative generation (reuse-only).
- Google Ads **write** (read-only integration stays as-is).
- Multiple ad sets per platform in the agent's first pass (single ad set/group; multi can follow).
- Agent driving the publish/spend directly (agent is read-only; it only proposes).

## 3. Architecture

The safe loop — the agent never spends; it only drafts.

```
NL brief ─▶ Campaign Agent (Claude Agent SDK, read-only tools)
            └─▶ CampaignDraft (editable spec, DB)
                 └─▶ Approval (existing approvalStatus / approval-workflow)
                      └─▶ Publish Workflow (durable, Vercel WDK)
                           └─▶ Platform Write Adapters (Meta, TikTok)
                                └─▶ External objects (PAUSED ─▶ ACTIVE) + IDs stored
                                     └─▶ Status/metric sync (existing syncEngine, extended)
```

**Reused as-is**
- `Integration` (AES-256-GCM encrypted OAuth tokens) — `apps/ci/src/lib/encryption.ts`
- OAuth connect/exchange/status/accounts flows — `apps/ci/src/lib/services/{metaAds,tiktokAds}Service.ts`
- `Campaign` / `SubCampaign` / `CampaignIntegration` models — `apps/ci/prisma/schema.prisma`
- Approval workflow — `Campaign.approvalStatus`, `/admin/approval-workflow`
- Spend-guard engine — `CampaignAlert` / `CampaignRule` / `RuleExecution`
- Read metric sync — `apps/ci/src/lib/services/syncEngine.ts` + per-platform adapters
- Vercel Cron — `apps/ci/vercel.json`
- Multi-tenancy — Postgres RLS via `UserBrand` (`apps/ci/prisma/rls-policies.sql`)

**New**
- Models: `CampaignDraft`, `PublishedObject`, `PublishJob`, `PublishStep`
- Adapter **write** methods (Meta, TikTok)
- Durable publish workflow (Vercel WDK)
- `CampaignAgentService` + read-only agent tools
- Campaign builder UI (brief → draft review/edit → submit → publish status)

## 4. Data model (Prisma additions)

### `CampaignDraft`
Holds the rich, iterable spec off the live `Campaign`.
```
id, campaignId (FK), brandId,
status: drafting | ready | approved | publishing | published | failed,
objective,
spec: Json,           // normalized cross-platform: budget + caps, schedule, audience,
                      // placements, platforms[], selected creative IDs
platformSpecs: Json,  // resolved per-platform payloads (meta, tiktok)
createdByAgent: bool, agentThreadRef, createdBy (userId),
createdAt, updatedAt
```

### `PublishedObject`
One row per created platform object — drives status sync, pause/resume, rollback.
```
id, campaignIntegrationId (FK), platform,
objectType: campaign | adset | ad | creative,
externalId, parentExternalId, status, raw: Json,
createdAt, updatedAt
```

### `PublishJob`
```
id, campaignDraftId (FK),
status: queued | running | succeeded | partial | failed | rolled_back,
workflowRunId, error, startedAt, finishedAt
```

### `PublishStep`
Durable audit **and** idempotency key — a retried step that already has an `externalId`
skips re-creation (no duplicate spend).
```
id, jobId (FK), platform, step, objectType, status,
externalId, request: Json, response: Json, error, attempts
```

### `CampaignIntegration` (extend)
Keep `externalCampaignId`, `externalName`, `isActive`, `lastSyncedAt`; add
`publishState`, `lastPublishError`. Detailed hierarchy lives in `PublishedObject`.

All new tables are brand-scoped and inherit RLS via their `brandId` / campaign join.

## 5. Agent draft loop

`CampaignAgentService` on `@anthropic-ai/claude-agent-sdk` (already a dependency).

- **Input:** NL brief + brandId + chosen platforms + budget guardrails.
- **Tools (strictly read-only — cannot spend):**
  - list ad accounts (currency, spend cap)
  - **list existing creatives/assets** (Meta page posts / image / video creatives; TikTok videos + identities)
  - list / search targeting options (Meta Targeting Search; TikTok targeting)
  - optional reach/audience estimate
- **Output:** a **Zod-validated** `CampaignDraft.spec` — objective, budget (daily/lifetime + caps), schedule, audience, placements, selected creative IDs per platform.
- User reviews/edits the draft in pre-filled structured forms, then marks **ready**.
- The agent has **no** access to write/spend endpoints by construction.

## 6. Publish flow (durable workflow)

Trigger: approval granted → create `PublishJob` → start WDK workflow with `campaignDraftId`.
**Meta and TikTok run as parallel, independently-atomic branches.**

Per branch:
1. `resolvePayload` — normalized spec → platform payload; validate; refresh token if needed (`refreshTokenIfNeeded`).
2. `createCampaign` **(PAUSED)** → record `PublishedObject` + `PublishStep`.
3. `createAdSet` / `createAdGroup` **(PAUSED)** — budget, targeting, schedule.
4. `createAd(s)` — referencing the **reused** creative IDs.
5. `verify` — read objects back; confirm platform review state.
6. `activate` — flip to ACTIVE. **Only step that starts spend; last and isolated.**
7. `finalize` (per branch) — record the link and kick a metric sync for that platform. Once all branches settle, the job is `succeeded` (all activated), `partial` (some activated), or `failed` (none); `Campaign` is marked active if **any** branch activated.

**Key invariant:** everything is created PAUSED and activated last, so any failure before
step 6 spends nothing.

**Idempotency:** each step checks `PublishStep` for an existing `externalId` before
creating; retries resume without duplication.

## 7. Approval gate & safety (real money)

- Publish workflow **cannot start** until `Campaign.approvalStatus = approved` by an
  owner/admin (RLS already restricts integration access to owner/admin).
- **Budget caps enforced at BOTH levels** before publish:
  - **Brand level** — a configurable per-brand cap (new brand setting).
  - **Account level** — validated against the connected ad account's currency/spend cap.
  - Publish is rejected if the draft's daily/lifetime budget exceeds either; platform
    spend caps are also set on the created objects.
- **Kill-switch:** one `pauseAll(campaignId)` path flips every `PublishedObject` to
  PAUSED across both platforms.
- **Auto spend-guard:** extend the existing `CampaignRule` / alert engine to auto-pause
  on spend-threshold breaches.
- **Feature flag** `CAMPAIGN_PUBLISH_ENABLED` + sandbox toggles for staged rollout.
- Full audit: `PublishStep` stores request/response; `ActivityLog` entries on publish/activate/pause.

## 8. Lifecycle management & status sync

- Extend each adapter beyond `fetchCampaignMetrics` with `fetchObjectStatus`,
  `setStatus(PAUSE|ACTIVE)`, `updateBudget`.
- Pause/resume/budget edits are **single direct calls** (no workflow needed).
- The daily `/api/sync` cron also reconciles CI ↔ platform status.
- Metrics keep flowing into the existing `Metric` model and dashboards unchanged.

## 9. Error handling & rollback

- Step-level retry with backoff (WDK native); idempotent via `PublishStep.externalId`.
- **Per-platform independence:** a TikTok failure never holds a valid Meta launch hostage
  — job status = `partial`, surfaced clearly in the UI.
- **Discard/rollback:** a branch that fails before `activate` can delete its PAUSED
  objects (zero spend occurred), driven precisely by `PublishStep`.
- Platform error codes normalized → friendly messages, stored on `PublishStep` + `ActivityLog`.

## 10. Testing

- **Unit:** spec→payload translators (golden fixtures per platform), Zod validation,
  idempotency/resume logic, both-level budget-cap checks.
- **Sandbox adapters:** Meta sandbox ad accounts + TikTok sandbox — create/activate with
  **no real spend**.
- **Workflow:** inject step failures → assert resume, no duplicates, no activation-on-failure.
- **Safety:** budget-cap rejection (brand + account), kill-switch pauses all, approval
  gate blocks unapproved publish.
- **E2E (sandbox):** brief → draft → approve → publish → objects PAUSED → activate → sync.

## 11. New API surface

```
POST   /api/campaigns/draft                 # agent: brief -> draft
GET    /api/campaigns/draft/[id]            # review
PUT    /api/campaigns/draft/[id]            # edit
POST   /api/campaigns/draft/[id]/submit     # -> approval
POST   /api/campaigns/[id]/publish          # approval-gated -> start workflow
GET    /api/campaigns/[id]/publish-status   # job + steps
POST   /api/campaigns/[id]/pause            # lifecycle
POST   /api/campaigns/[id]/resume
POST   /api/campaigns/[id]/budget
POST   /api/campaigns/[id]/kill             # kill-switch
GET    /api/integrations/meta-ads/creatives # agent read tool
GET    /api/integrations/meta-ads/targeting
GET    /api/integrations/tiktok-ads/creatives
GET    /api/integrations/tiktok-ads/targeting
```

Env (already stubbed in `apps/ci/.env.example`): `META_APP_ID/SECRET`,
`TIKTOK_ADS_APP_ID/SECRET`. Add: `META_API_VERSION`, `TIKTOK_API_VERSION`,
`CAMPAIGN_PUBLISH_ENABLED`, sandbox toggles, and WDK config.

## 12. Build sequence (high level)

1. Schema + migration (`CampaignDraft`, `PublishedObject`, `PublishJob`, `PublishStep`, `CampaignIntegration` fields) + RLS policies.
2. Adapter write methods + sandbox wiring (Meta, then TikTok).
3. Spec→payload translators + Zod schema + both-level budget-cap validation.
4. Durable publish workflow (parallel branches, idempotent steps, per-platform activate).
5. Agent service + read-only tools + draft endpoints.
6. Approval integration + kill-switch + spend-guard rule extension.
7. Lifecycle (pause/resume/budget) + status-sync extension.
8. Builder UI (brief → draft edit → submit → publish status/management).
9. Tests at each layer (unit → sandbox adapter → workflow → E2E).

## 13. Open questions / future
- Per-brand budget cap storage — reuse `Brand.pricingModel` Json or a dedicated setting? (resolve in plan)
- WDK vs Inngest final pick — WDK preferred (Vercel-native, Next 16); confirm at implementation.
- Multi-ad-set / A-B creative testing — post-v1.
- Google Ads write parity — post-v1.
