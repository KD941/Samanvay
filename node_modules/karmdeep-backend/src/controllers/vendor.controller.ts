import { z } from 'zod';
import { Vendor } from '../models/Vendor';
import { Product } from '../models/Product';
import { HttpError } from '../utils/httpError';

const vendorCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      pincode: z.string().optional()
    })
    .optional(),
  gstin: z.string().optional(),
  industryTags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional()
});

const productCreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  specs: z.any().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  leadTimeDays: z.number().optional(),
  images: z.array(z.string()).optional()
});

export async function createVendor(req: any, res: any) {
  const data = vendorCreateSchema.parse(req.body);
  const vendor = await Vendor.create(data);
  res.status(201).json(vendor);
}

export async function getVendor(req: any, res: any) {
  const { vendorId } = req.params;
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new HttpError(404, 'Vendor not found');
  res.json(vendor);
}

export async function updateVendor(req: any, res: any) {
  const { vendorId } = req.params;
  const patch = vendorCreateSchema.partial().parse(req.body);
  const vendor = await Vendor.findByIdAndUpdate(vendorId, patch, { new: true });
  if (!vendor) throw new HttpError(404, 'Vendor not found');
  res.json(vendor);
}

export async function listVendors(req: any, res: any) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Vendor.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Vendor.countDocuments()
  ]);

  res.json({ page, limit, total, items });
}

export async function createProduct(req: any, res: any) {
  const { vendorId } = req.params;
  const data = productCreateSchema.parse(req.body);
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new HttpError(404, 'Vendor not found');

  const product = await Product.create({ ...data, vendorId });
  res.status(201).json(product);
}

export async function getProduct(req: any, res: any) {
  const { vendorId, productId } = req.params;
  const product = await Product.findOne({ _id: productId, vendorId });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
}

export async function updateProduct(req: any, res: any) {
  const { vendorId, productId } = req.params;
  const patch = productCreateSchema.partial().parse(req.body);
  const product = await Product.findOneAndUpdate({ _id: productId, vendorId }, patch, { new: true });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
}

export async function listProducts(req: any, res: any) {
  const { vendorId } = req.params;
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const skip = (page - 1) * limit;

  const filter: any = { vendorId };
  if (req.query.category) filter.category = String(req.query.category);

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({ page, limit, total, items });
}

export async function searchProducts(req: any, res: any) {
  const q = String(req.query.q ?? '').trim();
  const category = req.query.category ? String(req.query.category) : undefined;

  const filter: any = { isActive: true };
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const items = await Product.find(filter).limit(50);
  res.json({ items });
}

export async function deleteVendor(req: any, res: any) {
  const { vendorId } = req.params;
  const vendor = await Vendor.findByIdAndDelete(vendorId);
  if (!vendor) throw new HttpError(404, 'Vendor not found');
  
  // Clean up products associated with the vendor
  await Product.deleteMany({ vendorId });
  
  res.json({ message: 'Vendor deleted successfully' });
}

export async function deleteProduct(req: any, res: any) {
  const { vendorId, productId } = req.params;
  const product = await Product.findOneAndDelete({ _id: productId, vendorId });
  
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ message: 'Product deleted successfully' });
}
