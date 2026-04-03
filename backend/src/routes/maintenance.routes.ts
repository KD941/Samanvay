import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import * as Maintenance from '../controllers/maintenance.controller';

export const maintenanceRouter = Router();

maintenanceRouter.post('/schedules', requireAuth, asyncHandler(Maintenance.createSchedule));
maintenanceRouter.post('/work-orders', requireAuth, asyncHandler(Maintenance.createWorkOrder));
maintenanceRouter.put('/work-orders/:workOrderId', requireAuth, asyncHandler(Maintenance.updateWorkOrder));
maintenanceRouter.get('/work-orders', requireAuth, asyncHandler(Maintenance.getWorkOrders));
maintenanceRouter.delete('/work-orders/:workOrderId', requireAuth, asyncHandler(Maintenance.deleteWorkOrder));
