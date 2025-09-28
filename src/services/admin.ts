import { apiClient } from './api';
import type {
  DashboardMetrics,
  AdminUser,
  SystemInfo,
  SystemError,
  UserActivity,
  PaginatedResponse,
  BlockMetrics,
  UserBlockMetrics,
  VehicleBlockMetrics,
  ReservationBlockMetrics,
  FilterParams
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

  // New 3-Block Metrics Methods (from team dialog requirements)

  /**
   * Get all block metrics with optional filtering
   */
  async getBlockMetrics(filters?: FilterParams): Promise<BlockMetrics> {
    const params = this.buildFilterParams(filters);
    return await apiClient.get<BlockMetrics>('/admin/metrics/blocks', params);
  }

  /**
   * Get user block metrics
   */
  async getUserBlockMetrics(filters?: FilterParams): Promise<UserBlockMetrics> {
    const params = this.buildFilterParams(filters);
    return await apiClient.get<UserBlockMetrics>('/admin/metrics/users', params);
  }

  /**
   * Get vehicle block metrics
   */
  async getVehicleBlockMetrics(filters?: FilterParams): Promise<VehicleBlockMetrics> {
    const params = this.buildFilterParams(filters);
    return await apiClient.get<VehicleBlockMetrics>('/admin/metrics/vehicles', params);
  }

  /**
   * Get reservation block metrics
   */
  async getReservationBlockMetrics(filters?: FilterParams): Promise<ReservationBlockMetrics> {
    const params = this.buildFilterParams(filters);
    return await apiClient.get<ReservationBlockMetrics>('/admin/metrics/reservations', params);
  }

  /**
   * Build filter parameters for API requests
   */
  private buildFilterParams(filters?: FilterParams): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.dateRange) {
      params.date_start = filters.dateRange.start;
      params.date_end = filters.dateRange.end;
    }

    if (filters.role && filters.role !== 'ALL') {
      params.role = filters.role;
    }

    if (filters.userStatus) {
      params.user_status = filters.userStatus;
    }

    if (filters.vehicleStatus) {
      params.vehicle_status = filters.vehicleStatus;
    }

    if (filters.reservationStatus) {
      params.reservation_status = filters.reservationStatus;
    }

    return params;
  }
}

export const adminService = new AdminService();
export type {
  AdminUserQueryParams,
  SystemErrorQueryParams,
  UserActivityQueryParams
};