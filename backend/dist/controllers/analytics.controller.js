"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.track = track;
exports.metrics = metrics;
exports.reports = reports;
exports.recommendations = recommendations;
const zod_1 = require("zod");
const AnalyticsEvent_1 = require("../models/AnalyticsEvent");
const Order_1 = require("../models/Order");
const trackSchema = zod_1.z.object({
    eventType: zod_1.z.string().min(1),
    properties: zod_1.z.any().optional(),
    occurredAt: zod_1.z.coerce.date().default(() => new Date()),
    anonymousId: zod_1.z.string().optional()
});
async function track(req, res) {
    const data = trackSchema.parse(req.body);
    const userId = req.user?.sub;
    const ev = await AnalyticsEvent_1.AnalyticsEvent.create({
        userId,
        anonymousId: data.anonymousId,
        eventType: data.eventType,
        properties: data.properties,
        occurredAt: data.occurredAt
    });
    res.status(201).json(ev);
}
async function metrics(_req, res) {
    const [orders, events] = await Promise.all([Order_1.Order.countDocuments(), AnalyticsEvent_1.AnalyticsEvent.countDocuments()]);
    res.json({ orders, events });
}
async function reports(_req, res) {
    // placeholder: build aggregated reports later (Mongo aggregation pipeline)
    res.json({ status: 'ok', report: { message: 'Reports endpoint stub. Implement aggregation pipelines as needed.' } });
}
async function recommendations(_req, res) {
    // placeholder: build recommendation engine later
    res.json({ status: 'ok', recommendations: [] });
}
