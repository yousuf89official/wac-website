# Backlog

> ⚠️ The sections from "🚦 Pre-Launch Checklist" downward predate the 2026-06 restructure
> (they assume `apps/wac` root + Supabase + pre-extraction). Treat the **Active Backlog**
> below as the source of truth; mine the older sections for still-valid cleanup items only.

---

## 📍 ACTIVE BACKLOG — as of 2026-06-08

**Where things stand:** Public marketing site is **LIVE** on `wearecollaborative.net`
(Vercel prod, commit `7cfd3d0`, reading **Neon**). Repo root = public site (marketing-only);
`apps/backend` (auth/dashboard/admin/checkout) and `apps/ci` (Collaborative Intelligence)
are extracted but **not deployed**. Auth/checkout CTAs on the public site are **hidden** until
the backend ships. Vercel auto-deploys are OFF (manual `vercel --prod` only). Work lives on
branch `restructure/phase1-public-front-seo-routing` (NOT merged to `main`).

### 🔴 P0 — blocking the next phase
- **Deploy the backend** → `app.wearecollaborative.net` (Vercel project `wac-backend`, Root Dir `apps/backend`).
  Env: `DATABASE_URL`/`DIRECT_URL` = WAC Neon (`ep-fancy-star`), `JWT_SECRET` (shared), `MIDTRANS_*`,
  `GOOGLE_GENERATIVE_AI_API_KEY`, `COOKIE_DOMAIN=.wearecollaborative.net`. Map domain + DNS.
- **Re-enable the public-site auth/checkout CTAs once backend is live:** set prod
  `NEXT_PUBLIC_APP_URL=https://app.wearecollaborative.net`; un-hide header Login/Register +
  Portal menu (Header.tsx); repoint "Get Started"/"Enroll Now" from `/#contact` back to
  `checkoutUrl(...)` (PackagesTriptych.tsx, academy/[slug]/page.tsx).
- **Real `JWT_SECRET` in production**, identical across public/backend/ci (currently the dev
  placeholder `dev-jwt-secret-change-in-production`).
- **Rotate the Gemini API key** — it's in DEPLOY.md git history (commit b38f853-era). Still not rotated.

### 🟠 P1 — important
- **CI master/admin can't access CI:** admin login issues `wac-auth-token` (host-only), but CI
  reads `wac-customer-token`. The master account `yousuf@wearecollaborative.net` can't SSO into CI.
  Fix `/api/customer/login` to also issue the customer token for admin/master. (Customer login works.)
- **Deploy CI** → `intelligence.wearecollaborative.net` (project `collaborative-intelligence`).
  Apply the `User.wacCustomerId` column to CI's **production** Neon branch (only the dev branch got
  `prisma db push` this session). The `@wac/ui` ThemeProvider fix is already committed.
- **Vercel Preview env scope (wac-website) is missing `DATABASE_URL`/`DIRECT_URL`** → preview/branch
  deploys fail at static-gen. Add the Neon vars to Preview scope (or "All Environments").
- **Supabase decommission decision:** prod is on Neon now; Supabase is a divergent one-time-copy
  backup. Decide to decommission or keep warm. (`.env.supabase.bak` rollback files kept locally, gitignored.)
- **Merge `restructure/phase1-public-front-seo-routing` → `main`** so `main` reflects what's live.

### 🟡 P2 — public-site polish (deferred from launch)
- **#contact lead form:** the hidden CTAs now point to `/#contact` — confirm that section has a real
  working lead form posting to `POST /api/leads` (old B-2 flagged the homepage lost its contact funnel).
- **Footer dead links:** Privacy Policy + Terms of Service are `href="#"` — build the pages or remove.
- **Harden remaining marketing pages' direct Prisma reads** against DB cold-starts (only the root
  layout `generateMetadata` was wrapped this session; see old B-5 for the `cache()` half).
- Social X handle mismatch (`wearecollab` vs `wearecollaborative`); placeholder phone in structured-data (B-16).

### 🟢 P3 — architecture / tech-debt
- `@wac/agents` is definitions-only (JARVIS + 13 specialists) — expose agent API routes if/when used.
- Extract `packages/db` (`@wac/db`) shared Prisma client (Phase-2 plan); both WAC apps import it.
- No tests yet — API route + E2E funnel tests.
- Email integration (password-reset, order-confirmation) — `TODO` markers in code.
- Older code-review items **B-11…B-20** below (component dedup, indexes, cookie `Secure`) mostly still valid.

---

## 🚦 Pre-Launch Checklist (Intelligence integration — ops you must do before deploy)

Architecture decision (locked in 2026-06-05):
- `wearecollaborative.net/intelligence` → WAC marketing landing for the Intelligence product (indexed, SEO surface)
- `intelligence.wearecollaborative.net/` → CI product dashboard (NOT indexed, separate Vercel project)
- Two databases (WAC = Supabase, CI = Neon), cross-app communication via API calls
- Shared `.wearecollaborative.net` cookie for SSO once Phase 4 ships
- Each app develops/builds/deploys independently from `apps/wac/` and `apps/ci/`

### L-1 · Set up the CI Vercel project
- Create new Vercel project pointed at the SAME Git repo
- **Root Directory** → `apps/ci`
- Domain: `intelligence.wearecollaborative.net`
- Build command: `next build` (default)
- Install command: `npm install --legacy-peer-deps` (react-simple-maps peer-dep conflict)

### L-2 · Update the WAC Vercel project
- Change **Root Directory** → `apps/wac` (was the repo root pre-monorepo)
- Domain stays: `wearecollaborative.net`

### L-3 · DNS (Hostinger)
- Add CNAME / A record: `intelligence.wearecollaborative.net` → `cname.vercel-dns.com`
- TLS issued automatically by Vercel

### L-4 · Env vars in WAC Vercel project
- `NEXT_PUBLIC_CI_URL=https://intelligence.wearecollaborative.net` — referenced by WAC's `/intelligence` page CTAs and (in Phase 4) the SSO bounce
- All existing WAC env vars stay
- (Phase 4) `JWT_SECRET` must match the value in the CI project

### L-5 · Env vars in CI Vercel project
- All existing CI env vars (Neon Postgres, NextAuth, Encryption Key, Cron Secret, Google/Meta/TikTok OAuth) stay
- `NEXTAUTH_URL=https://intelligence.wearecollaborative.net` (canonical login URL)
- (Phase 4) `JWT_SECRET` shared with WAC
- (Phase 4) Update Google/Meta/TikTok OAuth callback whitelists to include `https://intelligence.wearecollaborative.net/api/auth/callback/...`

### L-6 · SEO underlay isolation (CI subdomain)
- Decision: do NOT index `intelligence.wearecollaborative.net` (the subdomain) since the marketing surface lives on the apex
- Implementation: `X-Robots-Tag: noindex, nofollow` middleware response header on the CI subdomain — already added in code via Phase 3 changes
- Also: ensure CI's `robots.txt` disallows all (file does not exist by default in CI; add if needed pre-launch)

### L-7 · Smoke test pre-launch
- `wearecollaborative.net/intelligence` — marketing landing renders, all 7 sections, SoftwareApplication + BreadcrumbList JSON-LD, sienna palette
- Click "Sign in to dashboard" CTA — bounces to `intelligence.wearecollaborative.net/`
- (Pre-Phase 4) NextAuth login flow works on CI
- (Post-Phase 4) WAC-logged-in customer hits CI subdomain — auto-provisioned + dashboard renders

### L-8 · `react-simple-maps` peer-dep
- CI install requires `--legacy-peer-deps` (declared in `apps/ci/.npmrc`). Vercel honors per-app `.npmrc`. Confirm Vercel uses it; otherwise set the install command explicitly.

### L-9 · Rate-limit at scale
- WAC's `lib/rate-limit.ts` is in-memory per-instance. Behind Vercel's serverless scaling, each cold lambda has its own counter. Acceptable for v1; backed by Redis (Upstash) for production-grade.

---

# Code-review backlog — Editorial Luxe revamp (2026-06-05)

Findings from `/code-review` after the Editorial Luxe revamp (Phases A–H). Ordered by severity; correctness/security outrank cleanup.

## P0 — Active product regressions

### B-1 · Homepage primary CTA dead-ends
- **File:** [components/marketing/editorial/CTAFinale.tsx:57](components/marketing/editorial/CTAFinale.tsx#L57)
- "Schedule a strategy call" links to `/checkout` with no `courseId`. `app/(marketing)/checkout/page.tsx` requires `courseId` and silently redirects to `/academy`.
- **Fix:** point the CTA at a real lead-capture surface (new `/contact` page, or a Calendly link, or a `mailto:`).

### B-2 · Homepage rewrite removed the lead-capture funnel
- **File:** [app/(marketing)/page.tsx:88](app/(marketing)/page.tsx#L88)
- The new `HomeEditorial` no longer renders the equivalent of the old `ContactSection`, `ClientsSection` (logo bar), `BlogSection`, or `AffiliateSection`. There is no `/contact` page. `leadCreateSchema`-backed POST `/api/leads` now has no UI caller except `NewsletterPopup`. Affiliate prospects have no entry point.
- **Fix:** add a lead-capture section to the homepage *or* build `/contact` *or* surface the lead form in `CTAFinale`. Decide where AffiliateSection content lives.

## P1 — Latent security / reliability

### B-3 · Middleware matcher `[id]` is a literal, not a route param
- **File:** [middleware.ts:89](middleware.ts#L89)
- Pattern `'/api/:path*/[id]/seo'` uses Next-route bracket syntax in a path-to-regexp matcher. `[id]` is interpreted as a character class matching the single char `i` or `d`, not a wildcard. `/api/blogs/123/seo` etc. never hit middleware.
- **Fix:** replace with explicit `['/api/blogs/:id/seo', '/api/case-studies/:id/seo', '/api/courses/:id/seo']` or `'/api/:type/:id/seo'`.

### B-4 · Middleware no longer covers most admin-write API paths
- **File:** [middleware.ts:81](middleware.ts#L81)
- Old `'/api/:path*'` covered everything. New whitelist drops `/api/blogs`, `/api/services`, `/api/courses`, `/api/clients`, `/api/testimonials`, `/api/case-studies`, `/api/navigation`, `/api/values`, `/api/brand`, `/api/theme`, `/api/stats`, `/api/process-steps`, `/api/seo/global`, and their `/[id]` children.
- Today's handlers all call `requireAuth()` so not actively exploitable. A future route added without explicit auth would be publicly writable.
- **Fix:** either add `'/api/blogs/:path*'` etc. to the matcher list or write a unit test that asserts every non-GET handler under `/api/*` calls `requireAuth`.

### B-5 · `generateMetadata()` runs Prisma uncached, no try/catch
- **File:** [app/layout.tsx:36](app/layout.tsx#L36)
- Two Prisma queries (`globalSeo.findFirst`, `brandConfig.findFirst`) on every request. Transient DB failure 500s every page on the site simultaneously. At build time, missing DB env vars fail the entire build before any page prerenders.
- **Fix:** wrap with React's `cache()` + `unstable_cache` (revalidate 1h, tag-invalidated on admin save) and surround in a try/catch that falls back to static defaults.

### B-6 · `use-affinity` injects phantom +2 dwell on first navigation
- **File:** [hooks/use-affinity.ts:50](hooks/use-affinity.ts#L50)
- `enterRef.current` defaults to `0`. First cleanup computes `dwell = Date.now() - 0 ≈ 1.7e12 ms`, exceeds the 8000 ms threshold, calls `trackDwell` with `bonus = min(2, dwell/30000) = 2`. Every cold first-nav injects synthetic affinity; React StrictMode and Fast Refresh repeat the bug.
- **Fix:** guard `if (enterRef.current === 0) return;` in the cleanup, *or* set `enterRef.current = Date.now()` inside the same `useEffect` body before registering listeners.

### B-7 · `/api/faqs` revalidate silently ignored
- **File:** [app/api/faqs/route.ts:5](app/api/faqs/route.ts#L5)
- `export const revalidate = 300` is dead because `req.nextUrl.searchParams.get(...)` forces dynamic rendering. Route hits Prisma on every request. Audit the other 14 routes that got `revalidate=300` in Phase C — any that read headers/cookies/searchParams have the same issue.
- **Fix:** wrap query with `unstable_cache` keyed by the searchParams, *or* split into static segments `/api/faqs/[page]/route.ts`.

## P2 — Quality / a11y / perf

### B-8 · No rate-limit on community replies
- **File:** [app/api/portal/community/[id]/route.ts:38](app/api/portal/community/[id]/route.ts#L38)
- `lib/rate-limit.ts` exists and is used by `/api/leads` + `/api/auth/*`. Reply POST is unbounded per-post and per-customer.
- **Fix:** apply `rateLimit` middleware to the POST handler.

### B-9 · Dashboard sidebar uses `<button>` not `<Link>`
- **File:** [app/dashboard/layout.tsx:91](app/dashboard/layout.tsx#L91)
- Nav items render `<button onClick={() => router.push(href)}>`. Drops middle-click-new-tab, cmd/ctrl-click, right-click "Copy link", and screen-reader link semantics (WCAG 4.1.2). Also loses Next.js `<Link>` viewport prefetching.
- **Fix:** swap to `<Link href={href}>` with the same className. Preserve the `onSelect` mobile-drawer-close callback via an `onClick` prop.

### B-10 · Display + serif fonts ship on auth/dashboard/admin routes
- **File:** [app/layout.tsx:9](app/layout.tsx#L9)
- Fraunces (with SOFT/WONK/opsz axes) + Newsreader (normal+italic) load via root layout on every route. Auth/dashboard/admin only use Manrope. ~500–800KB of unused font weight on first paint of those routes.
- **Fix:** move Fraunces + Newsreader font loaders into `app/(marketing)/layout.tsx` (and the few other surfaces that use them); leave Manrope + JetBrains Mono in root.

## P3 — Cleanup (not blocking)

### B-11 · `.wonk` CSS utility duplicated inline 10+ times
- **Files:** `HeroEditorial.tsx`, `ManifestoSection.tsx`, `ServicesTriptych.tsx`, `CTAFinale.tsx`, `CaseStudyEditorial.tsx`, `AboutEditorial.tsx`
- Raw `style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}` inlined where `className="italic wonk"` would suffice. The `.wonk` utility is already defined in [globals.css:221](app/globals.css#L221).
- **Fix:** sweep usages, replace with `className="italic wonk"`.

### B-12 · `FadeUp` primitive is unused; ~40 motion blocks duplicate the same pattern
- **File:** [components/marketing/editorial/FadeUp.tsx](components/marketing/editorial/FadeUp.tsx)
- The shared primitive was added but no rebuild uses it. Same `initial={{opacity:0,y:12}} whileInView={{...}} viewport={{once:true,margin:'-80px'}} transition={{duration:0.8,ease:[0.16,1,0.3,1]}}` block is copy-pasted across 12 components.
- **Fix:** adopt `<FadeUp delay={i*0.05}>` throughout. Also gives one place to gate motion on `prefers-reduced-motion`.

### B-13 · Hairline-grid SVG pattern duplicated across 3 components
- **Files:** [HeroEditorial.tsx:71](components/marketing/editorial/HeroEditorial.tsx#L71), [PageHero.tsx:24](components/marketing/editorial/PageHero.tsx#L24), `CaseStudyEditorial.tsx:118`
- Same two-linear-gradient SVG with drifting opacity (0.08 / 0.06 / 0.05).
- **Fix:** extract `<HairlineGrid opacity={...} />` or add a `.editorial-grid` Tailwind utility.

### B-14 · Eyebrow-row pattern duplicated across 6+ sections
- **Files:** `PageHero`, `HeroEditorial`, `ManifestoSection`, `ServicesTriptych`, `CTAFinale`, `PersonalizedFeed`, `SectionFrame`
- Same motion + hairline span + label pattern. SectionFrame encapsulates it but is not used by the others.
- **Fix:** extract `<Eyebrow>{label}</Eyebrow>` primitive.

### B-15 · `PackageCardView` and `ServiceCardView` are near-identical
- **Files:** [PackagesTriptych.tsx:37](components/marketing/editorial/PackagesTriptych.tsx#L37), [ServicesTriptych.tsx:82](components/marketing/editorial/ServicesTriptych.tsx#L82)
- Same asymmetric vertical-offset ternary, hover chrome, mono number + ArrowUpRight, display title. Only the body differs.
- **Fix:** extract `<EditorialCard n="01" title="…" hover>{children}</EditorialCard>`.

### B-16 · Hardcoded placeholder phone in structured-data
- **File:** [utils/structured-data.ts:47](utils/structured-data.ts#L47)
- `telephone: '+62-812-0000-0000'` ships to production schema.org markup.
- **Fix:** source from `BrandConfig` or an env var.

### B-17 · Missing composite DB indexes for homepage queries
- **File:** [prisma/schema.prisma](prisma/schema.prisma)
- `BlogPost.findMany({where: {isPublished: true}, orderBy: {date: 'desc'}})` and `Course.findMany({where: {isPublished: true}, orderBy: {updatedAt: 'desc'}})` will table-scan on the post-SQLite MySQL/Postgres migration.
- **Fix:** add `@@index([isPublished, date])` to `BlogPost`, `@@index([isPublished, updatedAt])` to `Course`.

### B-18 · Cookie missing `Secure` flag
- **File:** [lib/personalization.ts:85](lib/personalization.ts#L85)
- `wac-affinity` cookie is set without `Secure`. If a visitor ever hits the site over HTTP, the behavioral profile travels in cleartext.
- **Fix:** add `secure` (gate on `location.protocol === 'https:'` since dev is HTTP).

### B-19 · `theme-provider` has unnecessary `useMemo`/`useCallback` ceremony + duplicate read
- **File:** [components/theme-provider.tsx](components/theme-provider.tsx)
- Triple `useCallback` + `useMemo` wrap a provider whose only state IS what consumers want updates on — zero render savings. Also: the `useEffect` re-reads localStorage that the boot script already mirrored to `document.documentElement.dataset.theme`.
- **Fix:** inline the helpers, read initial state from `document.documentElement.dataset.theme` in lazy `useState`, drop the effect.

### B-20 · `HeroEditorial` + `ManifestoSection` duplicate JSX that should be `.map`
- **Files:** [HeroEditorial.tsx:103-115](components/marketing/editorial/HeroEditorial.tsx#L103), [ManifestoSection.tsx:61-78](components/marketing/editorial/ManifestoSection.tsx#L61)
- Three `RevealLine` instances (delays 0.25/0.4/0.55) and three "No templates / No generalists / No vanity" tenets each duplicate near-identical markup.
- **Fix:** `[{text, italic?}, ...].map(({text, italic}, i) => ...)` for the lines; same for tenets.

## Deferred (out of scope earlier)

### D-1 · Admin internal tooling reskin (`components/admin/*`)
- ~30 internal-tool components still on the old cyberpunk system. Not customer-facing.

### D-2 · Checkout page body still on old styling
- Functional but visually inconsistent with the rest. `bg-white/[0.03]` / `text-white` literals remain.

### D-3 · Stray test rows in Supabase
- `CommunityPost id=2` + `CommunityReply id=2` from earlier smoke tests. CLI can't reach the DB; delete via Studio.

### D-4 · `eslint.config.js` references missing `eslint-plugin-react-refresh`
- Pre-existing broken config. `npx eslint` fails. `tsc --noEmit` is the active check.

### D-5 · FAQ `locale` column is dead schema
- `app/api/faqs/route.ts` defaults to `locale: 'en'`. Schema retains the column. Either drop the column in a migration or keep as a future hedge — decide.
