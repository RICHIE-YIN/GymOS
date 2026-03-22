import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import * as SubscriptionsService from './subscriptions.service';

export const subscriptionsRouter = Router();

subscriptionsRouter.use(authenticateToken);

// GET /api/v1/subscriptions/me
subscriptionsRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const subscription = await SubscriptionsService.getSubscription(req.user.userId);
    res.json({ success: true, data: { subscription } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/subscriptions/check/:feature
subscriptionsRouter.get('/check/:feature', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const hasAccess = await SubscriptionsService.checkFeatureAccess(req.user.userId, req.params.feature);
    res.json({ success: true, data: { feature: req.params.feature, hasAccess } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/subscriptions/me - admin only for now (real billing handled via webhooks)
subscriptionsRouter.patch('/me', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const subscription = await SubscriptionsService.updateSubscription(req.user.userId, req.body);
    res.json({ success: true, data: { subscription } });
  } catch (err) {
    next(err);
  }
});
