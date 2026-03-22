import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import * as ProgressController from './progress.controller';

export const progressRouter = Router();

progressRouter.use(authenticateToken);

// POST /api/v1/me/check-ins
progressRouter.post('/me/check-ins', ProgressController.createCheckIn);

// GET /api/v1/me/check-ins
progressRouter.get('/me/check-ins', ProgressController.getCheckIns);

// GET /api/v1/me/progress
progressRouter.get('/me/progress', ProgressController.getProgressOverview);

// POST /api/v1/me/progress-photos
progressRouter.post('/me/progress-photos', ProgressController.addProgressPhoto);
