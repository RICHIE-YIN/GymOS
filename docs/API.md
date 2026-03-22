# API Reference

Base URL: `http://localhost:3000/api/v1` (development)

All responses use a consistent envelope format:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }

// Validation error (422)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": { "fieldName": ["Error message"] }
  }
}
```

**Authentication:** Protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register

Register a new user account.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass1",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "CLIENT"
}
```

| Field | Type | Rules |
|---|---|---|
| `email` | string | Valid email format; normalised to lowercase |
| `password` | string | Min 8 chars, at least 1 uppercase letter, at least 1 digit |
| `firstName` | string | 1–50 characters |
| `lastName` | string | 1–50 characters |
| `role` | `CLIENT` \| `TRAINER` | Optional; defaults to `CLIENT` |

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234...",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "CLIENT",
      "avatarUrl": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "<JWT access token>",
    "refreshToken": "<JWT refresh token>"
  }
}
```

**Errors:** `409 CONFLICT` — email already registered. `422 VALIDATION_ERROR` — invalid input.

---

### POST /auth/login

Authenticate with email and password.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "<JWT access token>",
    "refreshToken": "<JWT refresh token>"
  }
}
```

**Errors:** `401 UNAUTHORIZED` — wrong email or password. `403 ACCOUNT_DEACTIVATED` — account has been disabled.

---

### POST /auth/logout

_Requires authentication._

Logs the current user out (stateless — client should discard the token).

**Response `200 OK`:**
```json
{ "success": true, "data": { "message": "Logged out successfully." } }
```

---

### GET /auth/me

_Requires authentication._

Returns the authenticated user's full profile.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234...",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "CLIENT",
      "avatarUrl": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "userProfile": { ... },
      "trainerProfile": null,
      "subscription": {
        "planType": "FREE",
        "status": "TRIALING",
        "trialEndsAt": "2024-01-15T00:00:00.000Z",
        "currentPeriodEnd": null
      }
    }
  }
}
```

---

### POST /auth/refresh

Exchange a refresh token for a new access token.

**Request body:**
```json
{ "refreshToken": "<JWT refresh token>" }
```

**Response `200 OK`:**
```json
{ "success": true, "data": { "token": "<new JWT access token>" } }
```

**Errors:** `401 INVALID_TOKEN` — refresh token is expired or invalid.

---

## User / Profile Endpoints

All `/users` endpoints require authentication.

### GET /users/me/profile

Returns the current user's profile data.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234...",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "userProfile": {
        "id": "prof_001",
        "gender": "female",
        "birthDate": "1995-03-15T00:00:00.000Z",
        "heightCm": 165,
        "currentWeightKg": 65,
        "goalType": "LOSE_WEIGHT",
        "activityLevel": "MODERATELY_ACTIVE",
        "experienceLevel": "BEGINNER",
        "equipmentAccess": "COMMERCIAL_GYM",
        "workoutDaysPerWeek": 3,
        "preferredWorkoutDurationMinutes": 60,
        "dietaryPreferences": [],
        "onboardingComplete": true
      }
    }
  }
}
```

---

### PATCH /users/me/profile

Update profile fields (partial update supported).

**Request body (all fields optional):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "currentWeightKg": 63.5,
  "goalType": "MAINTAIN",
  "workoutDaysPerWeek": 4
}
```

**Response `200 OK`:** Returns the updated profile (same shape as GET).

---

### POST /users/me/onboarding

Complete the initial onboarding questionnaire. Creates the user's profile and auto-generates their first macro plan.

**Request body:**
```json
{
  "gender": "female",
  "birthDate": "1995-03-15",
  "heightCm": 165,
  "currentWeightKg": 65,
  "goalType": "LOSE_WEIGHT",
  "activityLevel": "MODERATELY_ACTIVE",
  "experienceLevel": "BEGINNER",
  "equipmentAccess": "COMMERCIAL_GYM",
  "workoutDaysPerWeek": 3,
  "preferredWorkoutDurationMinutes": 60,
  "dietaryPreferences": ["HIGH_PROTEIN"],
  "excludedFoods": ["nuts"],
  "injuriesNotes": "Left knee tendinitis",
  "unitsPreference": "IMPERIAL"
}
```

**Response `200 OK`:** Returns the created `UserProfile`.

---

### GET /users/me/stats

Returns summary statistics for the current user.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalWorkoutSessions": 24,
    "totalCheckIns": 8,
    "hasActiveProgram": true,
    "lastCheckInDate": "2024-06-01T00:00:00.000Z"
  }
}
```

---

## Macros Endpoints

### POST /macros/calculate

_Requires authentication._

Calculate macros based on supplied body stats. Does not save a plan — use `PATCH /me/macros/current` to persist.

**Request body:**
```json
{
  "heightCm": 175,
  "currentWeightKg": 80,
  "activityLevel": "MODERATELY_ACTIVE",
  "goalType": "GAIN_MUSCLE",
  "gender": "male",
  "age": 28
}
```

`goalType` values: `LOSE_WEIGHT`, `GAIN_MUSCLE`, `MAINTAIN`, `IMPROVE_ENDURANCE`, `INCREASE_STRENGTH`, `GENERAL_FITNESS`

`activityLevel` values: `SEDENTARY`, `LIGHTLY_ACTIVE`, `MODERATELY_ACTIVE`, `VERY_ACTIVE`, `EXTREMELY_ACTIVE`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "macros": {
      "calories": 2800,
      "protein": 210,
      "carbs": 315,
      "fat": 78
    }
  }
}
```

---

### GET /me/macros/current

_Requires authentication._

Returns the user's current active macro plan.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan_001",
      "userId": "clx1234...",
      "sourceType": "SYSTEM_DEFAULT",
      "calories": 2800,
      "protein": 210,
      "carbs": 315,
      "fat": 78,
      "effectiveStartDate": "2024-01-01T00:00:00.000Z",
      "effectiveEndDate": null,
      "isActive": true
    }
  }
}
```

**Errors:** `404 NOT_FOUND` — no active macro plan (user has not completed onboarding).

---

### PATCH /me/macros/current

_Requires authentication._

Update the current macro plan. Creates a new plan record and deactivates the old one.

**Request body (all fields optional):**
```json
{
  "calories": 2600,
  "protein": 195,
  "carbs": 292,
  "fat": 72,
  "sourceType": "USER_CUSTOM"
}
```

`sourceType` values: `AI_GENERATED`, `TRAINER_ASSIGNED`, `USER_CUSTOM`, `SYSTEM_DEFAULT`

**Response `200 OK`:** Returns the new plan.

---

### GET /me/macros/history

_Requires authentication._

Returns all past macro plans in reverse chronological order.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "history": [ { ...plan }, { ...plan } ]
  }
}
```

---

### GET /me/nutrition/today

_Requires authentication._

Returns or creates today's nutrition log. Automatically populates targets from the active macro plan.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "log": {
      "id": "log_001",
      "date": "2024-06-10T00:00:00.000Z",
      "targetCalories": 2800,
      "targetProtein": 210,
      "targetCarbs": 315,
      "targetFat": 78,
      "consumedCalories": 1200,
      "consumedProtein": 95,
      "consumedCarbs": 130,
      "consumedFat": 35
    }
  }
}
```

---

### PATCH /me/nutrition/today

_Requires authentication._

Update the consumed macro values for today.

**Request body (all fields optional):**
```json
{
  "consumedCalories": 1800,
  "consumedProtein": 140,
  "consumedCarbs": 195,
  "consumedFat": 52
}
```

**Response `200 OK`:** Returns the updated log.

---

## Exercise Endpoints

### GET /exercises

Returns the full exercise library. Supports filtering.

**Query params:**
- `search` — string filter on exercise name
- `muscleGroup` — filter by primary muscle group
- `equipment` — filter by equipment type

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "ex_001",
        "name": "Barbell Back Squat",
        "slug": "barbell-back-squat",
        "primaryMuscleGroup": "quadriceps",
        "equipment": "barbell",
        "difficulty": "intermediate",
        "movementPattern": "squat"
      }
    ]
  }
}
```

---

### GET /exercises/:slug

Returns full details for a single exercise including coaching cues and tutorial steps.

---

## Program Endpoints

### GET /programs

_Requires authentication._

Returns the current user's workout programs.

---

### POST /programs

_Requires authentication._

Create a new workout program.

**Request body:**
```json
{
  "title": "12-Week Strength Builder",
  "description": "Progressive strength program for intermediate lifters.",
  "goalType": "INCREASE_STRENGTH",
  "durationWeeks": 12,
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "dayNumber": 1,
          "title": "Day 1 — Lower Body",
          "estimatedDurationMinutes": 60,
          "exercises": [
            {
              "exerciseId": "ex_001",
              "sortOrder": 1,
              "prescribedSets": 5,
              "prescribedRepsMin": 3,
              "prescribedRepsMax": 5,
              "prescribedWeightKg": 100,
              "prescribedRestSeconds": 180
            }
          ]
        }
      ]
    }
  ]
}
```

**Response `201 Created`:** Returns the created program.

---

### GET /programs/active

_Requires authentication._

Returns the currently active program for the user.

---

### PATCH /programs/:id

_Requires authentication._

Update program metadata (title, description, etc.).

---

### DELETE /programs/:id

_Requires authentication._

Soft-delete a program (sets `isActive: false`).

---

## Session Endpoints

### POST /sessions/start

_Requires authentication._

Start a new workout session.

**Request body (optional):**
```json
{ "workoutDayId": "day_cuid_001" }
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "sess_001",
      "userId": "clx1234...",
      "workoutDayId": "day_cuid_001",
      "startedAt": "2024-06-10T09:00:00.000Z",
      "endedAt": null,
      "completed": false,
      "durationMinutes": null,
      "notes": null
    }
  }
}
```

---

### POST /sessions/:id/log-set

_Requires authentication._

Log a completed set within a session.

**Request body:**
```json
{
  "exerciseId": "ex_001",
  "setNumber": 1,
  "actualReps": 5,
  "actualWeightKg": 100,
  "actualRpe": 8,
  "notes": "Felt easy, increase next time."
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "setLog": {
      "id": "log_001",
      "sessionId": "sess_001",
      "exerciseId": "ex_001",
      "setNumber": 1,
      "actualWeightKg": 100,
      "actualReps": 5,
      "actualRpe": 8,
      "completed": true
    }
  }
}
```

**Errors:** `404 NOT_FOUND` — session not found or belongs to another user. `400 BAD_REQUEST` — session is already completed.

---

### POST /sessions/:id/finish

_Requires authentication._

Mark a session as complete.

**Request body (optional):**
```json
{ "notes": "PR on squats!" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "sess_001",
      "completed": true,
      "endedAt": "2024-06-10T10:05:00.000Z",
      "durationMinutes": 65
    }
  }
}
```

---

### GET /me/sessions/history

_Requires authentication._

Returns completed sessions for the current user.

**Query params:** `page` (default `1`), `limit` (default `20`)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "sessions": [ { ...session }, { ...session } ],
    "pagination": { "page": 1, "limit": 20, "total": 48 }
  }
}
```

---

## Progress Endpoints

### POST /me/progress/check-in

_Requires authentication._

Record a body measurement check-in.

**Request body:**
```json
{
  "bodyWeightKg": 79.5,
  "waistCm": 85,
  "chestCm": 102,
  "armCm": 38,
  "thighCm": 58,
  "notes": "Feeling leaner."
}
```

**Response `201 Created`:** Returns the created check-in record.

---

### GET /me/progress/check-ins

_Requires authentication._

Returns all check-ins in reverse chronological order.

---

### POST /me/progress/photos

_Requires authentication._

Upload a progress photo. Requires S3 configuration.

**Request:** `multipart/form-data` with fields `photo` (file) and `photoType` (`FRONT`, `BACK`, `SIDE_LEFT`, `SIDE_RIGHT`, `CUSTOM`).

---

## Trainer Endpoints

All `/trainer` endpoints require a `TRAINER` role.

### GET /trainer/clients

Returns the trainer's active client list.

### GET /trainer/clients/:clientId

Returns full profile and stats for a specific client.

### POST /trainer/clients/:clientId/assign-program

Assign a program to a client.

**Request body:**
```json
{ "programId": "prog_001" }
```

### PATCH /trainer/clients/:clientId/macros

Override a client's macro plan.

---

## Messaging Endpoints

### GET /me/threads

_Requires authentication._

Returns all message threads for the current user.

### POST /me/threads/:threadId/messages

_Requires authentication._

Send a message in a thread.

**Request body:**
```json
{ "content": "Great session today! How are you feeling?" }
```

### GET /me/threads/:threadId/messages

_Requires authentication._

Returns messages in a thread, paginated.

---

## AI Endpoints

### POST /ai/coach

_Requires authentication. Requires `OPENAI_API_KEY` to be set._

Chat with the AI fitness coach.

**Request body:**
```json
{
  "message": "Should I eat more carbs on training days?",
  "context": "weight_loss"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "reply": "Yes, carb cycling can be effective for weight loss while maintaining performance. On training days, aim to consume..."
  }
}
```

---

## Health Check

### GET /health

No authentication required.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-06-10T09:00:00.000Z",
    "version": "1.0.0",
    "environment": "development"
  }
}
```
