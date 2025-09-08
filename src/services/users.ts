import { apiClient } from './api';
import type { User, PaginatedResponse } from '../types';

interface UserQueryParams {
  page?: number;
  size?: number;
  search?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

interface CreateUserData {
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

interface UpdateUserData {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

class UserService {
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<any>('/users', params);
    
    // Transform API response to match our expected structure
    return {
      items: response.data || [],
      total: response.count || 0,
      page: params?.page || 1,
      size: params?.size || 20,
      pages: Math.ceil((response.count || 0) / (params?.size || 20))
    };
  }

  async getUser(id: string): Promise<User> {
    return await apiClient.get<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserData): Promise<User> {
    return await apiClient.post<User>('/users', data);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return await apiClient.patch<User>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<void> {
    return await apiClient.delete<void>(`/users/${id}`);
  }

  async activateUser(id: string): Promise<User> {
    return await apiClient.patch<User>(`/users/${id}`, { is_active: true });
  }

  async deactivateUser(id: string): Promise<User> {
    return await apiClient.patch<User>(`/users/${id}`, { is_active: false });
  }

  async toggleSuperuser(id: string, is_superuser: boolean): Promise<User> {
    return await apiClient.patch<User>(`/users/${id}`, { is_superuser });
  }
}

export const userService = new UserService();
export type { CreateUserData, UpdateUserData };