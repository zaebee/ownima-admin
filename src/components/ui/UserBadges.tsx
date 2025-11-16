import React from 'react';
import clsx from 'clsx';
import {
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface UserBadgesProps {
  /**
   * User role (RIDER, OWNER, etc.)
   */
  role?: 'RIDER' | 'OWNER' | string;

  /**
   * Whether the user is active
   */
  isActive: boolean;

  /**
   * Whether the user is a superuser/admin
   */
  isSuperuser?: boolean;

  /**
   * Whether the user is a beta tester
   */
  isBetaTester?: boolean;

  /**
   * Custom class name for the container
   */
  className?: string;
}

/**
 * UserBadges Component
 *
 * Displays status badges for a user including role, active status,
 * admin status, and beta tester status.
 *
 * Used in user detail pages to show user status at a glance.
 *
 * @example
 * ```tsx
 * <UserBadges
 *   role="RIDER"
 *   isActive={true}
 *   isSuperuser={false}
 *   isBetaTester={true}
 * />
 * ```
 */
export const UserBadges: React.FC<UserBadgesProps> = ({
  role,
  isActive,
  isSuperuser = false,
  isBetaTester = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      {/* Role Badge */}
      {role && (
        <span
          className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            role === 'OWNER'
              ? 'bg-blue-100 text-blue-800'
              : role === 'RIDER'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          )}
        >
          <UserIcon className="w-3 h-3 mr-1" />
          {role}
        </span>
      )}

      {/* Active Status Badge */}
      {isActive ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Active
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Inactive
        </span>
      )}

      {/* Superuser/Admin Badge */}
      {isSuperuser && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <ShieldCheckIcon className="w-3 h-3 mr-1" />
          Admin
        </span>
      )}

      {/* Beta Tester Badge */}
      {isBetaTester && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Beta Tester
        </span>
      )}
    </div>
  );
};
