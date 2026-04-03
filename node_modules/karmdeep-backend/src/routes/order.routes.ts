import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import * as Order from '../controllers/order.controller';

export const orderRouter = Router();

// Buyers cannot create orders directly. Orders are created by admins (e.g. after award/accept).
orderRouter.post('/', requireAuth, requireRole('admin'), asyncHandler(Order.createOrder));

orderRouter.get('/', requireAuth, asyncHandler(Order.listOrders));
orderRouter.get('/:orderId', requireAuth, asyncHandler(Order.getOrder));

// Vendors/admins can update status.
orderRouter.put('/:orderId/status', requireAuth, requireRole('vendor', 'admin'), asyncHandler(Order.updateOrderStatus));

// Only admins can delete orders
orderRouter.delete('/:orderId', requireAuth, requireRole('admin'), asyncHandler(Order.deleteOrder));
