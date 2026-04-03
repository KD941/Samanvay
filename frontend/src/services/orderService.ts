import { api } from '../lib/api';
import { Order, PaginatedResponse, OrderStatus } from '../types';

export const orderService = {
  async listOrders(params?: {
    buyerId?: string;
    vendorId?: string;
    status?: OrderStatus;
    limit?: number;
  }): Promise<PaginatedResponse<Order>> {
    return api.get('/orders', params);
  },

  async getOrder(orderId: string): Promise<Order> {
    return api.get(`/orders/${orderId}`);
  },

  async createOrder(data: Partial<Order>): Promise<Order> {
    return api.post('/orders', data);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return api.put(`/orders/${orderId}/status`, { status });
  },

  async deleteOrder(orderId: string): Promise<{ message: string }> {
    return api.delete(`/orders/${orderId}`);
  },
};
