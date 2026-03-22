import { Request, Response, NextFunction } from 'express';
import * as TrainerService from './trainer.service';
import { AppError } from '../../middleware/error.middleware';

export async function getClients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const clients = await TrainerService.getClients(req.user.userId);
    res.json({ success: true, data: { clients } });
  } catch (err) {
    next(err);
  }
}

export async function inviteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const relationship = await TrainerService.inviteClient(req.user.userId, req.body.email);
    res.status(201).json({ success: true, data: { relationship } });
  } catch (err) {
    next(err);
  }
}

export async function getClientDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const client = await TrainerService.getClientDetail(req.user.userId, req.params.clientId);
    res.json({ success: true, data: { client } });
  } catch (err) {
    next(err);
  }
}

export async function assignProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const program = await TrainerService.assignProgramToClient(req.user.userId, req.params.clientId, req.body.programId);
    res.json({ success: true, data: { program } });
  } catch (err) {
    next(err);
  }
}

export async function updateClientMacros(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const plan = await TrainerService.updateClientMacros(req.user.userId, req.params.clientId, req.body);
    res.json({ success: true, data: { plan } });
  } catch (err) {
    next(err);
  }
}

export async function getClientProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const progress = await TrainerService.getClientProgress(req.user.userId, req.params.clientId);
    res.json({ success: true, data: { progress } });
  } catch (err) {
    next(err);
  }
}

export async function removeClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const result = await TrainerService.removeClient(req.user.userId, req.params.clientId);
    res.json({ success: true, data: { result } });
  } catch (err) {
    next(err);
  }
}
