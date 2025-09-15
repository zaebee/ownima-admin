import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MetricCard } from '../components/ui/MetricCard';
import {
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { UserActivity } from '../types';

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

export const SystemPage: React.FC = () => {
  const { data: systemInfo, isLoading: isSystemLoading } = useQuery({
    queryKey: ['system-info'],
    queryFn: () => adminService.getSystemInfo(),
    refetchInterval: 60000,
  });

  const { data: systemErrors, isLoading: isErrorsLoading } = useQuery({
    queryKey: ['system-errors'],
    queryFn: () => adminService.getSystemErrors(),
    refetchInterval: 30000,
  });

  const { data: userActivities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['user-activities'],
    queryFn: () => adminService.getRecentActivity(),
    refetchInterval: 30000,
  });

  if (isSystemLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const systemMetrics = systemInfo ? [
    {
      title: 'Backend Version',
      value: systemInfo.backend_version,
      icon: ServerIcon,
      description: 'Current backend version',
      color: 'blue' as const,
    },
    {
      title: 'Frontend Version',
      value: systemInfo.frontend_version,
      icon: ComputerDesktopIcon,
      description: 'Current frontend version',
      color: 'indigo' as const,
    },
    {
      title: 'Environment',
      value: systemInfo.environment?.charAt(0).toUpperCase() + systemInfo.environment?.slice(1) || 'Unknown',
      icon: GlobeAltIcon,
      description: 'Current deployment environment',
      color: systemInfo.environment === 'production' ? 'red' as const : systemInfo.environment === 'staging' ? 'yellow' as const : 'green' as const,
    },
    {
      title: 'Database Status',
      value: systemInfo.database_status?.charAt(0).toUpperCase() + systemInfo.database_status?.slice(1) || 'Unknown',
      icon: CircleStackIcon,
      description: 'Database connection status',
      color: getStatusColor(systemInfo.database_status || 'error'),
    },
    {
      title: 'API Status',
      value: systemInfo.api_status?.charAt(0).toUpperCase() + systemInfo.api_status?.slice(1) || 'Unknown',
      icon: ServerIcon,
      description: 'API service status',
      color: getStatusColor(systemInfo.api_status || 'error'),
    },
    {
      title: 'System Uptime',
      value: formatUptime(systemInfo.uptime || 0),
      icon: ClockIcon,
      description: 'Time since last restart',
      color: 'purple' as const,
    },
  ] : [];

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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Deployment Date:</strong> {formatDateTime(systemInfo.deployment_date)}
            </p>
          </div>
        )}
      </div>

      {/* System Errors */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-red-500" />
          Recent System Errors
        </h2>

        {isErrorsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : systemErrors && systemErrors.length > 0 ? (
          <div className="space-y-4">
            {systemErrors.slice(0, 10).map((error) => (
              <div
                key={error.id}
                className={`p-4 rounded-lg border-l-4 ${
                  error.level === 'ERROR'
                    ? 'bg-red-50 border-red-400'
                    : error.level === 'WARNING'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          error.level === 'ERROR'
                            ? 'bg-red-100 text-red-800'
                            : error.level === 'WARNING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {error.level}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(error.timestamp)}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{error.source}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-800">{error.message}</p>
                    {error.user_id && (
                      <p className="mt-1 text-xs text-gray-600">User ID: {error.user_id}</p>
                    )}
                    {error.request_id && (
                      <p className="mt-1 text-xs text-gray-600">Request ID: {error.request_id}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {error.resolved ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No recent system errors found</p>
            <p className="text-sm text-gray-500 mt-2">System is running smoothly</p>
          </div>
        )}
      </div>

      {/* Recent User Activities */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <UserIcon className="w-6 h-6 mr-2 text-blue-500" />
          Recent User Activities
        </h2>

        {isActivitiesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : userActivities && userActivities.length > 0 ? (
          <div className="space-y-4">
            {userActivities.slice(0, 10).map((activity: UserActivity) => {
              const ActivityIcon = getActivityIcon(activity.activity_type);
              const activityColor = getActivityColor(activity.activity_type) as 'blue' | 'green' | 'purple' | 'indigo';

              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    activityColor === 'blue' ? 'bg-blue-100' :
                    activityColor === 'green' ? 'bg-green-100' :
                    activityColor === 'purple' ? 'bg-purple-100' :
                    'bg-indigo-100'
                  }`}>
                    <ActivityIcon className={`w-5 h-5 ${
                      activityColor === 'blue' ? 'text-blue-600' :
                      activityColor === 'green' ? 'text-green-600' :
                      activityColor === 'purple' ? 'text-purple-600' :
                      'text-indigo-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user_name || activity.user_email}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          activityColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                          activityColor === 'green' ? 'bg-green-100 text-green-700' :
                          activityColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {activity.activity_type.replace(/_/g, ' ')}
                      </span>
                      {activity.ip_address && (
                        <span>IP: {activity.ip_address}</span>
                      )}
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
            <p className="text-sm text-gray-500 mt-2">Activity will appear here as users interact with the platform</p>
          </div>
        )}
      </div>
    </div>
  );
};