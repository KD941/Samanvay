"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTender = createTender;
exports.getTender = getTender;
exports.listTenders = listTenders;
exports.submitBid = submitBid;
exports.getBids = getBids;
exports.updateTender = updateTender;
exports.deleteTender = deleteTender;
const zod_1 = require("zod");
const Tender_1 = require("../models/Tender");
const Bid_1 = require("../models/Bid");
const httpError_1 = require("../utils/httpError");
const tenderCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive().optional(),
    budget: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    deadlineAt: zod_1.z.coerce.date(),
    requirements: zod_1.z.any().optional()
});
const bidCreateSchema = zod_1.z.object({
    amount: zod_1.z.number(),
    currency: zod_1.z.string().optional(),
    leadTimeDays: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
    // For vendor users we derive this from JWT; for admins we allow passing it explicitly.
    vendorId: zod_1.z.string().min(1).optional()
});
async function createTender(req, res) {
    const data = tenderCreateSchema.parse(req.body);
    const buyerId = req.user?.sub;
    if (!buyerId)
        throw new httpError_1.HttpError(401, 'Unauthenticated');
    const tender = await Tender_1.Tender.create({ ...data, buyerId });
    res.status(201).json(tender);
}
async function getTender(req, res) {
    const { tenderId } = req.params;
    const tender = await Tender_1.Tender.findById(tenderId);
    if (!tender)
        throw new httpError_1.HttpError(404, 'Tender not found');
    res.json(tender);
}
async function listTenders(req, res) {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status)
        filter.status = String(req.query.status);
    if (req.query.category)
        filter.category = String(req.query.category);
    const [items, total] = await Promise.all([
        Tender_1.Tender.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Tender_1.Tender.countDocuments(filter)
    ]);
    res.json({ page, limit, total, items });
}
async function submitBid(req, res) {
    const { tenderId } = req.params;
    const data = bidCreateSchema.parse(req.body);
    const submittedBy = req.user?.sub;
    if (!submittedBy)
        throw new httpError_1.HttpError(401, 'Unauthenticated');
    const tender = await Tender_1.Tender.findById(tenderId);
    if (!tender)
        throw new httpError_1.HttpError(404, 'Tender not found');
    // Enforce: vendors can only bid as their own vendor org
    const role = req.user?.role;
    const vendorId = role === 'vendor' ? req.user?.vendorId : data.vendorId;
    if (!vendorId)
        throw new httpError_1.HttpError(400, 'vendorId is required');
    const bid = await Bid_1.Bid.create({
        tenderId,
        vendorId,
        submittedBy,
        amount: data.amount,
        currency: data.currency ?? 'INR',
        leadTimeDays: data.leadTimeDays,
        notes: data.notes
    });
    res.status(201).json(bid);
}
async function getBids(req, res) {
    const { tenderId } = req.params;
    const items = await Bid_1.Bid.find({ tenderId }).sort({ createdAt: -1 });
    res.json({ items });
}
async function updateTender(req, res) {
    const { tenderId } = req.params;
    // Use partial of the create schema and allow status updates
    const updateSchema = tenderCreateSchema.partial().extend({
        status: zod_1.z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).optional()
    });
    const data = updateSchema.parse(req.body);
    const tender = await Tender_1.Tender.findByIdAndUpdate(tenderId, data, { new: true });
    if (!tender)
        throw new httpError_1.HttpError(404, 'Tender not found');
    res.json(tender);
}
async function deleteTender(req, res) {
    const { tenderId } = req.params;
    const tender = await Tender_1.Tender.findByIdAndDelete(tenderId);
    if (!tender)
        throw new httpError_1.HttpError(404, 'Tender not found');
    // Also clean up any associated bids
    await Bid_1.Bid.deleteMany({ tenderId });
    res.json({ message: 'Tender deleted successfully' });
}
