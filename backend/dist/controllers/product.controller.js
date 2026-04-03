"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.searchProducts = searchProducts;
const Product_1 = require("../models/Product");
async function listProducts(req, res) {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const skip = (page - 1) * limit;
    const filter = { isActive: true };
    if (req.query.vendorId)
        filter.vendorId = String(req.query.vendorId);
    if (req.query.category)
        filter.category = String(req.query.category);
    const [items, total] = await Promise.all([
        Product_1.Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Product_1.Product.countDocuments(filter)
    ]);
    // keep shape similar to earlier frontend types
    res.json({ items, total, page, limit });
}
async function searchProducts(req, res) {
    const q = String(req.query.q ?? '').trim();
    const category = req.query.category ? String(req.query.category) : undefined;
    const filter = { isActive: true };
    if (category)
        filter.category = category;
    if (q)
        filter.$text = { $search: q };
    const items = await Product_1.Product.find(filter).limit(50);
    res.json({ items, total: items.length, page: 1, limit: 50 });
}
