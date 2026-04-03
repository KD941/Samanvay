import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import * as Auth from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(Auth.register));
authRouter.post('/login', asyncHandler(Auth.login));
authRouter.post('/logout', asyncHandler(Auth.logout));
authRouter.get('/me', requireAuth, asyncHandler(Auth.me));
