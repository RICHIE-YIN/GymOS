import { Request, Response, NextFunction } from 'express';
import * as UsersService from './users.service';
import { AppError } from '../../middleware/error.middleware';

export async function getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const profile = await UsersService.getProfile(req.user.userId);
    res.json({ success: true, data: { profile } });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const profile = await UsersService.updateProfile(req.user.userId, req.body);
    res.json({ success: true, data: { profile } });
  } catch (err) {
    next(err);
  }
}

export async function completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const profile = await UsersService.completeOnboarding(req.user.userId, req.body);
    res.json({ success: true, data: { profile, message: 'Onboarding completed successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function getMyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const stats = await UsersService.getUserStats(req.user.userId);
    res.json({ success: true, data: { stats } });
  } catch (err) {
    next(err);
  }
}
