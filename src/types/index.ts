export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_superuser: boolean;
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

export interface AdminUser extends User {
  user_type: 'OWNER' | 'RIDER';
  phone?: string;
  booking_count: number;
  last_login?: string;
  registration_date: string;
}

export interface SystemInfo {
  backend_version: string;
  frontend_version: string;
  deployment_date: string;
  environment: 'development' | 'staging' | 'production';
  database_status: 'healthy' | 'warning' | 'error';
  api_status: 'healthy' | 'warning' | 'error';
  uptime: number;
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

export interface UserActivity {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  activity_type: 'LOGIN' | 'REGISTRATION' | 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'PROFILE_UPDATED';
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
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