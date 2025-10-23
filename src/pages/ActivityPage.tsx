import React from 'react';
import { ActivityTimeline } from '../components/ActivityTimeline';

export const ActivityPage: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Activity Feed</h1>
          <p className="mt-2 text-sm text-gray-700">
            A comprehensive view of all system activities including user registrations, vehicle
            updates, and reservation status changes.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
};
