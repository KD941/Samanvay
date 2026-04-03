import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { HttpError } from '../utils/httpError';
import { signToken } from '../services/token';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'buyer', 'vendor', 'maintenance', 'analyst']),
  vendorId: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req: any, res: any) {
  const data = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: data.email });
  if (existing) throw new HttpError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    email: data.email,
    passwordHash,
    name: data.name,
    phone: data.phone,
    role: data.role,
    vendorId: data.vendorId
  });

  const token = signToken({ sub: String(user._id), role: data.role, vendorId: data.vendorId });
  res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role, vendorId: user.vendorId } });
}

export async function login(req: any, res: any) {
  const data = loginSchema.parse(req.body);

  const user = await User.findOne({ email: data.email });
  if (!user) throw new HttpError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');

  const token = signToken({ sub: String(user._id), role: user.role as any, vendorId: user.vendorId ? String(user.vendorId) : undefined });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, vendorId: user.vendorId } });
}
