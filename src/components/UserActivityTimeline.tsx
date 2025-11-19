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
  StarIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { adminService } from '../services/admin';
import type { Activity, ActivityDetails } from '../types';

type UserType = 'RIDER' | 'OWNER';
type RiderCategory = 'all' | 'reservations' | 'ratings' | 'auth';
type OwnerCategory = 'all' | 'reservations' | 'ratings' | 'auth' | 'vehicles';

interface UserActivityTimelineProps {
  userId: string;
  userType: UserType;
  initialLimit?: number;
  showCategories?: boolean;
}

// Icon mapping for all activity types
const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Users & Auth
  user_registered: UserPlusIcon,
  user_login: ArrowRightOnRectangleIcon,
  rider_registered: UserPlusIcon,
  rider_login: ArrowRightOnRectangleIcon,

  // Vehicles (owner only)
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

  // Ratings
  rating_submitted: StarIcon,
  rating_received: StarIcon,
};

// Color classes for different activity types
const activityColors: Record<string, string> = {
  // Users & Auth
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

  // Ratings
  rating_submitted: 'text-yellow-600 bg-yellow-100',
  rating_received: 'text-yellow-600 bg-yellow-100',
};

function getActivityIcon(activityType: string): React.ComponentType<{ className?: string }> {
  return activityIcons[activityType] || ClockIcon;
}

function getActivityColor(activityType: string): string {
  return activityColors[activityType] || 'text-gray-600 bg-gray-100';
}

// Type-safe helper to access details properties
function getDetailsProp<T>(details: ActivityDetails, prop: string, defaultValue: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (details as any)[prop] ?? defaultValue;
}

// Helper to get user display name
function getUserDisplayName(activity: Activity): string {
  if (activity.user_id === 'system') {
    return 'System';
  }
  return getDetailsProp(activity.details, 'user_name', 'Unknown User');
}

function formatActivityMessage(activity: Activity): string {
  const { activity_type, details } = activity;
  const userName = getUserDisplayName(activity);

  switch (activity_type) {
    case 'user_registered':
      return `${userName} registered as an owner`;
    case 'rider_registered':
      return `${userName} registered as a rider`;
    case 'user_login':
    case 'rider_login':
      return `${userName} logged in`;
    case 'vehicle_created':
      return `Created vehicle "${getDetailsProp(details, 'vehicle_name', 'Unknown')}"`;
    case 'vehicle_updated':
      return `Updated vehicle "${getDetailsProp(details, 'vehicle_name', 'Unknown')}"`;
    case 'vehicle_published':
      return `Published vehicle "${getDetailsProp(details, 'vehicle_name', 'Unknown')}"`;
    case 'vehicle_archived':
      return `Archived vehicle "${getDetailsProp(details, 'vehicle_name', 'Unknown')}"`;
    case 'vehicle_deleted':
      return `Deleted vehicle "${getDetailsProp(details, 'vehicle_name', 'Unknown')}"`;
    case 'reservation_created':
      return `Created reservation #${getDetailsProp(details, 'reservation_id', 'Unknown')}`;
    case 'reservation_status_updated_collected':
      return `Collected reservation #${getDetailsProp(details, 'reservation_id', 'Unknown')}`;
    case 'reservation_status_updated_completed':
      return `Completed reservation #${getDetailsProp(details, 'reservation_id', 'Unknown')}`;
    case 'reservation_status_updated_cancelled':
      return `Cancelled reservation #${getDetailsProp(details, 'reservation_id', 'Unknown')}`;
    default:
      // Handle future activity types like ratings
      if (activity_type.includes('rating')) {
        return `Rating activity (${getDetailsProp(details, 'score', 0)} stars)`;
      }
      return `${activity_type.replace(/_/g, ' ')}`;
  }
}

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
    const reservationId = getDetailsProp(details, 'reservation_id', '');
    return reservationId ? `/dashboard/reservations/${reservationId}` : null;
  } else if (activity_type.startsWith('user_') || activity_type.startsWith('rider_')) {
    const userId = getDetailsProp(details, 'user_id', '');
    return userId ? `/dashboard/users/${userId}` : null;
  }

  return null;
}

export const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({
  userId,
  userType,
  initialLimit = 10,
  showCategories = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<RiderCategory | OwnerCategory>('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = initialLimit;

  // Load activities for specific user
  const loadActivities = async (reset: boolean = false, currentSkip: number = skip) => {
    setLoading(true);
    setError(null);
    const skipValue = reset ? 0 : currentSkip;

    try {
      let data;

      if (userType === 'RIDER') {
        data = await adminService.getRiderActivities(
          userId,
          skipValue,
          limit,
          activeCategory as RiderCategory
        );
      } else {
        data = await adminService.getUserActivities(
          userId,
          skipValue,
          limit,
          activeCategory as OwnerCategory
        );
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
      // Check if it's a 404 (endpoint not implemented yet)
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number } }).response;
        if (response?.status === 404) {
          setError('Activity feed endpoint not yet implemented by backend. See placeholder below.');
        } else {
          setError('Failed to load activities. Please try again.');
        }
      } else {
        setError('Failed to load activities. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reload when category or userId changes
  useEffect(() => {
    setActivities([]);
    setSkip(0);
    setHasMore(true);
    setError(null);
    loadActivities(true, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, userId]);

  const handleRefresh = () => {
    setActivities([]);
    setSkip(0);
    loadActivities(true, 0);
  };

  const handleLoadMore = () => {
    loadActivities(false, skip);
  };

  const handleCategoryChange = (newCategory: RiderCategory | OwnerCategory) => {
    setActiveCategory(newCategory);
  };

  // Tab navigation based on user type
  const riderTabs: { key: RiderCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'reservations', label: 'Reservations' },
    { key: 'ratings', label: 'Ratings' },
    { key: 'auth', label: 'Authentication' },
  ];

  const ownerTabs: { key: OwnerCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'reservations', label: 'Reservations' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'ratings', label: 'Ratings' },
    { key: 'auth', label: 'Authentication' },
  ];

  const tabs = userType === 'RIDER' ? riderTabs : ownerTabs;

  // Error state with placeholder for backend implementation
  if (error) {
    return (
      <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
        <ClockIcon className="mx-auto h-10 w-10 text-amber-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Activity Feed Coming Soon</h3>
        <p className="mt-1 text-sm text-gray-600 max-w-md mx-auto">{error}</p>
        <p className="mt-4 text-sm text-gray-500">
          Per-user activity filtering will be available once the backend implements the{' '}
          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
            /admin/{userType === 'RIDER' ? 'riders' : 'users'}/{userId}/activities
          </code>{' '}
          endpoint.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard/activity"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            View All System Activities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter indicator */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ClockIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Showing activities for this {userType.toLowerCase()} only.{' '}
              <Link to="/dashboard/activity" className="font-medium underline hover:text-blue-600">
                View all activities
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation and Refresh Button */}
      {showCategories && (
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
      )}

      {/* Loading State (initial load) */}
      {loading && activities.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && activities.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
          <p className="mt-1 text-sm text-gray-500">
            No recent activities found for this user
            {activeCategory !== 'all' ? ` in the ${activeCategory} category` : ''}.
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
              const entityUrl = getEntityUrl(activity);

              return (
                <li key={`${activity.activity_type}-${activity.id}-${activityIdx}`}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div
                          className={`h-10 w-10 rounded-full ${colorClasses} flex items-center justify-center ring-8 ring-white`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          {entityUrl ? (
                            <Link
                              to={entityUrl}
                              className="text-sm font-medium text-gray-900 hover:text-primary-600"
                            >
                              {message}
                            </Link>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{message}</p>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">{timeAgo}</p>
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
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
