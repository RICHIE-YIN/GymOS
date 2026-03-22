# Architecture Overview

This document describes the system design of GymOS — the component boundaries, data flow, key design decisions, and considerations for security and scaling.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │   Mobile App     │         │   Trainer Web Dashboard  │  │
│  │  (React Native   │         │   (Next.js 14,           │  │
│  │   + Expo)        │         │    Tailwind CSS)         │  │
│  └────────┬─────────┘         └────────────┬─────────────┘  │
│           │  HTTPS / REST API              │                │
└───────────┼────────────────────────────────┼────────────────┘
            │                                │
            ▼                                ▼
┌───────────────────────────────────────────────────────────┐
│                    GymOS REST API                         │
│              (Express 4 + TypeScript)                     │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │  Macros  │  │ Sessions │  │ Trainer  │  │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Programs │  │ Progress │  │Messaging │  │    AI    │  │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐    │
│  │              Shared Middleware                    │    │
│  │  Auth (JWT) │ Validation (Zod) │ Error Handling   │    │
│  └───────────────────────────────────────────────────┘    │
└───────────────────────────┬───────────────────────────────┘
                            │ Prisma ORM
                            ▼
              ┌─────────────────────────┐
              │       PostgreSQL        │
              │  (primary data store)   │
              └─────────────────────────┘

                            │ (optional)
                            ▼
              ┌─────────────────────────┐
              │     OpenAI API          │
              │  (AI coach completion)  │
              └─────────────────────────┘

              ┌─────────────────────────┐
              │     AWS S3              │
              │  (progress photos)      │
              └─────────────────────────┘
```

---

## Monorepo Structure

GymOS uses a **Turborepo** monorepo with **npm workspaces**. This allows shared code to be consumed across apps without publishing to npm and enables parallel builds and test runs via Turborepo's dependency graph caching.

### Workspaces

| Workspace | Path | Purpose |
|---|---|---|
| `@gymos/api` | `apps/api` | Express REST API, database access, business logic |
| `@gymos/mobile` | `apps/mobile` | React Native (Expo) client app |
| `@gymos/trainer-web` | `apps/trainer-web` | Next.js trainer dashboard |
| `@gymos/shared-types` | `packages/shared-types` | TypeScript types shared across all apps |
| `@gymos/fitness-engine` | `packages/fitness-engine` | Pure business logic: macro calculator, workout generator, progression engine |
| `@gymos/ai-prompts` | `packages/ai-prompts` | System prompt templates for the AI coach |

### Dependency Graph

```
apps/api          → packages/shared-types
apps/api          → packages/fitness-engine
apps/mobile       → packages/shared-types
apps/trainer-web  → packages/shared-types
```

The `fitness-engine` package is pure TypeScript with no external runtime dependencies — it can be tree-shaken and imported directly into either the API or a future client-side context.

---

## API Module Design

Each feature area in the API is encapsulated in a self-contained module under `src/modules/`:

```
src/modules/<feature>/
├── <feature>.router.ts      # Express Router — defines endpoints and middleware chain
├── <feature>.controller.ts  # Thin layer: parse req, call service, send res
├── <feature>.service.ts     # Business logic and database access via Prisma
└── <feature>.schema.ts      # Zod schemas for request validation
```

This layering enforces clear separation of concerns:
- **Router** — knows about HTTP verbs, paths, and which middleware to apply.
- **Controller** — knows about `req`/`res` but delegates all logic to the service.
- **Service** — knows about business rules and the database; no knowledge of HTTP.
- **Schema** — declares the shape and constraints of incoming data.

Controllers never access Prisma directly. Services never import from `express`.

---

## Authentication and Authorisation

### JWT Strategy

GymOS uses a **stateless dual-token** JWT strategy:

- **Access token** — short-lived (7 days default), signed with `JWT_SECRET`. Included as a `Bearer` token in every authenticated request.
- **Refresh token** — longer-lived (30 days default), signed with `JWT_REFRESH_SECRET`. Used exclusively at `POST /auth/refresh` to obtain a new access token.

Token payloads:
```typescript
// Access token
{ userId: string; email: string; role: string; }

// Refresh token
{ userId: string; type: 'refresh'; }
```

Both tokens are signed with `issuer: 'gymos-api'` and `audience: 'gymos-app'` to prevent token reuse across different services.

### Authorisation

- `authenticateToken` middleware verifies the JWT and attaches `req.user` to the request.
- `requireRole(...roles)` middleware checks that `req.user.role` is in the allowed set, returning `403 Forbidden` otherwise.
- Ownership checks (e.g., "does this session belong to the requesting user?") are enforced at the service layer by including `userId` in Prisma `where` clauses.

---

## Data Flow: Macro Calculation

```
Client submits profile data
         │
         ▼
POST /macros/calculate
         │
         ▼
validate() middleware (Zod schema)
         │
         ▼
MacrosController.calculateMacros()
         │
         ▼
MacrosService.calculateMacros()
  │
  ├─ Mifflin-St Jeor BMR calculation
  ├─ Activity multiplier → TDEE
  ├─ Goal adjustment → calorie target
  └─ Macro split (30% protein / 45% carbs / 25% fat by calories)
         │
         ▼
Return { calories, protein, carbs, fat }
         │
         ▼
Client uses PATCH /me/macros/current to persist
```

The `fitness-engine` package contains a more sophisticated `MacroCalculator` class (with support for multiple BMR formulas, per-goal protein targets, and body weight–based fat minimums) that can be used as an alternative to the service-layer inline calculation.

---

## AI Service Design

The AI module is intentionally isolated and optional. When `OPENAI_API_KEY` is not set, the feature returns a graceful error rather than crashing.

Key design principles:
- **Prompt templates** live in `packages/ai-prompts/` — not hardcoded in the API. This allows prompt iteration without touching API code.
- **Context injection** — the AI service fetches the user's current macro plan, active program, and recent session history before constructing the prompt, so the AI's responses are personalised.
- **No streaming** in the current implementation — the full completion is awaited before the response is sent.

---

## Fitness Engine Design

`packages/fitness-engine` is a **pure TypeScript** library with zero external dependencies at runtime. It contains:

- **`MacroCalculator`** — BMR/TDEE calculations with support for Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle formulas.
- **`WorkoutGenerator`** — generates workout program structures based on goal type, experience level, equipment, and days per week.
- **`ProgressionEngine`** — calculates recommended weight/rep progressions based on session history and the target RPE.

All functions are fully unit-tested in `packages/fitness-engine/src/__tests__/`.

---

## Database Design

GymOS uses a single **PostgreSQL** database accessed exclusively through the Prisma ORM. Key design choices:

- **CUIDs** for primary keys (collision-resistant, sortable, URL-safe) via `@default(cuid())`.
- **Soft deletes** for programs — `isActive: false` rather than physical deletion.
- **One active macro plan** per user — when a plan is updated, the old plan is deactivated (`isActive: false`, `effectiveEndDate` set) and a new plan is created. This preserves full history.
- **Daily nutrition logs** are auto-created on first access for the day via `upsert`, seeded from the active macro plan targets.
- **Cascade deletes** — deleting a user removes all their associated data (sessions, plans, check-ins, etc.) via Prisma `onDelete: Cascade`.

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Password storage | bcrypt with 12 rounds (configurable via `BCRYPT_ROUNDS`) |
| JWT secret exposure | Secrets injected via environment variables; never committed to source |
| Brute-force attacks | Auth endpoint rate-limited to 20 requests / 15 min via `express-rate-limit` |
| Mass assignment | Prisma `select` clauses explicitly list returned fields; `passwordHash` is never returned |
| Injection | All queries use Prisma parameterised queries; no raw SQL |
| CORS | Restricted to `CORS_ORIGIN` in production; permissive only in development |
| HTTPS | Enforced at the infrastructure level (not in the Express app); use a reverse proxy (Nginx, Railway, Vercel) |
| HTTP headers | `helmet` sets secure response headers (CSP, HSTS, X-Frame-Options, etc.) |
| Data ownership | Ownership checks use `userId` in Prisma `where` clauses; returning 404 (not 403) to avoid leaking resource existence |

---

## Scaling Considerations

GymOS is designed to be horizontally scalable. The main constraints and mitigation strategies are:

### Stateless API
The API is fully stateless — JWTs carry authentication state on the client. Any number of API instances can run behind a load balancer without session affinity.

### Database Connection Pooling
Prisma opens a connection pool per process. For high-concurrency production deployments, place a connection pooler (PgBouncer or [Prisma Accelerate](https://www.prisma.io/accelerate)) between the API and the database.

### Rate Limiting
The current `express-rate-limit` configuration uses an in-memory store, which does not share state across multiple API instances. For multi-instance deployments, replace with a Redis-backed store:
```typescript
import RedisStore from 'rate-limit-redis';
```

### Caching
High-read endpoints like the exercise library (`GET /exercises`) are candidates for a short-lived cache (Redis, or HTTP `Cache-Control` headers). Currently there is no caching layer.

### AI Latency
OpenAI API calls add 1–5 seconds of latency to AI coach responses. Consider streaming responses via SSE (Server-Sent Events) to improve perceived responsiveness.

### File Storage
Progress photos are stored in AWS S3. The API generates pre-signed upload URLs to allow direct client-to-S3 uploads, avoiding routing large binary payloads through the API server.
