import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import * as Mx from '../controllers/maintenanceExtras.controller';

export const maintenanceExtrasRouter = Router();

maintenanceExtrasRouter.get('/schedules', requireAuth, asyncHandler(Mx.listSchedules));
maintenanceExtrasRouter.get('/work-orders/:workOrderId', requireAuth, asyncHandler(Mx.getWorkOrder));
