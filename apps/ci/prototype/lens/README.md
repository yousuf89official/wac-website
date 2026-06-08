# Lens
### Indonesian Media Intelligence Platform — Next.js + Neon + Vercel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Maps | react-simple-maps (Indonesia choropleth) |
| Icons | Lucide React |
| Database | Neon (serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Deployment | Vercel |

## Architecture

```
Browser → Next.js App Router → API Routes → Neon PostgreSQL
                                    ↓ (fallback)
                              Mock Data (BNI)
```

The app runs in two modes:
- **Without `DATABASE_URL`**: Uses embedded BNI mock data (fully functional demo)
- **With `DATABASE_URL`**: Queries Neon, falls back to mock if tables are empty

---

## Quick Start (Local Dev)

```bash
# 1. Clone and install
cd lens-next
npm install

# 2. Run (no database needed — mock data mode)
npm run dev
# Open http://localhost:3000
```

That's it. No database setup required for local development.

---

## Deploy to Vercel + Neon

### Step 1: Create a Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project (e.g. "lens-prod")
3. Copy the connection string: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### Step 2: Push Schema to Neon

```bash
# Set your Neon connection string
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# Push the Drizzle schema to Neon
npm run db:push
```

### Step 3: Deploy to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: Connect GitHub repo in Vercel Dashboard
# vercel.com → New Project → Import Git Repository
```

### Step 4: Set Environment Variable in Vercel

1. Go to your Vercel project → Settings → Environment Variables
2. Add: `DATABASE_URL` = your Neon connection string
3. Redeploy

### Step 5: Seed the Database

After deployment, seed BNI data into Neon:

```bash
curl -X POST https://your-app.vercel.app/api/seed
```

Or from local dev:
```bash
npm run db:seed   # calls POST /api/seed on localhost:3000
```

---

## Database Scripts

| Script | Command |
|---|---|
| Generate migrations | `npm run db:generate` |
| Push schema to Neon | `npm run db:push` |
| Seed BNI data | `npm run db:seed` |
| Open Drizzle Studio | `npm run db:studio` |

---

## Project Structure

```
lens-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx            Root layout (sidebar + topbar)
│   │   ├── page.tsx              Redirect → /dashboard
│   │   ├── dashboard/page.tsx    Layer 1: Social Listening
│   │   ├── media-monitoring/     Layer 2: Media Monitoring Pro
│   │   ├── crisis/               Layer 3: Crisis Intelligence
│   │   ├── influencers/          Layer 4: Influencer Intelligence
│   │   ├── reputation/           Layer 5: Reputation Benchmarking
│   │   ├── public-opinion/       Layer 6: Public Opinion
│   │   └── api/                  7 API routes
│   ├── components/
│   │   ├── charts/     8 Recharts components + GeoMap
│   │   ├── panels/     8 interactive panels
│   │   ├── layout/     Sidebar + TopBar
│   │   └── shared/     KPICard, SentimentBadge, FilterDropdown
│   ├── lib/
│   │   ├── db/         Drizzle schema, client, seed
│   │   └── mock/       BNI mock data (375 lines)
│   └── types/          TypeScript interfaces
├── drizzle.config.ts   Drizzle Kit config → Neon
├── vercel.json         Vercel framework detection
├── tailwind.config.ts  Lens dark theme tokens
└── .env.example        DATABASE_URL template
```

---

## Database Schema (9 tables)

| Table | Purpose |
|---|---|
| `tenants` | Multi-tenant organizations |
| `users` | User accounts with roles |
| `projects` | Monitoring projects (keywords, channels) |
| `mentions` | Social media mentions with sentiment |
| `alert_rules` | Alert configuration |
| `alerts` | Triggered alerts |
| `influencers` | Influencer profiles |
| `reputation_snapshots` | Daily reputation index snapshots |
| `policy_topics` | Public opinion policy tracking |

---

## BNI Seeded Data

The mock data contains real Bank Negara Indonesia metrics:
- FY2025: Rp20.04T net profit, Rp1,269T total assets
- Wondr app: 4.2 Google Play rating, 1.09M reviews
- Competitors: BCA, Bank Mandiri, BRI, BSI, BTN, CIMB Niaga, Bank Jago
- Policy topic: "Digitalisasi Perbankan BUMN 2026"
- Stakeholders: OJK, Kementerian BUMN, Bank Indonesia, DPR Komisi XI

---

*Lens — See everything that matters.*
