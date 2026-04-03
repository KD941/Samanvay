"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    role: { type: String, required: true, enum: ['admin', 'buyer', 'vendor', 'maintenance', 'analyst'] },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', userSchema);
