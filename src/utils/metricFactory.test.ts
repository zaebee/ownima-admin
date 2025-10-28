import { describe, it, expect } from 'vitest';
import {
  createOwnerMetrics,
  createRiderMetrics,
  createVehicleMetrics,
} from './metricFactory';
import type { BlockMetrics } from '../types';
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

// Helper function to create mock BlockMetrics data
const createMockBlockMetrics = (overrides?: Partial<BlockMetrics>): BlockMetrics => ({
  users: {
    owners: {
      total: 100,
      online_last_30_days: 75,
      logins_today: 10,
    },
    riders: {
      total: 200,
      online_last_30_days: 150,
      logins_today: 25,
    },
  },
  vehicles: {
    total: 150,
    free: 80,
    collected: 40,
    maintenance: 10,
    draft: 15,
    archived: 5,
    unspecified: 0,
  },
  reservations: {
    total: 300,
    pending: 20,
    confirmed: 50,
    collected: 40,
    completed: 180,
    cancelled: 10,
    maintenance: 0,
    confirmation_by_rider: 5,
    confirmation_by_owner: 3,
    overdue: 2,
    conflict: 0,
    no_response: 0,
    unspecified: 0,
  },
  ...overrides,
});

describe('metricFactory', () => {
  describe('createOwnerMetrics', () => {
    it('returns object with primary and secondary metrics', () => {
      const data = createMockBlockMetrics();
      const result = createOwnerMetrics(data);

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(Array.isArray(result.primary)).toBe(true);
      expect(Array.isArray(result.secondary)).toBe(true);
    });

    it('creates correct number of primary metrics', () => {
      const data = createMockBlockMetrics();
      const { primary } = createOwnerMetrics(data);

      expect(primary).toHaveLength(2);
    });

    it('creates correct number of secondary metrics', () => {
      const data = createMockBlockMetrics();
      const { secondary } = createOwnerMetrics(data);

      expect(secondary).toHaveLength(2);
    });

    it('primary metrics have correct structure', () => {
      const data = createMockBlockMetrics();
      const { primary } = createOwnerMetrics(data);

      primary.forEach((metric) => {
        expect(metric).toHaveProperty('label');
        expect(metric).toHaveProperty('value');
        expect(metric).toHaveProperty('icon');
        expect(metric).toHaveProperty('color');
      });
    });

    it('sets correct total owners value', () => {
      const data = createMockBlockMetrics();
      const { primary } = createOwnerMetrics(data);

      const totalOwnersMetric = primary.find((m) => m.label === 'Total Vehicle Owners');
      expect(totalOwnersMetric).toBeDefined();
      expect(totalOwnersMetric?.value).toBe(100);
    });

    it('sets correct active owners value', () => {
      const data = createMockBlockMetrics();
      const { primary } = createOwnerMetrics(data);

      const activeOwnersMetric = primary.find((m) => m.label === 'Active Owners (30 days)');
      expect(activeOwnersMetric).toBeDefined();
      expect(activeOwnersMetric?.value).toBe(75);
    });

    it('calculates activity rate trend correctly', () => {
      const data = createMockBlockMetrics();
      const { primary } = createOwnerMetrics(data);

      const activeOwnersMetric = primary.find((m) => m.label === 'Active Owners (30 days)');
      expect(activeOwnersMetric?.trend).toBeDefined();
      expect(activeOwnersMetric?.trend?.value).toBe(75); // 75/100 * 100 = 75%
      expect(activeOwnersMetric?.trend?.direction).toBe('neutral');
    });

    it('sets correct logins today value', () => {
      const data = createMockBlockMetrics();
      const { secondary } = createOwnerMetrics(data);

      const loginsMetric = secondary.find((m) => m.label === 'Owner Logins Today');
      expect(loginsMetric).toBeDefined();
      expect(loginsMetric?.value).toBe(10);
    });

    it('calculates average vehicles per owner correctly', () => {
      const data = createMockBlockMetrics();
      const { secondary } = createOwnerMetrics(data);

      const avgVehiclesMetric = secondary.find((m) => m.label === 'Avg. Vehicles per Owner');
      expect(avgVehiclesMetric).toBeDefined();
      expect(avgVehiclesMetric?.value).toBe('1.5'); // 150 vehicles / 100 owners = 1.5
    });

    it('uses correct icons for owner metrics', () => {
      const data = createMockBlockMetrics();
      const { primary, secondary } = createOwnerMetrics(data);

      expect(primary[0].icon).toBe(TruckIcon);
      expect(primary[1].icon).toBe(UserIcon);
      expect(secondary[0].icon).toBe(ClockIcon);
      expect(secondary[1].icon).toBe(CogIcon);
    });

    it('uses correct colors for owner metrics', () => {
      const data = createMockBlockMetrics();
      const { primary, secondary } = createOwnerMetrics(data);

      expect(primary[0].color).toBe('purple');
      expect(primary[1].color).toBe('green');
      expect(secondary[0].color).toBe('blue');
      expect(secondary[1].color).toBe('gray');
    });

    it('handles edge case of zero owners', () => {
      const data = createMockBlockMetrics({
        users: {
          owners: { total: 0, online_last_30_days: 0, logins_today: 0 },
          riders: { total: 200, online_last_30_days: 150, logins_today: 25 },
        },
      });
      const { primary, secondary } = createOwnerMetrics(data);

      const totalOwnersMetric = primary[0];
      const activeOwnersMetric = primary[1];
      const avgVehiclesMetric = secondary[1];

      expect(totalOwnersMetric.value).toBe(0);
      expect(activeOwnersMetric.value).toBe(0);
      expect(activeOwnersMetric.trend?.value).toBe(0); // 0/0 = 0
      expect(avgVehiclesMetric.value).toBe('N/A'); // division by zero
    });

    it('includes href for total owners metric', () => {
      const data = createMockBlockMetrics();
      const { primary } = createOwnerMetrics(data);

      const totalOwnersMetric = primary[0];
      expect(totalOwnersMetric.href).toBe('/dashboard/users?type=OWNER');
    });
  });

  describe('createRiderMetrics', () => {
    it('returns object with primary and secondary metrics', () => {
      const data = createMockBlockMetrics();
      const result = createRiderMetrics(data);

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(Array.isArray(result.primary)).toBe(true);
      expect(Array.isArray(result.secondary)).toBe(true);
    });

    it('creates correct number of metrics', () => {
      const data = createMockBlockMetrics();
      const { primary, secondary } = createRiderMetrics(data);

      expect(primary).toHaveLength(2);
      expect(secondary).toHaveLength(2);
    });

    it('sets correct total riders value', () => {
      const data = createMockBlockMetrics();
      const { primary } = createRiderMetrics(data);

      const totalRidersMetric = primary[0];
      expect(totalRidersMetric.label).toBe('Total Riders');
      expect(totalRidersMetric.value).toBe(200);
    });

    it('sets correct active riders value', () => {
      const data = createMockBlockMetrics();
      const { primary } = createRiderMetrics(data);

      const activeRidersMetric = primary[1];
      expect(activeRidersMetric.label).toBe('Active Riders (30 days)');
      expect(activeRidersMetric.value).toBe(150);
    });

    it('calculates rider activity rate correctly', () => {
      const data = createMockBlockMetrics();
      const { primary } = createRiderMetrics(data);

      const activeRidersMetric = primary[1];
      expect(activeRidersMetric.trend?.value).toBe(75); // 150/200 * 100 = 75%
    });

    it('sets correct rider logins today value', () => {
      const data = createMockBlockMetrics();
      const { secondary } = createRiderMetrics(data);

      const loginsMetric = secondary[0];
      expect(loginsMetric.label).toBe('Rider Logins Today');
      expect(loginsMetric.value).toBe(25);
    });

    it('calculates average bookings per rider correctly', () => {
      const data = createMockBlockMetrics();
      const { secondary } = createRiderMetrics(data);

      const avgBookingsMetric = secondary[1];
      expect(avgBookingsMetric.label).toBe('Avg. Bookings per Rider');
      expect(avgBookingsMetric.value).toBe('1.5'); // 300 reservations / 200 riders = 1.5
    });

    it('uses correct icons for rider metrics', () => {
      const data = createMockBlockMetrics();
      const { primary, secondary } = createRiderMetrics(data);

      expect(primary[0].icon).toBe(UserIcon);
      expect(primary[1].icon).toBe(UserIcon);
      expect(secondary[0].icon).toBe(ClockIcon);
      expect(secondary[1].icon).toBe(CalendarDaysIcon);
    });

    it('uses correct colors for rider metrics', () => {
      const data = createMockBlockMetrics();
      const { primary, secondary } = createRiderMetrics(data);

      expect(primary[0].color).toBe('green');
      expect(primary[1].color).toBe('green');
      expect(secondary[0].color).toBe('blue');
      expect(secondary[1].color).toBe('purple');
    });

    it('handles edge case of zero riders', () => {
      const data = createMockBlockMetrics({
        users: {
          owners: { total: 100, online_last_30_days: 75, logins_today: 10 },
          riders: { total: 0, online_last_30_days: 0, logins_today: 0 },
        },
      });
      const { primary, secondary } = createRiderMetrics(data);

      expect(primary[0].value).toBe(0);
      expect(primary[1].value).toBe(0);
      expect(primary[1].trend?.value).toBe(0); // 0/0 = 0
      expect(secondary[1].value).toBe('N/A'); // division by zero for avg bookings
    });

    it('includes href for total riders metric', () => {
      const data = createMockBlockMetrics();
      const { primary } = createRiderMetrics(data);

      const totalRidersMetric = primary[0];
      expect(totalRidersMetric.href).toBe('/dashboard/users?type=RIDER');
    });
  });

  describe('createVehicleMetrics', () => {
    it('returns object with primary and secondary metrics', () => {
      const data = createMockBlockMetrics();
      const result = createVehicleMetrics(data);

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
    });

    it('creates correct number of metrics', () => {
      const data = createMockBlockMetrics();
      const { primary, secondary } = createVehicleMetrics(data);

      expect(primary).toHaveLength(4);
      expect(secondary).toHaveLength(3);
    });

    it('sets correct total vehicles value', () => {
      const data = createMockBlockMetrics();
      const { primary } = createVehicleMetrics(data);

      const totalVehiclesMetric = primary[0];
      expect(totalVehiclesMetric.label).toBe('Total Vehicles');
      expect(totalVehiclesMetric.value).toBe(150);
    });

    it('sets correct available vehicles value', () => {
      const data = createMockBlockMetrics();
      const { primary } = createVehicleMetrics(data);

      const availableMetric = primary[1];
      expect(availableMetric.label).toBe('Available');
      expect(availableMetric.value).toBe(80);
    });

    it('sets correct rented vehicles value', () => {
      const data = createMockBlockMetrics();
      const { primary } = createVehicleMetrics(data);

      const rentedMetric = primary[2];
      expect(rentedMetric.label).toBe('Currently Rented');
      expect(rentedMetric.value).toBe(40);
    });

    it('sets correct maintenance vehicles value', () => {
      const data = createMockBlockMetrics();
      const { primary } = createVehicleMetrics(data);

      const maintenanceMetric = primary[3];
      expect(maintenanceMetric.label).toBe('Under Maintenance');
      expect(maintenanceMetric.value).toBe(10);
    });

    it('includes trend for available vehicles', () => {
      const data = createMockBlockMetrics();
      const { primary } = createVehicleMetrics(data);

      const availableMetric = primary[1];
      expect(availableMetric.trend).toBeDefined();
      expect(availableMetric.trend?.value).toBe(5);
      expect(availableMetric.trend?.direction).toBe('up');
    });

    it('sets correct draft vehicles value', () => {
      const data = createMockBlockMetrics();
      const { secondary } = createVehicleMetrics(data);

      const draftMetric = secondary[0];
      expect(draftMetric.label).toBe('Draft Status');
      expect(draftMetric.value).toBe(15);
    });

    it('sets correct archived vehicles value', () => {
      const data = createMockBlockMetrics();
      const { secondary } = createVehicleMetrics(data);

      const archivedMetric = secondary[1];
      expect(archivedMetric.label).toBe('Archived');
      expect(archivedMetric.value).toBe(5);
    });

    it('sets correct unspecified vehicles value', () => {
      const data = createMockBlockMetrics();
      const { secondary } = createVehicleMetrics(data);

      const unspecifiedMetric = secondary[2];
      expect(unspecifiedMetric.label).toBe('Unspecified');
      expect(unspecifiedMetric.value).toBe(0);
    });

    it('uses correct icons for vehicle metrics', () => {
      const data = createMockBlockMetrics();
      const { primary, secondary } = createVehicleMetrics(data);

      expect(primary[0].icon).toBe(TruckIcon);
      expect(primary[1].icon).toBe(CheckCircleIcon);
      expect(primary[2].icon).toBe(ClockIcon);
      expect(primary[3].icon).toBe(WrenchScrewdriverIcon);
      expect(secondary[0].icon).toBe(DocumentCheckIcon);
      expect(secondary[1].icon).toBe(XCircleIcon);
      expect(secondary[2].icon).toBe(CogIcon);
    });

    it('uses correct colors for vehicle metrics', () => {
      const data = createMockBlockMetrics();
      const { primary, secondary } = createVehicleMetrics(data);

      expect(primary[0].color).toBe('green');
      expect(primary[1].color).toBe('green');
      expect(primary[2].color).toBe('blue');
      expect(primary[3].color).toBe('red');
      expect(secondary[0].color).toBe('yellow');
      expect(secondary[1].color).toBe('gray');
      expect(secondary[2].color).toBe('gray');
    });

    it('handles edge case of zero vehicles', () => {
      const data = createMockBlockMetrics({
        vehicles: {
          total: 0,
          free: 0,
          collected: 0,
          maintenance: 0,
          draft: 0,
          archived: 0,
          unspecified: 0,
        },
      });
      const { primary, secondary } = createVehicleMetrics(data);

      expect(primary[0].value).toBe(0);
      expect(primary[1].value).toBe(0);
      expect(primary[2].value).toBe(0);
      expect(primary[3].value).toBe(0);
      expect(secondary[0].value).toBe(0);
      expect(secondary[1].value).toBe(0);
      expect(secondary[2].value).toBe(0);
    });

    it('handles missing unspecified value gracefully', () => {
      const data = createMockBlockMetrics({
        vehicles: {
          total: 100,
          free: 50,
          collected: 30,
          maintenance: 10,
          draft: 5,
          archived: 5,
          unspecified: undefined as unknown as number, // Simulate missing/undefined value
        },
      });
      const { secondary } = createVehicleMetrics(data);

      const unspecifiedMetric = secondary[2];
      expect(unspecifiedMetric.value).toBe(0);
    });
  });

  describe('Integration tests', () => {
    it('all factory functions use consistent structure', () => {
      const data = createMockBlockMetrics();

      const ownerMetrics = createOwnerMetrics(data);
      const riderMetrics = createRiderMetrics(data);
      const vehicleMetrics = createVehicleMetrics(data);

      // All should have primary and secondary
      expect(ownerMetrics).toHaveProperty('primary');
      expect(ownerMetrics).toHaveProperty('secondary');
      expect(riderMetrics).toHaveProperty('primary');
      expect(riderMetrics).toHaveProperty('secondary');
      expect(vehicleMetrics).toHaveProperty('primary');
      expect(vehicleMetrics).toHaveProperty('secondary');

      // All metrics should have required fields
      [...ownerMetrics.primary, ...ownerMetrics.secondary].forEach((metric) => {
        expect(metric).toHaveProperty('label');
        expect(metric).toHaveProperty('value');
        expect(metric).toHaveProperty('icon');
        expect(metric).toHaveProperty('color');
      });
    });

    it('factories produce metrics with consistent color scheme', () => {
      const data = createMockBlockMetrics();

      const ownerMetrics = createOwnerMetrics(data);
      const riderMetrics = createRiderMetrics(data);
      const vehicleMetrics = createVehicleMetrics(data);

      const allMetrics = [
        ...ownerMetrics.primary,
        ...ownerMetrics.secondary,
        ...riderMetrics.primary,
        ...riderMetrics.secondary,
        ...vehicleMetrics.primary,
        ...vehicleMetrics.secondary,
      ];

      const validColors = ['purple', 'green', 'blue', 'red', 'yellow', 'gray'];

      allMetrics.forEach((metric) => {
        expect(validColors).toContain(metric.color);
      });
    });

    it('all factories handle realistic production data', () => {
      const productionData = createMockBlockMetrics({
        users: {
          owners: { total: 1523, online_last_30_days: 892, logins_today: 47 },
          riders: { total: 8934, online_last_30_days: 4521, logins_today: 312 },
        },
        vehicles: {
          total: 2341,
          free: 1205,
          collected: 876,
          maintenance: 134,
          draft: 89,
          archived: 37,
          unspecified: 0,
        },
        reservations: {
          total: 15678,
          pending: 234,
          confirmed: 567,
          collected: 876,
          completed: 13456,
          cancelled: 512,
          maintenance: 23,
          confirmation_by_rider: 10,
          confirmation_by_owner: 0,
          overdue: 0,
          conflict: 0,
          no_response: 0,
          unspecified: 0,
        },
      });

      const ownerMetrics = createOwnerMetrics(productionData);
      const riderMetrics = createRiderMetrics(productionData);
      const vehicleMetrics = createVehicleMetrics(productionData);

      // Verify calculations with realistic numbers
      expect(ownerMetrics.primary[1].trend?.value).toBe(59); // ~58.57%
      expect(ownerMetrics.secondary[1].value).toBe('1.5'); // 2341/1523
      expect(riderMetrics.primary[1].trend?.value).toBe(51); // ~50.62%
      expect(riderMetrics.secondary[1].value).toBe('1.8'); // 15678/8934 ≈ 1.75
      expect(vehicleMetrics.primary[0].value).toBe(2341);
    });
  });

  describe('Performance', () => {
    it('factory functions execute efficiently', () => {
      const data = createMockBlockMetrics();
      const start = performance.now();

      // Run 1000 iterations
      for (let i = 0; i < 1000; i++) {
        createOwnerMetrics(data);
        createRiderMetrics(data);
        createVehicleMetrics(data);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
