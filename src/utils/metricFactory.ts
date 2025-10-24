/**
 * Metric Factory Utilities
 *
 * Factory functions to create metric configurations.
 * Follows DRY principle - eliminates metric array duplication.
 */

import type { MetricRowData, BlockMetrics } from '../types';
import {
  TruckIcon,
  UserIcon,
  ClockIcon,
  CogIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  DocumentCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  calculateActivityRate,
  calculateVehiclesPerOwner,
  calculateBookingsPerRider,
} from './metricCalculations';

/**
 * Create owner metrics (primary and secondary)
 */
export const createOwnerMetrics = (data: BlockMetrics) => {
  const { owners } = data.users;
  const activityRate = calculateActivityRate(owners.online_last_30_days, owners.total);
  const avgVehicles = calculateVehiclesPerOwner(data.vehicles.total, owners.total);

  return {
    primary: [
      {
        label: 'Total Vehicle Owners',
        value: owners.total,
        icon: TruckIcon,
        href: '/dashboard/users?type=OWNER',
        color: 'purple' as const,
      },
      {
        label: 'Active Owners (30 days)',
        value: owners.online_last_30_days,
        icon: UserIcon,
        color: 'green' as const,
        trend: {
          value: activityRate,
          direction: 'neutral' as const,
        },
      },
    ] as MetricRowData[],
    secondary: [
      {
        label: 'Owner Logins Today',
        value: owners.logins_today,
        icon: ClockIcon,
        color: 'blue' as const,
      },
      {
        label: 'Avg. Vehicles per Owner',
        value: avgVehicles,
        icon: CogIcon,
        color: 'gray' as const,
      },
    ] as MetricRowData[],
  };
};

/**
 * Create rider metrics (primary and secondary)
 */
export const createRiderMetrics = (data: BlockMetrics) => {
  const { riders } = data.users;
  const activityRate = calculateActivityRate(riders.online_last_30_days, riders.total);
  const avgBookings = calculateBookingsPerRider(data.reservations.total, riders.total);

  return {
    primary: [
      {
        label: 'Total Riders',
        value: riders.total,
        icon: UserIcon,
        href: '/dashboard/users?type=RIDER',
        color: 'green' as const,
      },
      {
        label: 'Active Riders (30 days)',
        value: riders.online_last_30_days,
        icon: UserIcon,
        color: 'green' as const,
        trend: {
          value: activityRate,
          direction: 'neutral' as const,
        },
      },
    ] as MetricRowData[],
    secondary: [
      {
        label: 'Rider Logins Today',
        value: riders.logins_today,
        icon: ClockIcon,
        color: 'blue' as const,
      },
      {
        label: 'Avg. Bookings per Rider',
        value: avgBookings,
        icon: CalendarDaysIcon,
        color: 'purple' as const,
      },
    ] as MetricRowData[],
  };
};

/**
 * Create vehicle metrics (primary and secondary)
 */
export const createVehicleMetrics = (data: BlockMetrics) => {
  const { vehicles } = data;

  return {
    primary: [
      {
        label: 'Total Vehicles',
        value: vehicles.total,
        icon: TruckIcon,
        color: 'green' as const,
      },
      {
        label: 'Available',
        value: vehicles.free,
        icon: CheckCircleIcon,
        color: 'green' as const,
        trend: { value: 5, direction: 'up' as const },
      },
      {
        label: 'Currently Rented',
        value: vehicles.collected,
        icon: ClockIcon,
        color: 'blue' as const,
      },
      {
        label: 'Under Maintenance',
        value: vehicles.maintenance,
        icon: WrenchScrewdriverIcon,
        color: 'red' as const,
      },
    ] as MetricRowData[],
    secondary: [
      {
        label: 'Draft Status',
        value: vehicles.draft,
        icon: DocumentCheckIcon,
        color: 'yellow' as const,
      },
      {
        label: 'Archived',
        value: vehicles.archived,
        icon: XCircleIcon,
        color: 'gray' as const,
      },
      {
        label: 'Unspecified',
        value: vehicles.unspecified || 0,
        icon: CogIcon,
        color: 'gray' as const,
      },
    ] as MetricRowData[],
  };
};
