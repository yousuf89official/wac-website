# Deployment Guide — WAC Platform (Vercel monorepo)

This repo is a **monorepo** deployed to **Vercel** (team `wearecollaborative`). Each app is a
separate Vercel **project** that builds from its own **Root Directory** in this one repo. There are
no per-app repos — **branches are environments**: `main` = production, `staging` = staging.

```
repo: wac-website (monorepo; the repo ROOT is the public site)
.              → Vercel project "wac-website"                  → wearecollaborative.net
├── apps/ci      → Vercel project "collaborative-intelligence" → intelligence.wearecollaborative.net
└── apps/backend → Vercel project "wac-backend" (Phase 2)      → app.wearecollaborative.net
packages/ui, packages/db (shared)
```

The public site reads its Postgres **directly** (server components). The backend app
(`apps/backend`, Phase 2) owns auth + customer portal + admin + checkout and issues the shared
`wac-customer-token` JWT (cookie scoped to `.wearecollaborative.net`, so all three surfaces read it).

## 1. Per-project Vercel settings (dashboard — Settings → General)

For **each** project, set:
- **Root Directory**: `.` (repo root → wac-website) · `apps/ci` (collaborative-intelligence) · `apps/backend` (wac-backend).
- **Include files outside the root directory**: **ON** for the nested apps (so `packages/*` are available). The root project already sees everything.
- **Framework Preset**: Next.js. **Node**: 24.x. **Install Command**: default (`npm install`).
- Build runs the app's `postinstall` (`prisma generate`) automatically.

Branch → domain mapping (Settings → Domains / Git):
- `main` → production domains (e.g. `wearecollaborative.net`, `www.…`).
- `staging` branch → `staging.<domain>` (Preview deployment with a stable branch alias).

## 2. Environments & branches

- `staging` branch push → `staging.*` domain, talking only to **staging** peers + the Neon
  **`staging`** branch. `main` push → production domains + Neon **`main`** branch.
- **Never cross environments** (prod site must not call staging APIs or DB, and vice-versa).
- The Neon branch is selected purely by which connection string is set in that Vercel
  environment scope — see §3.

## 3. Environment variables (Vercel → Settings → Environment Variables)

Set per project, scoped **Production** and **Preview** (Preview = the `staging` branch).
See [`apps/wac/.env.example`](.env.example) for the full wac list. Key points:

- `DATABASE_URL` / `DIRECT_URL`: Production scope → Neon `main` branch; Preview scope → Neon
  `staging` branch. (Neon projects: wac-website `restless-feather-64294935`,
  wac-backend `misty-mountain-87002269`, collaborative-intelligence `damp-bar-65324140`.)
- `JWT_SECRET`: **identical** value across all three projects (shared-cookie verification).
- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CI_URL`: the apex / app / intelligence
  URLs for the matching environment (prod vs `staging.*`).
- Secrets (`GOOGLE_GENERATIVE_AI_API_KEY`, `MIDTRANS_*`): set as Vercel env vars — never commit.

## 4. Neon Postgres

- Each app owns its own Neon project. Create a **`staging`** branch in the `wac-website` and
  `wac-backend` Neon projects (collaborative-intelligence already has one), then paste its pooled +
  direct strings into that project's **Preview** `DATABASE_URL` / `DIRECT_URL`.
- Schema: `DATABASE_URL="<neon-direct>" npx prisma db push` from the app dir (no migration history
  today). To preserve existing data from another source, see `apps/wac/scripts/migrate-to-neon.cjs`.

## 5. CI/CD

- Vercel auto-deploys on push: `main` → production, `staging` → preview alias. No manual `vercel`
  needed once Git is connected.
- `.github/workflows/verify.yml` runs a build check on push.
- `apps/ci/vercel.json` defines the cron jobs (sync, reports, alerts, rules) — production only.

## 6. Verify a deploy

```bash
curl https://wearecollaborative.net/api/health             # { ok, env: "production", commit }
curl https://staging.wearecollaborative.net/api/health     # { ok, env: "preview", commit }
```

## ⚠️ Secrets hygiene

A Gemini API key was previously committed in this file in plaintext. It has been removed, but it
**remains in git history** — rotate it in Google AI Studio and store the new value only as a Vercel
env var.
