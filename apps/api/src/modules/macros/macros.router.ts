import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import * as MacrosController from './macros.controller';

export const macrosRouter = Router();

macrosRouter.use(authenticateToken);

// POST /api/v1/macros/calculate
macrosRouter.post('/macros/calculate', MacrosController.calculateMacros);

// GET /api/v1/me/macros/current
macrosRouter.get('/me/macros/current', MacrosController.getCurrentMacros);

// PATCH /api/v1/me/macros/current
macrosRouter.patch('/me/macros/current', MacrosController.updateCurrentMacros);

// GET /api/v1/me/macros/history
macrosRouter.get('/me/macros/history', MacrosController.getMacroHistory);

// GET /api/v1/me/nutrition/today
macrosRouter.get('/me/nutrition/today', MacrosController.getTodayNutrition);

// PATCH /api/v1/me/nutrition/today
macrosRouter.patch('/me/nutrition/today', MacrosController.logTodayNutrition);
