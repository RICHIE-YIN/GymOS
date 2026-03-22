import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import * as UsersController from './users.controller';

export const usersRouter = Router();

// All user routes require authentication
usersRouter.use(authenticateToken);

// GET /api/v1/users/me/profile
usersRouter.get('/me/profile', UsersController.getMyProfile);

// PATCH /api/v1/users/me/profile
usersRouter.patch('/me/profile', UsersController.updateMyProfile);

// POST /api/v1/users/me/onboarding
usersRouter.post('/me/onboarding', UsersController.completeOnboarding);

// GET /api/v1/users/me/stats
usersRouter.get('/me/stats', UsersController.getMyStats);
