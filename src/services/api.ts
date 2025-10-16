import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../config/environment';

// Use fetch adapter in test environment to avoid XHR issues with MSW
let axiosAdapter: string | undefined = undefined;
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  // In test environment, use fetch adapter
  axiosAdapter = 'fetch';
}

class ApiClient {
  private _client: AxiosInstance | null = null;
  private _testBaseUrl: string | null = null;

  // Method to set base URL for tests
  setTestBaseUrl(url: string): void {
    this._testBaseUrl = url;
    this._client = null; // Reset client to use new URL
  }

  // Method to reset client (useful for tests)
  resetClient(): void {
    this._client = null;
    this._testBaseUrl = null;
  }

  private get client(): AxiosInstance {
    if (!this._client) {
      // Lazy initialization - only create client when first accessed
      const baseURL = this._testBaseUrl || getApiBaseUrl();
      this._client = axios.create({
        baseURL,
        adapter: axiosAdapter,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this._client.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      this._client.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error) => {
          if (error.response?.status === 401) {
            // Dispatch custom event for toast notification
            window.dispatchEvent(
              new CustomEvent('auth:unauthorized', {
                detail: { message: 'Your session has expired. Please log in again.' },
              })
            );

            localStorage.removeItem('auth_token');

            // Delay redirect to allow toast to show
            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
          }
          return Promise.reject(error);
        }
      );
    }
    return this._client;
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
