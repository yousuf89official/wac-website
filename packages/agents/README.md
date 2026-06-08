# @wac/agents

The **WAC ecosystem agent team** — a roster of specialized Claude agents built on the
[`@anthropic-ai/claude-agent-sdk`](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk).
**Everyone reports to JARVIS**, the coordinator, who delegates work by domain and tier.

This package is shared across the whole monorepo (public site at the root, `apps/ci`, and the
future `apps/backend`) so there is one team, one org chart, one source of truth.

## Org chart

```
                              JARVIS  (Coordinator — never codes; delegates)
                                 │  spawns read-only sub-agents:
                                 │  code-auditor · ui-inspector · db-analyst · security-scanner · feature-planner
   ┌───────────────┬────────────┼─────────────────┬───────────────────────────┐
   │ cross-cutting │ public site│  backend app     │  Collaborative Intelligence│
   ├───────────────┼────────────┼─────────────────┼───────────────────────────┤
   │ NEON  (db)    │ EDITH (SEO)│ SHIELD (auth)    │ VISION   (analytics)       │
   │ SENTINEL (sec)│ FRIDAY (FE)│ STARK  (full-stk)│ HAWKEYE  (integrations)    │
   │ SCRIBE (QA/doc)│           │ PEPPER (billing) │ COMMANDER(campaign LC)     │
   │               │            │                  │ AUTOPILOT(rules engine)    │
   │               │            │                  │ ALLOCATOR(budget)          │
   └───────────────┴────────────┴─────────────────┴───────────────────────────┘
```

| Agent | Role | Tier | Model |
|-------|------|------|-------|
| **JARVIS** | Lead Project Manager (orchestrator) | ecosystem | Opus |
| NEON | Database & migrations | ecosystem | Opus |
| SENTINEL | Security & DevOps | ecosystem | Sonnet |
| SCRIBE | QA, build verification & docs | ecosystem | Sonnet |
| EDITH | SEO / marketing-site | public | Opus |
| FRIDAY | Frontend | public | Sonnet |
| SHIELD | Auth & backend identity | backend | Opus |
| STARK | Full-stack engineering | backend | Opus |
| PEPPER | Revenue & billing | backend | Opus |
| VISION | Data & analytics | ci | Opus |
| HAWKEYE | Ad-platform integrations | ci | Sonnet |
| COMMANDER | Campaign lifecycle | ci | Opus |
| AUTOPILOT | Rules engine | ci | Opus |
| ALLOCATOR | Budget intelligence | ci | Opus |

## Usage

```ts
import { askJarvis, askEdith } from "@wac/agents";

// Orchestrate: JARVIS breaks the task down and delegates to specialists.
const summary = await askJarvis("Audit the checkout flow end-to-end and delegate fixes.");

// Or call a specialist directly.
const report = await askEdith("Verify every public page has a canonical URL + BreadcrumbList JSON-LD.");
```

Every agent exposes `run*` (streams SDK messages) and `ask*` (resolves the final text).
Runs need `ANTHROPIC_API_KEY` in the environment and execute against `process.cwd()` by default
(override with `{ cwd }`). Turn and budget caps default per-agent and are overridable per call.

The org chart is pure data in [`registry.ts`](./src/registry.ts) — import `@wac/agents/registry`
to render the team in a UI **without** pulling the SDK.

## Adding an agent

1. Create `src/agents/<name>.ts` using `defineAgent({ … })` from [`runtime.ts`](./src/runtime.ts).
2. Export `run<Name>` / `ask<Name>`.
3. Add it to `src/index.ts` and to `AGENT_CATALOG` in `src/registry.ts` (with `reportsTo: "jarvis"`).
4. List it under the matching domain in JARVIS's system prompt so it gets delegated to.

## Wiring

Consumed via the tsconfig path alias `@wac/agents` and Next.js `transpilePackages` in each app
(root `next.config.mjs`, `apps/ci/next.config.js`). `apps/ci/src/agents/*` are thin re-export
shims kept for backwards compatibility.
