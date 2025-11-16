/**
 * Data Normalization Utilities
 *
 * Functions to transform API response types to UI types with computed fields.
 * Centralizes data transformation logic to maintain DRY principle.
 */

import type {
  AdminUserFromAPI,
  RiderUserAdminFromAPI,
  ActivityLogFromAPI,
} from '../types/api';
import type {
  AdminUserForUI,
  RiderUserAdminForUI,
  ActivityLogForUI,
} from '../types/ui';

/**
 * Normalize AdminUser from API to UI format
 *
 * Adds computed fields and renames fields for UI consistency
 */
export function normalizeAdminUser(
  apiUser: AdminUserFromAPI,
  userTypeFilter?: 'RIDER' | 'OWNER' | 'ALL'
): AdminUserForUI {
  return {
    ...apiUser,
    // Derive user_type from role or filter context
    user_type: apiUser.role as 'OWNER' | 'RIDER' | undefined ||
      (userTypeFilter === 'RIDER' ? 'RIDER' : undefined),
    // Rename fields for UI consistency
    phone: apiUser.phone_number,
    last_login: apiUser.last_login_at,
    registration_date: apiUser.created_at,
    // booking_count will be added by metrics query if needed
  };
}

/**
 * Normalize RiderUserAdmin from API to UI format
 *
 * Adds required user_type field and computed fields
 */
export function normalizeRiderUser(
  apiRider: RiderUserAdminFromAPI
): RiderUserAdminForUI {
  return {
    ...apiRider,
    // Always set user_type to RIDER
    user_type: 'RIDER',
    // Rating field (currently undefined until backend adds it)
    rating: (apiRider as Record<string, unknown>).rating as number | null ?? null,
    // Rename fields for UI consistency
    phone: apiRider.phone_number,
    last_login: apiRider.last_login_at,
    registration_date: apiRider.created_at,
  };
}

/**
 * Normalize ActivityLog from API to UI format
 *
 * Normalizes activity type to uppercase for UI display
 */
export function normalizeActivityLog(
  apiActivity: ActivityLogFromAPI
): ActivityLogForUI {
  return {
    ...apiActivity,
    // Normalize type to uppercase (backend sends lowercase)
    type: apiActivity.type.toUpperCase(),
  };
}

/**
 * Batch normalize array of users
 */
export function normalizeAdminUsers(
  apiUsers: AdminUserFromAPI[],
  userTypeFilter?: 'RIDER' | 'OWNER' | 'ALL'
): AdminUserForUI[] {
  return apiUsers.map((user) => normalizeAdminUser(user, userTypeFilter));
}

/**
 * Batch normalize array of riders
 */
export function normalizeRiderUsers(
  apiRiders: RiderUserAdminFromAPI[]
): RiderUserAdminForUI[] {
  return apiRiders.map((rider) => normalizeRiderUser(rider));
}

/**
 * Batch normalize array of activity logs
 */
export function normalizeActivityLogs(
  apiActivities: ActivityLogFromAPI[]
): ActivityLogForUI[] {
  return apiActivities.map((activity) => normalizeActivityLog(activity));
}

/**
 * Helper to get display name from user
 * Fallback: full_name → email username → email
 */
export function getUserDisplayName(user: {
  full_name?: string | null;
  email: string;
}): string {
  if (user.full_name) {
    return user.full_name;
  }
  // Extract username from email (part before @)
  const emailUsername = user.email.split('@')[0];
  return emailUsername || user.email;
}

/**
 * Helper to get user initials for avatar
 * Takes first letter of full name or email
 */
export function getUserInitials(user: {
  full_name?: string | null;
  email: string;
}): string {
  if (user.full_name) {
    return user.full_name[0].toUpperCase();
  }
  return user.email[0].toUpperCase();
}

/**
 * Helper to determine user type from role
 */
export function getUserType(
  role?: 'OWNER' | 'RIDER' | string
): 'OWNER' | 'RIDER' | undefined {
  if (role === 'OWNER') return 'OWNER';
  if (role === 'RIDER') return 'RIDER';
  return undefined;
}
