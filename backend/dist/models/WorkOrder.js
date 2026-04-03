"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrder = void 0;
const mongoose_1 = require("mongoose");
const workOrderSchema = new mongoose_1.Schema({
    scheduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MaintenanceSchedule' },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['open', 'in_progress', 'blocked', 'done', 'cancelled'], default: 'open', index: true },
    resolutionNotes: { type: String }
}, { timestamps: true });
exports.WorkOrder = (0, mongoose_1.model)('WorkOrder', workOrderSchema);
