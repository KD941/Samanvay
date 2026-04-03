import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuthStatus: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (nextUser: User) => {
    set({ user: nextUser, isAuthenticated: true });
  },

  logout: async () => {
    try {
      // Call backend logout endpoint to clear httpOnly cookie
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    }
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (nextUser: User) => {
    set({ user: nextUser });
  },

  checkAuthStatus: async () => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const user = await response.json();
        set({ user, isAuthenticated: true });
        return true;
      } else {
        // Token expired or invalid, clear auth state
        set({ user: null, isAuthenticated: false });
        return false;
      }
    } catch (error) {
      console.warn('Auth status check failed:', error);
      set({ user: null, isAuthenticated: false });
      return false;
    }
  }
}));
