import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MetricCard } from '../components/ui/MetricCard';
import {
  UsersIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';


export const DashboardPage: React.FC = () => {
  // Query dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => adminService.getMetricsOverview(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const metricsCards = [
    {
      title: 'Total Owners',
      value: metrics?.total_owners || 0,
      icon: UsersIcon,
      description: 'Vehicle owners on the platform',
      color: 'blue' as const,
      href: '/dashboard/users?type=OWNER',
    },
    {
      title: 'Total Riders',
      value: metrics?.total_riders || 0,
      icon: UserIcon,
      description: 'Riders registered on the platform',
      color: 'green' as const,
      href: '/dashboard/users?type=RIDER',
    },
    {
      title: 'Total Bookings',
      value: metrics?.total_bookings || 0,
      icon: ClipboardDocumentListIcon,
      description: 'All-time booking count',
      color: 'purple' as const,
    },
    {
      title: 'New Registrations Today',
      value: metrics?.new_registrations_today || 0,
      icon: UserPlusIcon,
      description: 'Users who joined today',
      color: 'indigo' as const,
    },
    {
      title: 'Logins Today',
      value: metrics?.logins_today || 0,
      icon: ArrowRightOnRectangleIcon,
      description: 'User login sessions today',
      color: 'pink' as const,
    },
    {
      title: 'Bookings Today',
      value: metrics?.bookings_today || 0,
      icon: CalendarDaysIcon,
      description: 'New bookings created today',
      color: 'yellow' as const,
    },
    {
      title: 'Pending Bookings',
      value: metrics?.bookings_pending || 0,
      icon: ClockIcon,
      description: 'Bookings awaiting confirmation',
      color: 'red' as const,
    },
    {
      title: 'Confirmed Bookings',
      value: metrics?.bookings_confirmed || 0,
      icon: CheckCircleIcon,
      description: 'Confirmed and active bookings',
      color: 'green' as const,
    },
    {
      title: 'Bookings for Today',
      value: metrics?.bookings_for_today || 0,
      icon: CalendarIcon,
      description: 'Bookings starting today',
      color: 'gray' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-indigo-100/50 rounded-2xl"></div>
        <div className="relative p-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Ownima Admin Dashboard
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor your platform's key metrics and performance in real-time.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live data - Updates every 30 seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            description={card.description}
            color={card.color}
            clickable={!!card.href}
            href={card.href}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Quick actions section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="User Management"
            value="Manage"
            icon={UsersIcon}
            description="View and manage all platform users"
            color="blue"
            size="small"
            clickable={true}
            href="/dashboard/users"
          />
          <MetricCard
            title="System Monitoring"
            value="Monitor"
            icon={ClipboardDocumentListIcon}
            description="View system status and logs"
            color="gray"
            size="small"
            clickable={true}
            href="/dashboard/system"
          />
          <MetricCard
            title="Generate Reports"
            value="Export"
            icon={CalendarDaysIcon}
            description="Download analytics reports"
            color="purple"
            size="small"
            clickable={true}
          />
        </div>
      </div>
    </div>
  );
};