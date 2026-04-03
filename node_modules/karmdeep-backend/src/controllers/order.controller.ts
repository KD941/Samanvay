import { z } from 'zod';
import { Order } from '../models/Order';
import { HttpError } from '../utils/httpError';

const createOrderSchema = z.object({
  // Admin-created orders: buyer is explicit.
  buyerId: z.string().min(1),
  vendorId: z.string().min(1),
  tenderId: z.string().optional(),
  bidId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string().optional(),
        quantity: z.number().int().positive().default(1),
        unitPrice: z.number().optional()
      })
    )
    .optional(),
  totalAmount: z.number(),
  currency: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['created', 'confirmed', 'shipped', 'delivered', 'installed', 'cancelled'])
});

export async function createOrder(req: any, res: any) {
  const data = createOrderSchema.parse(req.body);

  const order = await Order.create({
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

export async function getOrder(req: any, res: any) {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(order);
}

export async function updateOrderStatus(req: any, res: any) {
  const { orderId } = req.params;
  const data = updateStatusSchema.parse(req.body);
  const order = await Order.findByIdAndUpdate(orderId, { status: data.status }, { new: true });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(order);
}

export async function listOrders(req: any, res: any) {
  const buyerId = req.query.buyerId ? String(req.query.buyerId) : undefined;
  const vendorId = req.query.vendorId ? String(req.query.vendorId) : undefined;

  const filter: any = {};
  if (buyerId) filter.buyerId = buyerId;
  if (vendorId) filter.vendorId = vendorId;

  const items = await Order.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ items });
}

export async function deleteOrder(req: any, res: any) {
  const { orderId } = req.params;
  const order = await Order.findByIdAndDelete(orderId);
  
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({ message: 'Order deleted successfully' });
}
