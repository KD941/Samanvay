"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSchedules = listSchedules;
exports.getWorkOrder = getWorkOrder;
const MaintenanceSchedule_1 = require("../models/MaintenanceSchedule");
const WorkOrder_1 = require("../models/WorkOrder");
const httpError_1 = require("../utils/httpError");
async function listSchedules(req, res) {
    const orderId = req.query.orderId ? String(req.query.orderId) : undefined;
    const filter = {};
    if (orderId)
        filter.orderId = orderId;
    const items = await MaintenanceSchedule_1.MaintenanceSchedule.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ items });
}
async function getWorkOrder(req, res) {
    const { workOrderId } = req.params;
    const wo = await WorkOrder_1.WorkOrder.findById(workOrderId);
    if (!wo)
        throw new httpError_1.HttpError(404, 'Work order not found');
    res.json(wo);
}
