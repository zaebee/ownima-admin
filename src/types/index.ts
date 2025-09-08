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

export interface BetaTester {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  reviewed_at?: string;
  notes?: string;
}

export interface BetaTesterStats {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
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
  total_users: number;
  active_users: number;
  beta_testers: BetaTesterStats;
  recent_registrations: number;
}