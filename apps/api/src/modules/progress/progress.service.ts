import prisma from '../../lib/prisma';
import { NotFoundError } from '../../middleware/error.middleware';

export async function createCheckIn(
  userId: string,
  data: {
    bodyWeightKg: number;
    waistCm?: number;
    chestCm?: number;
    armCm?: number;
    thighCm?: number;
    notes?: string;
    date?: string;
  },
) {
  return prisma.progressCheckIn.create({
    data: {
      userId,
      bodyWeightKg: data.bodyWeightKg,
      waistCm: data.waistCm,
      chestCm: data.chestCm,
      armCm: data.armCm,
      thighCm: data.thighCm,
      notes: data.notes,
      date: data.date ? new Date(data.date) : new Date(),
    },
  });
}

export async function getCheckIns(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [checkIns, total] = await Promise.all([
    prisma.progressCheckIn.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.progressCheckIn.count({ where: { userId } }),
  ]);

  return { checkIns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getProgressOverview(userId: string) {
  const checkIns = await prisma.progressCheckIn.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, completed: true },
    orderBy: { startedAt: 'asc' },
    select: { startedAt: true, durationMinutes: true },
  });

  const firstCheckIn = checkIns[0];
  const lastCheckIn = checkIns[checkIns.length - 1];

  const weightChange =
    firstCheckIn && lastCheckIn ? lastCheckIn.bodyWeightKg - firstCheckIn.bodyWeightKg : null;

  const totalSessionTime = sessions.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0);

  return {
    totalCheckIns: checkIns.length,
    totalWorkoutSessions: sessions.length,
    totalWorkoutMinutes: totalSessionTime,
    weightChange,
    firstWeight: firstCheckIn?.bodyWeightKg ?? null,
    currentWeight: lastCheckIn?.bodyWeightKg ?? null,
    weightHistory: checkIns.map((c) => ({ date: c.date, weight: c.bodyWeightKg })),
  };
}

export async function addProgressPhoto(
  userId: string,
  data: {
    photoType: string;
    imageUrl: string;
    notes?: string;
    date?: string;
  },
) {
  return prisma.progressPhoto.create({
    data: {
      userId,
      photoType: data.photoType as any,
      imageUrl: data.imageUrl,
      notes: data.notes,
      date: data.date ? new Date(data.date) : new Date(),
    },
  });
}

export async function getProgressPhotos(userId: string) {
  return prisma.progressPhoto.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
}
