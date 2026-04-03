"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRouter = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const Vendor = __importStar(require("../controllers/vendor.controller"));
exports.vendorRouter = (0, express_1.Router)();
// Vendors
exports.vendorRouter.post('/', auth_1.requireAuth, (0, auth_1.requireRole)('admin'), (0, asyncHandler_1.asyncHandler)(Vendor.createVendor));
exports.vendorRouter.get('/', auth_1.requireAuth, (0, auth_1.requireRole)('admin'), (0, asyncHandler_1.asyncHandler)(Vendor.listVendors));
exports.vendorRouter.get('/:vendorId', auth_1.requireAuth, (0, auth_1.requireRole)('admin', 'vendor'), (0, auth_1.requireVendorMatchParam)('vendorId'), (0, asyncHandler_1.asyncHandler)(Vendor.getVendor));
exports.vendorRouter.put('/:vendorId', auth_1.requireAuth, (0, auth_1.requireRole)('admin', 'vendor'), (0, auth_1.requireVendorMatchParam)('vendorId'), (0, asyncHandler_1.asyncHandler)(Vendor.updateVendor));
exports.vendorRouter.delete('/:vendorId', auth_1.requireAuth, (0, auth_1.requireRole)('admin'), (0, asyncHandler_1.asyncHandler)(Vendor.deleteVendor));
// Products (scoped under a vendor)
exports.vendorRouter.post('/:vendorId/products', auth_1.requireAuth, (0, auth_1.requireRole)('admin', 'vendor'), (0, auth_1.requireVendorMatchParam)('vendorId'), (0, asyncHandler_1.asyncHandler)(Vendor.createProduct));
exports.vendorRouter.get('/:vendorId/products', auth_1.requireAuth, (0, auth_1.requireRole)('admin', 'vendor'), (0, auth_1.requireVendorMatchParam)('vendorId'), (0, asyncHandler_1.asyncHandler)(Vendor.listProducts));
exports.vendorRouter.get('/:vendorId/products/:productId', auth_1.requireAuth, (0, auth_1.requireRole)('admin', 'vendor'), (0, auth_1.requireVendorMatchParam)('vendorId'), (0, asyncHandler_1.asyncHandler)(Vendor.getProduct));
exports.vendorRouter.put('/:vendorId/products/:productId', auth_1.requireAuth, (0, auth_1.requireRole)('admin', 'vendor'), (0, auth_1.requireVendorMatchParam)('vendorId'), (0, asyncHandler_1.asyncHandler)(Vendor.updateProduct));
exports.vendorRouter.delete('/:vendorId/products/:productId', auth_1.requireAuth, (0, auth_1.requireRole)('admin', 'vendor'), (0, auth_1.requireVendorMatchParam)('vendorId'), (0, asyncHandler_1.asyncHandler)(Vendor.deleteProduct));
// Cross-vendor product search (buyers can browse)
exports.vendorRouter.get('/_search/products', auth_1.requireAuth, (0, auth_1.requireRole)('admin', 'buyer', 'vendor', 'analyst', 'maintenance'), (0, asyncHandler_1.asyncHandler)(Vendor.searchProducts));
