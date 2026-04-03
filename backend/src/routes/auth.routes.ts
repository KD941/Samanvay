import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as Auth from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(Auth.register));
authRouter.post('/login', asyncHandler(Auth.login));
