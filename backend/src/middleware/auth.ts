import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from '../utils/httpError';
import { JwtPayload, Role } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) throw new HttpError(401, 'Missing Authorization: Bearer <token>');

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) throw new HttpError(401, 'Unauthenticated');
    if (!roles.includes(role)) throw new HttpError(403, 'Forbidden');
    next();
  };
}

/**
 * If the caller is a vendor user, enforce that the vendorId in the route param matches
 * the vendorId embedded in their JWT.
 */
export function requireVendorMatchParam(paramName: string = 'vendorId') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) throw new HttpError(401, 'Unauthenticated');

    if (role === 'vendor') {
      const tokenVendorId = req.user?.vendorId;
      const routeVendorId = (req.params as any)?.[paramName];

      if (!tokenVendorId) throw new HttpError(403, 'Vendor user is missing vendorId');
      if (!routeVendorId) throw new HttpError(400, `Missing route param: ${paramName}`);
      if (String(tokenVendorId) !== String(routeVendorId)) throw new HttpError(403, 'Forbidden');
    }

    next();
  };
}
