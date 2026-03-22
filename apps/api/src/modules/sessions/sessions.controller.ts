import { Request, Response, NextFunction } from 'express';
import * as SessionsService from './sessions.service';
import { AppError } from '../../middleware/error.middleware';

export async function startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const session = await SessionsService.startSession(req.user.userId, req.body.workoutDayId);
    res.status(201).json({ success: true, data: { session } });
  } catch (err) {
    next(err);
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const session = await SessionsService.getSessionById(req.params.id, req.user.userId);
    res.json({ success: true, data: { session } });
  } catch (err) {
    next(err);
  }
}

export async function logSet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const setLog = await SessionsService.logSet(req.params.id, req.user.userId, req.body);
    res.json({ success: true, data: { setLog } });
  } catch (err) {
    next(err);
  }
}

export async function finishSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const session = await SessionsService.finishSession(req.params.id, req.user.userId, req.body.notes);
    res.json({ success: true, data: { session } });
  } catch (err) {
    next(err);
  }
}

export async function getSessionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const { page, limit } = req.query as Record<string, string>;
    const result = await SessionsService.getSessionHistory(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? Math.min(parseInt(limit), 100) : 20,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getTodaySession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const session = await SessionsService.getTodaySession(req.user.userId);
    res.json({ success: true, data: { session } });
  } catch (err) {
    next(err);
  }
}
