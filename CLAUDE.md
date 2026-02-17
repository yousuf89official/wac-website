# CLAUDE.md - WAC Website Project Intelligence

## Project Overview
- **Name:** We Are Collaborative (WAC)
- **Domain:** wearecollaborative.net (Hostinger DNS, self-hosted on laptop for now)
- **Purpose:** Lead/sales funnel website with admin dashboard for a collaborative marketing brand
- **Owner:** Yusuf Noor
- **Goal:** Enterprise-grade website that scales into a major online business (courses, affiliate, digital marketing)

## Tech Stack
- **Framework:** Next.js (App Router) with TypeScript
- **Database:** Prisma ORM + SQLite (dev), will migrate to MySQL/PostgreSQL on Hostinger
- **Styling:** Tailwind CSS + Radix UI (shadcn/ui) + Framer Motion
- **State:** TanStack Query (server state), React Context (UI state)
- **AI Chat:** Vercel AI SDK + Google Gemini (gemini-flash)
- **Auth:** Custom (being rebuilt - was plaintext, now bcrypt + JWT + middleware)

## Commands
- `npm run dev` — Start dev server with Turbo
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — ESLint
- `npm run db:push` — Push Prisma schema to database
- `npm run db:seed` — Seed database with initial data

## Architecture
- `/app` — Next.js App Router pages and API routes
- `/components` — React components (admin/, chat/, layout/, marketing/, modals/, pages/, sections/, ui/)
- `/contexts` — React Context providers (AppContext, NotificationContext)
- `/hooks` — Custom hooks (useContent, useActiveSection, useNewsletterPopup, use-toast)
- `/lib` — Utilities (api.ts axios instance, prisma.ts singleton, utils.ts)
- `/prisma` — Schema and seed files
- `/utils` — SEO utilities

## Key Design Decisions
- Dark cyberpunk aesthetic (cyan #00f0ff, purple #b000ff, pink #ff006e on #0a0a0a)
- CSS variables for theming via `--primary`, `--accent`, `--destructive` (HSL format)
- Admin dashboard is a full-screen overlay accessible from footer
- Generic ContentManager component handles CRUD for all content types
- All public content fetched via `/api/content` endpoint (aggregates 11 tables)

## Current Priorities (ordered)
1. **Security hardening** — Auth with bcrypt + JWT, middleware route protection, API input validation with Zod
2. **SEO overhaul** — Server-side rendering, Next.js metadata API, sitemap, robots.txt, structured data
3. **Database migration** — Move from SQLite to MySQL/PostgreSQL before cloud deployment
4. **Performance** — Split content API, add caching headers, optimize images
5. **Testing** — API route tests, component tests, E2E funnel tests

## Conventions
- Use `"use client"` only when components need browser APIs or interactivity
- Prefer Next.js built-in features (metadata API, middleware, Image component) over third-party alternatives
- API routes should always validate input with Zod schemas
- All API routes behind `/api/admin/*` require JWT authentication via middleware
- Keep components focused — section components in `/components/sections/`, admin in `/components/admin/`
- Use TanStack Query for all data fetching with appropriate staleTime

## Security Rules
- Never store plaintext passwords — always bcrypt hash
- All protected API routes must check JWT via middleware
- Input validation on every POST/PUT endpoint
- Rate limiting on auth and lead submission endpoints
- Restrict Next.js image domains to known hosts only

## SEO Rules
- Homepage and content pages must be Server Components (no "use client" at page level)
- Use `generateMetadata()` for dynamic pages (blog, case studies)
- Every page needs canonical URL, Open Graph, and Twitter Card meta
- Maintain sitemap.ts and robots.ts at app root
- Blog posts should use structured data (JSON-LD BlogPosting schema)

## Things to Avoid
- Don't use react-helmet-async — use Next.js metadata API instead
- Don't spread raw request body into Prisma — validate first
- Don't use `next: "latest"` — pin to specific version
- Don't allow `hostname: '**'` in image config — whitelist domains
- Don't store auth state in React useState — use JWT cookies
