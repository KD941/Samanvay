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
  // Try to get token from httpOnly cookie first, then fallback to Authorization header
  let token = req.signedCookies?.authToken;
  
  if (!token) {
    const header = req.header('authorization') ?? '';
    token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  }
  
  if (!token) {
    throw new HttpError(401, 'Missing authentication token');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
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

/**
 * Set secure httpOnly cookie with JWT token
 */
export function setAuthCookie(res: Response, token: string): void {
  const isProduction = env.NODE_ENV === 'production';
  
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    signed: true, // Sign the cookie to prevent tampering
  });
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    signed: true,
  });
}
