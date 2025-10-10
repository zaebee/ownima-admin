import React, { useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { adminService } from '../services/admin';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MetricCard } from '../components/ui/MetricCard';
import { SystemErrorsPanel } from '../components/SystemErrorsPanel';
import { mockSystemErrors, getErrorStatistics } from '../mocks/systemErrors';
import type { RecentActivity } from '../types';
import {
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  CodeBracketIcon,
  CommandLineIcon,
  ArchiveBoxIcon,
  TrashIcon,
  DocumentMinusIcon,
} from '@heroicons/react/24/outline';

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const getStatusColor = (status: 'healthy' | 'warning' | 'error'): 'green' | 'yellow' | 'red' => {
  switch (status) {
    case 'healthy':
      return 'green';
    case 'warning':
      return 'yellow';
    case 'error':
      return 'red';
    default:
      return 'red';
  }
};

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'LOGIN':
      return UserIcon;
    case 'REGISTRATION':
      return UserIcon;
    case 'BOOKING_CREATED':
    case 'BOOKING_CONFIRMED':
      return CalendarIcon;
    case 'PROFILE_UPDATED':
      return UserIcon;
    default:
      return InformationCircleIcon;
  }
};

const getActivityColor = (activityType: string): 'blue' | 'green' | 'purple' | 'indigo' => {
  switch (activityType) {
    case 'LOGIN':
      return 'blue';
    case 'REGISTRATION':
      return 'green';
    case 'BOOKING_CREATED':
    case 'BOOKING_CONFIRMED':
      return 'purple';
    case 'PROFILE_UPDATED':
      return 'indigo';
    default:
      return 'blue';
  }
};

const getVehicleActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'vehicle_created':
      return TruckIcon;
    case 'vehicle_updated':
      return WrenchScrewdriverIcon;
    case 'vehicle_published':
      return CheckCircleIcon;
    case 'vehicle_archived':
      return ArchiveBoxIcon;
    case 'vehicle_deleted':
      return TrashIcon;
    case 'vehicle_drafts_deleted':
      return DocumentMinusIcon;
    default:
      return InformationCircleIcon;
  }
};

const getVehicleActivityColor = (activityType: string): 'green' | 'blue' | 'yellow' | 'red' => {
  switch (activityType) {
    case 'vehicle_created':
    case 'vehicle_published':
      return 'green';
    case 'vehicle_updated':
      return 'blue';
    case 'vehicle_archived':
      return 'yellow';
    case 'vehicle_deleted':
    case 'vehicle_drafts_deleted':
      return 'red';
    default:
      return 'yellow';
  }
};

const getReservationActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'reservation_created':
      return CalendarIcon;
    case 'reservation_updated':
      return CheckCircleIcon;
    default:
      return InformationCircleIcon;
  }
};

const getReservationActivityColor = (activityType: string): 'purple' | 'blue' | 'green' | 'red' => {
  switch (activityType) {
    case 'reservation_created':
      return 'purple';
    case 'reservation_updated':
      return 'blue';
    default:
      return 'green';
  }
};

export const SystemPage: React.FC = () => {
  // Use mock data for system errors (will be replaced with real API)
  const [useMockErrors] = useState(true);

  const { data: systemInfo, isLoading: isSystemLoading } = useQuery({
    queryKey: ['system-info'],
    queryFn: () => adminService.getSystemInfo(),
    refetchInterval: 60000,
  });

  const { data: systemErrors, isLoading: isErrorsLoading } = useQuery({
    queryKey: ['system-errors'],
    queryFn: () => adminService.getSystemErrors(),
    refetchInterval: 30000,
    enabled: !useMockErrors, // Disable real API when using mock data
  });

  const {
    data: userActivities,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isActivitiesLoading,
  } = useInfiniteQuery<RecentActivity, Error>({
    queryKey: ['user-activities'],
    queryFn: ({ pageParam = 0 }) => adminService.getRecentActivity({ limit: 50, skip: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const currentLength = allPages.reduce((acc, page) => acc + (page.users?.length || 0), 0);
      return currentLength < 200 && lastPage.users.length > 0 ? currentLength : undefined;
    },
  });

  // Use mock data or real data
  const displayErrors = useMockErrors ? mockSystemErrors : systemErrors;
  const errorStats = useMockErrors ? getErrorStatistics() : undefined;

  if (isSystemLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const systemMetrics = systemInfo
    ? [
        {
          title: 'Backend Version',
          value: systemInfo.backend_version,
          icon: ServerIcon,
          description: `API ${systemInfo.api_version}`,
          color: 'blue' as const,
        },
        {
          title: 'Git Version',
          value: systemInfo.git_version || 'N/A',
          icon: CodeBracketIcon,
          description: `Commit: ${systemInfo.git_commit?.slice(0, 7) || 'unknown'}`,
          color: 'indigo' as const,
        },
        {
          title: 'Python Runtime',
          value: `Python ${systemInfo.python_version}`,
          icon: CommandLineIcon,
          description: 'Runtime environment',
          color: 'green' as const,
        },
        {
          title: 'Environment',
          value:
            systemInfo.environment?.charAt(0).toUpperCase() + systemInfo.environment?.slice(1) ||
            'Unknown',
          icon: GlobeAltIcon,
          description: systemInfo.project_name,
          color:
            systemInfo.environment === 'production'
              ? ('red' as const)
              : systemInfo.environment === 'staging'
                ? ('yellow' as const)
                : ('green' as const),
        },
        {
          title: 'Database',
          value: systemInfo.database.database_type.toUpperCase(),
          icon: CircleStackIcon,
          description:
            systemInfo.database.status.charAt(0).toUpperCase() +
            systemInfo.database.status.slice(1),
          color: getStatusColor(systemInfo.database.status),
        },
        {
          title: 'System Uptime',
          value: formatUptime(systemInfo.uptime_seconds),
          icon: ClockIcon,
          description: 'Time since last restart',
          color: 'purple' as const,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-slate-100/50 rounded-2xl"></div>
        <div className="relative p-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            System Monitoring
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor system health, recent errors, and user activity in real-time.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live monitoring - Updates automatically</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemMetrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              description={metric.description}
              color={metric.color}
              size="small"
              loading={isSystemLoading}
            />
          ))}
        </div>
        {systemInfo && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Build Date:</strong>{' '}
                {systemInfo.build_date ? formatDateTime(systemInfo.build_date) : 'Unknown'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Domain:</strong> {systemInfo.domain}
              </p>
            </div>
            {systemInfo.last_deployment && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Last Deployment:</strong> {formatDateTime(systemInfo.last_deployment)}
                </p>
              </div>
            )}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Database:</strong> {systemInfo.database.uri}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* System Errors - New Enhanced Panel */}
      {isErrorsLoading && !useMockErrors ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8">
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </div>
      ) : (
        <SystemErrorsPanel errors={displayErrors || []} statistics={errorStats} />
      )}

      {/* Recent Activities - Tabbed Interface */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activities</h2>

        {isActivitiesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
              <Tab
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                    selected
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-900'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Users ({userActivities?.pages.reduce((acc, page) => acc + (page.users?.length || 0), 0) || 0})
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                    selected
                      ? 'bg-white text-green-600 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-900'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Vehicles ({userActivities?.pages.reduce((acc, page) => acc + (page.vehicles?.length || 0), 0) || 0})
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                    selected
                      ? 'bg-white text-purple-600 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-900'
                  )
                }
              >
                <div className="flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Reservations ({userActivities?.pages.reduce((acc, page) => acc + (page.reservations?.length || 0), 0) || 0})
                </div>
              </Tab>
            </Tab.List>

            <Tab.Panels>
              {/* User Activities Tab */}
              <Tab.Panel>
                {userActivities && userActivities.pages.flatMap(page => page.users).length > 0 ? (
                  <div className="space-y-4">
                    {userActivities.pages.flatMap(page => page.users).map((activity) => {
                      const activityType =
                        (activity.activity_type as string) ||
                        (activity.type as string) ||
                        'unknown';
                      const ActivityIcon = getActivityIcon(activityType);
                      const activityColor = getActivityColor(activityType) as
                        | 'blue'
                        | 'green'
                        | 'purple'
                        | 'indigo';

                      return (
                        <div
                          key={
                            (activity.id as string) ||
                            (activity.user_id as string) + (activity.timestamp as string)
                          }
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              activityColor === 'blue'
                                ? 'bg-blue-100'
                                : activityColor === 'green'
                                  ? 'bg-green-100'
                                  : activityColor === 'purple'
                                    ? 'bg-purple-100'
                                    : 'bg-indigo-100'
                            }`}
                          >
                            <ActivityIcon
                              className={`w-5 h-5 ${
                                activityColor === 'blue'
                                  ? 'text-blue-600'
                                  : activityColor === 'green'
                                    ? 'text-green-600'
                                    : activityColor === 'purple'
                                      ? 'text-purple-600'
                                      : 'text-indigo-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {(activity.details?.user_name as string) ||
                                  (activity.details?.user_email as string) ||
                                  (activity.user_name as string) ||
                                  (activity.user_email as string) ||
                                  'Unknown User'}{' '}
                                <small>
                                  ({(activity.details?.user_email as string) || 'Unknown'})
                                </small>
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(activity.timestamp as string)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {(activity.description as string) ||
                                `User ${activityType.toLowerCase()}`}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span
                                className={`px-2 py-1 rounded-full font-medium ${
                                  activityColor === 'blue'
                                    ? 'bg-blue-100 text-blue-700'
                                    : activityColor === 'green'
                                      ? 'bg-green-100 text-green-700'
                                      : activityColor === 'purple'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                {activityType?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
                              </span>
                              {activity.ip_address && <span>IP: {activity.ip_address}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent user activities found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Activity will appear here as users interact with the platform
                    </p>
                  </div>
                )}
                {hasNextPage && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </button>
                  </div>
                )}
              </Tab.Panel>

              {/* Vehicle Activities Tab */}
              <Tab.Panel>
                {userActivities && userActivities.pages.flatMap(page => page.vehicles).length > 0 ? (
                  <div className="space-y-4">
                    {userActivities.pages.flatMap(page => page.vehicles).map((activity, idx) => {
                      const ActivityIcon = getVehicleActivityIcon(activity.activity_type);
                      const color = getVehicleActivityColor(activity.activity_type);

                      return (
                        <div
                          key={idx}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              color === 'green'
                                ? 'bg-green-100'
                                : color === 'blue'
                                  ? 'bg-blue-100'
                                  : 'bg-yellow-100'
                            }`}
                          >
                            <ActivityIcon
                              className={`w-5 h-5 ${
                                color === 'green'
                                  ? 'text-green-600'
                                  : color === 'blue'
                                    ? 'text-blue-600'
                                    : 'text-yellow-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {(activity.details.name as string) || 'Unknown Vehicle'}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Vehicle {activity.activity_type.replace('vehicle_', '')}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span
                                className={`px-2 py-1 rounded-full font-medium ${
                                  color === 'green'
                                    ? 'bg-green-100 text-green-700'
                                    : color === 'blue'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {activity.activity_type.toUpperCase().replace('_', ' ')}
                              </span>
                              <span>
                                Status: {(activity.details.status as string) || 'unknown'}
                              </span>
                              {(activity.details.vehicle_id as string) && (
                                <span>
                                  ID: {(activity.details.vehicle_id as string).slice(0, 8)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent vehicle activities found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Vehicle activities will appear here
                    </p>
                  </div>
                )}
                {hasNextPage && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </button>
                  </div>
                )}
              </Tab.Panel>

              {/* Reservation Activities Tab */}
              <Tab.Panel>
                {userActivities && userActivities.pages.flatMap(page => page.reservations).length > 0 ? (
                  <div className="space-y-4">
                    {userActivities.pages.flatMap(page => page.reservations).map((activity, idx) => {
                      const ActivityIcon = getReservationActivityIcon(activity.activity_type);
                      const color = getReservationActivityColor(activity.activity_type);

                      return (
                        <div
                          key={idx}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              color === 'purple'
                                ? 'bg-purple-100'
                                : color === 'blue'
                                  ? 'bg-blue-100'
                                  : color === 'green'
                                    ? 'bg-green-100'
                                    : 'bg-red-100'
                            }`}
                          >
                            <ActivityIcon
                              className={`w-5 h-5 ${
                                color === 'purple'
                                  ? 'text-purple-600'
                                  : color === 'blue'
                                    ? 'text-blue-600'
                                    : color === 'green'
                                      ? 'text-green-600'
                                      : 'text-red-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                Reservation {activity.activity_type.replace('reservation_', '')}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Status: {(activity.details.status as string) || 'unknown'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span
                                className={`px-2 py-1 rounded-full font-medium ${
                                  color === 'purple'
                                    ? 'bg-purple-100 text-purple-700'
                                    : color === 'blue'
                                      ? 'bg-blue-100 text-blue-700'
                                      : color === 'green'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {activity.activity_type.toUpperCase().replace('_', ' ')}
                              </span>
                              {(activity.details.total_price as number) && (
                                <span>Price: ${activity.details.total_price as number}</span>
                              )}
                              {(activity.details.reservation_id as string) && (
                                <span>
                                  ID: {(activity.details.reservation_id as string).slice(0, 8)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent reservation activities found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Reservation activities will appear here
                    </p>
                  </div>
                )}
                {hasNextPage && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                    >
                      {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </button>
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
    </div>
  );
};
