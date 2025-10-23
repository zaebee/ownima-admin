import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MetricCard } from '../components/ui/MetricCard';
import { SystemErrorsPanel } from '../components/SystemErrorsPanel';
import { mockSystemErrors, getErrorStatistics } from '../mocks/systemErrors';
import {
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  CommandLineIcon,
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

    </div>
  );
};
