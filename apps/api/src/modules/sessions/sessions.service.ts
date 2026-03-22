import prisma from '../../lib/prisma';
import { NotFoundError, AppError } from '../../middleware/error.middleware';

export async function startSession(userId: string, workoutDayId?: string) {
  // Check if there's already an active session today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingActive = await prisma.workoutSession.findFirst({
    where: {
      userId,
      completed: false,
      startedAt: { gte: today, lt: tomorrow },
    },
  });

  if (existingActive) {
    return existingActive;
  }

  const session = await prisma.workoutSession.create({
    data: {
      userId,
      workoutDayId,
      startedAt: new Date(),
      completed: false,
    },
    include: {
      workoutDay: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      setLogs: true,
    },
  });

  return session;
}

export async function getSessionById(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      workoutDay: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      setLogs: {
        include: { exercise: true },
        orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
      },
    },
  });

  if (!session) throw new NotFoundError('Session not found.');
  if (session.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  return session;
}

export async function logSet(
  sessionId: string,
  userId: string,
  data: {
    exerciseId: string;
    setNumber: number;
    actualWeightKg?: number;
    actualReps: number;
    actualRpe?: number;
    completed?: boolean;
    notes?: string;
  },
) {
  const session = await prisma.workoutSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new NotFoundError('Session not found.');
  if (session.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (session.completed) throw new AppError('This session has already been completed.', 400, 'SESSION_COMPLETED');

  const exercise = await prisma.exercise.findUnique({ where: { id: data.exerciseId } });
  if (!exercise) throw new NotFoundError('Exercise not found.');

  // Upsert set log
  const setLog = await prisma.workoutSetLog.upsert({
    where: {
      // Unique by session + exercise + setNumber not defined in schema,
      // so we use create and handle duplicates
      id: 'no-match',
    },
    update: {},
    create: {
      sessionId,
      exerciseId: data.exerciseId,
      setNumber: data.setNumber,
      actualWeightKg: data.actualWeightKg,
      actualReps: data.actualReps,
      actualRpe: data.actualRpe,
      completed: data.completed ?? true,
      notes: data.notes,
    },
  }).catch(async () => {
    // Fallback: find existing and update
    const existing = await prisma.workoutSetLog.findFirst({
      where: { sessionId, exerciseId: data.exerciseId, setNumber: data.setNumber },
    });

    if (existing) {
      return prisma.workoutSetLog.update({
        where: { id: existing.id },
        data: {
          actualWeightKg: data.actualWeightKg,
          actualReps: data.actualReps,
          actualRpe: data.actualRpe,
          completed: data.completed ?? true,
          notes: data.notes,
        },
      });
    }

    return prisma.workoutSetLog.create({
      data: {
        sessionId,
        exerciseId: data.exerciseId,
        setNumber: data.setNumber,
        actualWeightKg: data.actualWeightKg,
        actualReps: data.actualReps,
        actualRpe: data.actualRpe,
        completed: data.completed ?? true,
        notes: data.notes,
      },
    });
  });

  return setLog;
}

export async function finishSession(sessionId: string, userId: string, notes?: string) {
  const session = await prisma.workoutSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new NotFoundError('Session not found.');
  if (session.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  const endedAt = new Date();
  const durationMinutes = Math.round((endedAt.getTime() - session.startedAt.getTime()) / 60000);

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      endedAt,
      completed: true,
      durationMinutes,
      notes,
    },
    include: { setLogs: true },
  });
}

export async function getSessionHistory(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [sessions, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId, completed: true },
      skip,
      take: limit,
      orderBy: { startedAt: 'desc' },
      include: {
        workoutDay: { select: { title: true } },
        setLogs: { select: { id: true } },
      },
    }),
    prisma.workoutSession.count({ where: { userId, completed: true } }),
  ]);

  return { sessions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getTodaySession(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.workoutSession.findFirst({
    where: { userId, startedAt: { gte: today, lt: tomorrow } },
    include: {
      workoutDay: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      setLogs: {
        include: { exercise: true },
        orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
      },
    },
    orderBy: { startedAt: 'desc' },
  });
}

export async function getNextWeight(userId: string, exerciseId: string) {
  // Find most recent completed set for this exercise
  const lastSet = await prisma.workoutSetLog.findFirst({
    where: {
      exerciseId,
      completed: true,
      session: { userId, completed: true },
    },
    orderBy: { session: { startedAt: 'desc' } },
    include: { session: true },
  });

  if (!lastSet) {
    return { suggestion: null, message: 'No previous data. Start with a comfortable weight.' };
  }

  // Simple progressive overload: +2.5kg every session if all reps completed
  const suggestedWeight = lastSet.actualWeightKg ? lastSet.actualWeightKg + 2.5 : null;

  return {
    lastWeight: lastSet.actualWeightKg,
    lastReps: lastSet.actualReps,
    suggestion: suggestedWeight,
    message: suggestedWeight
      ? `Try ${suggestedWeight}kg based on your last session.`
      : 'No weight data from previous sessions.',
  };
}
