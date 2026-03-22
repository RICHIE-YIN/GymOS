# Environment Variables Reference

This document lists every environment variable used across the GymOS monorepo, their purpose, default values, and whether they are required.

---

## API Server (`apps/api/.env`)

Copy the template: `cp apps/api/.env.example apps/api/.env`

### Database

| Variable | Description | Default | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | *(none)* | Yes |

**Format:** `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

**Example:**
```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gymos
```

For production, use a connection string from your managed database provider (e.g., Railway, Supabase, Neon, RDS). Enable SSL by appending `?sslmode=require`.

---

### Authentication

| Variable | Description | Default | Required |
|---|---|---|---|
| `JWT_SECRET` | Secret key used to sign access tokens | `dev-secret-change-in-production` | Yes (in production) |
| `JWT_EXPIRES_IN` | Access token TTL | `7d` | No |
| `JWT_REFRESH_SECRET` | Secret key used to sign refresh tokens | `dev-refresh-secret-change-in-production` | Yes (in production) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `30d` | No |

**Security:** In production, `JWT_SECRET` and `JWT_REFRESH_SECRET` must be long, random, and unique strings. Generate them with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use different values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

---

### Server

| Variable | Description | Default | Required |
|---|---|---|---|
| `PORT` | Port the Express server listens on | `3000` | No |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` | No |
| `CORS_ORIGIN` | Allowed CORS origin in production | `http://localhost:3001` | No |
| `BCRYPT_ROUNDS` | Number of bcrypt hash rounds | `12` | No |

**Notes:**
- In development, `CORS_ORIGIN` is ignored — all origins are permitted.
- Increasing `BCRYPT_ROUNDS` improves security but slows down login/registration. 12 is a reasonable default; consider 14 for high-security environments.

---

### AI (Optional)

| Variable | Description | Default | Required |
|---|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key for AI coach features | *(empty)* | No |
| `AI_PROVIDER` | AI provider identifier | `openai` | No |
| `AI_MODEL` | Model to use for AI completions | `gpt-4o-mini` | No |

When `OPENAI_API_KEY` is not set, AI coach endpoints return a fallback response or a `503 Service Unavailable` error depending on the feature flag configuration.

---

### File Storage (Optional)

| Variable | Description | Default | Required |
|---|---|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key ID | *(empty)* | No |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret access key | *(empty)* | No |
| `AWS_REGION` | AWS region for S3 | `us-east-1` | No |
| `AWS_S3_BUCKET` | S3 bucket name for progress photos | *(empty)* | No |

When S3 credentials are not configured, progress photo uploads return `501 Not Implemented`.

---

### Stripe (Optional)

| Variable | Description | Default | Required |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key for payment processing | *(empty)* | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | *(empty)* | No |

Payments are disabled by default (`FEATURE_PAYMENTS=false`). These keys are only needed when enabling payment features.

---

### Feature Flags

| Variable | Description | Default |
|---|---|---|
| `FEATURE_AI_COACH` | Enable AI coach chat endpoints | `true` |
| `FEATURE_PAYMENTS` | Enable Stripe payment processing | `false` |
| `FEATURE_PROGRESS_PHOTOS` | Enable S3 progress photo uploads | `true` |

---

## Mobile App (`apps/mobile/.env`)

Copy the template: `cp apps/mobile/.env.example apps/mobile/.env`

All mobile environment variables are prefixed with `EXPO_PUBLIC_` so they are bundled into the client-side JavaScript.

| Variable | Description | Default | Required |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the GymOS REST API | `http://localhost:3000` | Yes |
| `EXPO_PUBLIC_APP_NAME` | Application display name | `GymOS` | No |
| `EXPO_PUBLIC_APP_VERSION` | App version string | `1.0.0` | No |

**Important:** On a physical device, `localhost` does not resolve to your development machine. Use your machine's local IP address instead:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Find your local IP with `ipconfig` (Windows) or `ifconfig` / `ip a` (macOS/Linux).

---

## Trainer Web (`apps/trainer-web/.env.local`)

Copy the template: `cp apps/trainer-web/.env.local.example apps/trainer-web/.env.local`

| Variable | Description | Default | Required |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the GymOS REST API | `http://localhost:3000` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `GymOS Trainer` | No |

Variables prefixed with `NEXT_PUBLIC_` are embedded into the browser bundle at build time.

---

## Production Considerations

### Secrets Management
- Never commit `.env` files to version control. They are in `.gitignore` by default.
- In production, inject environment variables via your hosting platform's secrets UI (Railway Variables, Render Environment, Vercel Environment Variables, etc.) rather than deploying `.env` files.

### Database URL
- Use connection pooling in production. Many managed PostgreSQL providers (Supabase, PlanetScale, Neon) provide a pooled connection URL separate from the direct URL.
- The `DATABASE_URL` for Prisma should use the **direct** (non-pooled) URL. If using Prisma Accelerate or PgBouncer, set `DIRECT_URL` separately.

### CORS
- Set `CORS_ORIGIN` to the exact domain of your trainer web deployment (e.g., `https://trainer.gymos.io`).
- The mobile app does not require a CORS entry — it communicates server-to-server (React Native).

### JWT Secrets
- Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` periodically. Note that rotating secrets immediately invalidates all active tokens, logging out all users.

### Rate Limiting
- The API applies a global rate limit of 500 requests per 15 minutes and a tighter limit of 20 requests per 15 minutes on auth endpoints. These are hardcoded defaults — adjust in `apps/api/src/index.ts` for your expected traffic patterns.
