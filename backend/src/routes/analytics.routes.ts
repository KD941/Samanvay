import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import * as Analytics from '../controllers/analytics.controller';

export const analyticsRouter = Router();

analyticsRouter.post('/track', requireAuth, asyncHandler(Analytics.track));
analyticsRouter.get('/metrics', requireAuth, asyncHandler(Analytics.metrics));
analyticsRouter.get('/reports', requireAuth, asyncHandler(Analytics.reports));
analyticsRouter.get('/recommendations', requireAuth, asyncHandler(Analytics.recommendations));
