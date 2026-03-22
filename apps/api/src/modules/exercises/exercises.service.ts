import prisma from '../../lib/prisma';
import { NotFoundError } from '../../middleware/error.middleware';
import { Prisma } from '@prisma/client';

export interface ExerciseFilters {
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listExercises(filters: ExerciseFilters) {
  const { muscle, equipment, difficulty, search, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.ExerciseWhereInput = {
    isActive: true,
    ...(muscle && { primaryMuscleGroup: { contains: muscle, mode: 'insensitive' } }),
    ...(equipment && { equipment: { contains: equipment, mode: 'insensitive' } }),
    ...(difficulty && { difficulty: { contains: difficulty, mode: 'insensitive' } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.exercise.count({ where }),
  ]);

  return {
    exercises,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getExerciseById(id: string) {
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) throw new NotFoundError('Exercise not found.');
  return exercise;
}

export async function getExerciseBySlug(slug: string) {
  const exercise = await prisma.exercise.findUnique({ where: { slug } });
  if (!exercise) throw new NotFoundError('Exercise not found.');
  return exercise;
}

export async function createExercise(data: {
  name: string;
  slug: string;
  description: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  equipment: string;
  difficulty: string;
  movementPattern: string;
  tutorialSteps: string[];
  coachingCues: string[];
  commonMistakes: string[];
  safetyNotes: string[];
  mediaUrl?: string;
  thumbnailUrl?: string;
}) {
  return prisma.exercise.create({ data });
}

export async function updateExercise(id: string, data: Partial<Prisma.ExerciseUpdateInput>) {
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Exercise not found.');

  return prisma.exercise.update({ where: { id }, data });
}
