# GymOS — AI Fitness Operating System

GymOS is a full-stack fitness platform that connects clients and personal trainers through an AI-powered coaching experience. Clients get personalised workout programs, nutrition plans, and real-time progress tracking. Trainers get a professional web dashboard to manage their entire client roster from a single place.

---

## Features

### For Clients (Mobile App)
- **AI-powered onboarding** — generate a macro plan and starter program in seconds based on your goals, body stats, and schedule.
- **Workout tracking** — log sets, reps, and weight live during your session; review your history and progress over time.
- **Macro & nutrition tracking** — daily targets from your active macro plan with a simple food-logging interface.
- **Progress check-ins** — record body weight, measurements, and progress photos with a built-in visual comparison tool.
- **Trainer messaging** — in-app messaging thread with your assigned trainer.
- **AI coach chat** — on-demand coaching advice powered by GPT-4o-mini.

### For Trainers (Web Dashboard)
- **Client management** — view all your clients in one place with at-a-glance progress summaries.
- **Program builder** — create fully customisable multi-week workout programs and assign them to clients.
- **Nutrition oversight** — view and override a client's macro plan.
- **Progress review** — track client body weight trends and check-in photos.
- **Messaging** — communicate with clients through the platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | Node.js, Express 4, TypeScript |
| Database ORM | Prisma 5 + PostgreSQL |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Validation | Zod |
| Mobile App | React Native (Expo SDK 51), Expo Router |
| Trainer Web | Next.js 14 (App Router), Tailwind CSS |
| Monorepo | Turborepo + npm workspaces |
| AI | OpenAI GPT-4o-mini (optional) |
| Testing | Jest + Supertest (API), Jest (packages) |

---

## Monorepo Structure

```
gymos/
├── apps/
│   ├── api/                   # Express REST API
│   │   ├── prisma/            # Database schema and migrations
│   │   └── src/
│   │       ├── modules/       # Feature modules (auth, macros, sessions, …)
│   │       ├── middleware/    # Auth, validation, error handling
│   │       ├── lib/           # Prisma client, JWT helpers
│   │       ├── config/        # Environment variable config
│   │       └── __tests__/     # Integration & unit tests
│   ├── mobile/                # Expo React Native app (client-facing)
│   │   └── src/
│   │       ├── app/           # Expo Router screens
│   │       ├── components/    # Reusable UI components
│   │       ├── hooks/         # React Query hooks
│   │       └── lib/           # API client, Zustand store
│   └── trainer-web/           # Next.js trainer dashboard
│       └── src/
│           ├── app/           # Next.js App Router pages
│           ├── components/    # Dashboard UI components
│           └── lib/           # Axios API client, auth helpers
├── packages/
│   ├── shared-types/          # TypeScript types shared across apps
│   ├── fitness-engine/        # Pure TS: macro calculator, workout generator
│   └── ai-prompts/            # AI system prompt templates
├── docs/                      # Project documentation
├── package.json               # Root workspace manifest
└── turbo.json                 # Turborepo pipeline config
```

---

## Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **PostgreSQL** 14 or higher (running locally or via Docker)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/gymos.git
cd gymos
```

### 2. Install dependencies

```bash
npm install
```

This installs dependencies for all apps and packages in the monorepo.

### 3. Set up environment variables

```bash
# API
cp apps/api/.env.example apps/api/.env

# Mobile
cp apps/mobile/.env.example apps/mobile/.env

# Trainer web
cp apps/trainer-web/.env.local.example apps/trainer-web/.env.local
```

Edit `apps/api/.env` and set `DATABASE_URL` to point to your local PostgreSQL instance. The other variables have sensible defaults for local development.

### 4. Set up the database

```bash
# Run migrations (creates all tables)
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 5. Start all apps

```bash
npm run dev
```

Turborepo starts all three apps in parallel.

---

## Access URLs

| App | URL |
|---|---|
| REST API | http://localhost:3000 |
| API Health Check | http://localhost:3000/health |
| Trainer Web | http://localhost:3001 |
| Mobile App | Scan the QR code in the Expo CLI output with the Expo Go app |

---

## Available Scripts

All scripts are run from the **repository root**.

| Script | Description |
|---|---|
| `npm run dev` | Start all apps in development mode (with hot-reload) |
| `npm run build` | Build all apps for production |
| `npm run test` | Run all test suites across the monorepo |
| `npm run lint` | Lint all packages |
| `npm run type-check` | Run TypeScript type checking across the monorepo |
| `npm run db:migrate` | Run pending Prisma migrations |
| `npm run db:seed` | Seed the database with demo data |
| `npm run db:studio` | Open Prisma Studio (visual database browser) |
| `npm run db:push` | Push the Prisma schema directly to the database (dev only) |

---

## Demo Accounts

After running `npm run db:seed`, the following demo accounts are available:

| Role | Email | Password |
|---|---|---|
| Client | client@demo.gymos.io | Demo1234! |
| Client (advanced) | alex@demo.gymos.io | Demo1234! |
| Trainer | trainer@demo.gymos.io | Demo1234! |
| Admin | admin@demo.gymos.io | Demo1234! |

> These accounts are for local development only. Never seed a production database with demo credentials.

---

## API Overview

The REST API is versioned and available under `/api/v1`.

| Group | Base Path | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Register, login, logout, token refresh |
| Users | `/api/v1/users` | Profile management, onboarding, stats |
| Macros | `/api/v1/macros`, `/api/v1/me/macros` | Macro calculation and plan management |
| Exercises | `/api/v1/exercises` | Exercise library |
| Programs | `/api/v1/programs` | Workout program CRUD |
| Sessions | `/api/v1/sessions`, `/api/v1/me/sessions` | Workout session tracking |
| Progress | `/api/v1/me/progress` | Check-ins and progress photos |
| Trainer | `/api/v1/trainer` | Trainer-specific client management |
| Messaging | `/api/v1/me/threads` | In-app messaging |
| AI | `/api/v1/ai` | AI coach chat |
| Subscriptions | `/api/v1/subscriptions` | Subscription management |

Full API reference: [docs/API.md](docs/API.md)

---

## Documentation

| Document | Description |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Step-by-step local development setup |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | All environment variables documented |
| [docs/SEED.md](docs/SEED.md) | Seed data reference and demo credentials |
| [docs/API.md](docs/API.md) | Full API reference with request/response examples |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and architecture overview |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | Local development runbook and troubleshooting |
| [docs/e2e-scenarios.md](docs/e2e-scenarios.md) | End-to-end test scenarios |

---

## Contributing

1. Fork the repository and create a feature branch from `main`.
2. Make your changes, following the existing code style.
3. Add or update tests as appropriate — all new API endpoints should have integration tests in `apps/api/src/__tests__/`.
4. Run `npm run test` and `npm run type-check` to verify everything passes.
5. Submit a pull request with a clear description of what you changed and why.

### Code Style
- TypeScript strict mode is enabled — avoid `any` casts.
- API responses always follow the `{ success: boolean, data?: T, error?: { code, message } }` envelope.
- Zod schemas are the single source of truth for request validation.
- Prisma is the only database access layer — no raw SQL.

### Commit Conventions
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `test:` — test additions or changes
- `refactor:` — code change that is neither a fix nor a feature
- `chore:` — build process, dependency updates

---

## License

MIT — see [LICENSE](LICENSE) for details.
