import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { HttpError } from '../utils/httpError';
import { signToken } from '../services/token';
import { setAuthCookie, clearAuthCookie } from '../middleware/auth';

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
  
  // Set secure httpOnly cookie instead of returning token in response
  setAuthCookie(res, token);
  
  res.status(201).json({ 
    user: { 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      vendorId: user.vendorId 
    } 
  });
}

export async function login(req: any, res: any) {
  const data = loginSchema.parse(req.body);

  const user = await User.findOne({ email: data.email });
  if (!user) throw new HttpError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');

  const token = signToken({ sub: String(user._id), role: user.role as any, vendorId: user.vendorId ? String(user.vendorId) : undefined });
  
  // Set secure httpOnly cookie instead of returning token in response
  setAuthCookie(res, token);
  
  res.json({ 
    user: { 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      vendorId: user.vendorId 
    } 
  });
}

export async function logout(req: any, res: any) {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
}

export async function me(req: any, res: any) {
  // This endpoint is protected by requireAuth middleware
  // which sets req.user from the JWT token
  if (!req.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  // Fetch fresh user data from database
  const user = await User.findById(req.user.sub);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  res.json({
    id: user._id,
    email: user.email,
    role: user.role,
    vendorId: user.vendorId,
    name: user.name,
    phone: user.phone
  });
}
