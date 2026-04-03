import { api } from '../lib/api';
import type { Role, User } from '../types';

export type LoginResponse = {
  token: string;
  user: User;
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return api.post('/auth/login', { email, password });
  },

  async register(data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role: Role;
    vendorId?: string;
  }): Promise<LoginResponse> {
    return api.post('/auth/register', data);
  },
};
