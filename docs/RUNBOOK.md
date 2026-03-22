# Local Development Runbook

A quick-reference guide for common development tasks, troubleshooting, and day-to-day operations when working on GymOS locally.

---

## Starting Services

### Start everything (recommended)

```bash
# From the repository root — starts API, trainer web, and mobile in parallel
npm run dev
```

### Start individual services

```bash
# API only
cd apps/api && npm run dev

# Trainer web only
cd apps/trainer-web && npm run dev

# Mobile only (Expo)
cd apps/mobile && npx expo start

# Mobile — iOS simulator
cd apps/mobile && npx expo start --ios

# Mobile — Android emulator
cd apps/mobile && npx expo start --android

# Mobile — physical device on a different network (tunnel)
cd apps/mobile && npx expo start --tunnel
```

### Verify the API is running

```bash
curl http://localhost:3000/health
```

Expected: `{"success":true,"data":{"status":"ok",...}}`

---

## Common Issues and Fixes

### "Cannot connect to database"

**Symptom:** The API fails to start with `PrismaClientInitializationError` or a connection refused error.

**Fix:**
1. Confirm PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Check `DATABASE_URL` in `apps/api/.env`.
3. Confirm the database exists: `psql -U postgres -c "\l" | grep gymos`
4. Create it if missing: `psql -U postgres -c "CREATE DATABASE gymos;"`

---

### "Prisma schema not in sync"

**Symptom:** Errors like `The table 'users' does not exist` or Prisma client types don't match the schema.

**Fix:**
```bash
# Apply pending migrations
npm run db:migrate

# If there are no migrations yet (prototype mode)
npm run db:push

# Regenerate the Prisma client after schema changes
cd apps/api && npx prisma generate
```

---

### "JWT token invalid or expired"

**Symptom:** API returns `401 INVALID_TOKEN` even with a freshly generated token.

**Fix:**
- If `JWT_SECRET` changed since the token was issued, all existing tokens are invalid. Log in again.
- Check that `JWT_SECRET` in `apps/api/.env` is not empty.
- In tests, ensure you are using `generateToken()` from `src/lib/jwt.ts` (which reads the same `env.JWT_SECRET`).

---

### "CORS error in the browser (trainer web)"

**Symptom:** Requests from `localhost:3001` to `localhost:3000` are blocked by CORS.

**Fix:**
- In development, the API allows all origins. Confirm `NODE_ENV=development` in `apps/api/.env`.
- If you changed the port, update `CORS_ORIGIN` in `.env` or restart the API.

---

### "Module not found" after adding a new package

**Symptom:** TypeScript or Jest cannot find a module you just installed.

**Fix:**
```bash
# Reinstall from the root to ensure workspace links are correct
npm install

# If adding a shared package, check that it's listed in the consumer's package.json
```

---

### "Port already in use"

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

**Fix:**
```bash
# Find the process using the port
lsof -ti:3000 | xargs kill -9

# Or change the port in apps/api/.env
PORT=3001
```

---

### "Expo QR code doesn't work on my phone"

**Symptom:** The Expo Go app cannot connect to the development server.

**Fix:**
1. Ensure your phone and computer are on the same Wi-Fi network.
2. Find your local IP: `ip a` or `ifconfig` (look for something like `192.168.x.x`).
3. Set `EXPO_PUBLIC_API_URL=http://192.168.x.x:3000` in `apps/mobile/.env`.
4. Or use tunnel mode: `cd apps/mobile && npx expo start --tunnel` (slower but works across networks).

---

### Tests fail with "Cannot find module '../index'"

**Symptom:** API tests error before any test runs.

**Fix:**
- The test file imports `app` from `src/index.ts`. Confirm the file exports `default app`.
- Run tests from the API directory: `cd apps/api && npm test`.
- Check `jest.config.js` in `apps/api` for the correct `rootDir` and `moduleDirectories`.

---

## Database Operations

### View the database in a GUI

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555.

### Reset and reseed the database

```bash
# Drop all data, re-run migrations, and seed demo data
cd apps/api && npx prisma migrate reset --force
```

`migrate reset` automatically runs the seed script defined in `package.json → prisma.seed`.

### Reset without seeding

```bash
cd apps/api && npx prisma migrate reset --force --skip-seed
```

### Seed only (without resetting)

```bash
npm run db:seed
```

### Run a specific migration

```bash
cd apps/api && npx prisma migrate dev --name <migration_name>
```

### Inspect the database manually

```bash
psql "$DATABASE_URL"

# Useful queries:
\dt                        -- list all tables
SELECT COUNT(*) FROM users;
SELECT email, role FROM users;
SELECT * FROM macro_plans WHERE "isActive" = true LIMIT 5;
```

---

## Checking Logs

### API logs (development)

The API uses `morgan` in `dev` mode, which prints each request to stdout:

```
GET /api/v1/auth/me 200 12.345 ms - 487
POST /api/v1/auth/login 401 8.123 ms - 89
```

Prisma query logs are also printed in development mode. To suppress them, set `NODE_ENV=production` or edit the Prisma client config in `apps/api/src/lib/prisma.ts`.

### Filter logs by module

```bash
# Show only API logs (suppress Turborepo output)
cd apps/api && npm run dev 2>&1 | grep "\[GymOS"

# Show only Prisma queries
cd apps/api && npm run dev 2>&1 | grep "prisma:query"
```

---

## Testing Specific Features with Demo Accounts

After running `npm run db:seed`, use these accounts to test different user experiences:

### Log in as a client (mobile or API)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@demo.gymos.io","password":"Demo1234!"}'
```

Save the token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@demo.gymos.io","password":"Demo1234!"}' \
  | jq -r '.data.token')
```

### Check macro plan

```bash
curl http://localhost:3000/api/v1/me/macros/current \
  -H "Authorization: Bearer $TOKEN"
```

### Start a workout session

```bash
SESSION=$(curl -s -X POST http://localhost:3000/api/v1/sessions/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r '.data.session.id')

echo "Session ID: $SESSION"
```

### Log a set

```bash
# First, get an exercise ID
EXERCISE_ID=$(curl -s http://localhost:3000/api/v1/exercises \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.exercises[0].id')

curl -X POST http://localhost:3000/api/v1/sessions/$SESSION/log-set \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"exerciseId\":\"$EXERCISE_ID\",\"setNumber\":1,\"actualReps\":5,\"actualWeightKg\":60}"
```

### Finish the session

```bash
curl -X POST http://localhost:3000/api/v1/sessions/$SESSION/finish \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Test session via runbook."}'
```

### Log in as the demo trainer

```bash
TRAINER_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@demo.gymos.io","password":"Demo1234!"}' \
  | jq -r '.data.token')

# View clients
curl http://localhost:3000/api/v1/trainer/clients \
  -H "Authorization: Bearer $TRAINER_TOKEN"
```

---

## Adding Test Data Manually

### Create a new user via the API

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mytest@example.com",
    "password": "TestPass1",
    "firstName": "My",
    "lastName": "Test"
  }'
```

### Insert data directly via Prisma

Create a one-off script in `apps/api/scripts/` and run it with `ts-node`:

```typescript
// apps/api/scripts/add-test-data.ts
import prisma from '../src/lib/prisma';

async function main() {
  const exercise = await prisma.exercise.create({
    data: {
      name: 'Test Exercise',
      slug: 'test-exercise',
      description: 'A temporary exercise for testing.',
      primaryMuscleGroup: 'chest',
      secondaryMuscleGroups: [],
      equipment: 'barbell',
      difficulty: 'beginner',
      movementPattern: 'push',
      tutorialSteps: [],
      coachingCues: [],
      commonMistakes: [],
      safetyNotes: [],
    },
  });
  console.log('Created:', exercise.id);
}

main().finally(() => prisma.$disconnect());
```

```bash
cd apps/api && npx ts-node scripts/add-test-data.ts
```

---

## Running Tests

```bash
# All tests in the monorepo
npm run test

# API tests only
cd apps/api && npm test

# API tests — watch mode
cd apps/api && npx jest --watch

# API tests — specific file
cd apps/api && npx jest src/__tests__/auth.test.ts

# Fitness engine tests only
cd packages/fitness-engine && npm test

# With coverage
cd apps/api && npx jest --coverage
```

---

## Useful One-liners

```bash
# Count records in each major table
psql "$DATABASE_URL" -c "
SELECT
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM macro_plans) AS macro_plans,
  (SELECT COUNT(*) FROM workout_sessions) AS sessions,
  (SELECT COUNT(*) FROM workout_set_logs) AS set_logs,
  (SELECT COUNT(*) FROM exercises) AS exercises;
"

# List all active macro plans
psql "$DATABASE_URL" -c "
SELECT u.email, m.calories, m.protein, m.carbs, m.fat
FROM macro_plans m
JOIN users u ON u.id = m.\"userId\"
WHERE m.\"isActive\" = true;
"

# Check which migrations have been applied
cd apps/api && npx prisma migrate status

# Format all TypeScript files with the project's ESLint config
npm run lint -- --fix
```
