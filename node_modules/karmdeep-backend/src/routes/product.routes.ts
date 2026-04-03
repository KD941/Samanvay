import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import * as Product from '../controllers/product.controller';

export const productRouter = Router();

productRouter.get('/', requireAuth, asyncHandler(Product.listProducts));
productRouter.get('/search', requireAuth, asyncHandler(Product.searchProducts));
