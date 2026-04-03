import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  return res.status(500).json({ error: message });
}
