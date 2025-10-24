import { apiClient } from './api';
import type { components } from '../types/api-generated';
import type {
  DashboardMetrics,
  AdminUser,
  SystemInfo,
  SystemError,
  PaginatedResponse,
  BlockMetrics,
  UserBlockMetrics,
  VehicleBlockMetrics,
  ReservationBlockMetrics,
  FilterParams,
  PaginatedActivityResponse,
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
  user_id?: string;
  activity_type?: 'LOGIN' | 'REGISTRATION' | 'BOOKING' | 'ALL';
  date_from?: string;
  date_to?: string;
}

class AdminService {
  /**
   * Get dashboard metrics overview with all 9 key metrics
   * @deprecated Use getBlockMetrics() instead. This endpoint was removed from backend.
   */
  async getMetricsOverview(): Promise<DashboardMetrics> {
    // Fallback to block metrics and transform to legacy format for compatibility
    const blockMetrics = await this.getBlockMetrics();
    return {
      total_owners: blockMetrics.users.owners.total,
      total_riders: blockMetrics.users.riders.total,
      total_bookings: blockMetrics.reservations.total,
      new_registrations_today: 0, // Not available in new structure
      logins_today: blockMetrics.users.owners.logins_today + blockMetrics.users.riders.logins_today,
      bookings_today: 0, // Not available in new structure
      bookings_pending: blockMetrics.reservations.pending,
      bookings_confirmed: blockMetrics.reservations.confirmed,
      bookings_for_today: 0, // Not available in new structure
    };
  }

  /**
   * Get paginated list of users with admin-specific information
   */
  async getAdminUsers(
    params?: AdminUserQueryParams
  ): Promise<{ data: AdminUser[]; count: number } | AdminUser[] | PaginatedResponse<AdminUser>> {
    const response = await apiClient.get<
      { data: AdminUser[]; count: number } | AdminUser[] | PaginatedResponse<AdminUser>
    >('/admin/users', params);
    return response;
  }

  /**
   * Get paginated list of riders with admin-specific information
   */
  async getAdminRiders(
    params?: AdminUserQueryParams
  ): Promise<{ data: AdminUser[]; count: number } | AdminUser[] | PaginatedResponse<AdminUser>> {
    const response = await apiClient.get<
      { data: AdminUser[]; count: number } | AdminUser[] | PaginatedResponse<AdminUser>
    >('/admin/riders', params);
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
   * Get paginated user activities (registrations and logins)
   * @param skip - Number of activities to skip for pagination
   * @param limit - Number of activities to return (default: 10, max: 100)
   */
  async getActivityUsers(skip: number = 0, limit: number = 10): Promise<PaginatedActivityResponse> {
    return await apiClient.get<PaginatedActivityResponse>('/admin/activity/users', { skip, limit });
  }

  /**
   * Get paginated vehicle activities from OpenSearch events
   * @param skip - Number of activities to skip for pagination
   * @param limit - Number of activities to return (default: 10, max: 100)
   */
  async getActivityVehicles(
    skip: number = 0,
    limit: number = 10
  ): Promise<PaginatedActivityResponse> {
    return await apiClient.get<PaginatedActivityResponse>('/admin/activity/vehicles', {
      skip,
      limit,
    });
  }

  /**
   * Get paginated reservation activities from OpenSearch events
   * @param skip - Number of activities to skip for pagination
   * @param limit - Number of activities to return (default: 10, max: 100)
   */
  async getActivityReservations(
    skip: number = 0,
    limit: number = 10
  ): Promise<PaginatedActivityResponse> {
    return await apiClient.get<PaginatedActivityResponse>('/admin/activity/reservations', {
      skip,
      limit,
    });
  }

  /**
   * Get all activities merged from users, vehicles, and reservations
   * Makes 3 parallel requests and merges results sorted by timestamp
   * Uses Promise.allSettled to show partial results if some endpoints fail
   * @param skip - Number of activities to skip for pagination
   * @param limit - Number of activities to return (default: 10)
   */
  async getAllActivities(skip: number = 0, limit: number = 10): Promise<PaginatedActivityResponse> {
    // Fetch all 3 activity streams in parallel with graceful failure handling
    const results = await Promise.allSettled([
      this.getActivityUsers(skip, limit),
      this.getActivityVehicles(skip, limit),
      this.getActivityReservations(skip, limit),
    ]);

    // Extract successful results
    const usersRes = results[0].status === 'fulfilled' ? results[0].value : { data: [], total: 0 };
    const vehiclesRes =
      results[1].status === 'fulfilled' ? results[1].value : { data: [], total: 0 };
    const reservationsRes =
      results[2].status === 'fulfilled' ? results[2].value : { data: [], total: 0 };

    // Log any failures for debugging (but don't throw)
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const category = ['users', 'vehicles', 'reservations'][index];
        console.error(`Failed to fetch ${category} activities:`, result.reason);
      }
    });

    // Merge and sort by timestamp (newest first)
    const allActivities = [...usersRes.data, ...vehiclesRes.data, ...reservationsRes.data]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit); // Take only the top N after sorting

    return {
      data: allActivities,
      total: usersRes.total + vehiclesRes.total + reservationsRes.total,
    };
  }

  /**
   * Get user statistics by type
   * @deprecated Use getBlockMetrics() instead. Individual stats endpoints were removed from backend.
   */
  async getUserStats(): Promise<{ owners: number; riders: number; total: number }> {
    const blockMetrics = await this.getBlockMetrics();
    return {
      owners: blockMetrics.users.owners.total,
      riders: blockMetrics.users.riders.total,
      total: blockMetrics.users.total_users,
    };
  }

  /**
   * Get booking statistics
   * @deprecated Use getBlockMetrics() instead. Individual stats endpoints were removed from backend.
   */
  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    today: number;
    today_by_start_date: number;
  }> {
    const blockMetrics = await this.getBlockMetrics();
    return {
      total: blockMetrics.reservations.total,
      pending: blockMetrics.reservations.pending,
      confirmed: blockMetrics.reservations.confirmed,
      today: 0, // Not available in new structure
      today_by_start_date: 0, // Not available in new structure
    };
  }

  /**
   * Get daily activity statistics
   * @deprecated Use getBlockMetrics() instead. Individual stats endpoints were removed from backend.
   */
  async getDailyStats(): Promise<{
    new_registrations_today: number;
    logins_today: number;
    bookings_today: number;
  }> {
    const blockMetrics = await this.getBlockMetrics();
    return {
      new_registrations_today: 0, // Not available in new structure
      logins_today: blockMetrics.users.owners.logins_today + blockMetrics.users.riders.logins_today,
      bookings_today: 0, // Not available in new structure
    };
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
   * @deprecated Use getBlockMetrics() instead. Individual block endpoints were removed from backend.
   */
  async getUserBlockMetrics(filters?: FilterParams): Promise<UserBlockMetrics> {
    const blockMetrics = await this.getBlockMetrics(filters);
    return blockMetrics.users;
  }

  /**
   * Get vehicle block metrics
   * @deprecated Use getBlockMetrics() instead. Individual block endpoints were removed from backend.
   */
  async getVehicleBlockMetrics(filters?: FilterParams): Promise<VehicleBlockMetrics> {
    const blockMetrics = await this.getBlockMetrics(filters);
    return blockMetrics.vehicles;
  }

  /**
   * Get reservation block metrics
   * @deprecated Use getBlockMetrics() instead. Individual block endpoints were removed from backend.
   */
  async getReservationBlockMetrics(filters?: FilterParams): Promise<ReservationBlockMetrics> {
    const blockMetrics = await this.getBlockMetrics(filters);
    return blockMetrics.reservations;
  }

  /**
   * Update a user by ID (admin operation)
   */
  async updateUser(userId: string, data: Partial<AdminUser>): Promise<AdminUser> {
    return await apiClient.patch<AdminUser>(`/users/${userId}`, data);
  }

  /**
   * Delete a user by ID (admin operation)
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/users/${userId}`);
  }

  /**
   * Get comprehensive metrics for a specific user
   */
  async getUserMetrics(userId: string): Promise<components['schemas']['UserMetrics']> {
    return await apiClient.get<components['schemas']['UserMetrics']>(
      `/admin/users/${userId}/metrics`
    );
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
export type { AdminUserQueryParams, SystemErrorQueryParams, UserActivityQueryParams };
