import React from 'react';
import {
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import type { UserActivity } from '../types';

interface ActivityTimelineProps {
  activities: UserActivity[];
  loading?: boolean;
}

const getActivityIcon = (activityType: string) => {
  switch (activityType.toLowerCase()) {
    case 'registration':
      return UserPlusIcon;
    case 'login':
      return ArrowRightOnRectangleIcon;
    default:
      return ClockIcon;
  }
};

const getActivityColor = (activityType: string): string => {
  switch (activityType.toLowerCase()) {
    case 'registration':
      return 'text-green-600 bg-green-100';
    case 'login':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getActivityLabel = (activityType: string): string => {
  switch (activityType.toLowerCase()) {
    case 'registration':
      return 'Registered';
    case 'login':
      return 'Logged in';
    default:
      return activityType;
  }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
        <p className="mt-1 text-sm text-gray-500">No recent activities found for this user.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => {
          const Icon = getActivityIcon(activity.activity_type);
          const colorClasses = getActivityColor(activity.activity_type);
          const label = getActivityLabel(activity.activity_type);

          return (
            <li key={activity.id || `${activity.timestamp}-${activityIdx}`}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${colorClasses}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{label}</span>
                        {activity.details?.user_email && (
                          <span className="text-gray-500"> - {activity.details.user_email}</span>
                        )}
                      </p>
                      {activity.details?.user_name && (
                        <p className="mt-0.5 text-sm text-gray-500">{activity.details.user_name}</p>
                      )}
                      {activity.details?.user_role && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                          {activity.details.user_role}
                        </span>
                      )}
                      {activity.activity_type.toLowerCase() === 'login' && activity.details?.login_count && (
                        <p className="mt-1 text-xs text-gray-500">
                          Login count: {activity.details.login_count}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={activity.timestamp}>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
