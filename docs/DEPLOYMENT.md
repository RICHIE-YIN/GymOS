# Production Deployment Guide

This document walks through deploying GymOS to production. The recommended stack is:

| Component | Provider |
|---|---|
| REST API | Railway, Render, or Fly.io |
| Trainer Web | Vercel |
| Database | Railway PostgreSQL, Supabase, or Neon |
| Mobile App | Expo EAS Build + App Store / Play Store |
| File Storage | AWS S3 |

---

## Pre-Deployment Checklist

Before deploying, ensure the following are ready:

- [ ] All environment variables documented in [ENVIRONMENT.md](ENVIRONMENT.md) are configured for production.
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are long random strings (not the dev defaults).
- [ ] `DATABASE_URL` points to a managed PostgreSQL instance with SSL enabled.
- [ ] `CORS_ORIGIN` is set to the exact trainer web domain.
- [ ] All tests pass: `npm run test`.
- [ ] TypeScript compiles without errors: `npm run type-check`.

---

## Step 1: Database Setup

Use a managed PostgreSQL provider. Recommended options:

- **Railway** — simplest for teams already deploying on Railway
- **Supabase** — generous free tier, includes built-in auth (unused by GymOS)
- **Neon** — serverless PostgreSQL with branching support
- **AWS RDS** — enterprise option with full control

### Steps

1. Create a PostgreSQL 14+ database instance.
2. Note the connection string. It should look like:
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
   ```
3. Run migrations from your CI/CD pipeline or manually:
   ```bash
   DATABASE_URL="<production_url>" npx prisma migrate deploy
   ```
   `prisma migrate deploy` (not `dev`) applies pending migrations without creating new ones — safe for production.

4. (Optional) Seed initial data:
   ```bash
   DATABASE_URL="<production_url>" npx ts-node apps/api/prisma/seed.ts
   ```
   Only do this if you want demo data in production — generally skip for a clean deployment.

### Connection Pooling

For production workloads, add a connection pooler. With Supabase, use the "Transaction" pooler URL as `DATABASE_URL`. With Neon, enable the connection pooler in the project settings.

---

## Step 2: API Server Deployment

### Option A: Railway

1. Push your code to GitHub.
2. In Railway: New Project → Deploy from GitHub Repo → select `gymos`.
3. Set the **Root Directory** to `apps/api`.
4. Set the **Build Command** to `npm run build`.
5. Set the **Start Command** to `npm start`.
6. Add all environment variables from [ENVIRONMENT.md](ENVIRONMENT.md) in the Railway Variables tab.
7. Railway will assign a public URL (e.g., `https://gymos-api.up.railway.app`).

### Option B: Render

1. New Web Service → Connect to GitHub → select `gymos`.
2. **Root Directory:** `apps/api`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node dist/index.js`
5. Add environment variables in the Render Environment tab.

### Option C: Fly.io

1. Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. From the `apps/api` directory:
   ```bash
   fly launch
   fly secrets set DATABASE_URL="..." JWT_SECRET="..." JWT_REFRESH_SECRET="..."
   fly deploy
   ```

### Run Migrations on Deploy

Add a **release command** that runs migrations before the new version receives traffic:

```bash
# Render: set "Pre-Deploy Command"
npx prisma migrate deploy

# Railway: add to the deploy pipeline via the CLI or a Procfile:
# release: cd apps/api && npx prisma migrate deploy
```

---

## Step 3: Trainer Web Deployment (Vercel)

1. Push your code to GitHub.
2. In Vercel: New Project → Import from GitHub → select `gymos`.
3. Set **Framework Preset** to `Next.js`.
4. Set **Root Directory** to `apps/trainer-web`.
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` → your production API URL (e.g., `https://gymos-api.up.railway.app`)
   - `NEXT_PUBLIC_APP_NAME` → `GymOS Trainer`
6. Click **Deploy**.

Vercel will automatically redeploy on every push to `main`.

---

## Step 4: Mobile App (Expo EAS Build)

### Prerequisites

- Install EAS CLI: `npm install -g eas-cli`
- Log in: `eas login`

### Configure EAS

In `apps/mobile/`, create or update `eas.json`:

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://gymos-api.up.railway.app"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Build and Submit

```bash
cd apps/mobile

# Build for both platforms
eas build --platform all --profile production

# Submit to App Store (requires Apple Developer account)
eas submit --platform ios --profile production

# Submit to Play Store (requires Google Play Console credentials)
eas submit --platform android --profile production
```

For internal testing, use the `preview` build profile and share via Expo Go or a direct download link.

---

## Step 5: Environment Variables for Production

Set these in your hosting platform's secrets/environment UI — never in committed files.

### API (required for production)

```
NODE_ENV=production
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=<64-character random hex>
JWT_REFRESH_SECRET=<64-character random hex>
CORS_ORIGIN=https://trainer.yourdomain.com
PORT=3000
```

### API (optional)

```
OPENAI_API_KEY=sk-...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=gymos-prod-photos
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FEATURE_AI_COACH=true
FEATURE_PAYMENTS=true
FEATURE_PROGRESS_PHOTOS=true
```

---

## Step 6: Health Check Setup

Configure your hosting provider to monitor the health check endpoint:

- **URL:** `GET /health`
- **Expected status:** `200`
- **Interval:** every 30 seconds
- **Timeout:** 5 seconds
- **Failure threshold:** 3 consecutive failures before alert

Railway, Render, and Fly.io all support health checks natively in their configuration UI or TOML file.

---

## Step 7: Backup Strategy

### Database Backups

- Enable automated daily backups in your managed PostgreSQL provider. Most providers retain 7–30 days of point-in-time recovery.
- For Railway: enable "Backup" in the database plugin settings.
- For Supabase: daily backups are included on the Pro plan.
- For critical data, add a daily pg_dump cronjob:

```bash
pg_dump "$DATABASE_URL" | gzip > backup_$(date +%Y%m%d).sql.gz
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://gymos-backups/
```

### Progress Photos

S3 offers 99.999999999% durability. Enable **S3 Versioning** on the bucket for an additional recovery layer, and configure **S3 Lifecycle Rules** to move old photos to Glacier after 90 days to reduce costs.

---

## Monitoring and Logging

### Recommended tools

- **Error tracking:** [Sentry](https://sentry.io) — add `@sentry/node` to the API and initialise before the error handler middleware.
- **Logging:** Railway and Render provide log streaming out of the box. For structured logging, add `pino` or `winston` to replace `morgan`.
- **Uptime monitoring:** [Better Uptime](https://betteruptime.com) or [Freshping](https://freshping.io) — monitor `/health` every minute.

### Log retention

Keep application logs for at least 30 days. In production, pipe logs to a service like Papertrail, Datadog, or Logtail for search and alerting.

---

## Rolling Back

To roll back the API to a previous version:

**Railway:** In the deployment history tab, click "Rollback" on the previous successful deployment.

**Render:** In the "Deploys" tab, click "Rollback" on the target deploy.

**Fly.io:**
```bash
# List versions
fly releases list

# Roll back to a specific version
fly deploy --image registry.fly.io/gymos-api:<version>
```

If the rollback involves a database migration reversal, restore from a backup taken before the problematic migration was applied. Never run `prisma migrate reset` against a production database.

---

## Custom Domain Setup

1. Purchase a domain (e.g., `gymos.io`).
2. In your API provider, add a custom domain (e.g., `api.gymos.io`) and follow the DNS instructions.
3. In Vercel, add a custom domain (e.g., `trainer.gymos.io`) and update your DNS records.
4. Update `CORS_ORIGIN` in the API environment to `https://trainer.gymos.io`.
5. Update `NEXT_PUBLIC_API_URL` in the trainer web to `https://api.gymos.io`.
6. Update `EXPO_PUBLIC_API_URL` in the mobile app's EAS build config and rebuild.
