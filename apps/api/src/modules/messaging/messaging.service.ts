import prisma from '../../lib/prisma';
import { NotFoundError, AppError } from '../../middleware/error.middleware';

export async function getUserThreads(userId: string) {
  return prisma.messageThread.findMany({
    where: {
      OR: [{ clientUserId: userId }, { trainerUserId: userId }],
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      trainer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createThread(
  userId: string,
  data: {
    threadType: string;
    recipientUserId?: string;
  },
) {
  const { threadType, recipientUserId } = data;

  // Check for existing thread between these users
  if (recipientUserId) {
    const existing = await prisma.messageThread.findFirst({
      where: {
        OR: [
          { clientUserId: userId, trainerUserId: recipientUserId },
          { clientUserId: recipientUserId, trainerUserId: userId },
        ],
      },
    });

    if (existing) return existing;
  }

  // Determine client/trainer assignment
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  let clientUserId: string | undefined;
  let trainerUserId: string | undefined;

  if (currentUser?.role === 'TRAINER') {
    trainerUserId = userId;
    clientUserId = recipientUserId;
  } else {
    clientUserId = userId;
    trainerUserId = recipientUserId;
  }

  return prisma.messageThread.create({
    data: {
      threadType: threadType as any,
      clientUserId,
      trainerUserId,
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      trainer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });
}

export async function getThreadMessages(threadId: string, userId: string, page = 1, limit = 50) {
  const thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
  if (!thread) throw new NotFoundError('Thread not found.');

  if (thread.clientUserId !== userId && thread.trainerUserId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { threadId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    }),
    prisma.message.count({ where: { threadId } }),
  ]);

  // Mark messages as read
  await prisma.message.updateMany({
    where: { threadId, senderUserId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

  return {
    messages: messages.reverse(),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function sendMessage(
  threadId: string,
  userId: string,
  content: string,
) {
  const thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
  if (!thread) throw new NotFoundError('Thread not found.');

  if (thread.clientUserId !== userId && thread.trainerUserId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  const senderType = user?.role === 'TRAINER' ? 'TRAINER' : 'CLIENT';

  return prisma.message.create({
    data: {
      threadId,
      senderType: senderType as any,
      senderUserId: userId,
      content,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });
}
