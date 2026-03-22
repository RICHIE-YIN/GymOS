import prisma from '../../lib/prisma';
import { NotFoundError, AppError } from '../../middleware/error.middleware';

interface MacroCalculationParams {
  heightCm: number;
  currentWeightKg: number;
  activityLevel: string;
  goalType: string;
  gender?: string;
  age?: number;
}

interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function calculateMacrosFormula(params: MacroCalculationParams): MacroResult {
  const { heightCm, currentWeightKg, activityLevel, goalType, gender, age } = params;

  // Mifflin-St Jeor Equation
  const isMale = gender?.toLowerCase() !== 'female';
  const userAge = age ?? 30;
  const bmr = isMale
    ? 10 * currentWeightKg + 6.25 * heightCm - 5 * userAge + 5
    : 10 * currentWeightKg + 6.25 * heightCm - 5 * userAge - 161;

  const activityMultipliers: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTREMELY_ACTIVE: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] ?? 1.55);

  const goalAdjustments: Record<string, number> = {
    LOSE_WEIGHT: -500,
    GAIN_MUSCLE: 300,
    MAINTAIN: 0,
    IMPROVE_ENDURANCE: 100,
    INCREASE_STRENGTH: 200,
    GENERAL_FITNESS: 0,
  };

  const calories = Math.round(tdee + (goalAdjustments[goalType] ?? 0));

  // High protein macro split
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.45) / 4);
  const fat = Math.round((calories * 0.25) / 9);

  return { calories, protein, carbs, fat };
}

export async function calculateMacros(userId: string, profileData: MacroCalculationParams): Promise<MacroResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found.');
  return calculateMacrosFormula(profileData);
}

export async function getCurrentMacros(userId: string) {
  const plan = await prisma.macroPlan.findFirst({
    where: { userId, isActive: true },
    orderBy: { effectiveStartDate: 'desc' },
  });

  if (!plan) {
    throw new NotFoundError('No active macro plan found. Please complete onboarding.');
  }

  return plan;
}

export async function updateMacros(userId: string, data: Partial<MacroResult> & { sourceType?: string }) {
  // Deactivate current plan
  await prisma.macroPlan.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false, effectiveEndDate: new Date() },
  });

  const current = await prisma.macroPlan.findFirst({
    where: { userId },
    orderBy: { effectiveStartDate: 'desc' },
  });

  const newPlan = await prisma.macroPlan.create({
    data: {
      userId,
      sourceType: (data.sourceType as any) ?? 'USER_CUSTOM',
      calories: data.calories ?? current?.calories ?? 2000,
      protein: data.protein ?? current?.protein ?? 150,
      carbs: data.carbs ?? current?.carbs ?? 225,
      fat: data.fat ?? current?.fat ?? 56,
      effectiveStartDate: new Date(),
      isActive: true,
    },
  });

  return newPlan;
}

export async function getMacroHistory(userId: string) {
  return prisma.macroPlan.findMany({
    where: { userId },
    orderBy: { effectiveStartDate: 'desc' },
  });
}

export async function getTodayNutrition(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let log = await prisma.dailyNutritionLog.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (!log) {
    // Auto-create today's log from active macro plan
    const plan = await prisma.macroPlan.findFirst({
      where: { userId, isActive: true },
      orderBy: { effectiveStartDate: 'desc' },
    });

    log = await prisma.dailyNutritionLog.create({
      data: {
        userId,
        date: today,
        targetCalories: plan?.calories ?? 2000,
        targetProtein: plan?.protein ?? 150,
        targetCarbs: plan?.carbs ?? 225,
        targetFat: plan?.fat ?? 56,
      },
    });
  }

  return log;
}

export async function logNutrition(
  userId: string,
  data: {
    consumedCalories?: number;
    consumedProtein?: number;
    consumedCarbs?: number;
    consumedFat?: number;
  },
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Ensure log exists
  await getTodayNutrition(userId);

  return prisma.dailyNutritionLog.update({
    where: { userId_date: { userId, date: today } },
    data: {
      ...(data.consumedCalories !== undefined && { consumedCalories: data.consumedCalories }),
      ...(data.consumedProtein !== undefined && { consumedProtein: data.consumedProtein }),
      ...(data.consumedCarbs !== undefined && { consumedCarbs: data.consumedCarbs }),
      ...(data.consumedFat !== undefined && { consumedFat: data.consumedFat }),
    },
  });
}
