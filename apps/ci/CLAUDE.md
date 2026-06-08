# Collaborative Intelligence

Enterprise campaign intelligence platform — unified analytics across Google Ads, Meta Ads, TikTok, and more.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL via Prisma ORM (hosted on Neon)
- **Auth**: Delegated to WAC (Phase 4). CI verifies the shared `wac-customer-token` JWT cookie set on `.wearecollaborative.net`; sign-in/sign-up pages live in the WAC app. NextAuth was removed.
- **Styling**: Tailwind CSS + Radix UI + shadcn/ui
- **Deployment**: Vercel (Singapore region)

## Environments

| Environment | Branch | Database | How to run |
|-------------|--------|----------|------------|
| **Local** | any | Neon Postgres (`local` branch) | `npm run dev` |
| **Local (mock)** | any | Mock DB (in-memory) | `npm run dev:mock` |
| **Staging** | `staging` | Neon Postgres (`staging` branch) | `npx vercel` (manual) |
| **Production** | `main` | Neon Postgres (`production` branch) | `npx vercel --prod` (manual) |

### Local Development

```bash
npm run dev                # Starts with Neon local branch (real Postgres)
npm run dev:mock           # Starts with mock DB (no Postgres needed)
```

Master account: `yousuf@wearecollaborative.net` (protected — cannot be deleted or demoted). Credentials are owned by WAC now; sign in via the WAC `/login` page. The CI `User` row is auto-provisioned from the WAC JWT on first access (see `src/lib/session.ts`).

Mock DB is defined in `src/lib/mock-db.ts` with seed data in `src/lib/mock-data.ts`.

### Staging

- Branch: `staging`
- **Manual deploy**: `npx vercel` (from staging branch)
- Uses separate Neon database branch
- Env vars scoped as "Preview" in Vercel dashboard

### Production

- Branch: `main`
- **Manual deploy**: `npx vercel --prod` (from main branch)
- Uses main Neon database
- Env vars scoped as "Production" in Vercel dashboard
- Cron jobs (`/api/sync`, `/api/scheduled-reports/send`) only run in production

## Environment Variables

See `.env.example` for the full list. Key groups:

- **Database**: `DATABASE_POSTGRES_PRISMA_URL`, `DATABASE_URL_UNPOOLED`, `USE_MOCK_DB`
- **Auth**: `JWT_SECRET` (must be IDENTICAL to the WAC project — used to verify the shared customer cookie; falls back to `NEXTAUTH_SECRET`), `NEXT_PUBLIC_WAC_URL`, `NEXT_PUBLIC_CI_URL`
- **Security**: `ENCRYPTION_KEY`, `CRON_SECRET`
- **Integrations**: Google Ads, Meta Ads, Resend (email)

## Database Commands

```bash
npm run db:push            # Push schema to database (no migration history)
npm run db:migrate         # Create and apply migration
npm run db:studio          # Open Prisma Studio GUI
npm run db:seed            # Run seed script
```

## Key Architecture Decisions

- **Row-Level Security (RLS)**: Enforced at the Postgres level. See `prisma/rls-policies.sql`.
- **Mock DB**: Full Prisma-compatible in-memory engine for local dev. Supports CRUD, relations, filtering.
- **Prisma singleton**: `src/lib/prisma.ts` manages a global instance. In dev, it resets on code changes (except mock mode).
- **Auth flow**: WAC issues a `wac-customer-token` JWT on `.wearecollaborative.net` → CI verifies it with `jose` (`src/lib/wac-auth.ts`) → `getCurrentUser` resolves/auto-provisions the CI `User` by `wacCustomerId` (`src/lib/session.ts`) → role-based access. Unauthenticated visitors are bounced to `${NEXT_PUBLIC_WAC_URL}/login?returnTo=…` by `app/page.tsx` and `app/(protected)/layout.tsx`. No CI-side credentials/bcrypt.

## Git Branching

- `main` — Production. Always deployable.
- `staging` — Staging/QA. Merges from feature branches before going to main.
- Feature branches — Branch from `staging`, merge back to `staging`.

## Build

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build   # Local builds need extra memory
```

Vercel handles memory automatically during deployment.

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
