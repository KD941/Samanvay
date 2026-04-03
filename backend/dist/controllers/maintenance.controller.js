"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchedule = createSchedule;
exports.createWorkOrder = createWorkOrder;
exports.updateWorkOrder = updateWorkOrder;
exports.getWorkOrders = getWorkOrders;
exports.deleteWorkOrder = deleteWorkOrder;
const zod_1 = require("zod");
const MaintenanceSchedule_1 = require("../models/MaintenanceSchedule");
const WorkOrder_1 = require("../models/WorkOrder");
const httpError_1 = require("../utils/httpError");
const scheduleCreateSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1),
    machineSerial: zod_1.z.string().optional(),
    intervalDays: zod_1.z.number().int().positive(),
    nextDueAt: zod_1.z.coerce.date(),
    notes: zod_1.z.string().optional()
});
const workOrderCreateSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1),
    scheduleId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional()
});
const workOrderUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(['open', 'in_progress', 'blocked', 'done', 'cancelled']).optional(),
    assignedTo: zod_1.z.string().optional(),
    resolutionNotes: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional()
});
async function createSchedule(req, res) {
    const data = scheduleCreateSchema.parse(req.body);
    const schedule = await MaintenanceSchedule_1.MaintenanceSchedule.create(data);
    res.status(201).json(schedule);
}
async function createWorkOrder(req, res) {
    const data = workOrderCreateSchema.parse(req.body);
    const createdBy = req.user?.sub;
    if (!createdBy)
        throw new httpError_1.HttpError(401, 'Unauthenticated');
    const wo = await WorkOrder_1.WorkOrder.create({
        orderId: data.orderId,
        scheduleId: data.scheduleId,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        createdBy
    });
    res.status(201).json(wo);
}
async function updateWorkOrder(req, res) {
    const { workOrderId } = req.params;
    const patch = workOrderUpdateSchema.parse(req.body);
    const wo = await WorkOrder_1.WorkOrder.findByIdAndUpdate(workOrderId, patch, { new: true });
    if (!wo)
        throw new httpError_1.HttpError(404, 'Work order not found');
    res.json(wo);
}
async function getWorkOrders(req, res) {
    const orderId = req.query.orderId ? String(req.query.orderId) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const filter = {};
    if (orderId)
        filter.orderId = orderId;
    if (status)
        filter.status = status;
    const items = await WorkOrder_1.WorkOrder.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ items });
}
async function deleteWorkOrder(req, res) {
    const { workOrderId } = req.params;
    const wo = await WorkOrder_1.WorkOrder.findByIdAndDelete(workOrderId);
    if (!wo)
        throw new httpError_1.HttpError(404, 'Work order not found');
    res.json({ message: 'Work order deleted successfully' });
}
