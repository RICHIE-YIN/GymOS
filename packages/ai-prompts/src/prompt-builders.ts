import type { UserProfile, GoalType } from '@gymos/shared-types';
import type { MacroPlan, MealType } from '@gymos/shared-types';
import type { WorkoutSession } from '@gymos/shared-types';
import type { ProgressCheckIn } from '@gymos/shared-types';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function section(title: string, lines: string[]): string {
  return `### ${title}\n${lines.map((l) => `- ${l}`).join('\n')}`;
}

function safetyReminder(): string {
  return `### Safety Reminder\n- Do not provide medical diagnoses or recommend medications.\n- Always advise consulting a healthcare professional for injuries or health conditions.`;
}

// ─── Context types ───────────────────────────────────────────────────────────

export interface UserProfileContext {
  profile: Pick<
    UserProfile,
    | 'goalType'
    | 'weightKg'
    | 'targetWeightKg'
    | 'heightCm'
    | 'activityLevel'
    | 'experienceLevel'
    | 'equipmentAccess'
    | 'dietaryStyle'
    | 'workoutsPerWeek'
  >;
  firstName: string;
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number | null;
}

export interface MealPreferences {
  dietaryStyle?: string | null;
  numberOfMeals?: number;
}

export interface MealSubstitutionContext {
  mealTitle: string;
  mealCalories: number;
  mealProteinG: number;
  mealCarbsG: number;
  mealFatG: number;
  ingredientToReplace: string;
}

export interface WorkoutConstraints {
  equipmentAccess?: string | null;
  daysPerWeek?: number | null;
  sessionDurationMinutes?: number | null;
  injuries?: string | null;
  preferences?: string | null;
}

export interface WeeklyProgressContext {
  weeklyLogs: Pick<
    WorkoutSession,
    'name' | 'completedAt' | 'durationMinutes' | 'totalVolumeKg' | 'caloriesBurned' | 'rpe'
  >[];
  checkIns: Pick<
    ProgressCheckIn,
    'checkInDate' | 'weightKg' | 'bodyFatPercent' | 'energyLevel' | 'sleepQuality' | 'stressLevel'
  >[];
  goals: {
    goalType?: GoalType | null;
    targetWeightKg?: number | null;
    currentWeightKg?: number | null;
  };
}

export interface TrainerClientContext {
  clientName: string;
  clientSummary: string;
  situation: string;
  trainerName?: string;
}

export interface CoachMessageContext {
  userMessage: string;
  userFirstName: string;
  goalType?: GoalType | null;
  currentWeightKg?: number | null;
  targetWeightKg?: number | null;
  activeProgramName?: string | null;
  recentWorkoutCount?: number;
  macroPlan?: Pick<MacroPlan, 'calories' | 'proteinG' | 'carbsG' | 'fatG'> | null;
}

// ─── Prompt builders ─────────────────────────────────────────────────────────

/**
 * Builds a prompt for explaining macro targets to a client.
 */
export function buildMacroExplanationPrompt(
  userProfile: UserProfileContext,
  macroPlan: MacroPlan,
): string {
  return [
    `### Task\nExplain the following macro targets to ${userProfile.firstName} in a clear, motivating way. Relate them to their specific goal.`,
    section('User Profile', [
      `Goal: ${userProfile.profile.goalType ?? 'Not specified'}`,
      `Current weight: ${userProfile.profile.weightKg ? `${userProfile.profile.weightKg} kg` : 'Not specified'}`,
      `Target weight: ${userProfile.profile.targetWeightKg ? `${userProfile.profile.targetWeightKg} kg` : 'Not specified'}`,
      `Activity level: ${userProfile.profile.activityLevel ?? 'Not specified'}`,
      `Experience level: ${userProfile.profile.experienceLevel ?? 'Not specified'}`,
    ]),
    section('Macro Targets', [
      `Calories: ${macroPlan.calories} kcal/day`,
      `Protein: ${macroPlan.proteinG}g/day`,
      `Carbohydrates: ${macroPlan.carbsG}g/day`,
      `Fat: ${macroPlan.fatG}g/day`,
      ...(macroPlan.fiberG ? [`Fiber: ${macroPlan.fiberG}g/day`] : []),
      ...(macroPlan.notes ? [`Trainer notes: ${macroPlan.notes}`] : []),
    ]),
    `### Output Format\nProvide a 3–5 sentence explanation covering: why these targets suit the user's goal, how to hit them practically, and an encouraging close.`,
    safetyReminder(),
  ].join('\n\n');
}

/**
 * Builds a prompt for generating a structured meal.
 */
export function buildMealGenerationPrompt(
  macroTargets: MacroTargets,
  preferences: MealPreferences,
  excludedFoods: string[],
  mealType: MealType,
): string {
  return [
    `### Task\nGenerate a single ${mealType} meal that fits within the macro targets below. Return valid JSON matching the meal schema.`,
    section('Macro Targets for This Meal', [
      `Calories: ${macroTargets.calories} kcal`,
      `Protein: ${macroTargets.proteinG}g`,
      `Carbohydrates: ${macroTargets.carbsG}g`,
      `Fat: ${macroTargets.fatG}g`,
      ...(macroTargets.fiberG ? [`Fiber: ${macroTargets.fiberG}g`] : []),
    ]),
    section('Preferences & Restrictions', [
      `Dietary style: ${preferences.dietaryStyle ?? 'None'}`,
      `Excluded foods (must not appear): ${excludedFoods.length > 0 ? excludedFoods.join(', ') : 'None'}`,
      `Meal type: ${mealType}`,
    ]),
    `### Output Format\nReturn a JSON object with the following structure:\n{\n  "title": string,\n  "mealType": "${mealType}",\n  "calories": number,\n  "proteinG": number,\n  "carbsG": number,\n  "fatG": number,\n  "fiberG": number | null,\n  "servingSize": number | null,\n  "servingUnit": string | null,\n  "notes": string | null,\n  "ingredients": [\n    {\n      "name": string,\n      "servingSize": number,\n      "servingUnit": string,\n      "calories": number,\n      "proteinG": number,\n      "carbsG": number,\n      "fatG": number,\n      "fiberG": number | null\n    }\n  ]\n}`,
    safetyReminder(),
  ].join('\n\n');
}

/**
 * Builds a prompt for substituting an ingredient in an existing meal.
 */
export function buildSubstitutionPrompt(
  meal: MealSubstitutionContext,
  ingredient: string,
  excludedFoods: string[],
): string {
  return [
    `### Task\nSuggest a suitable substitute for the ingredient "${ingredient}" in the meal described below. The substitute must keep the meal's macros as close as possible to the original.`,
    section('Original Meal', [
      `Title: ${meal.mealTitle}`,
      `Calories: ${meal.mealCalories} kcal`,
      `Protein: ${meal.mealProteinG}g`,
      `Carbohydrates: ${meal.mealCarbsG}g`,
      `Fat: ${meal.mealFatG}g`,
      `Ingredient to replace: ${ingredient}`,
    ]),
    section('Restrictions', [
      `Excluded foods (must not appear): ${excludedFoods.length > 0 ? excludedFoods.join(', ') : 'None'}`,
    ]),
    `### Output Format\nReturn a JSON object:\n{\n  "originalIngredient": string,\n  "substitute": string,\n  "servingSize": number,\n  "servingUnit": string,\n  "calories": number,\n  "proteinG": number,\n  "carbsG": number,\n  "fatG": number,\n  "fiberG": number | null,\n  "reasoning": string\n}`,
    safetyReminder(),
  ].join('\n\n');
}

/**
 * Builds a prompt for drafting a workout program.
 */
export function buildWorkoutDraftPrompt(
  userProfile: UserProfileContext,
  constraints: WorkoutConstraints,
): string {
  return [
    `### Task\nDraft a structured workout program for ${userProfile.firstName} based on their profile and constraints. Return valid JSON matching the workout program schema.`,
    section('User Profile', [
      `Goal: ${userProfile.profile.goalType ?? 'Not specified'}`,
      `Experience level: ${userProfile.profile.experienceLevel ?? 'Not specified'}`,
      `Activity level: ${userProfile.profile.activityLevel ?? 'Not specified'}`,
      `Preferred workouts per week: ${userProfile.profile.workoutsPerWeek ?? 'Not specified'}`,
    ]),
    section('Program Constraints', [
      `Equipment access: ${constraints.equipmentAccess ?? 'Full gym'}`,
      `Days per week: ${constraints.daysPerWeek ?? 'Flexible'}`,
      `Session duration: ${constraints.sessionDurationMinutes ? `${constraints.sessionDurationMinutes} minutes` : 'Flexible'}`,
      `Injuries or limitations: ${constraints.injuries ?? 'None reported'}`,
      `Preferences: ${constraints.preferences ?? 'None'}`,
    ]),
    `### Output Format\nReturn a JSON object with:\n{\n  "name": string,\n  "description": string,\n  "splitType": string,\n  "durationWeeks": number,\n  "daysPerWeek": number,\n  "difficulty": string,\n  "equipmentRequired": string[],\n  "goals": string[],\n  "weeks": [\n    {\n      "weekNumber": number,\n      "name": string,\n      "notes": string | null,\n      "days": [\n        {\n          "dayNumber": number,\n          "name": string,\n          "targetMuscleGroups": string[],\n          "isRestDay": boolean,\n          "estimatedDurationMinutes": number | null,\n          "notes": string | null,\n          "exercises": [\n            {\n              "name": string,\n              "sets": number,\n              "repsMin": number | null,\n              "repsMax": number | null,\n              "restSeconds": number | null,\n              "notes": string | null\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}`,
    safetyReminder(),
  ].join('\n\n');
}

/**
 * Builds a prompt for generating a weekly progress summary.
 */
export function buildProgressSummaryPrompt(context: WeeklyProgressContext): string {
  const completedWorkouts = context.weeklyLogs.filter((s) => s.completedAt).length;
  const latestCheckIn = context.checkIns[context.checkIns.length - 1];

  return [
    `### Task\nGenerate an encouraging, data-driven weekly progress summary for a client. Return valid JSON matching the weekly summary schema.`,
    section('Workout Data This Week', [
      `Completed workouts: ${completedWorkouts}`,
      `Total sessions logged: ${context.weeklyLogs.length}`,
      `Average RPE: ${
        context.weeklyLogs.filter((s) => s.rpe).length > 0
          ? (
              context.weeklyLogs.reduce((acc, s) => acc + (s.rpe ?? 0), 0) /
              context.weeklyLogs.filter((s) => s.rpe).length
            ).toFixed(1)
          : 'N/A'
      }`,
    ]),
    section('Latest Check-In', [
      `Date: ${latestCheckIn?.checkInDate ?? 'No check-in this week'}`,
      `Weight: ${latestCheckIn?.weightKg ? `${latestCheckIn.weightKg} kg` : 'Not recorded'}`,
      `Body fat: ${latestCheckIn?.bodyFatPercent ? `${latestCheckIn.bodyFatPercent}%` : 'Not recorded'}`,
      `Energy level: ${latestCheckIn?.energyLevel ?? 'Not recorded'}`,
      `Sleep quality: ${latestCheckIn?.sleepQuality ?? 'Not recorded'}`,
      `Stress level: ${latestCheckIn?.stressLevel ?? 'Not recorded'}`,
    ]),
    section('Goals', [
      `Goal type: ${context.goals.goalType ?? 'Not specified'}`,
      `Current weight: ${context.goals.currentWeightKg ? `${context.goals.currentWeightKg} kg` : 'Not specified'}`,
      `Target weight: ${context.goals.targetWeightKg ? `${context.goals.targetWeightKg} kg` : 'Not specified'}`,
    ]),
    `### Output Format\nReturn a JSON object:\n{\n  "headline": string,\n  "highlights": string[],\n  "areasForImprovement": string[],\n  "recommendation": string,\n  "motivationalMessage": string\n}`,
    safetyReminder(),
  ].join('\n\n');
}

/**
 * Builds a prompt for helping a trainer draft a message to a client.
 */
export function buildTrainerMessagePrompt(context: TrainerClientContext): string {
  return [
    `### Task\nHelp a fitness trainer draft a professional, encouraging message to a client based on the situation described below.`,
    section('Context', [
      `Trainer: ${context.trainerName ?? 'Trainer'}`,
      `Client: ${context.clientName}`,
      `Client summary: ${context.clientSummary}`,
      `Situation / reason for message: ${context.situation}`,
    ]),
    `### Output Format\nReturn a JSON object:\n{\n  "subject": string,\n  "messageDraft": string,\n  "toneNotes": string\n}`,
    safetyReminder(),
  ].join('\n\n');
}

/**
 * Builds a prompt for the AI coach to respond to a client message.
 */
export function buildCoachMessagePrompt(context: CoachMessageContext): string {
  return [
    `### Task\nRespond to the client's message below as their AI fitness coach. Be supportive, concise, and actionable.`,
    section('Client Context', [
      `Name: ${context.userFirstName}`,
      `Goal: ${context.goalType ?? 'Not specified'}`,
      `Current weight: ${context.currentWeightKg ? `${context.currentWeightKg} kg` : 'Not specified'}`,
      `Target weight: ${context.targetWeightKg ? `${context.targetWeightKg} kg` : 'Not specified'}`,
      `Active program: ${context.activeProgramName ?? 'None'}`,
      `Recent workouts (last 7 days): ${context.recentWorkoutCount ?? 0}`,
      ...(context.macroPlan
        ? [
            `Daily macro targets: ${context.macroPlan.calories} kcal | P: ${context.macroPlan.proteinG}g | C: ${context.macroPlan.carbsG}g | F: ${context.macroPlan.fatG}g`,
          ]
        : ['Macro targets: Not set']),
    ]),
    `### Client Message\n"${context.userMessage}"`,
    `### Output Format\nReturn a JSON object:\n{\n  "response": string,\n  "suggestedFollowUps": string[]\n}`,
    safetyReminder(),
  ].join('\n\n');
}
