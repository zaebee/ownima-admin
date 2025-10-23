import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CalendarDaysIcon,
  TruckIcon,
  CheckIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { adminService } from '../services/admin';
import type { Activity, ActivityDetails } from '../types';

type ActivityCategory = 'all' | 'users' | 'vehicles' | 'reservations';

interface ActivityTimelineProps {
  category?: ActivityCategory;
  initialLimit?: number;
}

// Icon mapping for all 14 activity types
const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Users
  user_registered: UserPlusIcon,
  user_login: ArrowRightOnRectangleIcon,
  rider_registered: UserPlusIcon,
  rider_login: ArrowRightOnRectangleIcon,

  // Vehicles
  vehicle_created: PlusCircleIcon,
  vehicle_updated: PencilSquareIcon,
  vehicle_published: CheckCircleIcon,
  vehicle_archived: ArchiveBoxIcon,
  vehicle_deleted: TrashIcon,
  vehicle_drafts_deleted: TrashIcon,

  // Reservations
  reservation_created: CalendarDaysIcon,
  reservation_status_updated_collected: TruckIcon,
  reservation_status_updated_completed: CheckIcon,
  reservation_status_updated_cancelled: XCircleIcon,
};

// Color classes for different activity types
const activityColors: Record<string, string> = {
  // Users
  user_registered: 'text-green-600 bg-green-100',
  user_login: 'text-blue-600 bg-blue-100',
  rider_registered: 'text-green-600 bg-green-100',
  rider_login: 'text-blue-600 bg-blue-100',

  // Vehicles
  vehicle_created: 'text-purple-600 bg-purple-100',
  vehicle_updated: 'text-yellow-600 bg-yellow-100',
  vehicle_published: 'text-green-600 bg-green-100',
  vehicle_archived: 'text-gray-600 bg-gray-100',
  vehicle_deleted: 'text-red-600 bg-red-100',
  vehicle_drafts_deleted: 'text-red-600 bg-red-100',

  // Reservations
  reservation_created: 'text-indigo-600 bg-indigo-100',
  reservation_status_updated_collected: 'text-blue-600 bg-blue-100',
  reservation_status_updated_completed: 'text-green-600 bg-green-100',
  reservation_status_updated_cancelled: 'text-red-600 bg-red-100',
};

function getActivityIcon(activityType: string): React.ComponentType<{ className?: string }> {
  return activityIcons[activityType] || ClockIcon; // Fallback
}

function getActivityColor(activityType: string): string {
  return activityColors[activityType] || 'text-gray-600 bg-gray-100';
}

// Type-safe helper to access details properties
function getDetailsProp<T>(details: ActivityDetails, prop: string, defaultValue: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (details as any)[prop] ?? defaultValue;
}

// Helper to get user display name (handles system activities)
function getUserDisplayName(activity: Activity): string {
  if (activity.user_id === 'system') {
    return 'System';
  }
  return getDetailsProp(activity.details, 'user_name', 'Unknown User');
}

function formatActivityMessage(activity: Activity): string {
  const { activity_type, details } = activity;
  const userName = getUserDisplayName(activity);

  // Type guard helper functions
  const hasUserDetails = (d: typeof details): boolean => {
    return 'user_name' in d && 'user_role' in d;
  };

  const hasVehicleDetails = (d: typeof details): boolean => {
    return 'event_type' in d;
  };

  const hasReservationDetails = (d: typeof details): boolean => {
    return 'reservation_id' in d;
  };

  switch (activity_type) {
    // User activities
    case 'user_registered':
      return hasUserDetails(details)
        ? `${userName} registered as ${getDetailsProp(details, 'user_role', '')}`
        : 'User registered';
    case 'user_login': {
      const loginCount = getDetailsProp(details, 'login_count', 0);
      return hasUserDetails(details)
        ? `${userName} logged in${loginCount ? ` (${loginCount} logins)` : ''}`
        : 'User logged in';
    }
    case 'rider_registered':
      return `${userName} registered as Rider`;
    case 'rider_login': {
      const loginCount = getDetailsProp(details, 'login_count', 0);
      return hasUserDetails(details)
        ? `${userName} logged in${loginCount ? ` (${loginCount} logins)` : ''}`
        : 'Rider logged in';
    }

    // Vehicle activities
    case 'vehicle_created': {
      const name = getDetailsProp(details, 'name', '');
      return hasVehicleDetails(details) && name ? `${name} created by owner` : 'Vehicle created';
    }
    case 'vehicle_updated': {
      const name = getDetailsProp(details, 'name', '');
      if (hasVehicleDetails(details) && name) {
        const changesObj = getDetailsProp(details, 'changes', {});
        const changes = changesObj ? Object.keys(changesObj).join(', ') : '';
        return `${name} updated${changes ? ` (${changes})` : ''}`;
      }
      return 'Vehicle updated';
    }
    case 'vehicle_published': {
      const name = getDetailsProp(details, 'name', '');
      return hasVehicleDetails(details) && name
        ? `${name} published and available for booking`
        : 'Vehicle published';
    }
    case 'vehicle_archived': {
      const name = getDetailsProp(details, 'name', '');
      return hasVehicleDetails(details) && name ? `${name} archived` : 'Vehicle archived';
    }
    case 'vehicle_deleted': {
      const name = getDetailsProp(details, 'name', '');
      return hasVehicleDetails(details) && name ? `${name} deleted` : 'Vehicle deleted';
    }
    case 'vehicle_drafts_deleted': {
      const deletedCount = getDetailsProp(details, 'deleted_count', 0);
      return hasVehicleDetails(details) && deletedCount
        ? `${deletedCount} draft vehicles deleted`
        : 'Draft vehicles deleted';
    }

    // Reservation activities
    case 'reservation_created': {
      const totalPrice = getDetailsProp(details, 'total_price', 0);
      return hasReservationDetails(details) ? `New booking for €${totalPrice}` : 'New booking created';
    }
    case 'reservation_status_updated_collected': {
      const reservationId = getDetailsProp(details, 'reservation_id', '');
      return hasReservationDetails(details)
        ? `Vehicle picked up for reservation ${reservationId.slice(0, 8)}`
        : 'Vehicle picked up';
    }
    case 'reservation_status_updated_completed': {
      const totalPrice = getDetailsProp(details, 'total_price', 0);
      return hasReservationDetails(details) ? `Rental completed (€${totalPrice})` : 'Rental completed';
    }
    case 'reservation_status_updated_cancelled': {
      const totalPrice = getDetailsProp(details, 'total_price', 0);
      return hasReservationDetails(details) ? `Booking cancelled (€${totalPrice})` : 'Booking cancelled';
    }

    // Fallback
    default:
      return String(activity_type).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
}

// Smart timestamp formatting: relative time for recent, exact time for old activities
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Get entity detail page URL for linking
function getEntityUrl(activity: Activity): string | null {
  const { details, activity_type } = activity;

  if (activity_type.startsWith('vehicle_')) {
    const vehicleId = getDetailsProp(details, 'vehicle_id', '');
    return vehicleId ? `/dashboard/vehicles/${vehicleId}` : null;
  } else if (activity_type.startsWith('reservation_')) {
    // Note: Reservations page may not exist yet, but keeping for future
    const reservationId = getDetailsProp(details, 'reservation_id', '');
    return reservationId ? `/dashboard/reservations/${reservationId}` : null;
  } else if (activity_type.startsWith('user_') || activity_type.startsWith('rider_')) {
    const userId = getDetailsProp(details, 'user_id', '');
    return userId ? `/dashboard/users/${userId}` : null;
  }

  return null;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  category = 'all',
  initialLimit = 25,
}) => {
  const [activeCategory, setActiveCategory] = useState<ActivityCategory>(category);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = initialLimit;

  // Load activities without depending on skip state
  const loadActivities = async (reset: boolean = false, currentSkip: number = skip) => {
    setLoading(true);
    setError(null);
    const skipValue = reset ? 0 : currentSkip;

    try {
      let data;

      if (activeCategory === 'all') {
        data = await adminService.getAllActivities(skipValue, limit);
      } else {
        const response =
          activeCategory === 'users'
            ? await adminService.getActivityUsers(skipValue, limit)
            : activeCategory === 'vehicles'
              ? await adminService.getActivityVehicles(skipValue, limit)
              : await adminService.getActivityReservations(skipValue, limit);
        data = response;
      }

      if (reset) {
        setActivities(data.data);
        setSkip(limit);
      } else {
        setActivities((prev) => [...prev, ...data.data]);
        setSkip(skipValue + limit);
      }

      setHasMore(data.data.length === limit);
    } catch (err) {
      console.error('Error in loadActivities:', err);
      setError('Failed to load activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Only reset and reload when category changes
  useEffect(() => {
    setActivities([]);
    setSkip(0);
    setHasMore(true);
    setError(null);
    loadActivities(true, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleRefresh = () => {
    setActivities([]);
    setSkip(0);
    loadActivities(true, 0);
  };

  const handleLoadMore = () => {
    loadActivities(false, skip);
  };

  const handleCategoryChange = (newCategory: ActivityCategory) => {
    setActiveCategory(newCategory);
  };

  // Tab navigation
  const tabs: { key: ActivityCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'users', label: 'Users' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'reservations', label: 'Reservations' },
  ];

  if (error && activities.length === 0) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading activities</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation and Refresh Button */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleCategoryChange(tab.key)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeCategory === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State (initial load) */}
      {loading && activities.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && activities.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
          <p className="mt-1 text-sm text-gray-500">
            No recent activities found for {activeCategory === 'all' ? 'any category' : activeCategory}.
          </p>
        </div>
      ) : null}

      {/* Activity List */}
      {activities.length > 0 ? (
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => {
              const Icon = getActivityIcon(activity.activity_type);
              const colorClasses = getActivityColor(activity.activity_type);
              const message = formatActivityMessage(activity);
              const timeAgo = formatTimestamp(activity.timestamp);

              // Check if activity has changes field
              const changes = getDetailsProp(activity.details, 'changes', null);
              const hasChanges = changes && typeof changes === 'object';

              return (
                <li key={`${activity.activity_type}-${activity.id}-${activityIdx}`}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${colorClasses}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{message}</p>

                          {/* Show changes if available */}
                          {hasChanges && changes && (
                            <div className="mt-1 space-y-0.5">
                              {Object.entries(changes).map(([field, change]) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const changeObj = change as { from: any; to: any };
                                return (
                                  <div key={field} className="text-xs text-gray-500">
                                    <span className="font-medium">{field}:</span>{' '}
                                    <span className="line-through">{String(changeObj.from)}</span> →{' '}
                                    <span className="font-medium text-gray-700">{String(changeObj.to)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="mt-1 flex items-center gap-3">
                            <p className="text-xs text-gray-500">{timeAgo}</p>
                            {getEntityUrl(activity) && (
                              <Link
                                to={getEntityUrl(activity)!}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View Details →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Load More</>
                )}
              </button>
            </div>
          )}

          {/* Error Message (partial) */}
          {error && activities.length > 0 && (
            <div className="mt-4 text-center text-sm text-red-600">{error}</div>
          )}
        </div>
      ) : null}
    </div>
  );
};
