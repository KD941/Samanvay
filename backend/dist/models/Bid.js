"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bid = void 0;
const mongoose_1 = require("mongoose");
const bidSchema = new mongoose_1.Schema({
    tenderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tender', required: true, index: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    submittedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    leadTimeDays: { type: Number },
    notes: { type: String },
    status: { type: String, enum: ['submitted', 'shortlisted', 'rejected', 'accepted'], default: 'submitted' }
}, { timestamps: true });
bidSchema.index({ tenderId: 1, vendorId: 1 }, { unique: true });
exports.Bid = (0, mongoose_1.model)('Bid', bidSchema);
