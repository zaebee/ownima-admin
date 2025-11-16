import React, { type ReactNode } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { UserBadges } from './UserBadges';

interface UserProfileHeaderProps {
  /**
   * User's full name (or fallback from email)
   */
  name: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * Avatar URL (optional)
   */
  avatarUrl?: string | null;

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
   * Color scheme for the gradient background
   * @default 'blue' (blue-purple gradient)
   */
  colorScheme?: 'blue' | 'green';

  /**
   * Additional content to show below badges (e.g., RatingStars)
   */
  additionalInfo?: ReactNode;

  /**
   * Action buttons (Edit, Delete, etc.)
   */
  actions?: ReactNode;
}

/**
 * UserProfileHeader Component
 *
 * Displays a user's profile header with avatar, name, email, status badges,
 * and optional additional information (like ratings).
 *
 * Used in user and rider detail pages for consistent header design.
 *
 * @example
 * ```tsx
 * <UserProfileHeader
 *   name="John Doe"
 *   email="john@example.com"
 *   avatarUrl="https://example.com/avatar.jpg"
 *   role="RIDER"
 *   isActive={true}
 *   isSuperuser={false}
 *   isBetaTester={true}
 *   colorScheme="green"
 *   additionalInfo={<RatingStars rating={4.5} />}
 *   actions={
 *     <>
 *       <Button onClick={handleEdit}>Edit</Button>
 *       <Button onClick={handleDelete}>Delete</Button>
 *     </>
 *   }
 * />
 * ```
 */
export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  email,
  avatarUrl,
  role,
  isActive,
  isSuperuser = false,
  isBetaTester = false,
  colorScheme = 'blue',
  additionalInfo,
  actions,
}) => {
  // Color scheme mappings
  const gradientColors = {
    blue: 'from-blue-500 to-purple-600',
    green: 'from-green-500 to-teal-600',
  };

  const gradientClass = gradientColors[colorScheme];

  // Get initials for avatar fallback
  const initial = (name?.[0] || email[0]).toUpperCase();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
      {/* Gradient header background */}
      <div className={`relative h-32 bg-gradient-to-r ${gradientClass}`}></div>

      <div className="relative px-8 pb-8">
        <div className="flex items-start -mt-16 mb-6">
          {/* Avatar */}
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className={`w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                <span className="text-white text-4xl font-bold">
                  {initial}
                </span>
              </div>
            )}

            {/* Active status indicator */}
            {isActive ? (
              <div
                className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"
                title="Active user"
              ></div>
            ) : (
              <div
                className="absolute bottom-2 right-2 w-6 h-6 bg-gray-400 rounded-full border-4 border-white"
                title="Inactive user"
              ></div>
            )}
          </div>

          {/* User info and actions */}
          <div className="ml-6 flex-1 mt-16">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Name */}
                <h1 className="text-3xl font-bold text-gray-900">{name}</h1>

                {/* Email and badges */}
                <div className="flex items-center flex-wrap gap-3 mt-2">
                  <span className="text-gray-600 flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-1" />
                    {email}
                  </span>

                  <UserBadges
                    role={role}
                    isActive={isActive}
                    isSuperuser={isSuperuser}
                    isBetaTester={isBetaTester}
                  />
                </div>

                {/* Additional info (e.g., rating) */}
                {additionalInfo && (
                  <div className="mt-3">
                    {additionalInfo}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {actions && (
                <div className="flex items-center space-x-3 ml-4">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
