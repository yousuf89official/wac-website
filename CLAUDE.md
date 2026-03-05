# CLAUDE.md - WAC Website Project Intelligence

## Project Overview
- **Name:** We Are Collaborative (WAC)
- **Domain:** wearecollaborative.net (Hostinger DNS, self-hosted on laptop for now)
- **Purpose:** Lead/sales funnel website with admin dashboard, customer portal, and academy for a collaborative marketing brand
- **Owner:** Yusuf Noor
- **Goal:** Enterprise-grade website that scales into a major online business (courses, affiliate, digital marketing)

## Tech Stack
- **Framework:** Next.js (App Router) with TypeScript
- **Database:** Prisma ORM + SQLite (dev), will migrate to MySQL/PostgreSQL on Hostinger
- **Styling:** Tailwind CSS + Radix UI (shadcn/ui) + Framer Motion
- **State:** TanStack Query (server state), React Context (UI state)
- **AI Chat:** Vercel AI SDK + Google Gemini (gemini-flash)
- **Auth:** Dual JWT — admin (`wac-auth-token`, 24h) + customer (`wac-customer-token`, 30d), bcrypt passwords
- **i18n:** next-intl with `[locale]` dynamic segment (EN + ID)
- **Payments:** Midtrans Snap gateway (sandbox mode)

## Commands
- `npm run dev` — Start dev server with Turbo (port 3003)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — ESLint
- `npm run db:push` — Push Prisma schema to database
- `npm run db:seed` — Seed database with initial data

## Architecture
```
app/
├── [locale]/                      ← i18n wrapper (en, id)
│   ├── layout.tsx                 (locale provider, metadata, GEO meta tags)
│   ├── (marketing)/               (public site)
│   │   ├── layout.tsx             (MarketingShell + Snap.js script)
│   │   ├── page.tsx               (homepage)
│   │   ├── services/page.tsx
│   │   ├── about/page.tsx
│   │   ├── academy/page.tsx
│   │   ├── academy/[slug]/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── resources/[slug]/page.tsx
│   │   ├── work/[slug]/page.tsx
│   │   └── checkout/              (payment flow)
│   │       ├── page.tsx           (checkout form + Snap popup)
│   │       ├── finish/page.tsx
│   │       ├── pending/page.tsx
│   │       └── error/page.tsx
│   ├── (auth)/                    (unified login/register)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx         (handles both admin + customer login)
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   ├── dashboard/                 (customer portal)
│   │   ├── layout.tsx             (DashboardShell + CustomerContext)
│   │   ├── page.tsx               (overview)
│   │   ├── courses/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── subscriptions/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── community/page.tsx
│   │   └── settings/page.tsx
│   └── admin/page.tsx             (redirects to /login if unauthenticated)
├── api/
│   ├── auth/                      (admin auth: login, logout, me)
│   ├── customer/                  (customer auth: register, login, logout, me, forgot-password)
│   ├── payments/                  (Midtrans: create-transaction, webhook, status)
│   ├── portal/                    (customer data: enrollments, orders, subscriptions, community)
│   ├── faqs/                      (FAQ content by page + locale)
│   └── ...                        (content APIs: blogs, services, case-studies, etc.)
├── layout.tsx                     (bare root shell)
├── sitemap.ts                     (locale-aware with hreflang)
└── robots.ts
```

### Key Directories
- `/components` — React components (admin/, auth/, chat/, dashboard/, layout/, marketing/, modals/, pages/, sections/, ui/)
- `/contexts` — React Context providers (AppContext, NotificationContext)
- `/hooks` — Custom hooks (useContent, useActiveSection, useNewsletterPopup, use-toast)
- `/lib` — Utilities (api.ts, prisma.ts, utils.ts, auth.ts, auth-customer.ts, midtrans.ts, rate-limit.ts, validations.ts)
- `/lib/i18n` — i18n config (routing.ts, navigation.ts, request.ts)
- `/messages` — Translation files (en.json, id.json)
- `/prisma` — Schema and seed files
- `/utils` — SEO utilities + structured data generators (structured-data.ts)
- `/types` — Type declarations (midtrans-client.d.ts, snap.d.ts)

## Database Models (Prisma)
### Content Models
- `User` (admin), `Service`, `CaseStudy`, `BlogPost`, `Client`, `Testimonial`
- `NavigationItem`, `Stat`, `Lead`, `BrandSettings`, `SEOSettings`, `HeroText`
- `Course`, `CourseModule`, `ServicePackage`, `FAQ`

### Customer/Commerce Models (Phase 2)
- `Customer` — customer accounts (email, bcrypt password, profile)
- `Enrollment` — customer ↔ course (progress tracking, completed modules)
- `Order` — payment orders (Midtrans order ID, status, snap token)
- `Payment` — payment transactions (transaction ID, payment type, settlement time)
- `Invoice` — generated invoices (invoice number, status, due date)
- `Subscription` — recurring plans (plan name, billing cycle, payment token)
- `SavedResource` — bookmarked resources
- `CommunityPost` + `CommunityReply` — community forum

## Auth Flow (Unified Login)
- Single login page at `/[locale]/login` handles both admin and customer
- `/api/customer/login` checks Customer table first, then User (admin) table
- Returns `userType: 'customer'` or `userType: 'admin'`
- Sets appropriate JWT cookie based on user type
- Login page redirects to `/dashboard` (customer) or `/admin` (admin)
- AdminPage component redirects to `/login` if unauthenticated (no inline LoginModal)
- Dashboard layout redirects to `/login` if no valid customer token

### Test Credentials
- **Admin:** yousuf@wearecollaborative.net / password
- **Customer:** customer@test.com / customer123

## Payment Flow (Midtrans Snap)
1. Customer clicks "Enroll" on course → `/checkout?courseId=X`
2. Checkout form submits to `POST /api/payments/create-transaction`
3. API creates Order (pending), requests Snap token from Midtrans
4. Client opens `window.snap.pay(snapToken)` popup
5. User completes payment in Midtrans popup
6. Midtrans sends webhook to `POST /api/payments/webhook`
7. Webhook verifies SHA512 signature, updates Order, creates Enrollment + Invoice
8. Client redirects to `/checkout/finish`

## SEO / Structured Data
- JSON-LD schemas on all pages via `utils/structured-data.ts`
- Homepage: Organization, WebSite, LocalBusiness
- Services: Service, BreadcrumbList, FAQPage
- Academy: ItemList, BreadcrumbList, FAQPage
- Academy/[slug]: Course, Offer, BreadcrumbList
- Resources: CollectionPage, BreadcrumbList
- Resources/[slug]: BlogPosting, BreadcrumbList
- Work/[slug]: CreativeWork, BreadcrumbList
- About: BreadcrumbList, FAQPage
- GEO meta tags (geo.region, geo.placename) on locale layout
- hreflang alternates on all pages via next-intl
- FAQ seed data in DB (bilingual EN/ID) for services, academy, about pages

## Key Design Decisions
- Dark cyberpunk aesthetic (cyan #00f0ff, purple #b000ff, pink #ff006e on #0a0a0a)
- CSS variables for theming via `--primary`, `--accent`, `--destructive` (HSL format)
- Admin dashboard is a full-screen overlay (AdminDashboard component)
- Generic ContentManager component handles CRUD for all content types
- All public content fetched via `/api/content` endpoint (aggregates 11 tables)
- Dashboard pages use client-side fetching from `/api/portal/*` endpoints
- CustomerContext in dashboard layout provides customer data to all child pages
- `useSearchParams()` must be wrapped in `<Suspense>` boundary (Next.js 16 requirement)

## Development Phases

### Phase 1 — COMPLETE
- Security hardening (bcrypt + JWT + middleware + Zod validation)
- SEO overhaul (metadata API, sitemap, robots, structured data)
- Multi-page marketing expansion (/services, /about, /academy, /resources)
- Route groups and design system

### Phase 2 — COMPLETE (Steps 1-22 of 25)
- **Batch 1-2: i18n** — next-intl, [locale] routing, EN/ID translations, locale switcher
- **Batch 3: Customer Auth** — Customer model, auth-customer.ts, register/login/logout/me APIs, auth pages
- **Batch 4: Customer Portal** — Dashboard layout + 7 pages (overview, courses, orders, subscriptions, resources, community, settings)
- **Batch 5: Payments** — Midtrans Snap integration, create-transaction/webhook/status APIs, checkout flow pages
- **Batch 6: SEO/GEO/AEO** — FAQ model + seed, structured data on all pages, GEO meta tags, BreadcrumbList schemas

### Phase 2 — REMAINING (Steps 23-25)
- **Step 23:** Community posts/replies — schema done, API done, page done. Needs testing.
- **Step 24:** Saved Resources — page done. Needs testing.
- **Step 25:** Full build verification + end-to-end test pass

### Future Priorities
1. **Database migration** — Move from SQLite to MySQL/PostgreSQL before cloud deployment
2. **Performance** — Split content API, add caching headers, optimize images
3. **Testing** — API route tests, component tests, E2E funnel tests
4. **Email integration** — Password reset emails, order confirmation emails
5. **Content localization** — Translate DB content (blogs, courses) to Indonesian

## Conventions
- Use `"use client"` only when components need browser APIs or interactivity
- Prefer Next.js built-in features (metadata API, middleware, Image component) over third-party alternatives
- API routes should always validate input with Zod schemas
- Admin API routes (`/api/admin/*`) protected by middleware `handleApiAuth`
- Portal API routes (`/api/portal/*`) check `wac-customer-token` in their own handlers
- Payment webhook (`/api/payments/webhook`) uses Midtrans signature verification (no JWT)
- Keep components focused — section components in `/components/sections/`, admin in `/components/admin/`
- Use TanStack Query for all data fetching with appropriate staleTime
- All dashboard pages use `useCustomer()` context hook for customer data
- Translation keys organized by section in messages/*.json

## Security Rules
- Never store plaintext passwords — always bcrypt hash
- All protected API routes must check JWT via middleware or handler
- Input validation on every POST/PUT endpoint with Zod schemas (lib/validations.ts)
- Rate limiting on auth and lead submission endpoints (lib/rate-limit.ts)
- Restrict Next.js image domains to known hosts only
- Midtrans webhook verified with SHA512 signature before processing
- Dual JWT cookies: admin (24h expiry) and customer (30d expiry) are separate

## SEO Rules
- Homepage and content pages must be Server Components (no "use client" at page level)
- Use `generateMetadata()` for dynamic pages (blog, case studies, courses)
- Every page needs canonical URL, Open Graph, and Twitter Card meta
- Maintain sitemap.ts and robots.ts at app root (locale-aware)
- All subpages need BreadcrumbList JSON-LD schema
- FAQ-heavy pages (services, academy, about) need FAQPage schema
- Use `utils/structured-data.ts` generators for consistent schema output

## Things to Avoid
- Don't use react-helmet-async — use Next.js metadata API instead
- Don't spread raw request body into Prisma — validate with Zod first
- Don't use `next: "latest"` — pin to specific version
- Don't allow `hostname: '**'` in image config — whitelist domains
- Don't store auth state in React useState — use JWT cookies
- Don't use `useSearchParams()` without wrapping in `<Suspense>` (Next.js 16)
- Don't put auth redirects for admin page in middleware — AdminPage handles its own auth
- Don't create separate login pages for admin/customer — use unified `/login`
