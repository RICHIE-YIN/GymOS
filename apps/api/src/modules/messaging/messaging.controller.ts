import { Request, Response, NextFunction } from 'express';
import * as MessagingService from './messaging.service';
import { AppError } from '../../middleware/error.middleware';

export async function getThreads(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const threads = await MessagingService.getUserThreads(req.user.userId);
    res.json({ success: true, data: { threads } });
  } catch (err) {
    next(err);
  }
}

export async function createThread(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const thread = await MessagingService.createThread(req.user.userId, req.body);
    res.status(201).json({ success: true, data: { thread } });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const { page, limit } = req.query as Record<string, string>;
    const result = await MessagingService.getThreadMessages(
      req.params.id,
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? Math.min(parseInt(limit), 100) : 50,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const message = await MessagingService.sendMessage(req.params.id, req.user.userId, req.body.content);
    res.status(201).json({ success: true, data: { message } });
  } catch (err) {
    next(err);
  }
}
