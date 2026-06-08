# Collaborative Intelligence

**Enterprise Campaign Intelligence Platform** — Full-funnel campaign analytics, real-time performance monitoring, and collaborative insights for global brands and agencies.

## Overview
Collaborative Intelligence is an enterprise-grade SaaS platform that aggregates data from social platforms, paid media channels (ATL, BTL, Digital), and agency workflows to provide a unified command view of brand performance across campaigns, markets, and channels.

### Key Capabilities
- **Full-Funnel Analytics** — Awareness, consideration, conversion, and retention metrics across ATL (TV, OOH, Print), BTL (Events, Activations), and Digital (Paid Social, Search, Programmatic)
- **Multi-Brand Management** — Role-based access with team collaboration per brand
- **Real-Time Dashboards** — Modular widgets with drill-down, filtering, and time-range controls
- **Campaign Intelligence** — Cross-channel performance comparison, budget monitoring, and ROAS tracking
- **Public Share Links** — Branded, token-authenticated dashboards for client-facing reports
- **Row-Level Security** — PostgreSQL RLS with per-user data isolation
- **Data Encryption** — AES-256-GCM for OAuth tokens and sensitive credentials

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL (Neon) via Prisma ORM + Row-Level Security
- **Auth**: NextAuth.js (JWT, bcrypt, RBAC)
- **Encryption**: AES-256-GCM with scrypt key derivation
- **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons
- **Charts/Maps**: Recharts, React Simple Maps
- **Security**: Security headers, CSRF protection, input validation
- **Deployment**: Docker / Vercel

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd collaborative-intelligence
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   ```
   Configure `DATABASE_URL` (Neon PostgreSQL), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `ENCRYPTION_KEY`.

4. Initialize Database:
   ```bash
   npx prisma db push
   npx prisma db execute --file prisma/rls-policies.sql --schema prisma/schema.prisma
   npx prisma db execute --file prisma/rls-force-owner.sql --schema prisma/schema.prisma
   ```

5. Run Development Server:
   ```bash
   npm run dev
   ```

## Project Structure
- `src/app` — Next.js App Router pages and API routes
- `src/components` — Reusable UI components
- `src/lib` — Utilities, database clients, encryption, and auth helpers
- `prisma` — Database schema, RLS policies, and migration scripts
- `scripts` — Maintenance and data migration scripts

## Security Architecture
- **Authentication**: bcrypt password hashing (cost 12), auto-migration from legacy SHA-256
- **Authorization**: `requireAuth()` / `requireAdmin()` guards on all 44 API routes
- **Database RLS**: PostgreSQL Row-Level Security with per-request session context
- **Encryption**: AES-256-GCM for OAuth tokens stored in database
- **Headers**: X-Frame-Options, CSP, HSTS, Referrer-Policy via Next.js config
- **Input Validation**: Strict regex for table names, parameterized SQL, clamped pagination

## Docker
```bash
docker compose build
docker compose up -d
```

## Build for Production
```bash
npm run build
npm start
```

## Deployment
Hosted on Hostinger via GitHub integration.

## License
Private / Proprietary — Collaborative Intelligence
