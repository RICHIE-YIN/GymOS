# Local Development Setup

This guide walks you through getting GymOS running on your machine from scratch.

---

## Prerequisites

Make sure the following are installed before you begin.

| Requirement | Minimum Version | Check |
|---|---|---|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| PostgreSQL | 14.x | `psql --version` |
| Git | any | `git --version` |

**PostgreSQL options:**
- Install natively via [postgresql.org](https://www.postgresql.org/download/)
- Use [Postgres.app](https://postgresapp.com/) on macOS
- Run with Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`

---

## Step 1: Clone and Install

```bash
git clone https://github.com/your-org/gymos.git
cd gymos
npm install
```

`npm install` at the root installs dependencies for all workspaces (API, mobile app, trainer web, and shared packages) in a single pass.

---

## Step 2: Create the Database

If you are using a local PostgreSQL installation, create the database manually:

```bash
psql -U postgres -c "CREATE DATABASE gymos;"
```

With Docker:
```bash
docker exec -it <container_name> psql -U postgres -c "CREATE DATABASE gymos;"
```

---

## Step 3: Environment Variables

Each app needs its own `.env` file. Copy the examples and edit as needed.

```bash
# API — required
cp apps/api/.env.example apps/api/.env

# Mobile — optional defaults are fine for local dev
cp apps/mobile/.env.example apps/mobile/.env

# Trainer web — optional defaults are fine for local dev
cp apps/trainer-web/.env.local.example apps/trainer-web/.env.local
```

Open `apps/api/.env` and update the following values:

```dotenv
# Your local PostgreSQL connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gymos

# Generate a random string for production; the default is fine for local dev
JWT_SECRET=dev-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
```

All other variables have sensible defaults. See [ENVIRONMENT.md](ENVIRONMENT.md) for a full reference.

---

## Step 4: Database Setup

Run the Prisma migrations to create all tables in your database:

```bash
npm run db:migrate
```

This runs `prisma migrate dev` in the `apps/api` directory and applies all pending migrations.

Then seed the database with demo users, exercises, meals, and sample programs:

```bash
npm run db:seed
```

---

## Step 5: Start All Apps

```bash
npm run dev
```

Turborepo starts all three apps in parallel. Wait for the output to stabilise — you should see something like:

```
[api]      [GymOS API] Server running on port 3000 in development mode
[api]      [GymOS API] Health check: http://localhost:3000/health
[trainer-web]  ▲ Next.js 14.x.x
[trainer-web]  - Local:  http://localhost:3001
[mobile]   Starting Metro Bundler…
[mobile]   ▸ Scan the QR code below with Expo Go (Android) or the Camera app (iOS)
```

---

## Step 6: Access the Apps

| App | URL / Method |
|---|---|
| REST API | http://localhost:3000 |
| Trainer Web Dashboard | http://localhost:3001 |
| Mobile App | Scan the QR code in the terminal with the Expo Go app on your phone, or press `i` for iOS simulator / `a` for Android emulator |

---

## Step 7: Verify the Setup

Run the health check to confirm the API is running:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

Try logging in with a demo account:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@demo.gymos.io","password":"Demo1234!"}'
```

You should receive a `200 OK` response with a `token` and `refreshToken`.

---

## Running Tests

```bash
# Run all tests across the monorepo
npm run test

# Run only the API tests
cd apps/api && npm test

# Run in watch mode (API only)
cd apps/api && npx jest --watch
```

---

## Common Commands Reference

```bash
# Start only the API
cd apps/api && npm run dev

# Start only the trainer web app
cd apps/trainer-web && npm run dev

# Start only the mobile app
cd apps/mobile && npx expo start

# Open Prisma Studio (visual database browser)
npm run db:studio

# Reset and reseed the database
cd apps/api && npx prisma migrate reset --force && npm run db:seed

# Type-check all packages
npm run type-check

# Lint all packages
npm run lint
```

---

## Troubleshooting

**`npm install` fails with peer dependency errors**
Ensure you are using npm 9 or higher: `npm --version`. Upgrade with `npm install -g npm@latest`.

**`npm run db:migrate` fails with a connection error**
Check that PostgreSQL is running and that `DATABASE_URL` in `apps/api/.env` is correct. Test the connection with `psql "$DATABASE_URL"`.

**Port 3000 already in use**
Change the port: set `PORT=3001` in `apps/api/.env`. Update `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` and `NEXT_PUBLIC_API_URL` in `apps/trainer-web/.env.local` to match.

**Expo QR code does not work on the device**
Make sure your phone and development machine are on the same Wi-Fi network. Try switching Expo to tunnel mode: `npx expo start --tunnel`.

**Prisma client is out of date after schema changes**
Run `cd apps/api && npx prisma generate` to regenerate the Prisma client.
