import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricBlock } from '../components/ui/MetricBlock';
import { FilterPanel } from '../components/ui/FilterPanel';
import {
  UsersIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  CogIcon,
  DocumentCheckIcon,
  XCircleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import type { FilterParams, MetricRowData } from '../types';


export const DashboardPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<FilterParams>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      end: new Date().toISOString().split('T')[0] // today
    },
    role: 'ALL'
  });

  // Query block metrics with filters
  const { data: blockMetrics, isLoading } = useQuery({
    queryKey: ['block-metrics', filters],
    queryFn: () => adminService.getBlockMetrics(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mock data for now (will be replaced with real API data)
  const mockBlockData = {
    users: {
      total: 1234,
      online_last_30_days: 567,
      internal: 89,
      external: 1145,
      owners: 456,
      riders: 778,
      logins: 890
    },
    vehicles: {
      total: 456,
      draft: 67,
      free: 123,
      collected: 234,
      maintenance: 12,
      archived: 20
    },
    reservations: {
      total: 2345,
      pending: 45,
      confirmed: 567,
      collected: 234,
      completed: 1234,
      cancelled: 123,
      maintenance: 12
    }
  };

  const handleFiltersChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      role: 'ALL'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Use real data if available, otherwise fall back to mock data
  const data = blockMetrics || mockBlockData;

  // Prepare metrics for each block
  const userMetrics: MetricRowData[] = [
    { label: 'Total Users', value: data.users.total, icon: UsersIcon, href: '/dashboard/users', color: 'blue' },
    { label: 'Online (30 days)', value: data.users.online_last_30_days, icon: UserIcon, color: 'green', trend: { value: 12, direction: 'up' } },
    { label: 'Internal Users', value: data.users.internal, icon: CogIcon, color: 'gray' },
    { label: 'External Users', value: data.users.external, icon: UsersIcon, color: 'blue' },
    { label: 'Vehicle Owners', value: data.users.owners, icon: TruckIcon, href: '/dashboard/users?type=OWNER', color: 'purple' },
    { label: 'Riders', value: data.users.riders, icon: UserIcon, href: '/dashboard/users?type=RIDER', color: 'green' },
    { label: 'Login Sessions', value: data.users.logins, icon: ArrowRightOnRectangleIcon, color: 'blue', trend: { value: 8, direction: 'up' } }
  ];

  const vehicleMetrics: MetricRowData[] = [
    { label: 'Total Vehicles', value: data.vehicles.total, icon: TruckIcon, color: 'green' },
    { label: 'Draft Status', value: data.vehicles.draft, icon: DocumentCheckIcon, color: 'yellow' },
    { label: 'Available', value: data.vehicles.free, icon: CheckCircleIcon, color: 'green', trend: { value: 5, direction: 'up' } },
    { label: 'Currently Rented', value: data.vehicles.collected, icon: ClockIcon, color: 'blue' },
    { label: 'Under Maintenance', value: data.vehicles.maintenance, icon: WrenchScrewdriverIcon, color: 'red' },
    { label: 'Archived', value: data.vehicles.archived, icon: XCircleIcon, color: 'gray' }
  ];

  const reservationMetrics: MetricRowData[] = [
    { label: 'Total Reservations', value: data.reservations.total, icon: CalendarDaysIcon, color: 'purple' },
    { label: 'Pending Approval', value: data.reservations.pending, icon: ClockIcon, color: 'yellow' },
    { label: 'Confirmed', value: data.reservations.confirmed, icon: CheckCircleIcon, color: 'green', trend: { value: 15, direction: 'up' } },
    { label: 'Active Rentals', value: data.reservations.collected, icon: TruckIcon, color: 'blue' },
    { label: 'Completed', value: data.reservations.completed, icon: DocumentCheckIcon, color: 'green' },
    { label: 'Cancelled', value: data.reservations.cancelled, icon: XCircleIcon, color: 'red' },
    { label: 'Maintenance', value: data.reservations.maintenance, icon: WrenchScrewdriverIcon, color: 'red' }
  ];

  return (
    <div className="space-y-6">
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

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* 3-Block Metrics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Block */}
        <MetricBlock
          title="Users"
          icon={UsersIcon}
          metrics={userMetrics}
          color="blue"
          loading={isLoading}
          liveIndicator={true}
        />

        {/* Vehicles Block */}
        <MetricBlock
          title="Vehicles"
          icon={TruckIcon}
          metrics={vehicleMetrics}
          color="green"
          loading={isLoading}
          liveIndicator={true}
        />

        {/* Reservations Block */}
        <MetricBlock
          title="Reservations"
          icon={CalendarDaysIcon}
          metrics={reservationMetrics}
          color="purple"
          loading={isLoading}
          liveIndicator={true}
        />
      </div>

      {/* Quick Actions section */}
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
            title="Vehicle Management"
            value="Manage"
            icon={TruckIcon}
            description="Manage vehicle fleet and status"
            color="green"
            size="small"
            clickable={true}
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
        </div>
      </div>
    </div>
  );
};