import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from './auth.schema';
import * as AuthController from './auth.controller';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post('/register', validate(RegisterSchema), AuthController.register);

// POST /api/v1/auth/login
authRouter.post('/login', validate(LoginSchema), AuthController.login);

// POST /api/v1/auth/logout
authRouter.post('/logout', authenticateToken, AuthController.logout);

// GET /api/v1/auth/me
authRouter.get('/me', authenticateToken, AuthController.getMe);

// POST /api/v1/auth/refresh
authRouter.post('/refresh', validate(RefreshTokenSchema), AuthController.refresh);
