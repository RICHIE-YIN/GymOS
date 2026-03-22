import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import * as SessionsController from './sessions.controller';

export const sessionsRouter = Router();

sessionsRouter.use(authenticateToken);

// POST /api/v1/sessions/start
sessionsRouter.post('/start', SessionsController.startSession);

// Static routes MUST come before parameterized routes
// GET /api/v1/sessions/history
sessionsRouter.get('/history', SessionsController.getSessionHistory);

// GET /api/v1/sessions/today
sessionsRouter.get('/today', SessionsController.getTodaySession);

// GET /api/v1/sessions/:id
sessionsRouter.get('/:id', SessionsController.getSession);

// PATCH /api/v1/sessions/:id/log-set
sessionsRouter.patch('/:id/log-set', SessionsController.logSet);

// POST /api/v1/sessions/:id/finish
sessionsRouter.post('/:id/finish', SessionsController.finishSession);
