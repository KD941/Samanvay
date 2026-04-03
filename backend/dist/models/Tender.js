"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tender = void 0;
const mongoose_1 = require("mongoose");
const tenderSchema = new mongoose_1.Schema({
    buyerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, required: true, index: true },
    quantity: { type: Number, default: 1 },
    budget: { type: Number },
    currency: { type: String, default: 'INR' },
    deadlineAt: { type: Date, required: true, index: true },
    status: {
        type: String,
        enum: ['draft', 'published', 'closed', 'awarded', 'cancelled'],
        default: 'published',
        index: true
    },
    requirements: { type: mongoose_1.Schema.Types.Mixed }
}, { timestamps: true });
tenderSchema.index({ category: 1, status: 1, deadlineAt: 1 });
exports.Tender = (0, mongoose_1.model)('Tender', tenderSchema);
