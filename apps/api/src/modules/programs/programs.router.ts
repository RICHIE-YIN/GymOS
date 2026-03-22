import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import * as ProgramsController from './programs.controller';

export const programsRouter = Router();

programsRouter.use(authenticateToken);

// POST /api/v1/programs/generate
programsRouter.post('/generate', ProgramsController.generateProgram);

// GET /api/v1/programs/me
programsRouter.get('/me', ProgramsController.getUserPrograms);

// GET /api/v1/programs/me/active
programsRouter.get('/me/active', ProgramsController.getActiveProgram);

// GET /api/v1/programs/:id
programsRouter.get('/:id', ProgramsController.getProgram);

// PATCH /api/v1/programs/:id
programsRouter.patch('/:id', ProgramsController.updateProgram);

// DELETE /api/v1/programs/:id
programsRouter.delete('/:id', ProgramsController.deleteProgram);

// POST /api/v1/programs/:id/activate
programsRouter.post('/:id/activate', ProgramsController.activateProgram);
