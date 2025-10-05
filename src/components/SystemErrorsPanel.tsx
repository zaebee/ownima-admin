import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  CodeBracketIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { type SystemError } from '../mocks/systemErrors';

interface SystemErrorsPanelProps {
  errors: SystemError[];
  statistics?: {
    total: number;
    critical: number;
    errors: number;
    warnings: number;
    resolved: number;
    unresolved: number;
    resolutionRate: string;
  };
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getLevelStyles = (level: SystemError['level']) => {
  switch (level) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        badge: 'bg-red-100 text-red-800',
        icon: 'text-red-600',
        pulse: 'bg-red-500',
      };
    case 'ERROR':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-400',
        badge: 'bg-orange-100 text-orange-800',
        icon: 'text-orange-600',
        pulse: 'bg-orange-500',
      };
    case 'WARNING':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-400',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: 'text-yellow-600',
        pulse: 'bg-yellow-500',
      };
    case 'INFO':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-400',
        badge: 'bg-blue-100 text-blue-800',
        icon: 'text-blue-600',
        pulse: 'bg-blue-500',
      };
  }
};

export const SystemErrorsPanel: React.FC<SystemErrorsPanelProps> = ({ errors, statistics }) => {
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<SystemError['level'] | 'ALL'>('ALL');
  const [showResolved, setShowResolved] = useState(true);

  const filteredErrors = errors.filter((error) => {
    if (filterLevel !== 'ALL' && error.level !== filterLevel) return false;
    if (!showResolved && error.resolved) return false;
    return true;
  });

  const toggleExpand = (errorId: string) => {
    setExpandedError(expandedError === errorId ? null : errorId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8">
      {/* Header with Statistics */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ExclamationTriangleIcon className="w-7 h-7 mr-3 text-red-500" />
            Recent System Errors
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live monitoring</span>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="text-xs text-red-700 mb-1">Critical</div>
              <div className="text-2xl font-bold text-red-900">{statistics.critical}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="text-xs text-orange-700 mb-1">Errors</div>
              <div className="text-2xl font-bold text-orange-900">{statistics.errors}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="text-xs text-yellow-700 mb-1">Warnings</div>
              <div className="text-2xl font-bold text-yellow-900">{statistics.warnings}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="text-xs text-green-700 mb-1">Resolved</div>
              <div className="text-2xl font-bold text-green-900">{statistics.resolved}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="text-xs text-red-700 mb-1">Unresolved</div>
              <div className="text-2xl font-bold text-red-900">{statistics.unresolved}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-blue-700 mb-1">Resolution</div>
              <div className="text-2xl font-bold text-blue-900">{statistics.resolutionRate}%</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
          <div className="flex space-x-2">
            {(['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  filterLevel === level
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <label className="flex items-center space-x-2 ml-auto">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show resolved</span>
          </label>
        </div>
      </div>

      {/* Error List */}
      {filteredErrors.length > 0 ? (
        <div className="space-y-3">
          {filteredErrors.map((error) => {
            const styles = getLevelStyles(error.level);
            const isExpanded = expandedError === error.id;

            return (
              <div
                key={error.id}
                className={`${styles.bg} rounded-lg border-l-4 ${styles.border} transition-all hover:shadow-md`}
              >
                <div className="p-4">
                  {/* Error Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {/* Level Badge */}
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles.badge}`}
                        >
                          {error.level}
                        </span>

                        {/* Timestamp */}
                        <div className="flex items-center text-xs text-gray-600">
                          <ClockIcon className="w-3.5 h-3.5 mr-1" />
                          {formatDateTime(error.timestamp)}
                        </div>

                        {/* Source */}
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs font-medium text-gray-700">{error.source}</span>

                        {/* Error Code */}
                        {error.error_code && (
                          <>
                            <span className="text-xs text-gray-500">•</span>
                            <code className="text-xs bg-gray-200 px-2 py-0.5 rounded font-mono text-gray-800">
                              {error.error_code}
                            </code>
                          </>
                        )}

                        {/* Pulse indicator for unresolved critical/errors */}
                        {!error.resolved &&
                          (error.level === 'CRITICAL' || error.level === 'ERROR') && (
                            <div
                              className={`w-2 h-2 ${styles.pulse} rounded-full animate-pulse`}
                            ></div>
                          )}
                      </div>

                      {/* Error Message */}
                      <p className="text-sm font-medium text-gray-900 mb-2">{error.message}</p>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        {error.affected_users && (
                          <div className="flex items-center">
                            <UserGroupIcon className="w-4 h-4 mr-1" />
                            <span>{error.affected_users} users affected</span>
                          </div>
                        )}
                        {error.user_id && (
                          <div className="flex items-center">
                            <span className="font-medium">User:</span>
                            <code className="ml-1 bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                              {error.user_id}
                            </code>
                          </div>
                        )}
                        {error.request_id && (
                          <div className="flex items-center">
                            <span className="font-medium">Request:</span>
                            <code className="ml-1 bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                              {error.request_id}
                            </code>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {error.tags && error.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {error.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-white/60 text-gray-700 rounded-full border border-gray-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex items-center space-x-2 ml-4">
                      {error.resolved ? (
                        <div className="flex flex-col items-center">
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                          <span className="text-xs text-green-700 mt-1">Resolved</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <XCircleIcon className={`w-6 h-6 ${styles.icon}`} />
                          <span className={`text-xs ${styles.icon} mt-1`}>Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  {(error.stack_trace || error.resolution_time) && (
                    <button
                      onClick={() => toggleExpand(error.id)}
                      className="mt-3 flex items-center text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUpIcon className="w-4 h-4 mr-1" />
                          Hide details
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="w-4 h-4 mr-1" />
                          Show details
                        </>
                      )}
                    </button>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-300 space-y-3">
                      {error.resolution_time && (
                        <div className="bg-white/60 rounded-lg p-3 border border-gray-300">
                          <div className="flex items-center text-xs text-green-700 mb-1">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            <span className="font-semibold">Resolved at:</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            {new Date(error.resolution_time).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {error.stack_trace && (
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center text-xs text-gray-400 mb-2">
                            <CodeBracketIcon className="w-4 h-4 mr-1" />
                            <span className="font-semibold">Stack Trace:</span>
                          </div>
                          <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                            {error.stack_trace}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No errors found</p>
          <p className="text-sm text-gray-500 mt-2">
            {filterLevel !== 'ALL'
              ? `No ${filterLevel.toLowerCase()} level errors to display`
              : 'System is running smoothly'}
          </p>
        </div>
      )}
    </div>
  );
};
