import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import * as ExercisesController from './exercises.controller';

export const exercisesRouter = Router();

// GET /api/v1/exercises - public list with filters
exercisesRouter.get('/', ExercisesController.listExercises);

// GET /api/v1/exercises/:id
exercisesRouter.get('/:id', ExercisesController.getExercise);

// POST /api/v1/exercises - admin only
exercisesRouter.post('/', authenticateToken, requireRole('ADMIN'), ExercisesController.createExercise);

// PATCH /api/v1/exercises/:id - admin only
exercisesRouter.patch('/:id', authenticateToken, requireRole('ADMIN'), ExercisesController.updateExercise);
