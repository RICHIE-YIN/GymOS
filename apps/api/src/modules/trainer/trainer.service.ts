import prisma from '../../lib/prisma';
import { NotFoundError, AppError, ForbiddenError } from '../../middleware/error.middleware';

export async function getClients(trainerUserId: string) {
  const relationships = await prisma.clientTrainerRelationship.findMany({
    where: { trainerUserId, status: 'ACTIVE' },
    include: {
      client: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          userProfile: true,
          subscription: { select: { planType: true, status: true } },
        },
      },
    },
  });

  return relationships.map((r) => ({
    relationshipId: r.id,
    status: r.status,
    startDate: r.startDate,
    client: r.client,
  }));
}

export async function inviteClient(trainerUserId: string, clientEmail: string) {
  const client = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (!client) {
    throw new NotFoundError('No user found with that email address.');
  }

  if (client.role !== 'CLIENT') {
    throw new AppError('This user is not a client.', 400, 'BAD_REQUEST');
  }

  const existing = await prisma.clientTrainerRelationship.findUnique({
    where: { clientUserId_trainerUserId: { clientUserId: client.id, trainerUserId } },
  });

  if (existing && existing.status === 'ACTIVE') {
    throw new AppError('This client is already in your roster.', 409, 'CONFLICT');
  }

  if (existing) {
    return prisma.clientTrainerRelationship.update({
      where: { id: existing.id },
      data: { status: 'PENDING', startDate: new Date(), endDate: null },
    });
  }

  return prisma.clientTrainerRelationship.create({
    data: {
      clientUserId: client.id,
      trainerUserId,
      status: 'PENDING',
      startDate: new Date(),
    },
  });
}

export async function getClientDetail(trainerUserId: string, clientUserId: string) {
  const relationship = await prisma.clientTrainerRelationship.findUnique({
    where: { clientUserId_trainerUserId: { clientUserId, trainerUserId } },
  });

  if (!relationship || relationship.status === 'TERMINATED') {
    throw new ForbiddenError('You do not have access to this client.');
  }

  return prisma.user.findUnique({
    where: { id: clientUserId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      userProfile: true,
      macroPlan: { where: { isActive: true }, take: 1 },
      workoutPrograms: { where: { isActive: true }, take: 1 },
      progressCheckIns: { orderBy: { date: 'desc' }, take: 5 },
      workoutSessions: {
        where: { completed: true },
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: { workoutDay: { select: { title: true } } },
      },
    },
  });
}

export async function assignProgramToClient(trainerUserId: string, clientUserId: string, programId: string) {
  const relationship = await prisma.clientTrainerRelationship.findUnique({
    where: { clientUserId_trainerUserId: { clientUserId, trainerUserId } },
  });

  if (!relationship || relationship.status !== 'ACTIVE') {
    throw new ForbiddenError('You do not have access to this client.');
  }

  const program = await prisma.workoutProgram.findUnique({ where: { id: programId } });
  if (!program) throw new NotFoundError('Program not found.');

  // Deactivate existing programs for client
  await prisma.workoutProgram.updateMany({
    where: { userId: clientUserId, isActive: true },
    data: { isActive: false },
  });

  // Duplicate program for client or assign directly
  return prisma.workoutProgram.create({
    data: {
      userId: clientUserId,
      sourceType: 'TRAINER_ASSIGNED',
      trainerUserId,
      title: program.title,
      description: program.description,
      goalType: program.goalType,
      durationWeeks: program.durationWeeks,
      isActive: true,
    },
  });
}

export async function updateClientMacros(
  trainerUserId: string,
  clientUserId: string,
  macros: { calories: number; protein: number; carbs: number; fat: number },
) {
  const relationship = await prisma.clientTrainerRelationship.findUnique({
    where: { clientUserId_trainerUserId: { clientUserId, trainerUserId } },
  });

  if (!relationship || relationship.status !== 'ACTIVE') {
    throw new ForbiddenError('You do not have access to this client.');
  }

  await prisma.macroPlan.updateMany({
    where: { userId: clientUserId, isActive: true },
    data: { isActive: false, effectiveEndDate: new Date() },
  });

  return prisma.macroPlan.create({
    data: {
      userId: clientUserId,
      sourceType: 'TRAINER',
      ...macros,
      effectiveStartDate: new Date(),
      isActive: true,
    },
  });
}

export async function getClientProgress(trainerUserId: string, clientUserId: string) {
  const relationship = await prisma.clientTrainerRelationship.findUnique({
    where: { clientUserId_trainerUserId: { clientUserId, trainerUserId } },
  });

  if (!relationship || relationship.status === 'TERMINATED') {
    throw new ForbiddenError('You do not have access to this client.');
  }

  const [checkIns, sessions, photos] = await Promise.all([
    prisma.progressCheckIn.findMany({ where: { userId: clientUserId }, orderBy: { date: 'desc' }, take: 10 }),
    prisma.workoutSession.findMany({
      where: { userId: clientUserId, completed: true },
      orderBy: { startedAt: 'desc' },
      take: 10,
    }),
    prisma.progressPhoto.findMany({ where: { userId: clientUserId }, orderBy: { date: 'desc' }, take: 10 }),
  ]);

  return { checkIns, sessions, photos };
}

export async function removeClient(trainerUserId: string, clientUserId: string) {
  const relationship = await prisma.clientTrainerRelationship.findUnique({
    where: { clientUserId_trainerUserId: { clientUserId, trainerUserId } },
  });

  if (!relationship) {
    throw new NotFoundError('Client relationship not found.');
  }

  return prisma.clientTrainerRelationship.update({
    where: { id: relationship.id },
    data: { status: 'TERMINATED', endDate: new Date() },
  });
}
