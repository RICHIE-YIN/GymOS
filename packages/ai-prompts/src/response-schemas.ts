import { z } from 'zod';

// ─── Meal Response Schema ─────────────────────────────────────────────────────

export const MealIngredientResponseSchema = z.object({
  name: z.string().min(1),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative().nullable().optional(),
});

export const MealResponseSchema = z.object({
  title: z.string().min(1),
  mealType: z.enum([
    'BREAKFAST',
    'LUNCH',
    'DINNER',
    'SNACK',
    'PRE_WORKOUT',
    'POST_WORKOUT',
  ]),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative().nullable().optional(),
  servingSize: z.number().positive().nullable().optional(),
  servingUnit: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  ingredients: z.array(MealIngredientResponseSchema).min(1),
});

export type MealResponse = z.infer<typeof MealResponseSchema>;
export type MealIngredientResponse = z.infer<typeof MealIngredientResponseSchema>;

// ─── Workout Plan Response Schema ─────────────────────────────────────────────

export const WorkoutExerciseResponseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive(),
  repsMin: z.number().int().positive().nullable().optional(),
  repsMax: z.number().int().positive().nullable().optional(),
  durationSeconds: z.number().int().positive().nullable().optional(),
  restSeconds: z.number().int().nonnegative().nullable().optional(),
  tempo: z.string().nullable().optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const WorkoutDayResponseSchema = z.object({
  dayNumber: z.number().int().positive(),
  name: z.string().min(1),
  targetMuscleGroups: z.array(z.string()).min(0),
  isRestDay: z.boolean(),
  estimatedDurationMinutes: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  exercises: z.array(WorkoutExerciseResponseSchema),
});

export const WorkoutWeekResponseSchema = z.object({
  weekNumber: z.number().int().positive(),
  name: z.string().optional(),
  notes: z.string().nullable().optional(),
  days: z.array(WorkoutDayResponseSchema).min(1),
});

export const WorkoutPlanResponseSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  splitType: z.enum([
    'FULL_BODY',
    'UPPER_LOWER',
    'PUSH_PULL_LEGS',
    'BODY_PART',
    'ARNOLD',
    'BRO_SPLIT',
    'CUSTOM',
  ]),
  durationWeeks: z.number().int().positive(),
  daysPerWeek: z.number().int().min(1).max(7),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  equipmentRequired: z.array(z.string()).min(0),
  goals: z.array(z.string()).min(1),
  weeks: z.array(WorkoutWeekResponseSchema).min(1),
});

export type WorkoutPlanResponse = z.infer<typeof WorkoutPlanResponseSchema>;
export type WorkoutWeekResponse = z.infer<typeof WorkoutWeekResponseSchema>;
export type WorkoutDayResponse = z.infer<typeof WorkoutDayResponseSchema>;
export type WorkoutExerciseResponse = z.infer<typeof WorkoutExerciseResponseSchema>;

// ─── Substitution Response Schema ─────────────────────────────────────────────

export const SubstitutionResponseSchema = z.object({
  originalIngredient: z.string().min(1),
  substitute: z.string().min(1),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative().nullable().optional(),
  reasoning: z.string().min(1),
});

export type SubstitutionResponse = z.infer<typeof SubstitutionResponseSchema>;

// ─── Weekly Summary Response Schema ───────────────────────────────────────────

export const WeeklySummaryResponseSchema = z.object({
  headline: z.string().min(1),
  highlights: z.array(z.string()).min(1),
  areasForImprovement: z.array(z.string()),
  recommendation: z.string().min(1),
  motivationalMessage: z.string().min(1),
});

export type WeeklySummaryResponse = z.infer<typeof WeeklySummaryResponseSchema>;

// ─── Coach Message Response Schema ────────────────────────────────────────────

export const CoachMessageResponseSchema = z.object({
  response: z.string().min(1),
  suggestedFollowUps: z.array(z.string()),
});

export type CoachMessageResponse = z.infer<typeof CoachMessageResponseSchema>;

// ─── Trainer Message Response Schema ─────────────────────────────────────────

export const TrainerMessageResponseSchema = z.object({
  subject: z.string().min(1),
  messageDraft: z.string().min(1),
  toneNotes: z.string(),
});

export type TrainerMessageResponse = z.infer<typeof TrainerMessageResponseSchema>;
