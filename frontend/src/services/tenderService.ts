import { api } from '../lib/api';
import { Tender, Bid, PaginatedResponse } from '../types';

export const tenderService = {
  async listTenders(params?: {
    status?: string;
    buyerId?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Tender>> {
    return api.get('/tenders', params);
  },

  async getTender(tenderId: string): Promise<Tender> {
    return api.get(`/tenders/${tenderId}`);
  },

  async createTender(data: Partial<Tender>): Promise<Tender> {
    return api.post('/tenders', data);
  },

  async submitBid(tenderId: string, data: Partial<Bid>): Promise<Bid> {
    return api.post(`/tenders/${tenderId}/bids`, data);
  },

  async getBids(tenderId: string): Promise<PaginatedResponse<Bid>> {
    return api.get(`/tenders/${tenderId}/bids`);
  },

  async updateTender(tenderId: string, data: Partial<Tender>): Promise<Tender> {
    return api.put(`/tenders/${tenderId}`, data);
  },

  async deleteTender(tenderId: string): Promise<{ message: string }> {
    return api.delete(`/tenders/${tenderId}`);
  },
};
