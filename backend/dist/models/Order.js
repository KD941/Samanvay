"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number }
}, { _id: false });
const milestoneSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    status: { type: String, enum: ['pending', 'done'], default: 'pending' },
    dueAt: { type: Date }
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    buyerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    tenderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tender' },
    bidId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Bid' },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
        type: String,
        enum: ['created', 'confirmed', 'shipped', 'delivered', 'installed', 'cancelled'],
        default: 'created'
    },
    milestones: { type: [milestoneSchema], default: [] }
}, { timestamps: true });
exports.Order = (0, mongoose_1.model)('Order', orderSchema);
