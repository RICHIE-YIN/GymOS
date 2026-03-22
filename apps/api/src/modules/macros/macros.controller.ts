import { Request, Response, NextFunction } from 'express';
import * as MacrosService from './macros.service';
import { AppError } from '../../middleware/error.middleware';

export async function calculateMacros(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const macros = await MacrosService.calculateMacros(req.user.userId, req.body);
    res.json({ success: true, data: { macros } });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentMacros(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const plan = await MacrosService.getCurrentMacros(req.user.userId);
    res.json({ success: true, data: { plan } });
  } catch (err) {
    next(err);
  }
}

export async function updateCurrentMacros(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const plan = await MacrosService.updateMacros(req.user.userId, req.body);
    res.json({ success: true, data: { plan } });
  } catch (err) {
    next(err);
  }
}

export async function getMacroHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const history = await MacrosService.getMacroHistory(req.user.userId);
    res.json({ success: true, data: { history } });
  } catch (err) {
    next(err);
  }
}

export async function getTodayNutrition(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const log = await MacrosService.getTodayNutrition(req.user.userId);
    res.json({ success: true, data: { log } });
  } catch (err) {
    next(err);
  }
}

export async function logTodayNutrition(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const log = await MacrosService.logNutrition(req.user.userId, req.body);
    res.json({ success: true, data: { log } });
  } catch (err) {
    next(err);
  }
}
