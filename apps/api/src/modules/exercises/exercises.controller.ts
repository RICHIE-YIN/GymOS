import { Request, Response, NextFunction } from 'express';
import * as ExercisesService from './exercises.service';

export async function listExercises(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { muscle, equipment, difficulty, search, page, limit } = req.query as Record<string, string>;
    const result = await ExercisesService.listExercises({
      muscle,
      equipment,
      difficulty,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? Math.min(parseInt(limit), 100) : 20,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exercise = await ExercisesService.getExerciseById(req.params.id);
    res.json({ success: true, data: { exercise } });
  } catch (err) {
    next(err);
  }
}

export async function createExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exercise = await ExercisesService.createExercise(req.body);
    res.status(201).json({ success: true, data: { exercise } });
  } catch (err) {
    next(err);
  }
}

export async function updateExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exercise = await ExercisesService.updateExercise(req.params.id, req.body);
    res.json({ success: true, data: { exercise } });
  } catch (err) {
    next(err);
  }
}
