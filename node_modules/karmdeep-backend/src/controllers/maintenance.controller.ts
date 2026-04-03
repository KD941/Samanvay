import { z } from 'zod';
import { MaintenanceSchedule } from '../models/MaintenanceSchedule';
import { WorkOrder } from '../models/WorkOrder';
import { HttpError } from '../utils/httpError';

const scheduleCreateSchema = z.object({
  orderId: z.string().min(1),
  machineSerial: z.string().optional(),
  intervalDays: z.number().int().positive(),
  nextDueAt: z.coerce.date(),
  notes: z.string().optional()
});

const workOrderCreateSchema = z.object({
  orderId: z.string().min(1),
  scheduleId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string().optional()
});

const workOrderUpdateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'blocked', 'done', 'cancelled']).optional(),
  assignedTo: z.string().optional(),
  resolutionNotes: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional()
});

export async function createSchedule(req: any, res: any) {
  const data = scheduleCreateSchema.parse(req.body);
  const schedule = await MaintenanceSchedule.create(data);
  res.status(201).json(schedule);
}

export async function createWorkOrder(req: any, res: any) {
  const data = workOrderCreateSchema.parse(req.body);
  const createdBy = req.user?.sub;
  if (!createdBy) throw new HttpError(401, 'Unauthenticated');

  const wo = await WorkOrder.create({
    orderId: data.orderId,
    scheduleId: data.scheduleId,
    title: data.title,
    description: data.description,
    assignedTo: data.assignedTo,
    createdBy
  });

  res.status(201).json(wo);
}

export async function updateWorkOrder(req: any, res: any) {
  const { workOrderId } = req.params;
  const patch = workOrderUpdateSchema.parse(req.body);
  const wo = await WorkOrder.findByIdAndUpdate(workOrderId, patch, { new: true });
  if (!wo) throw new HttpError(404, 'Work order not found');
  res.json(wo);
}

export async function getWorkOrders(req: any, res: any) {
  const orderId = req.query.orderId ? String(req.query.orderId) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const filter: any = {};
  if (orderId) filter.orderId = orderId;
  if (status) filter.status = status;

  const items = await WorkOrder.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ items });
}

export async function deleteWorkOrder(req: any, res: any) {
  const { workOrderId } = req.params;
  const wo = await WorkOrder.findByIdAndDelete(workOrderId);
  
  if (!wo) throw new HttpError(404, 'Work order not found');
  res.json({ message: 'Work order deleted successfully' });
}
