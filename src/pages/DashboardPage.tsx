import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricBlock } from '../components/ui/MetricBlock';
import { FilterPanel } from '../components/ui/FilterPanel';
import { SkeletonMetricBlock, SkeletonHeader } from '../components/ui/SkeletonLoader';
import { ErrorState } from '../components/ui/EmptyState';
import {
  UsersIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  CogIcon,
  DocumentCheckIcon,
  XCircleIcon,
  WrenchScrewdriverIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import type { FilterParams, MetricRowData } from '../types';

export const DashboardPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<FilterParams>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      end: new Date().toISOString().split('T')[0], // today
    },
    role: 'ALL',
  });

  // Query block metrics with filters
  const {
    data: blockMetrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['block-metrics', filters],
    queryFn: () => adminService.getBlockMetrics(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleFiltersChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      role: 'ALL',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonMetricBlock />
          <SkeletonMetricBlock />
          <SkeletonMetricBlock />
          <SkeletonMetricBlock />
        </div>
      </div>
    );
  }

  if (error || !blockMetrics) {
    return (
      <ErrorState
        onRetry={() => window.location.reload()}
        message="Failed to load dashboard metrics. Please try again."
      />
    );
  }

  const data = blockMetrics;

  // Prepare metrics for each block
  const ownerMetrics: MetricRowData[] = [
    {
      label: 'Total Vehicle Owners',
      value: data.users.owners,
      icon: TruckIcon,
      href: '/dashboard/users?type=OWNER',
      color: 'purple',
    },
    {
      label: 'Avg. Vehicles per Owner',
      value: data.users.owners > 0 ? (data.vehicles.total / data.users.owners).toFixed(1) : 'N/A',
      icon: CogIcon,
      color: 'gray',
    },
    {
      label: 'New Owners (in range)',
      value: data.users.owners,
      icon: UserPlusIcon,
      color: 'green',
    },
  ];

  const riderMetrics: MetricRowData[] = [
    {
      label: 'Total Riders',
      value: data.users.riders,
      icon: UserIcon,
      href: '/dashboard/users?type=RIDER',
      color: 'green',
    },
    {
      label: 'Avg. Bookings per Rider',
      value:
        data.users.riders > 0 ? (data.reservations.total / data.users.riders).toFixed(1) : 'N/A',
      icon: CalendarDaysIcon,
      color: 'purple',
    },
    { label: 'New Riders (in range)', value: data.users.riders, icon: UserPlusIcon, color: 'blue' },
  ];

  const vehicleMetrics: MetricRowData[] = [
    { label: 'Total Vehicles', value: data.vehicles.total, icon: TruckIcon, color: 'green' },
    { label: 'Draft Status', value: data.vehicles.draft, icon: DocumentCheckIcon, color: 'yellow' },
    {
      label: 'Available',
      value: data.vehicles.free,
      icon: CheckCircleIcon,
      color: 'green',
      trend: { value: 5, direction: 'up' },
    },
    { label: 'Currently Rented', value: data.vehicles.collected, icon: ClockIcon, color: 'blue' },
    {
      label: 'Under Maintenance',
      value: data.vehicles.maintenance,
      icon: WrenchScrewdriverIcon,
      color: 'red',
    },
    { label: 'Archived', value: data.vehicles.archived, icon: XCircleIcon, color: 'gray' },
  ];

  const reservationMetrics: MetricRowData[] = [
    {
      label: 'Total Reservations',
      value: data.reservations.total,
      icon: CalendarDaysIcon,
      color: 'purple',
    },
    {
      label: 'Pending Approval',
      value: data.reservations.pending,
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      label: 'Confirmed',
      value: data.reservations.confirmed,
      icon: CheckCircleIcon,
      color: 'green',
      trend: { value: 15, direction: 'up' },
    },
    { label: 'Active Rentals', value: data.reservations.collected, icon: TruckIcon, color: 'blue' },
    {
      label: 'Completed',
      value: data.reservations.completed,
      icon: DocumentCheckIcon,
      color: 'green',
    },
    { label: 'Cancelled', value: data.reservations.cancelled, icon: XCircleIcon, color: 'red' },
    {
      label: 'Maintenance',
      value: data.reservations.maintenance,
      icon: WrenchScrewdriverIcon,
      color: 'red',
    },
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

      {/* 4-Block Metrics Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Owners Block */}
        <MetricBlock
          title="Owners"
          icon={TruckIcon}
          metrics={ownerMetrics}
          color="purple"
          loading={isLoading}
          liveIndicator={true}
        />

        {/* Riders Block */}
        <MetricBlock
          title="Riders"
          icon={UserIcon}
          metrics={riderMetrics}
          color="green"
          loading={isLoading}
          liveIndicator={true}
        />

        {/* Vehicles Block */}
        <MetricBlock
          title="Vehicles"
          icon={TruckIcon}
          metrics={vehicleMetrics}
          color="blue"
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
