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

// Admin Metrics Blocks API v2.0 - Nested Structure
export interface OwnerMetrics {
  // Core metrics (real data from User table)
  total: number;
  online_last_30_days: number;
  logins_today: number;

  // Placeholder metrics (returns 0 - not yet implemented in backend)
  internal: number;
  external: number;
  verified: number;
  with_vehicles: number;
  with_active_rentals: number;
}

export interface RiderMetrics {
  // Core metrics (real data from RiderUser table)
  total: number;
  online_last_30_days: number;
  logins_today: number;

  // Placeholder metrics (returns 0 - not yet implemented in backend)
  internal: number;
  external: number;
  with_bookings: number;
  with_completed_trips: number;
  with_active_bookings: number;
}

export interface UserBlockMetrics {
  owners: OwnerMetrics;
  riders: RiderMetrics;
  total_users: number;
}

export interface VehicleBlockMetrics {
  total: number;
  draft: number;
  free: number;
  collected: number;
  maintenance: number;
  archived: number;
  unspecified: number; // NEW - from api-generated.ts
}

export interface ReservationBlockMetrics {
  total: number;
  pending: number;
  confirmed: number;
  collected: number;
  completed: number;
  cancelled: number;
  maintenance: number;

  // NEW FIELDS - from api-generated.ts
  confirmation_by_rider: number;
  confirmation_by_owner: number;
  overdue: number;
  conflict: number;
  no_response: number;
  unspecified: number;
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
  vehicleStatus?: 'draft' | 'free' | 'collected' | 'maintenance' | 'archived' | 'unspecified';
  reservationStatus?:
    | 'pending'
    | 'confirmed'
    | 'collected'
    | 'completed'
    | 'cancelled'
    | 'maintenance'
    | 'confirmation_by_rider'
    | 'confirmation_by_owner'
    | 'overdue'
    | 'conflict'
    | 'no_response'
    | 'unspecified';
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

  // New fields from UserAdmin generated type
  booking_website_published?: boolean;
  business_name?: string;
  working_hours_start?: string;
  working_hours_end?: string;
  average_rating?: number | null;
  rating_count?: number;
  total_reservations?: number;
  completed_reservations?: number;
  cancelled_reservations?: number;
  cancel_rate?: number;
  completion_rate?: number;
  avg_response_time_seconds?: number | null;

  // Rider-specific fields
  bio?: string;
  date_of_birth?: string;
  rating?: number;

  // Computed/derived fields for UI compatibility
  user_type?: 'OWNER' | 'RIDER';
  phone?: string;
  booking_count?: number;
  last_login?: string;
  registration_date?: string;
}

// Rider-specific metrics extending UserMetrics
export interface RiderDetailMetrics {
  // User base metrics
  total_vehicles: number;
  total_reservations: number;
  wallet_balance: number;
  total_spent: number;
  total_earned: number;
  wallet_currency: string;
  login_count: number;
  account_age_days: number;
  days_since_last_login: number | null;

  // Rider-specific booking statistics
  total_bookings: number;
  active_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  booking_completion_rate: number;
  average_booking_value: number;

  // Reservation breakdown by status
  reservation_breakdown: {
    pending: number;
    confirmed: number;
    collected: number;
    completed: number;
    cancelled: number;
    confirmation_by_rider: number;
    confirmation_by_owner: number;
    overdue: number;
    conflict: number;
    no_response: number;
    maintenance: number;
    unspecified: number;
  };
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

export type RatingActivityType = 'rating_submitted' | 'rating_received';

export type ActivityType = UserActivityType | VehicleActivityType | ReservationActivityType | RatingActivityType;

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

export interface RatingActivityDetails {
  event_type: string;
  score: number;
  rated_user_id: string;
  rated_user_name: string;
  from_user_id: string;
  from_user_name: string;
  entity_id: string;
  user_id: string;
}

export type ActivityDetails = UserActivityDetails | VehicleActivityDetails | ReservationActivityDetails | RatingActivityDetails;

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

// ============================================================================
// Vehicle & Reservation Lists - Status Mappings and Filters
// ============================================================================

/**
 * Customer source enum values matching backend CustomerSource proto
 * Specifies where the customer originated from
 */
export const CustomerSourceEnum = {
  UNSPECIFIED: 0,
  ONLINE_RIDER_APP: 1,
  ONLINE_BOOKING_WEB: 2,
  OFFLINE_WALK_IN: 3,
} as const;

/**
 * Human-readable labels for customer source values
 */
export const CustomerSourceLabels: Record<number, string> = {
  0: 'Unspecified',
  1: 'Rider App',
  2: 'Booking Website',
  3: 'Walk-in',
};

/**
 * Reservation type enum values matching backend ReservationType proto
 * Specifies the category of reservation
 */
export const ReservationTypeEnum = {
  UNSPECIFIED: 0,
  ONLINE: 1,
  OFFLINE: 2,
  MAINTENANCE: 3,
} as const;

/**
 * Human-readable labels for reservation type values
 */
export const ReservationTypeLabels: Record<number, string> = {
  0: 'Unspecified',
  1: 'Online',
  2: 'Offline',
  3: 'Maintenance',
};

/**
 * Color themes for reservation type badges
 */
export const ReservationTypeColors: Record<number, 'gray' | 'yellow' | 'green' | 'blue' | 'purple' | 'red'> = {
  0: 'gray',      // Unspecified
  1: 'green',     // Online
  2: 'blue',      // Offline
  3: 'yellow',    // Maintenance
};

/**
 * Vehicle status enum values matching backend VehicleStatus
 * From api-generated.ts: VehicleStatus = 0 | 1 | 2 | 3 | 4 | 5
 */
export const VehicleStatusEnum = {
  UNSPECIFIED: 0,
  DRAFT: 1,
  FREE: 2,
  MAINTENANCE: 3,
  COLLECTED: 4,
  ARCHIVED: 5,
} as const;

/**
 * Human-readable labels for vehicle status values
 */
export const VehicleStatusLabels: Record<number, string> = {
  0: 'Unspecified',
  1: 'Draft',
  2: 'Free',
  3: 'Maintenance',
  4: 'Collected',
  5: 'Archived',
};

/**
 * Color themes for vehicle status badges
 */
export const VehicleStatusColors: Record<number, 'gray' | 'yellow' | 'green' | 'blue' | 'purple' | 'red'> = {
  0: 'gray',      // Unspecified
  1: 'yellow',    // Draft
  2: 'green',     // Free (available)
  3: 'blue',      // Maintenance
  4: 'purple',    // Collected (in use)
  5: 'red',       // Archived
};

/**
 * Vehicle type labels
 * Based on backend VehicleType enum
 */
export const VehicleTypeLabels: Record<number, string> = {
  0: 'Car',
  1: 'Motorcycle',
  2: 'Bicycle',
  3: 'Scooter',
  4: 'Truck',
  5: 'Van',
  6: 'RV',
  7: 'Boat',
  8: 'Other',
};

/**
 * Reservation status enum values matching backend ReservationStatus proto
 * IMPORTANT: These values must match exactly with backend proto definitions
 * Note: Value 9 (RESERVATION_CONFIRMATION) is deprecated and should not be used
 */
export const ReservationStatusEnum = {
  PENDING: 0,
  CONFIRMATION_BY_RIDER: 1,
  CONFIRMED: 2,
  COLLECTED: 3,
  MAINTENANCE: 4,
  COMPLETED: 5,
  CANCELLED: 6,
  OVERDUE: 7,
  CONFLICT: 8,
  // 9 = RESERVATION_CONFIRMATION (deprecated, skip this value)
  CONFIRMATION_BY_OWNER: 10,
  NO_RESPONSE: 11,
  UNSPECIFIED: 12,
} as const;

/**
 * Human-readable labels for reservation status values
 */
export const ReservationStatusLabels: Record<number, string> = {
  0: 'Pending',
  1: 'Awaiting Rider',
  2: 'Confirmed',
  3: 'Collected',
  4: 'Maintenance',
  5: 'Completed',
  6: 'Cancelled',
  7: 'Overdue',
  8: 'Conflict',
  9: 'Confirmation', // Deprecated
  10: 'Awaiting Owner',
  11: 'No Response',
  12: 'Unspecified',
};

/**
 * Color themes for reservation status badges
 */
export const ReservationStatusColors: Record<number, 'gray' | 'yellow' | 'green' | 'blue' | 'purple' | 'red'> = {
  0: 'yellow',    // Pending
  1: 'yellow',    // Awaiting Rider
  2: 'green',     // Confirmed
  3: 'blue',      // Collected
  4: 'blue',      // Maintenance
  5: 'green',     // Completed
  6: 'red',       // Cancelled
  7: 'red',       // Overdue
  8: 'red',       // Conflict
  9: 'gray',      // Confirmation (deprecated)
  10: 'yellow',   // Awaiting Owner
  11: 'red',      // No Response
  12: 'gray',     // Unspecified
};

/**
 * Filter state for vehicle lists
 */
export interface VehicleFilters {
  status?: number;
  search?: string;
}

/**
 * Filter state for reservation lists
 */
export interface ReservationFilters {
  status?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration for vehicle tables
 */
export interface VehicleSort {
  field: 'name' | 'status' | 'created_at' | 'updated_at';
  direction: SortDirection;
}

/**
 * Sort configuration for reservation tables
 */
export interface ReservationSort {
  field: 'date_from' | 'date_to' | 'status' | 'total_price' | 'created_date';
  direction: SortDirection;
}
