import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { adminService } from '../services/admin';

// Mock admin service
vi.mock('../services/admin', () => ({
  adminService: {
    getBlockMetrics: vi.fn(),
  },
}));

const mockBlockMetrics = {
  users: {
    total: 1250,
    online_last_30_days: 890,
    internal: 45,
    external: 1205,
    owners: 620,
    riders: 630,
    logins: 3420,
  },
  vehicles: {
    total: 450,
    draft: 12,
    free: 180,
    collected: 95,
    maintenance: 8,
    archived: 155,
  },
  reservations: {
    total: 2340,
    pending: 23,
    confirmed: 145,
    collected: 95,
    completed: 2050,
    cancelled: 22,
    maintenance: 5,
  },
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderDashboardPage = (queryClient = createTestQueryClient()) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows skeleton loaders while fetching data', () => {
      vi.mocked(adminService.getBlockMetrics).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = renderDashboardPage();

      // Check for skeleton loaders (animated pulse elements)
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not show content while loading', () => {
      vi.mocked(adminService.getBlockMetrics).mockImplementation(() => new Promise(() => {}));

      renderDashboardPage();

      expect(screen.queryByText('Ownima Admin Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when data fetch fails', async () => {
      vi.mocked(adminService.getBlockMetrics).mockRejectedValue(new Error('Network error'));

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      vi.mocked(adminService.getBlockMetrics).mockRejectedValue(new Error('Network error'));

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('does not show content on error', async () => {
      vi.mocked(adminService.getBlockMetrics).mockRejectedValue(new Error('Network error'));

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      expect(screen.queryByText('Ownima Admin Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Successful Data Load', () => {
    beforeEach(() => {
      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(mockBlockMetrics);
    });

    it('renders dashboard header', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Ownima Admin Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText(/Monitor your platform's key metrics/i)).toBeInTheDocument();
    });

    it('shows live data indicator', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/Live data - Updates every 30 seconds/i)).toBeInTheDocument();
      });
    });

    it('renders filter panel', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Ownima Admin Dashboard')).toBeInTheDocument();
      });

      // FilterPanel should be rendered (check for common filter elements)
      // Note: Actual FilterPanel content depends on its implementation
    });
  });

  describe('Owner and Rider Metrics Blocks', () => {
    beforeEach(() => {
      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(mockBlockMetrics);
    });

    it('displays Owners block title', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Owners' })).toBeInTheDocument();
      });
    });

    it('displays Riders block title', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Riders' })).toBeInTheDocument();
      });
    });
    it('displays total vehicle owners metric', async () => {
      renderDashboardPage();

      await waitFor(async () => {
        const ownersHeading = await screen.findByRole('heading', { name: 'Owners' });
        const ownersContainer = ownersHeading.closest('div[class*="rounded-2xl"]');
        expect(within(ownersContainer!).getByText('Total Vehicle Owners')).toBeInTheDocument();
        // 620 appears twice in the Owners block (total and new), so use getAllByText
        expect(within(ownersContainer!).getAllByText('620').length).toBeGreaterThan(0);
      });
    });

    it('displays avg. vehicles per owner metric', async () => {
      renderDashboardPage();

      await waitFor(async () => {
        const ownersHeading = await screen.findByRole('heading', { name: 'Owners' });
        const ownersContainer = ownersHeading.closest('div[class*="rounded-2xl"]');
        expect(within(ownersContainer!).getByText('Avg. Vehicles per Owner')).toBeInTheDocument();
        // 450 vehicles / 620 owners = 0.725... rounded to 1 decimal place
        expect(within(ownersContainer!).getByText('0.7')).toBeInTheDocument();
      });
    });

    it('displays new owners metric', async () => {
      renderDashboardPage();

      await waitFor(async () => {
        const ownersHeading = await screen.findByRole('heading', { name: 'Owners' });
        const ownersContainer = ownersHeading.closest('div[class*="rounded-2xl"]');
        expect(within(ownersContainer!).getByText('New Owners (in range)')).toBeInTheDocument();
        // 620 appears twice in the Owners block (total and new), so use getAllByText
        expect(within(ownersContainer!).getAllByText('620').length).toBeGreaterThan(0);
      });
    });

    it('displays total riders metric', async () => {
      renderDashboardPage();

      await waitFor(async () => {
        const ridersHeading = await screen.findByRole('heading', { name: 'Riders' });
        const ridersContainer = ridersHeading.closest('div[class*="rounded-2xl"]');
        expect(within(ridersContainer!).getByText('Total Riders')).toBeInTheDocument();
        // 630 appears twice in the Riders block (total and new), so use getAllByText
        expect(within(ridersContainer!).getAllByText('630').length).toBeGreaterThan(0);
      });
    });

    it('displays avg. bookings per rider metric', async () => {
      renderDashboardPage();

      await waitFor(async () => {
        const ridersHeading = await screen.findByRole('heading', { name: 'Riders' });
        const ridersContainer = ridersHeading.closest('div[class*="rounded-2xl"]');
        expect(within(ridersContainer!).getByText('Avg. Bookings per Rider')).toBeInTheDocument();
        // 2340 reservations / 630 riders = 3.71...
        expect(within(ridersContainer!).getByText('3.7')).toBeInTheDocument();
      });
    });

    it('displays new riders metric', async () => {
      renderDashboardPage();

      await waitFor(async () => {
        const ridersHeading = await screen.findByRole('heading', { name: 'Riders' });
        const ridersContainer = ridersHeading.closest('div[class*="rounded-2xl"]');
        expect(within(ridersContainer!).getByText('New Riders (in range)')).toBeInTheDocument();
        // 630 appears twice in the Riders block (total and new), so use getAllByText
        expect(within(ridersContainer!).getAllByText('630').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Vehicle Metrics Block', () => {
    beforeEach(() => {
      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(mockBlockMetrics);
    });

    it('displays Vehicles block title', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Vehicles')).toBeInTheDocument();
      });
    });

    it('displays total vehicles metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Total Vehicles')).toBeInTheDocument();
        expect(screen.getByText('450')).toBeInTheDocument();
      });
    });

    it('displays draft vehicles metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Draft Status')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
      });
    });

    it('displays available vehicles metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('180')).toBeInTheDocument();
      });
    });

    it('displays rented vehicles metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Currently Rented')).toBeInTheDocument();
        // Note: 95 appears multiple times (vehicles collected and reservations collected)
        expect(screen.getAllByText('95').length).toBeGreaterThan(0);
      });
    });

    it('displays maintenance vehicles metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Under Maintenance')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
      });
    });

    it('displays archived vehicles metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Archived')).toBeInTheDocument();
        expect(screen.getByText('155')).toBeInTheDocument();
      });
    });
  });

  describe('Reservation Metrics Block', () => {
    beforeEach(() => {
      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(mockBlockMetrics);
    });

    it('displays Reservations block title', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Reservations')).toBeInTheDocument();
      });
    });

    it('displays total reservations metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Total Reservations')).toBeInTheDocument();
        expect(screen.getByText('2,340')).toBeInTheDocument();
      });
    });

    it('displays pending reservations metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Pending Approval')).toBeInTheDocument();
        expect(screen.getByText('23')).toBeInTheDocument();
      });
    });

    it('displays confirmed reservations metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Confirmed')).toBeInTheDocument();
        expect(screen.getByText('145')).toBeInTheDocument();
      });
    });

    it('displays active rentals metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Active Rentals')).toBeInTheDocument();
        // Note: 95 appears multiple times
        expect(screen.getAllByText('95').length).toBeGreaterThan(0);
      });
    });

    it('displays completed reservations metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('2,050')).toBeInTheDocument();
      });
    });

    it('displays cancelled reservations metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Cancelled')).toBeInTheDocument();
        expect(screen.getByText('22')).toBeInTheDocument();
      });
    });

    it('displays maintenance reservations metric', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Maintenance')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(mockBlockMetrics);
    });

    it('displays Quick Actions section', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });
    });

    it('displays User Management action', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('View and manage all platform users')).toBeInTheDocument();
      });
    });

    it('displays Vehicle Management action', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Vehicle Management')).toBeInTheDocument();
        expect(screen.getByText('Manage vehicle fleet and status')).toBeInTheDocument();
      });
    });

    it('displays System Monitoring action', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('System Monitoring')).toBeInTheDocument();
        expect(screen.getByText('View system status and logs')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('calls getBlockMetrics on mount', async () => {
      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(mockBlockMetrics);

      renderDashboardPage();

      await waitFor(() => {
        expect(adminService.getBlockMetrics).toHaveBeenCalled();
      });
    });

    it('passes filters to getBlockMetrics', async () => {
      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(mockBlockMetrics);

      renderDashboardPage();

      await waitFor(() => {
        expect(adminService.getBlockMetrics).toHaveBeenCalledWith(
          expect.objectContaining({
            dateRange: expect.any(Object),
            role: 'ALL',
          })
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero values in metrics', async () => {
      const zeroMetrics = {
        users: {
          total: 0,
          online_last_30_days: 0,
          internal: 0,
          external: 0,
          owners: 0,
          riders: 0,
          logins: 0,
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
      };

      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(zeroMetrics);

      renderDashboardPage();

      await waitFor(() => {
        // New block-based dashboard doesn't have "Total Users", but has "Total Vehicle Owners"
        expect(screen.getByText('Total Vehicle Owners')).toBeInTheDocument();
        // Multiple zeros will appear
        expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      });
    });

    it('handles very large numbers in metrics', async () => {
      const largeMetrics = {
        users: {
          total: 999999,
          online_last_30_days: 890,
          internal: 45,
          external: 1205,
          owners: 999999,
          riders: 630,
          logins: 3420,
        },
        vehicles: {
          total: 450,
          draft: 12,
          free: 180,
          collected: 95,
          maintenance: 8,
          archived: 155,
        },
        reservations: {
          total: 2340,
          pending: 23,
          confirmed: 145,
          collected: 95,
          completed: 2050,
          cancelled: 22,
          maintenance: 5,
        },
      };

      vi.mocked(adminService.getBlockMetrics).mockResolvedValue(largeMetrics);

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Total Vehicle Owners')).toBeInTheDocument();
        // 999,999 appears multiple times (total and new owners), so use getAllByText
        expect(screen.getAllByText('999,999').length).toBeGreaterThan(0);
      });
    });
  });
});
