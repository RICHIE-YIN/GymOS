import { Request, Response, NextFunction } from 'express';
import * as ProgressService from './progress.service';
import { AppError } from '../../middleware/error.middleware';

export async function createCheckIn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const checkIn = await ProgressService.createCheckIn(req.user.userId, req.body);
    res.status(201).json({ success: true, data: { checkIn } });
  } catch (err) {
    next(err);
  }
}

export async function getCheckIns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const { page, limit } = req.query as Record<string, string>;
    const result = await ProgressService.getCheckIns(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? Math.min(parseInt(limit), 100) : 20,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getProgressOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const overview = await ProgressService.getProgressOverview(req.user.userId);
    res.json({ success: true, data: { overview } });
  } catch (err) {
    next(err);
  }
}

export async function addProgressPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const photo = await ProgressService.addProgressPhoto(req.user.userId, req.body);
    res.status(201).json({ success: true, data: { photo } });
  } catch (err) {
    next(err);
  }
}
