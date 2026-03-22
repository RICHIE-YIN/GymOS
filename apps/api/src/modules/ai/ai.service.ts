import { env } from '../../config/env';

// ============================================================
// Types
// ============================================================

export interface UserProfileContext {
  goalType?: string;
  activityLevel?: string;
  experienceLevel?: string;
  currentWeightKg?: number;
  heightCm?: number;
  gender?: string;
  age?: number;
  injuriesNotes?: string;
  equipmentAccess?: string;
}

export interface MacroPlanContext {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sourceType: string;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealVariant {
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  ingredients: Array<{ name: string; amount: string }>;
  instructions: string[];
  tags: string[];
}

export interface WorkoutDraftDay {
  dayNumber: number;
  title: string;
  exercises: Array<{
    name: string;
    sets: number;
    repsMin: number;
    repsMax: number;
    restSeconds: number;
    notes?: string;
  }>;
}

// ============================================================
// Safety guardrails
// ============================================================

const SAFETY_DISCLAIMER =
  'Note: This information is for general fitness purposes only and does not constitute medical advice. Always consult with a healthcare provider before starting a new fitness or nutrition program, especially if you have any medical conditions or injuries.';

const FORBIDDEN_TOPICS = [
  'medical diagnosis',
  'prescribe medication',
  'cure disease',
  'treat injury',
  'diagnose',
];

function hasForbiddenContent(message: string): boolean {
  const lower = message.toLowerCase();
  return FORBIDDEN_TOPICS.some((topic) => lower.includes(topic));
}

function validateOutputStructure<T>(output: unknown, expectedKeys: string[]): output is T {
  if (typeof output !== 'object' || output === null) return false;
  return expectedKeys.every((key) => key in (output as Record<string, unknown>));
}

// ============================================================
// OpenAI abstraction layer
// ============================================================

async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content ?? '';
}

const GYMOS_SYSTEM_PROMPT = `You are GymOS Coach, an expert AI fitness and nutrition assistant.
You provide personalized, evidence-based guidance on exercise, nutrition, and wellness.
CRITICAL SAFETY RULES:
1. NEVER provide medical diagnoses, treatment advice, or prescription recommendations
2. ALWAYS recommend consulting a healthcare provider for medical concerns
3. NEVER suggest extreme caloric deficits (below 1200 cal/day for women, 1500 for men)
4. ALWAYS acknowledge individual variation and the importance of professional guidance
5. Keep responses practical, encouraging, and science-based`;

// ============================================================
// AI Service Methods
// ============================================================

export async function explainMacroPlan(
  userProfile: UserProfileContext,
  macroPlan: MacroPlanContext,
): Promise<string> {
  const mockResponse = `Your macro plan is designed to support your ${userProfile.goalType?.replace(/_/g, ' ').toLowerCase() || 'fitness'} goal:

**Daily Targets:**
- Calories: ${macroPlan.calories} kcal
- Protein: ${macroPlan.protein}g (${Math.round((macroPlan.protein * 4 / macroPlan.calories) * 100)}% of calories)
- Carbohydrates: ${macroPlan.carbs}g (${Math.round((macroPlan.carbs * 4 / macroPlan.calories) * 100)}% of calories)
- Fat: ${macroPlan.fat}g (${Math.round((macroPlan.fat * 9 / macroPlan.calories) * 100)}% of calories)

**Why these numbers?**
Protein is set high to preserve and build muscle tissue. Carbohydrates fuel your workouts and recovery. Fat supports hormone production and nutrient absorption.

**Tips for hitting your targets:**
- Prioritize protein at every meal
- Time carbohydrates around workouts for best results
- Use tracking apps like MyFitnessPal to monitor intake

${SAFETY_DISCLAIMER}`;

  if (!env.OPENAI_API_KEY) {
    return mockResponse;
  }

  try {
    const prompt = `Explain this macro plan to the user in a friendly, educational way:
Profile: Goal=${userProfile.goalType}, Activity=${userProfile.activityLevel}, Experience=${userProfile.experienceLevel}
Macros: ${macroPlan.calories} calories, ${macroPlan.protein}g protein, ${macroPlan.carbs}g carbs, ${macroPlan.fat}g fat
Keep it under 300 words and include practical tips. End with a brief safety disclaimer.`;

    return await callOpenAI(prompt, GYMOS_SYSTEM_PROMPT);
  } catch {
    return mockResponse;
  }
}

export async function generateMealVariants(
  macroTargets: MacroTargets,
  preferences: { dietaryPreferences?: string[]; excludedFoods?: string[]; mealType?: string },
): Promise<MealVariant[]> {
  const mockMeals: MealVariant[] = [
    {
      title: 'Grilled Chicken & Rice Bowl',
      description: 'A balanced, protein-rich bowl perfect for post-workout recovery.',
      calories: Math.round(macroTargets.calories / 4),
      protein: Math.round(macroTargets.protein / 4),
      carbs: Math.round(macroTargets.carbs / 4),
      fat: Math.round(macroTargets.fat / 4),
      prepTimeMinutes: 10,
      ingredients: [
        { name: 'Chicken breast', amount: '150g' },
        { name: 'Brown rice', amount: '80g dry' },
        { name: 'Broccoli', amount: '100g' },
        { name: 'Olive oil', amount: '1 tbsp' },
      ],
      instructions: ['Cook rice according to package.', 'Season and grill chicken.', 'Steam broccoli. Combine and serve.'],
      tags: ['high-protein', 'meal-prep', 'gluten-free'],
    },
    {
      title: 'Greek Yogurt Protein Bowl',
      description: 'A quick, high-protein breakfast or snack.',
      calories: Math.round(macroTargets.calories / 5),
      protein: Math.round(macroTargets.protein / 4),
      carbs: Math.round(macroTargets.carbs / 6),
      fat: Math.round(macroTargets.fat / 5),
      prepTimeMinutes: 5,
      ingredients: [
        { name: 'Greek yogurt (0%)', amount: '200g' },
        { name: 'Berries', amount: '80g' },
        { name: 'Granola', amount: '30g' },
        { name: 'Honey', amount: '1 tsp' },
      ],
      instructions: ['Combine yogurt and berries.', 'Top with granola and honey.'],
      tags: ['breakfast', 'quick', 'no-cook'],
    },
    {
      title: 'Salmon & Sweet Potato',
      description: 'Omega-3 rich dinner for muscle recovery and heart health.',
      calories: Math.round(macroTargets.calories / 3),
      protein: Math.round(macroTargets.protein / 3),
      carbs: Math.round(macroTargets.carbs / 3),
      fat: Math.round(macroTargets.fat / 2),
      prepTimeMinutes: 25,
      ingredients: [
        { name: 'Salmon fillet', amount: '180g' },
        { name: 'Sweet potato', amount: '200g' },
        { name: 'Asparagus', amount: '100g' },
        { name: 'Lemon', amount: '1/2' },
      ],
      instructions: ['Roast sweet potato at 200°C for 20 min.', 'Pan-sear salmon 4 min per side.', 'Steam asparagus. Serve with lemon.'],
      tags: ['dinner', 'omega-3', 'gluten-free'],
    },
  ];

  if (!env.OPENAI_API_KEY) {
    return mockMeals;
  }

  try {
    const prompt = `Generate 3 meal ideas as a JSON array matching these macro targets per meal:
Target calories: ~${Math.round(macroTargets.calories / 4)} per meal
Target protein: ~${Math.round(macroTargets.protein / 4)}g per meal
Preferences: ${preferences.dietaryPreferences?.join(', ') || 'none'}
Excluded foods: ${preferences.excludedFoods?.join(', ') || 'none'}
Meal type: ${preferences.mealType || 'any'}

Return ONLY a JSON array with this exact structure:
[{"title": string, "description": string, "calories": number, "protein": number, "carbs": number, "fat": number, "prepTimeMinutes": number, "ingredients": [{"name": string, "amount": string}], "instructions": string[], "tags": string[]}]`;

    const result = await callOpenAI(prompt, GYMOS_SYSTEM_PROMPT);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    }
    return mockMeals;
  } catch {
    return mockMeals;
  }
}

export async function suggestSubstitutions(
  meal: { title: string; ingredients: Array<{ ingredientName: string; substitutionGroup?: string | null }> },
  excludedFoods: string[],
): Promise<Array<{ original: string; substitutes: string[] }>> {
  const mockSubs = meal.ingredients.map((ing) => ({
    original: ing.ingredientName,
    substitutes: ['Similar protein alternative', 'Plant-based option', 'Lower calorie version'],
  }));

  if (!env.OPENAI_API_KEY) {
    return mockSubs;
  }

  try {
    const prompt = `Suggest ingredient substitutions for the meal "${meal.title}".
Ingredients: ${meal.ingredients.map((i) => i.ingredientName).join(', ')}
Foods to avoid: ${excludedFoods.join(', ')}
Return ONLY a JSON array: [{"original": string, "substitutes": string[]}]`;

    const result = await callOpenAI(prompt, GYMOS_SYSTEM_PROMPT);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    }
    return mockSubs;
  } catch {
    return mockSubs;
  }
}

export async function draftWorkoutPlan(
  userProfile: UserProfileContext,
  constraints: { daysPerWeek: number; durationMinutes: number; equipment?: string },
): Promise<WorkoutDraftDay[]> {
  const mockPlan: WorkoutDraftDay[] = Array.from({ length: constraints.daysPerWeek }, (_, i) => ({
    dayNumber: i + 1,
    title: ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio'][i % 7],
    exercises: [
      { name: 'Barbell Back Squat', sets: 4, repsMin: 6, repsMax: 8, restSeconds: 120 },
      { name: 'Romanian Deadlift', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 90 },
      { name: 'Leg Press', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { name: 'Leg Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { name: 'Calf Raise', sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60 },
    ],
  }));

  if (!env.OPENAI_API_KEY) {
    return mockPlan;
  }

  try {
    const prompt = `Draft a ${constraints.daysPerWeek}-day workout plan as JSON.
User: Goal=${userProfile.goalType}, Experience=${userProfile.experienceLevel}, Equipment=${userProfile.equipmentAccess || constraints.equipment}
Session duration: ${constraints.durationMinutes} minutes
Return ONLY a JSON array: [{"dayNumber": number, "title": string, "exercises": [{"name": string, "sets": number, "repsMin": number, "repsMax": number, "restSeconds": number, "notes"?: string}]}]`;

    const result = await callOpenAI(prompt, GYMOS_SYSTEM_PROMPT);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    }
    return mockPlan;
  } catch {
    return mockPlan;
  }
}

export async function summarizeProgress(userLogs: {
  checkIns: Array<{ date: Date; bodyWeightKg: number }>;
  sessions: Array<{ startedAt: Date; durationMinutes: number | null }>;
  weightChange: number | null;
}): Promise<string> {
  const mockSummary = `**Weekly Progress Summary**

${userLogs.checkIns.length > 0 ? `Your current weight: ${userLogs.checkIns[userLogs.checkIns.length - 1]?.bodyWeightKg}kg${userLogs.weightChange !== null ? ` (${userLogs.weightChange > 0 ? '+' : ''}${userLogs.weightChange.toFixed(1)}kg overall)` : ''}` : 'No weight check-ins recorded yet.'}

You completed **${userLogs.sessions.length} workout sessions** this period, totaling approximately **${userLogs.sessions.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0)} minutes** of training.

Keep up the consistency — it's the key to long-term results! Consider logging your meals and workouts daily for best insights.

${SAFETY_DISCLAIMER}`;

  if (!env.OPENAI_API_KEY) {
    return mockSummary;
  }

  try {
    const prompt = `Write an encouraging weekly progress summary for a fitness app user.
Data: ${JSON.stringify(userLogs)}
Keep it under 200 words, highlight positives, give 1-2 actionable tips. Include a brief safety disclaimer at the end.`;

    return await callOpenAI(prompt, GYMOS_SYSTEM_PROMPT);
  } catch {
    return mockSummary;
  }
}

export async function coachMessage(
  userId: string,
  message: string,
  context: {
    userProfile?: UserProfileContext;
    recentSessions?: number;
    currentMacros?: MacroTargets;
  },
): Promise<string> {
  // Safety check
  if (hasForbiddenContent(message)) {
    return `I'm not able to provide medical advice or diagnoses. For any health concerns, please consult with a qualified healthcare provider. I can help you with workout programming, general nutrition guidance, and fitness motivation instead! What fitness questions can I help you with?`;
  }

  const mockResponse = `Great question! As your AI coach, I'm here to help you stay on track with your fitness journey.

Based on your profile and goals, here's my guidance: Focus on consistency over perfection. Every workout you complete, every meal you track, and every check-in you log is building toward your goal.

If you're looking for specific advice on your program, nutrition, or progress, feel free to ask me anything specific!

${SAFETY_DISCLAIMER}`;

  if (!env.OPENAI_API_KEY) {
    return mockResponse;
  }

  try {
    const contextStr = `User context: Goal=${context.userProfile?.goalType}, Experience=${context.userProfile?.experienceLevel}, Recent sessions=${context.recentSessions || 0}`;
    const prompt = `${contextStr}\n\nUser message: "${message}"\n\nProvide a helpful, personalized coaching response. Keep it under 200 words.`;

    return await callOpenAI(prompt, GYMOS_SYSTEM_PROMPT);
  } catch {
    return mockResponse;
  }
}

export async function generateAdjustedWorkout(
  currentWorkout: { title: string; exercises: Array<{ name: string; sets: number; repsMin: number; repsMax: number }> },
  adjustments: { reason: string; constraints?: string },
): Promise<typeof currentWorkout> {
  const mockAdjusted = {
    title: `${currentWorkout.title} (Modified)`,
    exercises: currentWorkout.exercises.map((ex) => ({
      ...ex,
      sets: Math.max(2, ex.sets - 1),
      notes: `Adjusted: ${adjustments.reason}`,
    })),
  };

  if (!env.OPENAI_API_KEY) {
    return mockAdjusted;
  }

  try {
    const prompt = `Adjust this workout based on the user's feedback:
Current workout: ${JSON.stringify(currentWorkout)}
Adjustment reason: ${adjustments.reason}
Constraints: ${adjustments.constraints || 'none'}
Return ONLY valid JSON matching the exact same structure as the input workout.`;

    const result = await callOpenAI(prompt, GYMOS_SYSTEM_PROMPT);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (validateOutputStructure<typeof currentWorkout>(parsed, ['title', 'exercises'])) {
        return parsed;
      }
    }
    return mockAdjusted;
  } catch {
    return mockAdjusted;
  }
}
