# Seed Data Reference

The seed script populates a fresh GymOS database with realistic demo data so you can explore the platform immediately after setup — no manual data entry required.

---

## Running the Seed

```bash
# From the repository root
npm run db:seed

# Or directly from the API directory
cd apps/api && npx ts-node prisma/seed.ts
```

The seed script is idempotent — running it multiple times will not create duplicate records (it upserts by unique key where possible).

---

## Demo Account Credentials

All demo accounts use the same password: **`Demo1234!`**

| Role | Name | Email | Notes |
|---|---|---|---|
| Client | Alex Johnson | `client@demo.gymos.io` | Beginner, weight loss goal, assigned trainer |
| Client | Sam Rivera | `alex@demo.gymos.io` | Intermediate, muscle gain goal, assigned trainer |
| Client | Jordan Lee | `jordan@demo.gymos.io` | Advanced, strength goal, no trainer |
| Trainer | Coach Morgan | `trainer@demo.gymos.io` | 2 active clients, 3 assigned programs |
| Admin | GymOS Admin | `admin@demo.gymos.io` | Full platform access |

> These accounts are for **local development only**. Do not seed a production database with these credentials.

---

## What Gets Seeded

### Users and Profiles
- 3 client users with completed onboarding profiles (height, weight, goal, activity level, dietary preferences).
- 1 trainer user with a trainer profile (bio, specialties, certifications).
- 1 admin user.
- Client–trainer relationships linking the two beginner/intermediate clients to the demo trainer.

### Macro Plans
Each seeded client has an active macro plan calculated from their profile:

| Client | Calories | Protein | Carbs | Fat |
|---|---|---|---|---|
| Alex (weight loss) | ~1,800 kcal | ~135g | ~180g | ~50g |
| Sam (muscle gain) | ~2,500 kcal | ~188g | ~281g | ~69g |
| Jordan (strength) | ~2,900 kcal | ~218g | ~326g | ~81g |

### Exercise Library
~50 exercises across major movement patterns:
- **Compound lifts:** Barbell Back Squat, Deadlift, Bench Press, Overhead Press, Barbell Row
- **Accessory work:** Dumbbell Curl, Tricep Pushdown, Lat Pulldown, Cable Fly, etc.
- **Cardio:** Treadmill Run, Rowing Machine, Assault Bike
- **Bodyweight:** Pull-up, Dip, Push-up, Plank, Box Jump

Each exercise includes coaching cues, tutorial steps, common mistakes, and safety notes.

### Workout Programs
- **Alex's program:** 3-day beginner full-body program (12 weeks, LOSE_WEIGHT goal)
- **Sam's program:** 4-day upper/lower split (8 weeks, GAIN_MUSCLE goal)
- **Jordan's program:** 5-day PPL (push/pull/legs) strength program (12 weeks, INCREASE_STRENGTH goal)

Each program includes multiple weeks, workout days, and exercise prescriptions with sets, reps, weight, and rest intervals.

### Session History
- Alex: 8 completed sessions over the past 4 weeks
- Sam: 12 completed sessions with set logs and RPE ratings
- Jordan: 20 completed sessions with progressive overload visible in the logs

### Progress Check-ins
- Alex: 4 weekly check-ins with body weight and measurements
- Sam: 8 bi-weekly check-ins
- Jordan: 12 check-ins over 3 months

### Meal Library
~20 pre-built meals with full nutritional info and ingredient lists:
- Chicken & Rice Bowl, Greek Yoghurt Parfait, Oat Porridge with Berries
- Salmon & Quinoa, Turkey Wrap, Protein Smoothie
- (and more)

### Subscriptions
All demo users are created with a `FREE` plan in `TRIALING` status with a 14-day trial end date in the future.

---

## Resetting and Reseeding

To wipe all data and start fresh:

```bash
cd apps/api && npx prisma migrate reset --force
```

This drops and recreates the database, runs all migrations, and then runs the seed script automatically. It is equivalent to:

```bash
npx prisma migrate reset --force
# (migrate reset calls the seed script defined in package.json prisma.seed)
```

To reset without the seed:

```bash
cd apps/api && npx prisma migrate reset --force --skip-seed
npm run db:seed  # seed separately when ready
```

---

## Adding Custom Seed Data

The seed script is located at `apps/api/prisma/seed.ts`. To add your own demo data:

1. Open `apps/api/prisma/seed.ts`.
2. Add your records using the Prisma client (already imported at the top of the file).
3. Follow the existing upsert pattern to keep the script idempotent:

```typescript
await prisma.exercise.upsert({
  where: { slug: 'my-new-exercise' },
  update: {},
  create: {
    name: 'My New Exercise',
    slug: 'my-new-exercise',
    description: '...',
    // … other fields
  },
});
```

4. Run `npm run db:seed` to apply your additions.

### Adding a New Demo User

```typescript
const passwordHash = await bcrypt.hash('Demo1234!', 12);

await prisma.user.upsert({
  where: { email: 'newuser@demo.gymos.io' },
  update: {},
  create: {
    email: 'newuser@demo.gymos.io',
    passwordHash,
    firstName: 'New',
    lastName: 'User',
    role: 'CLIENT',
    isActive: true,
  },
});
```

---

## Verifying the Seed

After seeding, check the data using Prisma Studio:

```bash
npm run db:studio
```

This opens a browser-based GUI at `http://localhost:5555` where you can browse all tables.

Alternatively, verify via the API:

```bash
# Log in as the demo client
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@demo.gymos.io","password":"Demo1234!"}'

# Use the returned token to check the macro plan
TOKEN="<paste token here>"
curl http://localhost:3000/api/v1/me/macros/current \
  -H "Authorization: Bearer $TOKEN"
```
