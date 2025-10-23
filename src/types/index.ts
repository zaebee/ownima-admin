import React from 'react';

export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_beta_tester?: boolean;
  role?: 'OWNER' | 'RIDER';
  currency?: string | null;
  language?: string | null;
  location?: string | null;
  avatar?: string;
  phone_number?: string;
  login_count?: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface DashboardMetrics {
  total_owners: number;
  total_riders: number;
  total_bookings: number;
  new_registrations_today: number;
  logins_today: number;
  bookings_today: number;
  bookings_pending: number;
  bookings_confirmed: number;
  bookings_for_today: number;
}

// New 3-Block Metrics Structure (from team dialog)
export interface UserBlockMetrics {
  total: number;
  online_last_30_days: number;
  internal: number;
  external: number;
  owners: number;
  riders: number;
  logins: number;
}

export interface VehicleBlockMetrics {
  total: number;
  draft: number;
  free: number;
  collected: number;
  maintenance: number;
  archived: number;
}

export interface ReservationBlockMetrics {
  total: number;
  pending: number;
  confirmed: number;
  collected: number;
  completed: number;
  cancelled: number;
  maintenance: number;
}

export interface BlockMetrics {
  users: UserBlockMetrics;
  vehicles: VehicleBlockMetrics;
  reservations: ReservationBlockMetrics;
}

// Filter interfaces
export interface DateRange {
  start: string;
  end: string;
}

export interface FilterParams {
  dateRange?: DateRange;
  role?: 'OWNER' | 'RIDER' | 'ALL';
  userStatus?: string;
  vehicleStatus?: 'draft' | 'free' | 'collected' | 'maintenance' | 'archived';
  reservationStatus?:
    | 'pending'
    | 'confirmed'
    | 'collected'
    | 'completed'
    | 'cancelled'
    | 'maintenance';
}

export type DateRangePreset = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom';

// Metric row interface for UI components
export interface MetricRowData {
  label: string;
  value: number | string;
  icon?: React.ElementType;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  href?: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray';
}

export interface AdminUser extends User {
  role: 'OWNER' | 'RIDER';
  phone_number?: string;
  login_count: number;
  last_login_at?: string;
  full_name?: string;
  is_beta_tester: boolean;
  currency?: string;
  language?: string;
  location?: string;
  avatar?: string;
  rent_service_name?: string;
  address?: string;

  // Computed/derived fields for UI compatibility
  user_type?: 'OWNER' | 'RIDER';
  phone?: string;
  booking_count?: number;
  last_login?: string;
  registration_date?: string;
}

export interface SystemInfo {
  // Version information
  backend_version: string;
  api_version: string;
  frontend_version: string | null;
  git_version: string | null;
  git_commit: string | null;
  python_version: string;

  // Environment & deployment
  environment: 'local' | 'staging' | 'production';
  project_name: string;
  domain: string;
  build_date: string | null;
  last_deployment: string | null;

  // System health
  database: {
    status: 'healthy' | 'warning' | 'error';
    database_type: string;
    uri: string;
    test_query_result: number;
  };
  uptime_seconds: number;
}

export interface SystemError {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  source: string;
  stack_trace?: string;
  user_id?: string;
  request_id?: string;
  resolved: boolean;
}

// Activity Feed Types (Backend Specification v2.0)

// Activity type definitions
export type UserActivityType = 'user_registered' | 'user_login' | 'rider_registered' | 'rider_login';

export type VehicleActivityType =
  | 'vehicle_created'
  | 'vehicle_updated'
  | 'vehicle_published'
  | 'vehicle_archived'
  | 'vehicle_deleted'
  | 'vehicle_drafts_deleted';

export type ReservationActivityType =
  | 'reservation_created'
  | 'reservation_status_updated_collected'
  | 'reservation_status_updated_completed'
  | 'reservation_status_updated_cancelled';

export type ActivityType = UserActivityType | VehicleActivityType | ReservationActivityType;

// Activity details interfaces for different activity types
export interface UserActivityDetails {
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: 'OWNER' | 'RIDER';
  login_count?: number;
}

export interface VehicleActivityDetails {
  event_type: string;
  vehicle_id?: string;
  name?: string;
  status?: 'draft' | 'free' | 'collected' | 'maintenance' | 'archived' | 'deleted';
  vehicle_type?: string;
  brand?: string;
  model?: string;
  entity_id: string;
  user_id: string;
  deleted_count?: number; // For bulk operations
  changes?: {
    [key: string]: {
      from: string | number;
      to: string | number;
    };
  };
}

export interface ReservationActivityDetails {
  event_type: string;
  reservation_id: string;
  status: 'pending' | 'confirmed' | 'collected' | 'completed' | 'cancelled';
  total_price: number;
  start_date?: string;
  end_date?: string;
  vehicle_id?: string;
  entity_id: string;
  user_id: string;
  changes?: {
    [key: string]: {
      from: string | number;
      to: string | number;
    };
  };
}

export type ActivityDetails = UserActivityDetails | VehicleActivityDetails | ReservationActivityDetails;

// Main Activity interface matching backend specification
export interface Activity {
  id: string; // Entity ID (vehicle_id, reservation_id, or user_id)
  timestamp: string; // ISO 8601 format
  user_id: string; // Who performed the action
  activity_type: ActivityType;
  details: ActivityDetails;
}

// Paginated response from backend
export interface PaginatedActivityResponse {
  data: Activity[];
  total: number; // Total count of activities returned
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  today: number;
  today_by_start_date: number;
}

export interface UserStats {
  total_users: number;
  total_owners: number;
  total_riders: number;
  active_users: number;
  new_today: number;
  logins_today: number;
}
