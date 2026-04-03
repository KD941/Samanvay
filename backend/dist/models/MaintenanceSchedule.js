"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceSchedule = void 0;
const mongoose_1 = require("mongoose");
const maintenanceScheduleSchema = new mongoose_1.Schema({
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    machineSerial: { type: String },
    intervalDays: { type: Number, required: true },
    nextDueAt: { type: Date, required: true, index: true },
    notes: { type: String }
}, { timestamps: true });
exports.MaintenanceSchedule = (0, mongoose_1.model)('MaintenanceSchedule', maintenanceScheduleSchema);
