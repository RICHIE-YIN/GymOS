# GymOS — End-to-End Test Scenarios

This document describes the key end-to-end (E2E) test scenarios for the GymOS platform. Each scenario walks through a realistic user journey from start to finish, covering the mobile app (client-facing), the trainer web dashboard, and the API backend.

These scenarios are written as human-readable acceptance criteria and should be used as the basis for automated E2E tests (e.g., Detox for mobile, Playwright for the web app).

---

## Scenario 1: New Client Onboarding Flow

**Goal:** A brand-new user registers, completes the onboarding questionnaire, and receives their first macro plan and workout program suggestion.

**Actors:** New client (mobile app)

### Steps

1. **Launch the app.**
   - The Welcome screen is displayed with "Sign Up" and "Log In" options.

2. **Register a new account.**
   - Tap "Sign Up."
   - Enter a valid email address, a password meeting complexity requirements (8+ chars, 1 uppercase, 1 digit), first name, and last name.
   - Tap "Create Account."
   - **Expected:** The API returns `201 Created` with a JWT. The user is navigated to the Onboarding screen.

3. **Complete the onboarding questionnaire.**
   - Enter height and weight (in preferred units).
   - Select gender.
   - Select a fitness goal (e.g., "Lose Weight").
   - Select activity level (e.g., "Moderately Active").
   - Select experience level (e.g., "Beginner").
   - Select equipment access (e.g., "Commercial Gym").
   - Optionally note dietary preferences and any injuries.
   - Tap "Finish Setup."
   - **Expected:** `POST /api/v1/users/me/onboarding` returns `200 OK`. An initial macro plan is auto-generated and stored.

4. **View the generated macro plan.**
   - The app navigates to the Dashboard (home tab).
   - The Nutrition card displays the calculated daily calorie and macro targets.
   - **Expected:** `GET /api/v1/me/macros/current` returns the newly created plan.

5. **View the suggested workout program.**
   - The app shows a prompt to view or generate a workout program.
   - **Expected:** The user can view a suggested program appropriate for their goal and experience level.

### Pass Criteria
- Registration succeeds without errors.
- All onboarding fields are saved correctly in the user profile.
- Macro plan is present and values are non-zero positive integers.
- Dashboard loads without errors within 3 seconds.

---

## Scenario 2: Trainer Assigns a Program Flow

**Goal:** A trainer logs into the web dashboard, views their client list, selects a client, and assigns a custom workout program to that client.

**Actors:** Trainer (trainer web dashboard), Client (passive — receives the program)

### Steps

1. **Trainer logs in.**
   - Navigate to the trainer web app (`localhost:3001` in development).
   - Enter trainer credentials (email and password).
   - Tap "Log In."
   - **Expected:** `POST /api/v1/auth/login` returns `200 OK` with a JWT. The trainer is redirected to their dashboard.

2. **View the client list.**
   - Navigate to "Clients" in the sidebar.
   - **Expected:** A list of active clients is displayed, loaded via `GET /api/v1/trainer/clients`.

3. **Select a client.**
   - Click on a client name.
   - **Expected:** The client's profile page loads, showing their stats, current program (if any), and macro plan.

4. **Create or assign a program.**
   - Click "Assign Program."
   - Choose to create a new program or select from existing templates.
   - Configure program details: title, goal type, duration (weeks), workout days per week.
   - Add exercises to each workout day with prescribed sets, reps, weight, and rest intervals.
   - Click "Save and Assign."
   - **Expected:** `POST /api/v1/programs` creates the program; it is associated with the client.

5. **Verify the client can see the program.**
   - The client opens the mobile app.
   - The "Program" tab shows the newly assigned program with all workout days visible.
   - **Expected:** `GET /api/v1/programs/active` returns the assigned program for the client.

### Pass Criteria
- Trainer can log in and access the client list.
- Program creation succeeds with all exercises and prescriptions saved.
- The client's app reflects the assigned program without requiring a manual refresh.
- The trainer cannot access programs belonging to unrelated clients (authorization check).

---

## Scenario 3: Client Logs a Workout Session Flow

**Goal:** A client opens the mobile app, starts a workout session based on their assigned program, logs multiple sets for each exercise, and finishes the session.

**Actors:** Client (mobile app)

### Steps

1. **Client logs in.**
   - Open the mobile app and log in with valid credentials.
   - **Expected:** JWT obtained; user navigated to the Dashboard.

2. **Navigate to today's workout.**
   - Tap the "Workout" tab.
   - The current day's prescribed workout is displayed (exercises, sets, reps, weight targets).
   - **Expected:** The UI reads from the active program's workout day schedule.

3. **Start the session.**
   - Tap "Start Workout."
   - **Expected:** `POST /api/v1/sessions/start` returns `201 Created` with a new session ID and `completed: false`.

4. **Log the first exercise — Barbell Back Squat.**
   - The exercise card is displayed with prescribed sets/reps/weight.
   - For each set (e.g., 3 sets × 5 reps @ 100 kg):
     - Tap "Log Set."
     - Enter or confirm weight and reps performed.
     - Optionally enter an RPE rating.
     - Tap "Save Set."
     - **Expected:** `POST /api/v1/sessions/:id/log-set` returns `201 Created`.

5. **Log remaining exercises.**
   - Repeat step 4 for all remaining exercises in the workout.

6. **Finish the session.**
   - Tap "Finish Workout."
   - Optionally add a session note (e.g., "PR on squats!").
   - Tap "Confirm."
   - **Expected:** `POST /api/v1/sessions/:id/finish` returns `200 OK` with `completed: true` and a calculated `durationMinutes`.

7. **View session summary.**
   - A summary screen displays total sets logged, duration, and exercises completed.
   - **Expected:** Summary data matches the set logs submitted during the session.

8. **Verify session appears in history.**
   - Navigate to the "History" tab.
   - **Expected:** The just-completed session appears at the top of the list, returned by `GET /api/v1/me/sessions/history`.

### Pass Criteria
- Session starts successfully.
- All set logs are saved and associated with the correct session and exercise IDs.
- Session finishes with correct duration (calculated server-side as `endedAt - startedAt`).
- Session history shows the completed session.
- Attempting to log a set to an already-finished session returns `400 Bad Request`.

---

## Scenario 4: Macro Tracking Flow

**Goal:** A client views their daily nutrition targets, logs their food intake throughout the day, and checks their progress against their macro targets.

**Actors:** Client (mobile app)

### Steps

1. **Client logs in and opens the Nutrition tab.**
   - **Expected:** `GET /api/v1/me/macros/current` returns the active macro plan. Daily targets (calories, protein, carbs, fat) are displayed.

2. **View today's nutrition log.**
   - The Nutrition screen shows consumed vs. target macros for today, initialised at zero.
   - **Expected:** `GET /api/v1/me/nutrition/today` returns or creates a `DailyNutritionLog` with today's date.

3. **Log breakfast.**
   - Tap "Log Food" or "Add Meal."
   - Search for a meal or food item (e.g., "Chicken & Rice Bowl").
   - Confirm and log the meal.
   - **Expected:** `PATCH /api/v1/me/nutrition/today` updates `consumedCalories`, `consumedProtein`, `consumedCarbs`, `consumedFat`.
   - The progress bars on the Nutrition screen update to reflect the logged values.

4. **Log lunch and dinner similarly.**
   - Repeat step 3 for additional meals.

5. **Check end-of-day summary.**
   - By end of day, the consumed macros are visible alongside targets.
   - A visual indicator (e.g., green/amber/red) shows whether the client is on track.
   - **Expected:** `consumedCalories` is within ±10% of `targetCalories` for a well-tracked day.

6. **Update macro targets (optional).**
   - The client decides to adjust their protein target.
   - Navigate to Settings > Nutrition.
   - Edit the macro targets and tap "Save."
   - **Expected:** `PATCH /api/v1/me/macros/current` deactivates the old plan and creates a new one with `sourceType: USER_CUSTOM`. The new targets are immediately reflected in the UI.

7. **View macro history (optional).**
   - The client can see a history of their previous macro plans.
   - **Expected:** `GET /api/v1/me/macros/history` returns all past plans ordered by date descending.

### Pass Criteria
- Daily nutrition log is created automatically on first access for the day.
- Consumed macro values update correctly after each food log entry.
- Updating macros creates a new plan and deactivates the previous one.
- Macro history lists all past plans without duplicates.
- Progress bars and indicators render correctly for zero, partial, and over-target values.

---

## General E2E Considerations

### Authentication
- All authenticated endpoints must return `401 Unauthorized` when accessed without a token.
- Expired tokens must return `401` with code `INVALID_TOKEN`.
- Role-restricted endpoints must return `403 Forbidden` for users with insufficient roles.

### Error Handling
- Submitting invalid data (wrong types, missing fields) must return `422 Unprocessable Entity` with a `details` object identifying each invalid field.
- Accessing resources belonging to another user must return `404 Not Found` (not `403`) to avoid leaking resource existence.

### Performance
- All API responses in these flows should complete within 500ms under normal load.
- The mobile app should render each screen within 300ms after data is received.

### Data Isolation
- E2E tests should use dedicated test accounts (seeded via `npm run db:seed`) and clean up after each test run.
- Never run E2E tests against the production database.
