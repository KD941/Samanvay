import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vendorService } from '../vendorService';
import { api } from '../../lib/api';

vi.mock('../../lib/api');

describe('vendorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listVendors', () => {
    it('calls API with correct parameters', async () => {
      const mockResponse = {
        items: [{ vendorId: '1', companyName: 'Test Vendor' }],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await vendorService.listVendors({ limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/vendors', { limit: 10 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getVendor', () => {
    it('fetches vendor by ID', async () => {
      const mockVendor = { vendorId: '1', companyName: 'Test Vendor' };

      vi.mocked(api.get).mockResolvedValue(mockVendor);

      const result = await vendorService.getVendor('1');

      expect(api.get).toHaveBeenCalledWith('/vendors/1');
      expect(result).toEqual(mockVendor);
    });
  });

  describe('searchProducts', () => {
    it('searches products with query parameters', async () => {
      const mockResponse = {
        items: [{ productId: '1', productName: 'Test Product' }],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await vendorService.searchProducts({
        q: 'CNC',
        category: 'Machines',
        minPrice: 1000,
        maxPrice: 5000,
      });

      expect(api.get).toHaveBeenCalledWith('/products/search', {
        q: 'CNC',
        category: 'Machines',
        minPrice: 1000,
        maxPrice: 5000,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
