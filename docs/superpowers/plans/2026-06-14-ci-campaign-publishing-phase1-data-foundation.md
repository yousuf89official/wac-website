# CI Campaign Publishing — Phase 1: Data Foundation (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the data + contract foundation for publishing live Meta/TikTok campaigns from CI — the normalized campaign spec, both-level budget guard, the four new Prisma models, and their RLS policies.

**Architecture:** Pure, unit-tested TypeScript building blocks (Zod spec + budget guard) first, then the Prisma schema additions and Postgres RLS policies they will be persisted through. Everything is brand-scoped and inherits CI's existing `UserBrand` RLS model.

**Tech Stack:** Next.js 16, TypeScript, Prisma + PostgreSQL (Neon), Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-14-ci-campaign-publishing-design.md`

---

## Phase roadmap (context)

This is **Phase 1 of 7**. Each phase is its own plan doc and produces independently testable software:

1. **Data foundation** *(this plan)* — spec schema, budget guard, models, RLS.
2. Platform write adapters + sandbox (Meta, then TikTok) — *needs Meta Marketing API + TikTok Business API docs*.
3. Durable publish workflow (Vercel WDK, parallel branches, idempotent steps) — *needs WDK docs*.
4. Agent draft loop (Claude Agent SDK + read-only tools) + draft endpoints.
5. Approval gate, kill-switch, spend-guard rule extension.
6. Lifecycle (pause/resume/budget) + status-sync extension.
7. Builder UI (brief → draft edit → submit → publish status/management).

Phase 1 has **no external API dependency**, so it is fully code-complete here.

---

## File structure (Phase 1)

- Create: `apps/ci/src/lib/campaigns/spec.ts` — Zod `CampaignSpec` schema + inferred type. The single contract the agent emits and the translators consume.
- Create: `apps/ci/src/lib/campaigns/__tests__/spec.test.ts` — spec validation tests.
- Create: `apps/ci/src/lib/campaigns/budget-guard.ts` — pure `validateBudget()` (brand + account caps).
- Create: `apps/ci/src/lib/campaigns/__tests__/budget-guard.test.ts` — budget guard tests.
- Modify: `apps/ci/prisma/schema.prisma` — add `CampaignDraft`, `PublishedObject`, `PublishJob`, `PublishStep`; extend `CampaignIntegration` + back-relations on `Campaign`/`Brand`.
- Modify: `apps/ci/prisma/rls-policies.sql` — RLS for the four new tables.

All paths below are relative to the repo root `/Users/yusuf.noor/Documents/Web Apps/wac-website`.

---

## Task 1: Normalized `CampaignSpec` Zod schema

**Files:**
- Create: `apps/ci/src/lib/campaigns/spec.ts`
- Test: `apps/ci/src/lib/campaigns/__tests__/spec.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// apps/ci/src/lib/campaigns/__tests__/spec.test.ts
import { describe, it, expect } from 'vitest';
import { CampaignSpecSchema } from '../spec';

const valid = {
  objective: 'TRAFFIC',
  platforms: ['meta', 'tiktok'],
  budget: { type: 'daily', amount: 50, currency: 'USD' },
  schedule: { start: '2026-07-01T00:00:00.000Z', end: '2026-07-31T00:00:00.000Z' },
  audience: { geos: ['US'], ageMin: 18, ageMax: 65, genders: ['all'], interests: [] },
  placements: ['feed'],
  creatives: { meta: ['1234567890'], tiktok: ['v-9876'] },
};

describe('CampaignSpecSchema', () => {
  it('accepts a valid spec', () => {
    const parsed = CampaignSpecSchema.parse(valid);
    expect(parsed.platforms).toEqual(['meta', 'tiktok']);
    expect(parsed.budget.amount).toBe(50);
  });

  it('rejects an unknown platform', () => {
    const bad = { ...valid, platforms: ['myspace'] };
    expect(() => CampaignSpecSchema.parse(bad)).toThrow();
  });

  it('rejects a non-positive budget amount', () => {
    const bad = { ...valid, budget: { ...valid.budget, amount: 0 } };
    expect(() => CampaignSpecSchema.parse(bad)).toThrow();
  });

  it('rejects ageMax below ageMin', () => {
    const bad = { ...valid, audience: { ...valid.audience, ageMin: 50, ageMax: 30 } };
    expect(() => CampaignSpecSchema.parse(bad)).toThrow();
  });

  it('requires at least one creative for each selected platform', () => {
    const bad = { ...valid, creatives: { meta: [], tiktok: ['v-9876'] } };
    expect(() => CampaignSpecSchema.parse(bad)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "apps/ci" && npx vitest run src/lib/campaigns/__tests__/spec.test.ts`
Expected: FAIL — `Cannot find module '../spec'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/ci/src/lib/campaigns/spec.ts
import { z } from 'zod';

export const PLATFORMS = ['meta', 'tiktok'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const OBJECTIVES = [
  'AWARENESS',
  'TRAFFIC',
  'ENGAGEMENT',
  'LEADS',
  'SALES',
  'APP_PROMOTION',
] as const;

const BudgetSchema = z.object({
  type: z.enum(['daily', 'lifetime']),
  amount: z.number().positive(),
  currency: z.string().length(3),
});

const AudienceSchema = z
  .object({
    geos: z.array(z.string()).min(1),
    ageMin: z.number().int().min(13).max(65),
    ageMax: z.number().int().min(13).max(65),
    genders: z.array(z.enum(['all', 'male', 'female'])).min(1),
    interests: z.array(z.string()).default([]),
  })
  .refine((a) => a.ageMax >= a.ageMin, {
    message: 'ageMax must be >= ageMin',
    path: ['ageMax'],
  });

export const CampaignSpecSchema = z
  .object({
    objective: z.enum(OBJECTIVES),
    platforms: z.array(z.enum(PLATFORMS)).min(1),
    budget: BudgetSchema,
    schedule: z.object({
      start: z.string().datetime(),
      end: z.string().datetime().optional(),
    }),
    audience: AudienceSchema,
    placements: z.array(z.string()).min(1),
    // Reused platform creative/asset IDs, keyed by platform.
    creatives: z.object({
      meta: z.array(z.string()).default([]),
      tiktok: z.array(z.string()).default([]),
    }),
  })
  .superRefine((spec, ctx) => {
    for (const p of spec.platforms) {
      if ((spec.creatives[p] ?? []).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `at least one creative required for platform "${p}"`,
          path: ['creatives', p],
        });
      }
    }
  });

export type CampaignSpec = z.infer<typeof CampaignSpecSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "apps/ci" && npx vitest run src/lib/campaigns/__tests__/spec.test.ts`
Expected: PASS — 5 passed.

- [ ] **Step 5: Commit**

```bash
git add "apps/ci/src/lib/campaigns/spec.ts" "apps/ci/src/lib/campaigns/__tests__/spec.test.ts"
git commit -m "feat(ci): normalized CampaignSpec zod schema for campaign publishing"
```

---

## Task 2: Both-level budget guard

Pure function validating a spec's budget against **brand** and **account** caps. No I/O — caps are passed in (the account cap is fetched by the adapter layer in Phase 2 and handed here).

**Files:**
- Create: `apps/ci/src/lib/campaigns/budget-guard.ts`
- Test: `apps/ci/src/lib/campaigns/__tests__/budget-guard.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// apps/ci/src/lib/campaigns/__tests__/budget-guard.test.ts
import { describe, it, expect } from 'vitest';
import { validateBudget } from '../budget-guard';

const base = { type: 'daily' as const, amount: 50, currency: 'USD' };

describe('validateBudget', () => {
  it('passes when amount is within both caps', () => {
    const r = validateBudget(base, { brandDailyCap: 100, accountDailyCap: 200 });
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it('fails when over the brand cap', () => {
    const r = validateBudget({ ...base, amount: 150 }, { brandDailyCap: 100, accountDailyCap: 200 });
    expect(r.ok).toBe(false);
    expect(r.violations).toContain('brand');
  });

  it('fails when over the account cap', () => {
    const r = validateBudget({ ...base, amount: 250 }, { brandDailyCap: 1000, accountDailyCap: 200 });
    expect(r.ok).toBe(false);
    expect(r.violations).toContain('account');
  });

  it('reports both when over both caps', () => {
    const r = validateBudget({ ...base, amount: 500 }, { brandDailyCap: 100, accountDailyCap: 200 });
    expect(r.ok).toBe(false);
    expect(r.violations.sort()).toEqual(['account', 'brand']);
  });

  it('treats a null cap as unset (no violation from that level)', () => {
    const r = validateBudget({ ...base, amount: 9999 }, { brandDailyCap: null, accountDailyCap: null });
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "apps/ci" && npx vitest run src/lib/campaigns/__tests__/budget-guard.test.ts`
Expected: FAIL — `Cannot find module '../budget-guard'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// apps/ci/src/lib/campaigns/budget-guard.ts
import type { CampaignSpec } from './spec';

export interface BudgetCaps {
  /** Per-brand daily-equivalent cap in account currency, or null if unset. */
  brandDailyCap: number | null;
  /** Connected ad account daily-equivalent cap in account currency, or null if unset. */
  accountDailyCap: number | null;
}

export interface BudgetCheck {
  ok: boolean;
  violations: Array<'brand' | 'account'>;
}

/**
 * Validate a campaign budget against both the brand cap and the connected
 * account cap. A null cap means "no limit configured at that level".
 * Lifetime budgets are compared directly against the (lifetime-equivalent) caps
 * the caller supplies; the caller is responsible for passing comparable units.
 */
export function validateBudget(
  budget: CampaignSpec['budget'],
  caps: BudgetCaps,
): BudgetCheck {
  const violations: Array<'brand' | 'account'> = [];
  if (caps.brandDailyCap != null && budget.amount > caps.brandDailyCap) {
    violations.push('brand');
  }
  if (caps.accountDailyCap != null && budget.amount > caps.accountDailyCap) {
    violations.push('account');
  }
  return { ok: violations.length === 0, violations };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "apps/ci" && npx vitest run src/lib/campaigns/__tests__/budget-guard.test.ts`
Expected: PASS — 5 passed.

- [ ] **Step 5: Commit**

```bash
git add "apps/ci/src/lib/campaigns/budget-guard.ts" "apps/ci/src/lib/campaigns/__tests__/budget-guard.test.ts"
git commit -m "feat(ci): both-level (brand+account) budget guard"
```

---

## Task 3: Prisma models + CampaignIntegration extension

Add the four publishing models and extend `CampaignIntegration`. Follow existing conventions: `String @id @default(cuid())`, String status fields (not Prisma enums), `Json` for blobs, `createdAt/updatedAt`, brand/campaign back-relations.

**Files:**
- Modify: `apps/ci/prisma/schema.prisma`

- [ ] **Step 1: Extend `CampaignIntegration`**

In `apps/ci/prisma/schema.prisma`, inside `model CampaignIntegration { ... }`, add these two fields (after `lastSyncedAt`) and one back-relation:

```prisma
  publishState     String?   // null | publishing | published | partial | failed
  lastPublishError String?
  publishedObjects PublishedObject[]
```

- [ ] **Step 2: Add the four new models**

Append to `apps/ci/prisma/schema.prisma`:

```prisma
// ── Campaign publishing (Meta + TikTok) ───────────────────────────────

model CampaignDraft {
  id            String   @id @default(cuid())
  campaignId    String
  brandId       String
  status        String   @default("drafting") // drafting | ready | approved | publishing | published | failed
  objective     String?
  spec          Json     // normalized CampaignSpec
  platformSpecs Json?    // resolved per-platform payloads (filled in Phase 2/3)
  createdByAgent Boolean @default(false)
  agentThreadRef String?
  createdBy     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  campaign      Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  brand         Brand    @relation(fields: [brandId], references: [id])
  publishJobs   PublishJob[]

  @@index([campaignId])
  @@index([brandId])
}

model PublishedObject {
  id                    String   @id @default(cuid())
  campaignIntegrationId String
  platform              String   // meta | tiktok
  objectType            String   // campaign | adset | ad | creative
  externalId            String
  parentExternalId      String?
  status                String   @default("PAUSED")
  raw                   Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  campaignIntegration   CampaignIntegration @relation(fields: [campaignIntegrationId], references: [id], onDelete: Cascade)

  @@index([campaignIntegrationId])
  @@index([platform, objectType])
}

model PublishJob {
  id              String   @id @default(cuid())
  campaignDraftId String
  status          String   @default("queued") // queued | running | succeeded | partial | failed | rolled_back
  workflowRunId   String?
  error           String?
  startedAt       DateTime?
  finishedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  draft           CampaignDraft @relation(fields: [campaignDraftId], references: [id], onDelete: Cascade)
  steps           PublishStep[]

  @@index([campaignDraftId])
}

model PublishStep {
  id         String   @id @default(cuid())
  jobId      String
  platform   String   // meta | tiktok
  step       String   // resolvePayload | createCampaign | createAdSet | createAd | verify | activate | finalize
  objectType String?  // campaign | adset | ad | creative
  status     String   @default("pending") // pending | running | done | failed | skipped
  externalId String?  // idempotency key — set once the object exists
  request    Json?
  response   Json?
  error      String?
  attempts   Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  job        PublishJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@index([jobId])
  @@index([jobId, platform, step])
}
```

- [ ] **Step 3: Add back-relations on `Campaign` and `Brand`**

In `model Campaign { ... }`, add to the relations block:

```prisma
  drafts            CampaignDraft[]
```

In `model Brand { ... }`, add to the relations block:

```prisma
  campaignDrafts    CampaignDraft[]
```

- [ ] **Step 4: Validate the schema**

Run: `cd "apps/ci" && npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 5: Create the migration and regenerate the client**

Run: `cd "apps/ci" && npx prisma migrate dev --name campaign_publishing`
Expected: migration created and applied; `✔ Generated Prisma Client`.
(If the environment has no migration history / shadow DB, fall back to `npx prisma db push` — confirm with the repo owner which the team uses before running against a shared DB.)

- [ ] **Step 6: Verify the new model delegates compile**

Create a throwaway type-check file `apps/ci/src/lib/campaigns/__typecheck__.ts`:

```ts
import { prisma } from '@/lib/prisma';
// Compile-time only: assert the new delegates exist.
export type _Drafts = Awaited<ReturnType<typeof prisma.campaignDraft.findMany>>;
export type _Objs = Awaited<ReturnType<typeof prisma.publishedObject.findMany>>;
export type _Jobs = Awaited<ReturnType<typeof prisma.publishJob.findMany>>;
export type _Steps = Awaited<ReturnType<typeof prisma.publishStep.findMany>>;
```

Run: `cd "apps/ci" && npx tsc --noEmit`
Expected: no errors referencing `campaignDraft`/`publishedObject`/`publishJob`/`publishStep`.
Then delete the throwaway file: `rm "apps/ci/src/lib/campaigns/__typecheck__.ts"`

- [ ] **Step 7: Commit**

```bash
git add "apps/ci/prisma/schema.prisma" "apps/ci/prisma/migrations"
git commit -m "feat(ci): add CampaignDraft/PublishedObject/PublishJob/PublishStep models"
```

---

## Task 4: RLS policies for the new tables

Mirror the existing `Integration` policy style (admin OR owner/admin of the brand). Brand-scoped tables (`CampaignDraft`) check `UserBrand` directly; child tables (`PublishedObject`, `PublishJob`, `PublishStep`) inherit access by joining up to a brand.

**Files:**
- Modify: `apps/ci/prisma/rls-policies.sql`

- [ ] **Step 1: Append the policies**

Append to `apps/ci/prisma/rls-policies.sql`:

```sql
-- ============================================================
-- CAMPAIGN PUBLISHING TABLES
-- ============================================================

-- CampaignDraft — brand-scoped (owner/admin only, like Integration)
ALTER TABLE "CampaignDraft" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_drafts_all" ON "CampaignDraft" FOR ALL
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "CampaignDraft"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin')
    )
  );

-- PublishJob — inherit access through its draft's brand
ALTER TABLE "PublishJob" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publish_jobs_all" ON "PublishJob" FOR ALL
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "CampaignDraft" d
      JOIN "UserBrand" ub ON ub."brandId" = d."brandId"
      WHERE d."id" = "PublishJob"."campaignDraftId"
      AND ub."userId" = current_app_user_id()
      AND ub."role" IN ('owner', 'admin')
    )
  );

-- PublishStep — inherit access through its job → draft → brand
ALTER TABLE "PublishStep" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publish_steps_all" ON "PublishStep" FOR ALL
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "PublishJob" j
      JOIN "CampaignDraft" d ON d."id" = j."campaignDraftId"
      JOIN "UserBrand" ub ON ub."brandId" = d."brandId"
      WHERE j."id" = "PublishStep"."jobId"
      AND ub."userId" = current_app_user_id()
      AND ub."role" IN ('owner', 'admin')
    )
  );

-- PublishedObject — inherit access through CampaignIntegration → Campaign → brand
ALTER TABLE "PublishedObject" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published_objects_all" ON "PublishedObject" FOR ALL
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "CampaignIntegration" ci
      JOIN "Campaign" c ON c."id" = ci."campaignId"
      JOIN "UserBrand" ub ON ub."brandId" = c."brandId"
      WHERE ci."id" = "PublishedObject"."campaignIntegrationId"
      AND ub."userId" = current_app_user_id()
      AND ub."role" IN ('owner', 'admin')
    )
  );
```

- [ ] **Step 2: Apply the policies to the database**

Run (uses the unpooled URL like other admin SQL):
`cd "apps/ci" && psql "$DATABASE_URL_UNPOOLED" -f prisma/rls-policies.sql`
Expected: `ALTER TABLE` + `CREATE POLICY` lines, no errors.
(If `rls-policies.sql` is not idempotent and re-running errors on existing policies, only run the appended block, or wrap new policies with `DROP POLICY IF EXISTS` first — match whatever convention the existing file uses.)

- [ ] **Step 3: Verify RLS is enabled on the new tables**

Run:
`cd "apps/ci" && psql "$DATABASE_URL_UNPOOLED" -c "SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('CampaignDraft','PublishedObject','PublishJob','PublishStep');"`
Expected: all four rows show `relrowsecurity = t`.

- [ ] **Step 4: Commit**

```bash
git add "apps/ci/prisma/rls-policies.sql"
git commit -m "feat(ci): RLS policies for campaign publishing tables"
```

---

## Task 5: Phase 1 verification gate

- [ ] **Step 1: Run the full CI test suite**

Run: `cd "apps/ci" && npm test`
Expected: all suites pass, including the two new files (`spec.test.ts`, `budget-guard.test.ts`).

- [ ] **Step 2: Typecheck the app**

Run: `cd "apps/ci" && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Confirm clean tree**

Run: `git status -s`
Expected: clean (all Phase 1 changes committed; the throwaway typecheck file deleted).

---

## Self-review (completed by plan author)

- **Spec coverage (Phase 1 portion):** §4 data model → Tasks 3–4; §2/§7 both-level budget caps → Task 2; the normalized `spec` referenced across §3/§5/§6 → Task 1. Adapters/workflow/agent/safety-runtime/lifecycle/UI are explicitly deferred to Phases 2–7.
- **Placeholders:** none — every code/test/SQL step is concrete.
- **Type consistency:** `CampaignSpec` (Task 1) is consumed by `validateBudget` (Task 2); model/field names in Tasks 3–4 match (`CampaignDraft`, `PublishedObject`, `PublishJob`, `PublishStep`, `campaignIntegrationId`, `campaignDraftId`, `jobId`).
- **Note for executor:** Tasks 3 step 5 (migrate vs push) and Task 4 step 2 (psql apply) touch a shared database — confirm the team's workflow before running against anything other than a local/dev DB.
