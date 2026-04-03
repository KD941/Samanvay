"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrder = getOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.listOrders = listOrders;
exports.deleteOrder = deleteOrder;
const zod_1 = require("zod");
const Order_1 = require("../models/Order");
const httpError_1 = require("../utils/httpError");
const createOrderSchema = zod_1.z.object({
    // Admin-created orders: buyer is explicit.
    buyerId: zod_1.z.string().min(1),
    vendorId: zod_1.z.string().min(1),
    tenderId: zod_1.z.string().optional(),
    bidId: zod_1.z.string().optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        quantity: zod_1.z.number().int().positive().default(1),
        unitPrice: zod_1.z.number().optional()
    }))
        .optional(),
    totalAmount: zod_1.z.number(),
    currency: zod_1.z.string().optional()
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['created', 'confirmed', 'shipped', 'delivered', 'installed', 'cancelled'])
});
async function createOrder(req, res) {
    const data = createOrderSchema.parse(req.body);
    const order = await Order_1.Order.create({
        buyerId: data.buyerId,
        vendorId: data.vendorId,
        tenderId: data.tenderId,
        bidId: data.bidId,
        items: data.items ?? [],
        totalAmount: data.totalAmount,
        currency: data.currency ?? 'INR'
    });
    res.status(201).json(order);
}
async function getOrder(req, res) {
    const { orderId } = req.params;
    const order = await Order_1.Order.findById(orderId);
    if (!order)
        throw new httpError_1.HttpError(404, 'Order not found');
    res.json(order);
}
async function updateOrderStatus(req, res) {
    const { orderId } = req.params;
    const data = updateStatusSchema.parse(req.body);
    const order = await Order_1.Order.findByIdAndUpdate(orderId, { status: data.status }, { new: true });
    if (!order)
        throw new httpError_1.HttpError(404, 'Order not found');
    res.json(order);
}
async function listOrders(req, res) {
    const buyerId = req.query.buyerId ? String(req.query.buyerId) : undefined;
    const vendorId = req.query.vendorId ? String(req.query.vendorId) : undefined;
    const filter = {};
    if (buyerId)
        filter.buyerId = buyerId;
    if (vendorId)
        filter.vendorId = vendorId;
    const items = await Order_1.Order.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ items });
}
async function deleteOrder(req, res) {
    const { orderId } = req.params;
    const order = await Order_1.Order.findByIdAndDelete(orderId);
    if (!order)
        throw new httpError_1.HttpError(404, 'Order not found');
    res.json({ message: 'Order deleted successfully' });
}
