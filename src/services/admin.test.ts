import { describe, it, expect, beforeEach } from 'vitest';
import { adminService } from './admin';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

describe('AdminService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getAdminUsers', () => {
    it('fetches admin users successfully', async () => {
      const result = await adminService.getAdminUsers();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('count');
      expect(Array.isArray((result as { data: unknown[] }).data)).toBe(true);
      expect((result as { count: number }).count).toBe(2);
    });

    it('includes query parameters', async () => {
      let searchParams: URLSearchParams | null = null;

      server.use(
        http.get(`${API_BASE}/admin/users`, ({ request }) => {
          searchParams = new URL(request.url).searchParams;
          return HttpResponse.json({ data: [], count: 0 });
        })
      );

      await adminService.getAdminUsers({
        skip: 10,
        limit: 20,
        search: 'test',
        user_type: 'OWNER',
      });

      expect(searchParams?.get('skip')).toBe('10');
      expect(searchParams?.get('limit')).toBe('20');
      expect(searchParams?.get('search')).toBe('test');
      expect(searchParams?.get('user_type')).toBe('OWNER');
    });
  });

  describe('getBlockMetrics', () => {
    it('fetches block metrics successfully', async () => {
      const result = await adminService.getBlockMetrics();

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('vehicles');
      expect(result).toHaveProperty('reservations');

      expect(result.users).toHaveProperty('total');
      expect(result.users).toHaveProperty('owners');
      expect(result.users).toHaveProperty('riders');

      expect(result.vehicles).toHaveProperty('total');
      expect(result.vehicles).toHaveProperty('free');

      expect(result.reservations).toHaveProperty('total');
      expect(result.reservations).toHaveProperty('pending');
    });

    it('includes filter parameters', async () => {
      let searchParams: URLSearchParams | null = null;

      server.use(
        http.get(`${API_BASE}/admin/metrics/blocks`, ({ request }) => {
          searchParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            users: {
              total: 0,
              owners: 0,
              riders: 0,
              logins: 0,
              online_last_30_days: 0,
              internal: 0,
              external: 0,
            },
            vehicles: { total: 0, draft: 0, free: 0, collected: 0, maintenance: 0, archived: 0 },
            reservations: {
              total: 0,
              pending: 0,
              confirmed: 0,
              collected: 0,
              completed: 0,
              cancelled: 0,
              maintenance: 0,
            },
          });
        })
      );

      await adminService.getBlockMetrics({
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        role: 'OWNER',
      });

      expect(searchParams?.get('date_start')).toBe('2024-01-01');
      expect(searchParams?.get('date_end')).toBe('2024-01-31');
      expect(searchParams?.get('role')).toBe('OWNER');
    });

    it('excludes ALL role from parameters', async () => {
      let searchParams: URLSearchParams | null = null;

      server.use(
        http.get(`${API_BASE}/admin/metrics/blocks`, ({ request }) => {
          searchParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            users: {
              total: 0,
              owners: 0,
              riders: 0,
              logins: 0,
              online_last_30_days: 0,
              internal: 0,
              external: 0,
            },
            vehicles: { total: 0, draft: 0, free: 0, collected: 0, maintenance: 0, archived: 0 },
            reservations: {
              total: 0,
              pending: 0,
              confirmed: 0,
              collected: 0,
              completed: 0,
              cancelled: 0,
              maintenance: 0,
            },
          });
        })
      );

      await adminService.getBlockMetrics({
        role: 'ALL',
      });

      expect(searchParams?.has('role')).toBe(false);
    });
  });

  describe('getSystemInfo', () => {
    it('fetches system info successfully', async () => {
      const result = await adminService.getSystemInfo();

      expect(result).toHaveProperty('backend_version');
      expect(result).toHaveProperty('api_version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('database');
      expect(result.database).toHaveProperty('status');
    });
  });

  describe('getSystemErrors', () => {
    it('fetches system errors successfully', async () => {
      const result = await adminService.getSystemErrors();

      expect(Array.isArray(result)).toBe(true);
    });

    it('includes query parameters', async () => {
      let searchParams: URLSearchParams | null = null;

      server.use(
        http.get(`${API_BASE}/admin/system/errors`, ({ request }) => {
          searchParams = new URL(request.url).searchParams;
          return HttpResponse.json([]);
        })
      );

      await adminService.getSystemErrors({
        _limit: 50,
        level: 'ERROR',
      });

      expect(searchParams?.get('_limit')).toBe('50');
      expect(searchParams?.get('level')).toBe('ERROR');
    });
  });

  describe('getRecentActivity', () => {
    it.skip('fetches recent activity successfully', async () => {
      // This test is skipped because the endpoint is deprecated
      const result = await adminService.getRecentActivity();

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('vehicles');
      expect(result).toHaveProperty('reservations');
      expect(Array.isArray(result.users)).toBe(true);
      expect(Array.isArray(result.vehicles)).toBe(true);
      expect(Array.isArray(result.reservations)).toBe(true);
    });
  });

  describe('getRecentUserActivities', () => {
    it('fetches recent user activities successfully', async () => {
      const result = await adminService.getRecentUserActivities();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('getRecentVehicleActivities', () => {
    it('fetches recent vehicle activities successfully', async () => {
      const result = await adminService.getRecentVehicleActivities();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('getRecentReservationActivities', () => {
    it('fetches recent reservation activities successfully', async () => {
      const result = await adminService.getRecentReservationActivities();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      server.use(
        http.patch(`${API_BASE}/users/1`, async ({ request }) => {
          const updates = await request.json();
          return HttpResponse.json({
            id: '1',
            email: 'test@example.com',
            is_active: true,
            is_superuser: false,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: new Date().toISOString(),
            ...updates,
          });
        })
      );

      const result = await adminService.updateUser('1', {
        full_name: 'Updated Name',
      });

      expect(result.id).toBe('1');
      expect(result.full_name).toBe('Updated Name');
    });
  });

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      const result = await adminService.deleteUser('1');

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('User deleted successfully');
    });

    it('throws error when user not found', async () => {
      server.use(
        http.delete(`${API_BASE}/users/999`, () => {
          return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
        })
      );

      await expect(adminService.deleteUser('999')).rejects.toThrow();
    });
  });

  describe('getUserMetrics', () => {
    it('fetches user metrics successfully', async () => {
      server.use(
        http.get(`${API_BASE}/admin/users/1/metrics`, () => {
          return HttpResponse.json({
            user_id: '1',
            total_bookings: 10,
            total_vehicles: 2,
            last_activity: '2024-01-15T00:00:00Z',
          });
        })
      );

      const result = await adminService.getUserMetrics('1');

      expect(result).toHaveProperty('user_id');
      expect(result.user_id).toBe('1');
    });
  });

  describe('Deprecated Methods', () => {
    it('getMetricsOverview falls back to getBlockMetrics', async () => {
      const result = await adminService.getMetricsOverview();

      expect(result).toHaveProperty('total_owners');
      expect(result).toHaveProperty('total_riders');
      expect(result).toHaveProperty('total_bookings');
      expect(result.total_owners).toBe(40);
      expect(result.total_riders).toBe(60);
    });

    it('getUserStats falls back to getBlockMetrics', async () => {
      const result = await adminService.getUserStats();

      expect(result).toHaveProperty('owners');
      expect(result).toHaveProperty('riders');
      expect(result).toHaveProperty('total');
      expect(result.owners).toBe(40);
      expect(result.riders).toBe(60);
      expect(result.total).toBe(100);
    });

    it('getBookingStats falls back to getBlockMetrics', async () => {
      const result = await adminService.getBookingStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('confirmed');
      expect(result.total).toBe(200);
      expect(result.pending).toBe(10);
      expect(result.confirmed).toBe(50);
    });
  });
});
