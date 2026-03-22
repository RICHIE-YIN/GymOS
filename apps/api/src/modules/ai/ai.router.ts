import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import * as AiService from './ai.service';
import prisma from '../../lib/prisma';
import rateLimit from 'express-rate-limit';

export const aiRouter = Router();

// AI routes have tighter rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many AI requests. Please wait a moment.' } },
});

aiRouter.use(authenticateToken, aiLimiter);

// POST /api/v1/ai/explain-macros
aiRouter.post('/explain-macros', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

    const [profile, macroPlan] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: req.user.userId } }),
      prisma.macroPlan.findFirst({ where: { userId: req.user.userId, isActive: true } }),
    ]);

    if (!macroPlan) throw new AppError('No active macro plan found.', 404, 'NOT_FOUND');

    const explanation = await AiService.explainMacroPlan(
      profile ?? {},
      {
        calories: macroPlan.calories,
        protein: macroPlan.protein,
        carbs: macroPlan.carbs,
        fat: macroPlan.fat,
        sourceType: macroPlan.sourceType,
      },
    );

    res.json({ success: true, data: { explanation } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/generate-meal
aiRouter.post('/generate-meal', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

    const [profile, macroPlan] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: req.user.userId } }),
      prisma.macroPlan.findFirst({ where: { userId: req.user.userId, isActive: true } }),
    ]);

    const macroTargets = macroPlan
      ? { calories: macroPlan.calories, protein: macroPlan.protein, carbs: macroPlan.carbs, fat: macroPlan.fat }
      : { calories: 2000, protein: 150, carbs: 225, fat: 55 };

    const meals = await AiService.generateMealVariants(macroTargets, {
      dietaryPreferences: (profile?.dietaryPreferences as string[]) ?? [],
      excludedFoods: (profile?.excludedFoods as string[]) ?? [],
      mealType: req.body.mealType,
    });

    res.json({ success: true, data: { meals } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/adjust-workout
aiRouter.post('/adjust-workout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const { workout, reason, constraints } = req.body;
    if (!workout || !reason) throw new AppError('workout and reason are required.', 400, 'BAD_REQUEST');

    const adjusted = await AiService.generateAdjustedWorkout(workout, { reason, constraints });
    res.json({ success: true, data: { workout: adjusted } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/weekly-summary
aiRouter.post('/weekly-summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [checkIns, sessions] = await Promise.all([
      prisma.progressCheckIn.findMany({
        where: { userId: req.user.userId, date: { gte: oneWeekAgo } },
        orderBy: { date: 'asc' },
        select: { date: true, bodyWeightKg: true },
      }),
      prisma.workoutSession.findMany({
        where: { userId: req.user.userId, completed: true, startedAt: { gte: oneWeekAgo } },
        select: { startedAt: true, durationMinutes: true },
      }),
    ]);

    const firstWeight = checkIns[0]?.bodyWeightKg ?? null;
    const lastWeight = checkIns[checkIns.length - 1]?.bodyWeightKg ?? null;
    const weightChange = firstWeight && lastWeight ? lastWeight - firstWeight : null;

    const summary = await AiService.summarizeProgress({ checkIns, sessions, weightChange });
    res.json({ success: true, data: { summary } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/coach/message
aiRouter.post('/coach/message', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const { message } = req.body;
    if (!message) throw new AppError('message is required.', 400, 'BAD_REQUEST');

    const [profile, recentSessions, macroPlan] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: req.user.userId } }),
      prisma.workoutSession.count({
        where: {
          userId: req.user.userId,
          completed: true,
          startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.macroPlan.findFirst({ where: { userId: req.user.userId, isActive: true } }),
    ]);

    const response = await AiService.coachMessage(req.user.userId, message, {
      userProfile: profile ?? undefined,
      recentSessions,
      currentMacros: macroPlan
        ? { calories: macroPlan.calories, protein: macroPlan.protein, carbs: macroPlan.carbs, fat: macroPlan.fat }
        : undefined,
    });

    // Store message in AI_COACH thread
    const thread = await prisma.messageThread.upsert({
      where: { id: `ai-${req.user.userId}` },
      create: {
        id: `ai-${req.user.userId}`,
        threadType: 'AI_COACH',
        clientUserId: req.user.userId,
      },
      update: {},
    });

    await prisma.message.create({
      data: { threadId: thread.id, senderType: 'CLIENT', senderUserId: req.user.userId, content: message },
    });
    await prisma.message.create({
      data: { threadId: thread.id, senderType: 'AI', content: response },
    });

    res.json({ success: true, data: { response } });
  } catch (err) {
    next(err);
  }
});
