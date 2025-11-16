/**
 * API Response Types
 *
 * This file contains type definitions that exactly match API response structures.
 * These types should NOT include computed/UI-only fields.
 *
 * For UI-enriched types, see src/types/ui.ts
 * For auto-generated OpenAPI types, see src/types/api-generated.ts
 */

import type { components } from './api-generated';

/**
 * Admin User from /admin/users endpoint
 * Exact structure as returned by the API
 */
export interface AdminUserFromAPI {
  id: string;
  email: string;
  role?: 'OWNER' | 'RIDER' | string;
  full_name?: string | null;
  phone_number?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_beta_tester: boolean;
  avatar?: string | null;
  currency?: string | null;
  language?: string | null;
  location?: string | null;
  created_at: string;
  last_login_at?: string | null;
  login_count: number;
}

/**
 * Rider User from /admin/riders endpoint
 * Uses auto-generated type from OpenAPI schema
 *
 * Note: Missing fields that should be added by backend:
 * - role: 'RIDER' (always RIDER for this endpoint)
 * - rating: number | null (average rating from reviews)
 */
export type RiderUserAdminFromAPI = components['schemas']['RiderUserAdmin'];

/**
 * Owner User (subset of AdminUser)
 * Currently no separate endpoint, uses /admin/users
 */
export type OwnerUserAdminFromAPI = AdminUserFromAPI;

/**
 * Paginated API Response
 * Standard format for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page?: number;
  size?: number;
  total_pages?: number;
}

/**
 * User Metrics from /admin/users/{userId}/metrics
 */
export interface UserMetricsFromAPI {
  total_bookings?: number;
  active_bookings?: number;
  completed_bookings?: number;
  cancelled_bookings?: number;
  total_revenue?: number;
  average_booking_value?: number;
  [key: string]: unknown; // Allow additional fields
}

/**
 * Activity Log from /admin/activities
 */
export interface ActivityLogFromAPI {
  id: string;
  user_id: string;
  user_email: string;
  type: string; // Note: backend sends lowercase, UI expects uppercase
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * System Error from /admin/errors
 */
export interface SystemErrorFromAPI {
  id: string;
  message: string;
  stack_trace?: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'ignored';
  created_at: string;
  resolved_at?: string | null;
}

/**
 * Type guards for runtime type checking
 */

export function isPaginatedResponse<T>(data: unknown): data is PaginatedResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as Record<string, unknown>).data) &&
    'count' in data &&
    typeof (data as Record<string, unknown>).count === 'number'
  );
}

export function isArrayResponse<T>(data: unknown): data is T[] {
  return Array.isArray(data);
}

/**
 * Helper function to normalize API responses
 * Handles both direct arrays and paginated responses
 */
export function normalizeListResponse<T>(
  data: T[] | PaginatedResponse<T> | { data: T[]; count: number } | undefined
): { items: T[]; count: number } {
  if (!data) {
    return { items: [], count: 0 };
  }

  // Direct array
  if (Array.isArray(data)) {
    return { items: data, count: data.length };
  }

  // Paginated response or {data, count} format
  if ('data' in data && Array.isArray(data.data)) {
    return {
      items: data.data,
      count: data.count || data.data.length,
    };
  }

  // Fallback
  return { items: [], count: 0 };
}
