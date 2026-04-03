"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vendor = void 0;
const mongoose_1 = require("mongoose");
const vendorSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        pincode: String
    },
    gstin: { type: String },
    industryTags: { type: [String], default: [] },
    rating: { type: Number, min: 0, max: 5 }
}, { timestamps: true });
exports.Vendor = (0, mongoose_1.model)('Vendor', vendorSchema);
