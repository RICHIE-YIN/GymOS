import prisma from '../../lib/prisma';
import { AppError, NotFoundError } from '../../middleware/error.middleware';
import { Prisma } from '@prisma/client';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userProfile: true,
      trainerProfile: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User profile not found.');
  }

  return user;
}

export async function updateProfile(userId: string, data: Record<string, unknown>) {
  const { firstName, lastName, avatarUrl, ...profileData } = data as {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    [key: string]: unknown;
  };

  // Update user base fields if provided
  if (firstName || lastName || avatarUrl) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });
  }

  // Upsert UserProfile
  if (Object.keys(profileData).length > 0) {
    await prisma.userProfile.upsert({
      where: { userId },
      update: profileData as Prisma.UserProfileUpdateInput,
      create: {
        userId,
        ...(profileData as Prisma.UserProfileCreateInput),
      },
    });
  }

  return getProfile(userId);
}

export async function completeOnboarding(userId: string, data: Record<string, unknown>) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const {
    gender,
    birthDate,
    heightCm,
    currentWeightKg,
    goalType,
    activityLevel,
    experienceLevel,
    equipmentAccess,
    workoutDaysPerWeek,
    preferredWorkoutDurationMinutes,
    dietaryPreferences,
    excludedFoods,
    injuriesNotes,
    unitsPreference,
  } = data as {
    gender?: string;
    birthDate?: string;
    heightCm?: number;
    currentWeightKg?: number;
    goalType?: string;
    activityLevel?: string;
    experienceLevel?: string;
    equipmentAccess?: string;
    workoutDaysPerWeek?: number;
    preferredWorkoutDurationMinutes?: number;
    dietaryPreferences?: string[];
    excludedFoods?: string[];
    injuriesNotes?: string;
    unitsPreference?: string;
  };

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      gender,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      heightCm,
      currentWeightKg,
      goalType: goalType as any,
      activityLevel: activityLevel as any,
      experienceLevel: experienceLevel as any,
      equipmentAccess: equipmentAccess as any,
      workoutDaysPerWeek,
      preferredWorkoutDurationMinutes,
      dietaryPreferences: dietaryPreferences ?? [],
      excludedFoods: excludedFoods ?? [],
      injuriesNotes,
      unitsPreference: unitsPreference as any,
      onboardingComplete: true,
    },
    create: {
      userId,
      gender,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      heightCm,
      currentWeightKg,
      goalType: (goalType as any) ?? 'GENERAL_FITNESS',
      activityLevel: (activityLevel as any) ?? 'MODERATELY_ACTIVE',
      experienceLevel: (experienceLevel as any) ?? 'BEGINNER',
      equipmentAccess: (equipmentAccess as any) ?? 'COMMERCIAL_GYM',
      workoutDaysPerWeek: workoutDaysPerWeek ?? 3,
      preferredWorkoutDurationMinutes: preferredWorkoutDurationMinutes ?? 60,
      dietaryPreferences: dietaryPreferences ?? [],
      excludedFoods: excludedFoods ?? [],
      injuriesNotes,
      unitsPreference: (unitsPreference as any) ?? 'IMPERIAL',
      onboardingComplete: true,
    },
  });

  // Auto-calculate and create initial macros
  if (heightCm && currentWeightKg && activityLevel && goalType) {
    const macros = calculateBaseMacros({ heightCm, currentWeightKg, activityLevel, goalType, gender });
    await prisma.macroPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    await prisma.macroPlan.create({
      data: {
        userId,
        sourceType: 'SYSTEM_DEFAULT',
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        effectiveStartDate: new Date(),
        isActive: true,
      },
    });
  }

  return profile;
}

export async function getUserStats(userId: string) {
  const [sessionCount, checkInCount, activeProgram] = await Promise.all([
    prisma.workoutSession.count({ where: { userId, completed: true } }),
    prisma.progressCheckIn.count({ where: { userId } }),
    prisma.workoutProgram.findFirst({ where: { userId, isActive: true } }),
  ]);

  const lastCheckIn = await prisma.progressCheckIn.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  return {
    totalWorkoutSessions: sessionCount,
    totalCheckIns: checkInCount,
    hasActiveProgram: !!activeProgram,
    lastCheckInDate: lastCheckIn?.date ?? null,
  };
}

function calculateBaseMacros(params: {
  heightCm: number;
  currentWeightKg: number;
  activityLevel: string;
  goalType: string;
  gender?: string;
}) {
  const { heightCm, currentWeightKg, activityLevel, goalType, gender } = params;

  // Mifflin-St Jeor BMR
  const isMale = gender?.toLowerCase() !== 'female';
  const bmr = isMale
    ? 10 * currentWeightKg + 6.25 * heightCm - 5 * 30 + 5
    : 10 * currentWeightKg + 6.25 * heightCm - 5 * 30 - 161;

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

  // Macro split: protein 30%, carbs 45%, fat 25%
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.45) / 4);
  const fat = Math.round((calories * 0.25) / 9);

  return { calories, protein, carbs, fat };
}
