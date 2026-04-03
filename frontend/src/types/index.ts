// Types aligned with backend Mongo/Mongoose models (see project_mern/db.md)

// User / Auth
export type Role = 'admin' | 'buyer' | 'vendor' | 'maintenance' | 'analyst';
export const ROLES: Role[] = ['admin', 'buyer', 'vendor', 'maintenance', 'analyst'];

export interface User {
  id: string;
  email: string;
  role: Role;
  vendorId?: string;
  name?: string;
  phone?: string;
}

// Vendor
export interface Vendor {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  gstin?: string;
  industryTags?: string[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

// Product
export interface Product {
  _id: string;
  vendorId: string;
  name: string;
  category: string;
  description?: string;
  specs?: Record<string, any>;
  price?: number;
  currency?: string;
  leadTimeDays?: number;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tender
export type TenderStatus = 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled';

export interface Tender {
  _id: string;
  buyerId: string;
  title: string;
  description?: string;
  category: string;
  quantity: number;
  budget?: number;
  currency: string;
  deadlineAt: string;
  status: TenderStatus;
  requirements?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Bid
export type BidStatus = 'submitted' | 'shortlisted' | 'rejected' | 'accepted';

export interface Bid {
  _id: string;
  tenderId: string;
  vendorId: string;
  submittedBy: string;
  amount: number;
  currency: string;
  leadTimeDays?: number;
  notes?: string;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

// Orders
export type OrderStatus = 'created' | 'confirmed' | 'shipped' | 'delivered' | 'installed' | 'cancelled';

export interface OrderItem {
  productId?: string;
  name?: string;
  quantity: number;
  unitPrice?: number;
}

export interface Order {
  _id: string;
  buyerId: string;
  vendorId: string;
  tenderId?: string;
  bidId?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  milestones?: { name: string; status: 'pending' | 'done'; dueAt?: string }[];
  createdAt: string;
  updatedAt: string;
}

// Generic API wrappers
export interface PaginatedResponse<T> {
  items: T[];
  page?: number;
  limit?: number;
  total?: number;
  nextToken?: string;
}
