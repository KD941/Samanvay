import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireRole, requireVendorMatchParam } from '../middleware/auth';
import * as Vendor from '../controllers/vendor.controller';

export const vendorRouter = Router();

// Vendors
vendorRouter.post('/', requireAuth, requireRole('admin'), asyncHandler(Vendor.createVendor));
vendorRouter.get('/', requireAuth, requireRole('admin'), asyncHandler(Vendor.listVendors));
vendorRouter.get('/:vendorId', requireAuth, requireRole('admin', 'vendor'), requireVendorMatchParam('vendorId'), asyncHandler(Vendor.getVendor));
vendorRouter.put('/:vendorId', requireAuth, requireRole('admin', 'vendor'), requireVendorMatchParam('vendorId'), asyncHandler(Vendor.updateVendor));
vendorRouter.delete('/:vendorId', requireAuth, requireRole('admin'), asyncHandler(Vendor.deleteVendor));

// Products (scoped under a vendor)
vendorRouter.post('/:vendorId/products', requireAuth, requireRole('admin', 'vendor'), requireVendorMatchParam('vendorId'), asyncHandler(Vendor.createProduct));
vendorRouter.get('/:vendorId/products', requireAuth, requireRole('admin', 'vendor'), requireVendorMatchParam('vendorId'), asyncHandler(Vendor.listProducts));
vendorRouter.get('/:vendorId/products/:productId', requireAuth, requireRole('admin', 'vendor'), requireVendorMatchParam('vendorId'), asyncHandler(Vendor.getProduct));
vendorRouter.put('/:vendorId/products/:productId', requireAuth, requireRole('admin', 'vendor'), requireVendorMatchParam('vendorId'), asyncHandler(Vendor.updateProduct));
vendorRouter.delete('/:vendorId/products/:productId', requireAuth, requireRole('admin', 'vendor'), requireVendorMatchParam('vendorId'), asyncHandler(Vendor.deleteProduct));

// Cross-vendor product search (buyers can browse)
vendorRouter.get('/_search/products', requireAuth, requireRole('admin', 'buyer', 'vendor', 'analyst', 'maintenance'), asyncHandler(Vendor.searchProducts));
