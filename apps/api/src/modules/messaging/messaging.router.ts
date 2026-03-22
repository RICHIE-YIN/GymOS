import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import * as MessagingController from './messaging.controller';

export const messagingRouter = Router();

messagingRouter.use(authenticateToken);

// GET /api/v1/threads
messagingRouter.get('/threads', MessagingController.getThreads);

// POST /api/v1/threads
messagingRouter.post('/threads', MessagingController.createThread);

// GET /api/v1/threads/:id/messages
messagingRouter.get('/threads/:id/messages', MessagingController.getMessages);

// POST /api/v1/threads/:id/messages
messagingRouter.post('/threads/:id/messages', MessagingController.sendMessage);
