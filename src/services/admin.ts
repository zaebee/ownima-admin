import { apiClient } from './api';
import type {
  DashboardMetrics,
  AdminUser,
  SystemInfo,
  SystemError,
  UserActivity,
  PaginatedResponse
} from '../types';

interface AdminUserQueryParams extends Record<string, unknown> {
  skip?: number;
  limit?: number;
  search?: string;
  user_type?: 'OWNER' | 'RIDER';
  registration_date_from?: string;
  registration_date_to?: string;
  inactive_days?: number;
  is_active?: boolean;
}

interface SystemErrorQueryParams extends Record<string, unknown> {
  _limit?: number;
  level?: 'ERROR' | 'WARNING' | 'INFO';
  date_from?: string;
  date_to?: string;
}

interface UserActivityQueryParams extends Record<string, unknown> {
  limit?: number;
  activity_type?: 'LOGIN' | 'REGISTRATION' | 'BOOKING' | 'ALL';
  date_from?: string;
  date_to?: string;
}

class AdminService {
  /**
   * Get dashboard metrics overview with all 9 key metrics
   */
  async getMetricsOverview(): Promise<DashboardMetrics> {
    return await apiClient.get<DashboardMetrics>('/admin/metrics/overview');
  }

  /**
   * Get paginated list of users with admin-specific information
   */
  async getAdminUsers(params?: AdminUserQueryParams): Promise<{data: AdminUser[], count: number} | AdminUser[] | PaginatedResponse<AdminUser>> {
    const response = await apiClient.get<{data: AdminUser[], count: number} | AdminUser[] | PaginatedResponse<AdminUser>>('/admin/users', params);
    console.log('Admin users API response:', response);
    return response;
  }

  /**
   * Get system information including version and deployment details
   */
  async getSystemInfo(): Promise<SystemInfo> {
    return await apiClient.get<SystemInfo>('/admin/system/info');
  }

  /**
   * Get recent system errors for monitoring
   */
  async getSystemErrors(params?: SystemErrorQueryParams): Promise<SystemError[]> {
    return await apiClient.get<SystemError[]>('/admin/system/errors', params);
  }

  /**
   * Get recent user activities (logins, registrations, bookings)
   */
  async getRecentActivity(params?: UserActivityQueryParams): Promise<UserActivity[]> {
    return await apiClient.get<UserActivity[]>('/admin/activity/recent', params);
  }

  /**
   * Get user statistics by type
   */
  async getUserStats(): Promise<{ owners: number; riders: number; total: number }> {
    const response = await apiClient.get<{ owners: number; riders: number; total: number }>('/admin/users/stats');
    return response;
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    today: number;
    today_by_start_date: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      pending: number;
      confirmed: number;
      today: number;
      today_by_start_date: number;
    }>('/admin/bookings/stats');
    return response;
  }

  /**
   * Get daily activity statistics
   */
  async getDailyStats(): Promise<{
    new_registrations_today: number;
    logins_today: number;
    bookings_today: number;
  }> {
    const response = await apiClient.get<{
      new_registrations_today: number;
      logins_today: number;
      bookings_today: number;
    }>('/admin/activity/daily');
    return response;
  }
}

export const adminService = new AdminService();
export type {
  AdminUserQueryParams,
  SystemErrorQueryParams,
  UserActivityQueryParams
};