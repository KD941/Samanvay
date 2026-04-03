"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String },
    specs: { type: mongoose_1.Schema.Types.Mixed },
    price: { type: Number },
    currency: { type: String, default: 'INR' },
    leadTimeDays: { type: Number },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
productSchema.index({ vendorId: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' });
exports.Product = (0, mongoose_1.model)('Product', productSchema);
