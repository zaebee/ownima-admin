import axios from 'axios';
import { apiClient } from './api';
import { getApiBaseUrl } from '../config/environment';
import type { LoginRequest, LoginResponse, User } from '../types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    formData.append('user_type', 'admin');

    const response = await axios.post<LoginResponse>(
      `${getApiBaseUrl()}/auth/access-token`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/users/me');
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
  }
}

export const authService = new AuthService();
