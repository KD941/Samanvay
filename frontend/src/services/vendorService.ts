import { api } from '../lib/api';
import { Vendor, Product, PaginatedResponse } from '../types';

export const vendorService = {
  // Vendors
  async listVendors(params?: { limit?: number; page?: number }): Promise<PaginatedResponse<Vendor>> {
    return api.get('/vendors', params);
  },

  async getVendor(vendorId: string): Promise<Vendor> {
    return api.get(`/vendors/${vendorId}`);
  },

  async registerVendor(data: Partial<Vendor>): Promise<Vendor> {
    return api.post('/vendors', data);
  },

  async updateVendor(vendorId: string, data: Partial<Vendor>): Promise<Vendor> {
    return api.put(`/vendors/${vendorId}`, data);
  },

  // Products
  async listProducts(params?: {
    vendorId?: string;
    category?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> {
    return api.get('/products', params);
  },

  async searchProducts(params: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    // backend schema does not have availability; kept for UI filtering (not enforced server-side)
availability?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> {
    return api.get('/products/search', params);
  },

  async getProduct(vendorId: string, productId: string): Promise<Product> {
    return api.get(`/vendors/${vendorId}/products/${productId}`);
  },

  async createProduct(vendorId: string, data: Partial<Product>): Promise<Product> {
    return api.post(`/vendors/${vendorId}/products`, data);
  },

  async updateProduct(vendorId: string, productId: string, data: Partial<Product>): Promise<Product> {
    return api.put(`/vendors/${vendorId}/products/${productId}`, data);
  },

  async deleteVendor(vendorId: string): Promise<{ message: string }> {
    return api.delete(`/vendors/${vendorId}`);
  },

  async deleteProduct(vendorId: string, productId: string): Promise<{ message: string }> {
    return api.delete(`/vendors/${vendorId}/products/${productId}`);
  },
};
