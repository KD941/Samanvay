import { api } from '../lib/api';
import type { Role, User } from '../types';

export type AuthResponse = {
  user: User;
};

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return api.post('/auth/login', { email, password });
  },

  async register(data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role: Role;
    vendorId?: string;
  }): Promise<AuthResponse> {
    return api.post('/auth/register', data);
  },

  async logout(): Promise<void> {
    return api.post('/auth/logout');
  },

  async me(): Promise<User> {
    return api.get('/auth/me');
  },
};
