# API Latency Tracker

A developer-focused web application to monitor, visualize, and analyze HTTP API endpoint performance (latency) over time.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (credentials)
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

**Zero-config (SQLite):** The project uses SQLite by default. Requires **Node.js 20 or 22** (Node 24 has compatibility issues).

```bash
cd api-latency-tracker
nvm use 22    # or: nvm use 20 (if using nvm)
npm install
npx prisma db push
npm run dev
```

The `npm run dev` script automatically uses Node 22 via nvm when available.

Open [http://localhost:3000](http://localhost:3000) and register an account.

**PostgreSQL (production):** For production, use PostgreSQL. Set `DATABASE_URL` in `.env` and update `prisma/schema.prisma` datasource to `provider = "postgresql"`.

**Deploy to Vercel:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

### Health Check Scheduling

**Development:** A built-in cron runner checks endpoints every 30 seconds (scans for due checks).

**Production:** Call the cron API from an external scheduler (e.g. Vercel Cron, GitHub Actions):

```bash
curl -X POST https://your-app.vercel.app/api/cron/run-checks \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

Add `CRON_SECRET` to your environment variables.

## Features (Phase 1 - MVP)

- ✅ Email/password authentication
- ✅ Endpoint CRUD (add, edit, delete, pause)
- ✅ Automated health checks with configurable intervals
- ✅ Dashboard with summary cards and status
- ✅ Endpoint detail page with latency chart
- ✅ Manual "Ping Now" trigger
- ✅ Uptime percentage, p50/p95/p99 stats

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to login or dashboard |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Main dashboard |
| `/endpoints/new` | Add endpoint form |
| `/endpoints/[id]` | Endpoint detail & charts |
| `/endpoints/[id]/edit` | Edit endpoint |
| `/settings` | User settings |
