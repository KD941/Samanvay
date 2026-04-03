"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendor = createVendor;
exports.getVendor = getVendor;
exports.updateVendor = updateVendor;
exports.listVendors = listVendors;
exports.createProduct = createProduct;
exports.getProduct = getProduct;
exports.updateProduct = updateProduct;
exports.listProducts = listProducts;
exports.searchProducts = searchProducts;
exports.deleteVendor = deleteVendor;
exports.deleteProduct = deleteProduct;
const zod_1 = require("zod");
const Vendor_1 = require("../models/Vendor");
const Product_1 = require("../models/Product");
const httpError_1 = require("../utils/httpError");
const vendorCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z
        .object({
        line1: zod_1.z.string().optional(),
        line2: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        pincode: zod_1.z.string().optional()
    })
        .optional(),
    gstin: zod_1.z.string().optional(),
    industryTags: zod_1.z.array(zod_1.z.string()).optional(),
    rating: zod_1.z.number().min(0).max(5).optional()
});
const productCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    specs: zod_1.z.any().optional(),
    price: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    leadTimeDays: zod_1.z.number().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional()
});
async function createVendor(req, res) {
    const data = vendorCreateSchema.parse(req.body);
    const vendor = await Vendor_1.Vendor.create(data);
    res.status(201).json(vendor);
}
async function getVendor(req, res) {
    const { vendorId } = req.params;
    const vendor = await Vendor_1.Vendor.findById(vendorId);
    if (!vendor)
        throw new httpError_1.HttpError(404, 'Vendor not found');
    res.json(vendor);
}
async function updateVendor(req, res) {
    const { vendorId } = req.params;
    const patch = vendorCreateSchema.partial().parse(req.body);
    const vendor = await Vendor_1.Vendor.findByIdAndUpdate(vendorId, patch, { new: true });
    if (!vendor)
        throw new httpError_1.HttpError(404, 'Vendor not found');
    res.json(vendor);
}
async function listVendors(req, res) {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        Vendor_1.Vendor.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Vendor_1.Vendor.countDocuments()
    ]);
    res.json({ page, limit, total, items });
}
async function createProduct(req, res) {
    const { vendorId } = req.params;
    const data = productCreateSchema.parse(req.body);
    const vendor = await Vendor_1.Vendor.findById(vendorId);
    if (!vendor)
        throw new httpError_1.HttpError(404, 'Vendor not found');
    const product = await Product_1.Product.create({ ...data, vendorId });
    res.status(201).json(product);
}
async function getProduct(req, res) {
    const { vendorId, productId } = req.params;
    const product = await Product_1.Product.findOne({ _id: productId, vendorId });
    if (!product)
        throw new httpError_1.HttpError(404, 'Product not found');
    res.json(product);
}
async function updateProduct(req, res) {
    const { vendorId, productId } = req.params;
    const patch = productCreateSchema.partial().parse(req.body);
    const product = await Product_1.Product.findOneAndUpdate({ _id: productId, vendorId }, patch, { new: true });
    if (!product)
        throw new httpError_1.HttpError(404, 'Product not found');
    res.json(product);
}
async function listProducts(req, res) {
    const { vendorId } = req.params;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const skip = (page - 1) * limit;
    const filter = { vendorId };
    if (req.query.category)
        filter.category = String(req.query.category);
    const [items, total] = await Promise.all([
        Product_1.Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Product_1.Product.countDocuments(filter)
    ]);
    res.json({ page, limit, total, items });
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
    res.json({ items });
}
async function deleteVendor(req, res) {
    const { vendorId } = req.params;
    const vendor = await Vendor_1.Vendor.findByIdAndDelete(vendorId);
    if (!vendor)
        throw new httpError_1.HttpError(404, 'Vendor not found');
    // Clean up products associated with the vendor
    await Product_1.Product.deleteMany({ vendorId });
    res.json({ message: 'Vendor deleted successfully' });
}
async function deleteProduct(req, res) {
    const { vendorId, productId } = req.params;
    const product = await Product_1.Product.findOneAndDelete({ _id: productId, vendorId });
    if (!product)
        throw new httpError_1.HttpError(404, 'Product not found');
    res.json({ message: 'Product deleted successfully' });
}
