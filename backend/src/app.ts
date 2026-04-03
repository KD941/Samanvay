import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import cookieParser from 'cookie-parser';
import 'express-async-errors';

import { env } from './config/env';
import { authRouter } from './routes/auth.routes';
import { vendorRouter } from './routes/vendor.routes';
import { tenderRouter } from './routes/tender.routes';
import { orderRouter } from './routes/order.routes';
import { maintenanceRouter } from './routes/maintenance.routes';
import { maintenanceExtrasRouter } from './routes/maintenanceExtras.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { productRouter } from './routes/product.routes';
import { errorHandler } from './middleware/errorHandler';
import { HttpError } from './utils/httpError';

// Input sanitization middleware
function sanitizeInput(req: express.Request, _res: express.Response, next: express.NextFunction) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  next();
}

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Basic XSS prevention - remove script tags and javascript: protocols
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// Validation error handler
function handleValidationErrors(req: express.Request, _res: express.Response, next: express.NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError(400, 'Validation failed', errors.array());
  }
  next();
}

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration with explicit origin allowlist
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
  });

  // Cookie parser for httpOnly cookies
  app.use(cookieParser(env.COOKIE_SECRET));

  // Body parsing with size limits
  app.use(express.json({ 
    limit: '2mb',
    verify: (req, res, buf) => {
      // Verify JSON is valid
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new HttpError(400, 'Invalid JSON');
      }
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '2mb' 
  }));

  // Input sanitization
  app.use(sanitizeInput);

  // Logging
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Health check
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Routes with rate limiting for auth
  app.use('/api/v1/auth', authLimiter, authRouter);
  app.use('/api/v1/vendors', vendorRouter);
  app.use('/api/v1/tenders', tenderRouter);
  app.use('/api/v1/orders', orderRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/maintenance', maintenanceRouter);
  app.use('/api/v1/maintenance', maintenanceExtrasRouter);
  app.use('/api/v1/analytics', analyticsRouter);

  // Error handling
  app.use(errorHandler);

  return app;
}
