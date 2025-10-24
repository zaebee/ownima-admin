import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricBlock } from '../components/ui/MetricBlock';
import { FilterPanel } from '../components/ui/FilterPanel';
import { SkeletonMetricBlock, SkeletonHeader } from '../components/ui/SkeletonLoader';
import { ErrorState } from '../components/ui/EmptyState';
import { StatusPieChart } from '../components/ui/StatusPieChart';
import { STATUS_COLORS } from '../components/ui/statusColors';
import type { StatusData } from '../components/ui/StatusPieChart';
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
} from '@heroicons/react/24/outline';
import type { FilterParams, MetricRowData } from '../types';
import {
  createOwnerMetrics,
  createRiderMetrics,
  createVehicleMetrics,
} from '../utils/metricFactory';

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

  // Create metrics using factory functions (DRY pattern)
  const { primary: ownerMetrics, secondary: ownerMetricsSecondary } = createOwnerMetrics(data);
  const { primary: riderMetrics, secondary: riderMetricsSecondary } = createRiderMetrics(data);
  const { primary: vehicleMetrics, secondary: vehicleMetricsSecondary } = createVehicleMetrics(data);

  // Primary reservation metrics (most important statuses)
  const reservationMetricsPrimary: MetricRowData[] = [
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

  // Secondary/Advanced reservation metrics (edge cases and detailed statuses)
  const reservationMetricsSecondary: MetricRowData[] = [
    {
      label: 'Awaiting Rider Confirmation',
      value: data.reservations.confirmation_by_rider || 0,
      icon: UserIcon,
      color: 'yellow',
    },
    {
      label: 'Awaiting Owner Confirmation',
      value: data.reservations.confirmation_by_owner || 0,
      icon: TruckIcon,
      color: 'yellow',
    },
    {
      label: 'Overdue',
      value: data.reservations.overdue || 0,
      icon: ClockIcon,
      color: 'red',
    },
    {
      label: 'Conflict',
      value: data.reservations.conflict || 0,
      icon: XCircleIcon,
      color: 'red',
    },
    {
      label: 'No Response',
      value: data.reservations.no_response || 0,
      icon: ClockIcon,
      color: 'gray',
    },
    {
      label: 'Unspecified Status',
      value: data.reservations.unspecified || 0,
      icon: CogIcon,
      color: 'gray',
    },
  ];

  // Prepare data for vehicle status chart
  const vehicleStatusData: StatusData[] = [
    { name: 'Available', value: data.vehicles.free, color: STATUS_COLORS.free },
    { name: 'Draft', value: data.vehicles.draft, color: STATUS_COLORS.draft },
    { name: 'Rented', value: data.vehicles.collected, color: STATUS_COLORS.collected },
    { name: 'Maintenance', value: data.vehicles.maintenance, color: STATUS_COLORS.maintenance },
    { name: 'Archived', value: data.vehicles.archived, color: STATUS_COLORS.archived },
    { name: 'Unspecified', value: data.vehicles.unspecified || 0, color: STATUS_COLORS.unspecified },
  ];

  // Prepare data for reservation status chart
  const reservationStatusData: StatusData[] = [
    { name: 'Completed', value: data.reservations.completed, color: STATUS_COLORS.completed },
    { name: 'Confirmed', value: data.reservations.confirmed, color: STATUS_COLORS.confirmed },
    { name: 'Collected', value: data.reservations.collected, color: STATUS_COLORS.collected },
    { name: 'Pending', value: data.reservations.pending, color: STATUS_COLORS.pending },
    { name: 'Cancelled', value: data.reservations.cancelled, color: STATUS_COLORS.cancelled },
    { name: 'Maintenance', value: data.reservations.maintenance, color: STATUS_COLORS.maintenance },
    {
      name: 'Conf. by Rider',
      value: data.reservations.confirmation_by_rider || 0,
      color: STATUS_COLORS.confirmation_by_rider,
    },
    {
      name: 'Conf. by Owner',
      value: data.reservations.confirmation_by_owner || 0,
      color: STATUS_COLORS.confirmation_by_owner,
    },
    { name: 'Overdue', value: data.reservations.overdue || 0, color: STATUS_COLORS.overdue },
    { name: 'Conflict', value: data.reservations.conflict || 0, color: STATUS_COLORS.conflict },
    { name: 'No Response', value: data.reservations.no_response || 0, color: STATUS_COLORS.no_response },
    { name: 'Unspecified', value: data.reservations.unspecified || 0, color: STATUS_COLORS.unspecified },
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
          secondaryMetrics={ownerMetricsSecondary}
          secondaryLabel="Additional"
          color="purple"
          loading={isLoading}
          liveIndicator={true}
        />

        {/* Riders Block */}
        <MetricBlock
          title="Riders"
          icon={UserIcon}
          metrics={riderMetrics}
          secondaryMetrics={riderMetricsSecondary}
          secondaryLabel="Additional"
          color="green"
          loading={isLoading}
          liveIndicator={true}
        />

        {/* Vehicles Block */}
        <MetricBlock
          title="Vehicles"
          icon={TruckIcon}
          metrics={vehicleMetrics}
          secondaryMetrics={vehicleMetricsSecondary}
          secondaryLabel="Other Statuses"
          color="blue"
          loading={isLoading}
          liveIndicator={true}
        />

        {/* Reservations Block */}
        <MetricBlock
          title="Reservations"
          icon={CalendarDaysIcon}
          metrics={reservationMetricsPrimary}
          secondaryMetrics={reservationMetricsSecondary}
          secondaryLabel="Advanced"
          color="purple"
          loading={isLoading}
          liveIndicator={true}
        />
      </div>

      {/* Status Distribution Charts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Distribution</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusPieChart
            data={vehicleStatusData}
            title="Vehicle Status Distribution"
            loading={isLoading}
            innerRadius={60}
            height={350}
          />
          <StatusPieChart
            data={reservationStatusData}
            title="Reservation Status Distribution"
            loading={isLoading}
            innerRadius={60}
            height={350}
          />
        </div>
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
