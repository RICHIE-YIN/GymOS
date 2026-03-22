import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

// Routers
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { macrosRouter } from './modules/macros/macros.router';
import { exercisesRouter } from './modules/exercises/exercises.router';
import { mealsRouter } from './modules/meals/meals.router';
import { programsRouter } from './modules/programs/programs.router';
import { sessionsRouter } from './modules/sessions/sessions.router';
import { progressRouter } from './modules/progress/progress.router';
import { trainerRouter } from './modules/trainer/trainer.router';
import { messagingRouter } from './modules/messaging/messaging.router';
import { aiRouter } from './modules/ai/ai.router';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.router';

const app = express();

// ============================================================
// Global Middleware
// ============================================================

app.use(helmet());

app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? env.CORS_ORIGIN : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' } },
});

// Tighter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many authentication attempts, please try again later.' } },
});

app.use(globalLimiter);

// ============================================================
// Health Check
// ============================================================

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: env.NODE_ENV,
    },
  });
});

// ============================================================
// API Routes
// ============================================================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authLimiter, authRouter);
app.use(`${API_PREFIX}/users`, usersRouter);
app.use(`${API_PREFIX}`, macrosRouter);
app.use(`${API_PREFIX}/exercises`, exercisesRouter);
app.use(`${API_PREFIX}`, mealsRouter);
app.use(`${API_PREFIX}/programs`, programsRouter);
app.use(`${API_PREFIX}/sessions`, sessionsRouter);
app.use(`${API_PREFIX}`, progressRouter);
app.use(`${API_PREFIX}/trainer`, trainerRouter);
app.use(`${API_PREFIX}`, messagingRouter);
app.use(`${API_PREFIX}/ai`, aiRouter);
app.use(`${API_PREFIX}/subscriptions`, subscriptionsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found.',
    },
  });
});

// ============================================================
// Global Error Handler
// ============================================================

app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`[GymOS API] Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  console.log(`[GymOS API] Health check: http://localhost:${PORT}/health`);
});

export default app;
