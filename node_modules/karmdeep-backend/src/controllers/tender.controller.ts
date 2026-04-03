import { z } from 'zod';
import { Tender } from '../models/Tender';
import { Bid } from '../models/Bid';
import { HttpError } from '../utils/httpError';

const tenderCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  budget: z.number().optional(),
  currency: z.string().optional(),
  deadlineAt: z.coerce.date(),
  requirements: z.any().optional()
});

const bidCreateSchema = z.object({
  amount: z.number(),
  currency: z.string().optional(),
  leadTimeDays: z.number().optional(),
  notes: z.string().optional(),
  // For vendor users we derive this from JWT; for admins we allow passing it explicitly.
  vendorId: z.string().min(1).optional()
});

export async function createTender(req: any, res: any) {
  const data = tenderCreateSchema.parse(req.body);
  const buyerId = req.user?.sub;
  if (!buyerId) throw new HttpError(401, 'Unauthenticated');

  const tender = await Tender.create({ ...data, buyerId });
  res.status(201).json(tender);
}

export async function getTender(req: any, res: any) {
  const { tenderId } = req.params;
  const tender = await Tender.findById(tenderId);
  if (!tender) throw new HttpError(404, 'Tender not found');
  res.json(tender);
}

export async function listTenders(req: any, res: any) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.category) filter.category = String(req.query.category);

  const [items, total] = await Promise.all([
    Tender.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Tender.countDocuments(filter)
  ]);

  res.json({ page, limit, total, items });
}

export async function submitBid(req: any, res: any) {
  const { tenderId } = req.params;
  const data = bidCreateSchema.parse(req.body);
  const submittedBy = req.user?.sub;
  if (!submittedBy) throw new HttpError(401, 'Unauthenticated');

  const tender = await Tender.findById(tenderId);
  if (!tender) throw new HttpError(404, 'Tender not found');

  // Enforce: vendors can only bid as their own vendor org
  const role = req.user?.role;
  const vendorId = role === 'vendor' ? req.user?.vendorId : data.vendorId;
  if (!vendorId) throw new HttpError(400, 'vendorId is required');

  const bid = await Bid.create({
    tenderId,
    vendorId,
    submittedBy,
    amount: data.amount,
    currency: data.currency ?? 'INR',
    leadTimeDays: data.leadTimeDays,
    notes: data.notes
  });

  res.status(201).json(bid);
}

export async function getBids(req: any, res: any) {
  const { tenderId } = req.params;
  const items = await Bid.find({ tenderId }).sort({ createdAt: -1 });
  res.json({ items });
}

export async function updateTender(req: any, res: any) {
  const { tenderId } = req.params;
  // Use partial of the create schema and allow status updates
  const updateSchema = tenderCreateSchema.partial().extend({
    status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).optional()
  });
  
  const data = updateSchema.parse(req.body);
  const tender = await Tender.findByIdAndUpdate(tenderId, data, { new: true });
  
  if (!tender) throw new HttpError(404, 'Tender not found');
  res.json(tender);
}

export async function deleteTender(req: any, res: any) {
  const { tenderId } = req.params;
  const tender = await Tender.findByIdAndDelete(tenderId);
  
  if (!tender) throw new HttpError(404, 'Tender not found');
  // Also clean up any associated bids
  await Bid.deleteMany({ tenderId });
  
  res.json({ message: 'Tender deleted successfully' });
}
