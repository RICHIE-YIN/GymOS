import prisma from '../../lib/prisma';
import { NotFoundError, AppError } from '../../middleware/error.middleware';
import { Prisma } from '@prisma/client';

interface GenerateProgramParams {
  title?: string;
  description?: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  goalType?: string;
  experienceLevel?: string;
  equipment?: string;
}

export async function generateProgram(userId: string, params: GenerateProgramParams) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('Please complete your profile before generating a program.', 400, 'PROFILE_INCOMPLETE');
  }

  const {
    title = `${profile.goalType} Program`,
    description = `A personalized ${profile.durationWeeks ?? 8}-week program tailored to your goals.`,
    durationWeeks = 8,
    daysPerWeek = profile.workoutDaysPerWeek,
    goalType = profile.goalType,
  } = params;

  // Deactivate any existing active programs
  await prisma.workoutProgram.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  // Create the program
  const program = await prisma.workoutProgram.create({
    data: {
      userId,
      sourceType: 'AI_GENERATED',
      title,
      description,
      goalType: goalType as any,
      durationWeeks,
      isActive: true,
    },
  });

  // Generate weeks and days scaffold
  for (let week = 1; week <= durationWeeks; week++) {
    const workoutWeek = await prisma.workoutWeek.create({
      data: { programId: program.id, weekNumber: week },
    });

    for (let day = 1; day <= daysPerWeek; day++) {
      const dayTitle = generateDayTitle(day, daysPerWeek, goalType as string);
      await prisma.workoutDay.create({
        data: {
          weekId: workoutWeek.id,
          dayNumber: day,
          title: dayTitle,
          estimatedDurationMinutes: profile.preferredWorkoutDurationMinutes,
        },
      });
    }
  }

  return prisma.workoutProgram.findUnique({
    where: { id: program.id },
    include: {
      weeks: {
        include: {
          days: {
            include: { exercises: true },
          },
        },
        orderBy: { weekNumber: 'asc' },
      },
    },
  });
}

function generateDayTitle(dayNumber: number, totalDays: number, goalType: string): string {
  const splits: Record<string, string[]> = {
    GAIN_MUSCLE: ['Push (Chest/Shoulders/Triceps)', 'Pull (Back/Biceps)', 'Legs', 'Upper Body', 'Lower Body', 'Full Body'],
    LOSE_WEIGHT: ['Full Body Circuit', 'Cardio + Core', 'Upper Body', 'Lower Body', 'HIIT', 'Active Recovery'],
    INCREASE_STRENGTH: ['Squat Day', 'Bench Press Day', 'Deadlift Day', 'Overhead Press Day', 'Accessory Work'],
    GENERAL_FITNESS: ['Full Body A', 'Full Body B', 'Cardio', 'Full Body C', 'Active Recovery'],
  };

  const dayNames = splits[goalType] || splits.GENERAL_FITNESS;
  return dayNames[(dayNumber - 1) % dayNames.length] ?? `Workout Day ${dayNumber}`;
}

export async function getUserPrograms(userId: string) {
  return prisma.workoutProgram.findMany({
    where: { userId },
    include: {
      weeks: {
        include: { days: true },
        orderBy: { weekNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveProgram(userId: string) {
  const program = await prisma.workoutProgram.findFirst({
    where: { userId, isActive: true },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              exercises: {
                include: { exercise: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { weekNumber: 'asc' },
      },
    },
  });

  if (!program) throw new NotFoundError('No active program found.');
  return program;
}

export async function getProgramById(programId: string, userId: string) {
  const program = await prisma.workoutProgram.findUnique({
    where: { id: programId },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              exercises: {
                include: { exercise: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { weekNumber: 'asc' },
      },
    },
  });

  if (!program) throw new NotFoundError('Program not found.');
  if (program.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  return program;
}

export async function updateProgram(programId: string, userId: string, data: Partial<Prisma.WorkoutProgramUpdateInput>) {
  const program = await prisma.workoutProgram.findUnique({ where: { id: programId } });
  if (!program) throw new NotFoundError('Program not found.');
  if (program.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  return prisma.workoutProgram.update({ where: { id: programId }, data });
}

export async function deleteProgram(programId: string, userId: string) {
  const program = await prisma.workoutProgram.findUnique({ where: { id: programId } });
  if (!program) throw new NotFoundError('Program not found.');
  if (program.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  await prisma.workoutProgram.delete({ where: { id: programId } });
}

export async function activateProgram(programId: string, userId: string) {
  const program = await prisma.workoutProgram.findUnique({ where: { id: programId } });
  if (!program) throw new NotFoundError('Program not found.');
  if (program.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  // Deactivate other programs
  await prisma.workoutProgram.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  return prisma.workoutProgram.update({ where: { id: programId }, data: { isActive: true } });
}

export async function assignExercises(
  workoutDayId: string,
  exercises: Array<{
    exerciseId: string;
    sortOrder: number;
    prescribedSets: number;
    prescribedRepsMin: number;
    prescribedRepsMax: number;
    prescribedWeightKg?: number;
    prescribedRestSeconds: number;
    prescribedTempo?: string;
    targetRpe?: number;
    notes?: string;
  }>,
) {
  // Remove existing exercises for this day
  await prisma.workoutDayExercise.deleteMany({ where: { workoutDayId } });

  // Insert new exercise list
  return prisma.workoutDayExercise.createMany({
    data: exercises.map((ex) => ({ workoutDayId, ...ex })),
  });
}
