import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import * as TrainerController from './trainer.controller';

export const trainerRouter = Router();

// All trainer routes require TRAINER or ADMIN role
trainerRouter.use(authenticateToken, requireRole('TRAINER', 'ADMIN'));

// GET /api/v1/trainer/clients
trainerRouter.get('/clients', TrainerController.getClients);

// POST /api/v1/trainer/clients/invite
trainerRouter.post('/clients/invite', TrainerController.inviteClient);

// GET /api/v1/trainer/clients/:clientId
trainerRouter.get('/clients/:clientId', TrainerController.getClientDetail);

// POST /api/v1/trainer/clients/:clientId/assign-program
trainerRouter.post('/clients/:clientId/assign-program', TrainerController.assignProgram);

// PATCH /api/v1/trainer/clients/:clientId/macros
trainerRouter.patch('/clients/:clientId/macros', TrainerController.updateClientMacros);

// GET /api/v1/trainer/clients/:clientId/progress
trainerRouter.get('/clients/:clientId/progress', TrainerController.getClientProgress);

// DELETE /api/v1/trainer/clients/:clientId
trainerRouter.delete('/clients/:clientId', TrainerController.removeClient);
