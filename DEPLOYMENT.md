# Deploy to Vercel

This guide walks you through deploying API Latency Tracker to Vercel.

## Important: Database Required

**SQLite won't work on Vercel** (serverless = no persistent filesystem). You need a hosted PostgreSQL database.

---

## Step 1: Create a PostgreSQL Database

**Option A: Vercel Postgres (easiest)**

1. Go to [vercel.com](https://vercel.com) → your project → **Storage** tab
2. Create a new **Postgres** database
3. Connect it to your project — Vercel will auto-add `POSTGRES_URL` and related env vars

**Option B: Neon (free tier)**

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (e.g. `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

**Option C: Supabase**

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **Settings → Database** and copy the connection string

---

## Step 2: Update Prisma for PostgreSQL

Edit `prisma/schema.prisma` and change the datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run migrations and generate the client:

```bash
npx prisma db push
npx prisma generate
```

---

## Step 3: Push to GitHub

```bash
cd api-latency-tracker
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/api-latency-tracker.git
git push -u origin main
```

---

## Step 4: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Root Directory:** `api-latency-tracker` (if the repo root is the parent folder)
4. Add **Environment Variables:**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (replace with your deployment URL) |
| `CRON_SECRET` | A random secret (e.g. `openssl rand -base64 32`) — secures the cron endpoint |

5. Click **Deploy**

---

## Step 5: Update NEXTAUTH_URL After Deploy

Once deployed, Vercel gives you a URL like `https://api-latency-tracker-xxx.vercel.app`. Go to **Project Settings → Environment Variables** and set:

```
NEXTAUTH_URL=https://your-actual-url.vercel.app
```

Redeploy if needed.

---

## Health Check Cron

Vercel will run `/api/cron/run-checks` **every minute** (configured in `vercel.json`). Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` when invoking cron jobs — make sure `CRON_SECRET` is set in your env vars.

---

## Quick Checklist

- [ ] PostgreSQL database created
- [ ] Prisma schema updated to `postgresql`
- [ ] `npx prisma db push` run locally
- [ ] Repo pushed to GitHub
- [ ] Vercel project created and env vars set
- [ ] `NEXTAUTH_URL` updated after first deploy
