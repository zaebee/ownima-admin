/**
 * UI Types
 *
 * This file contains type definitions for UI-enriched data structures.
 * These types extend API response types with computed/derived fields needed for display.
 *
 * For raw API response types, see src/types/api.ts
 */

import type { AdminUserFromAPI, RiderUserAdminFromAPI } from './api';

/**
 * User for UI display (extends API type with computed fields)
 * Used in user lists and detail pages
 */
export interface AdminUserForUI extends AdminUserFromAPI {
  /**
   * User type for UI routing and display
   * Derived from role field or endpoint context
   */
  user_type?: 'OWNER' | 'RIDER';

  /**
   * Formatted phone number for display
   * Renamed from phone_number for consistency
   */
  phone?: string | null;

  /**
   * Number of bookings (computed field)
   * Fetched from separate metrics endpoint
   */
  booking_count?: number;

  /**
   * Formatted last login timestamp
   * Renamed from last_login_at for UI consistency
   */
  last_login?: string | null;

  /**
   * Formatted registration date
   * Renamed from created_at for semantic clarity
   */
  registration_date?: string;
}

/**
 * Rider for UI display (extends API type with computed fields)
 * Used in rider detail pages and lists
 */
export interface RiderUserAdminForUI extends RiderUserAdminFromAPI {
  /**
   * User type (always 'RIDER' for riders)
   * Added by frontend since backend doesn't provide role field yet
   */
  user_type: 'RIDER';

  /**
   * Average rating from owner reviews
   * Note: Currently not provided by API (always undefined)
   * Waiting for backend to add this field
   */
  rating?: number | null;

  /**
   * Formatted phone number for display
   */
  phone?: string | null;

  /**
   * Formatted registration date
   */
  registration_date?: string;

  /**
   * Formatted last login
   */
  last_login?: string | null;
}

/**
 * Owner for UI display
 * Used in owner detail pages and lists
 */
export interface OwnerUserAdminForUI extends AdminUserFromAPI {
  /**
   * User type (always 'OWNER' for owners)
   */
  user_type: 'OWNER';

  /**
   * Number of vehicles owned (computed field)
   */
  vehicle_count?: number;

  /**
   * Total revenue from bookings (computed field)
   */
  total_revenue?: number;
}

/**
 * Status data for pie charts
 */
export interface StatusData {
  name: string;
  value: number;
  color: string;
}

/**
 * Metric data for dashboard cards
 */
export interface MetricData {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

/**
 * Activity log for UI display
 */
export interface ActivityLogForUI {
  id: string;
  user_id: string;
  user_email: string;
  /**
   * Activity type (normalized to uppercase for UI)
   * Backend sends lowercase, frontend normalizes to uppercase
   */
  type: 'LOGIN' | 'BOOKING' | 'PAYMENT' | 'PROFILE_UPDATE' | string;
  description: string;
  timestamp: string;
  /**
   * Formatted relative time (e.g., "2 hours ago")
   */
  relativeTime?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Form data types for mutations
 */

export interface UserCreateFormData {
  email: string;
  full_name?: string;
  phone_number?: string;
  password?: string;
  role?: 'OWNER' | 'RIDER';
  is_active?: boolean;
}

export interface UserUpdateFormData {
  email?: string;
  full_name?: string;
  phone_number?: string;
  is_active?: boolean;
  is_beta_tester?: boolean;
  currency?: string;
  language?: string;
  location?: string;
}

export interface RiderUpdateFormData extends UserUpdateFormData {
  bio?: string;
  date_of_birth?: string;
}

/**
 * Filter/Query parameter types
 */

export interface UserListFilters {
  search?: string;
  role?: 'OWNER' | 'RIDER' | 'ALL';
  is_active?: boolean;
  is_beta_tester?: boolean;
  registration_date_from?: string;
  registration_date_to?: string;
  page?: number;
  size?: number;
}

export interface RiderListFilters {
  search?: string;
  is_active?: boolean;
  min_rating?: number;
  max_rating?: number;
  page?: number;
  size?: number;
}

/**
 * Type guards for UI types
 */

export function isRiderUserForUI(user: AdminUserForUI): user is RiderUserAdminForUI {
  return user.user_type === 'RIDER' || (user as any).role === 'RIDER';
}

export function isOwnerUserForUI(user: AdminUserForUI): user is OwnerUserAdminForUI {
  return user.user_type === 'OWNER' || (user as any).role === 'OWNER';
}
