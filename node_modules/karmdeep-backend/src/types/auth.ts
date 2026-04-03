export type Role = 'admin' | 'buyer' | 'vendor' | 'maintenance' | 'analyst';

export type JwtPayload = {
  sub: string; // userId
  role: Role;
  vendorId?: string;
};
