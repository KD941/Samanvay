"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEvent = void 0;
const mongoose_1 = require("mongoose");
const analyticsEventSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    anonymousId: { type: String },
    eventType: { type: String, required: true, index: true },
    properties: { type: mongoose_1.Schema.Types.Mixed },
    occurredAt: { type: Date, required: true, index: true }
}, { timestamps: true });
analyticsEventSchema.index({ eventType: 1, occurredAt: -1 });
exports.AnalyticsEvent = (0, mongoose_1.model)('AnalyticsEvent', analyticsEventSchema);
