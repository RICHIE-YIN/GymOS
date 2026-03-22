import { Request, Response, NextFunction } from 'express';
import * as ProgramsService from './programs.service';
import { AppError } from '../../middleware/error.middleware';

export async function generateProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const program = await ProgramsService.generateProgram(req.user.userId, req.body);
    res.status(201).json({ success: true, data: { program } });
  } catch (err) {
    next(err);
  }
}

export async function getUserPrograms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const programs = await ProgramsService.getUserPrograms(req.user.userId);
    res.json({ success: true, data: { programs } });
  } catch (err) {
    next(err);
  }
}

export async function getActiveProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const program = await ProgramsService.getActiveProgram(req.user.userId);
    res.json({ success: true, data: { program } });
  } catch (err) {
    next(err);
  }
}

export async function getProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const program = await ProgramsService.getProgramById(req.params.id, req.user.userId);
    res.json({ success: true, data: { program } });
  } catch (err) {
    next(err);
  }
}

export async function updateProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const program = await ProgramsService.updateProgram(req.params.id, req.user.userId, req.body);
    res.json({ success: true, data: { program } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    await ProgramsService.deleteProgram(req.params.id, req.user.userId);
    res.json({ success: true, data: { message: 'Program deleted.' } });
  } catch (err) {
    next(err);
  }
}

export async function activateProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const program = await ProgramsService.activateProgram(req.params.id, req.user.userId);
    res.json({ success: true, data: { program } });
  } catch (err) {
    next(err);
  }
}
