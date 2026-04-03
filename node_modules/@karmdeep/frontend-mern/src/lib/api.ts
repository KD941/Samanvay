import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies in requests
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          // The auth store will handle clearing the auth state
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private unwrap<T>(payload: any): T {
    // Supports both { data: T } envelopes and raw T.
    if (payload && typeof payload === 'object' && 'data' in payload) return payload.data as T;
    return payload as T;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<any>(url, { params });
    return this.unwrap<T>(response.data);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<any>(url, data);
    return this.unwrap<T>(response.data);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<any>(url, data);
    return this.unwrap<T>(response.data);
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<any>(url);
    return this.unwrap<T>(response.data);
  }
}

export const api = new ApiClient();
