import { MaintenanceSchedule } from '../models/MaintenanceSchedule';
import { WorkOrder } from '../models/WorkOrder';
import { HttpError } from '../utils/httpError';

export async function listSchedules(req: any, res: any) {
  const orderId = req.query.orderId ? String(req.query.orderId) : undefined;
  const filter: any = {};
  if (orderId) filter.orderId = orderId;

  const items = await MaintenanceSchedule.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ items });
}

export async function getWorkOrder(req: any, res: any) {
  const { workOrderId } = req.params;
  const wo = await WorkOrder.findById(workOrderId);
  if (!wo) throw new HttpError(404, 'Work order not found');
  res.json(wo);
}
