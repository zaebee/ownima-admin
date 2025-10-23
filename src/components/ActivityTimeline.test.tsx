import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ActivityTimeline } from './ActivityTimeline';
import { adminService } from '../services/admin';
import type { Activity, PaginatedActivityResponse } from '../types';

// Mock admin service
vi.mock('../services/admin', () => ({
  adminService: {
    getActivityUsers: vi.fn(),
    getActivityVehicles: vi.fn(),
    getActivityReservations: vi.fn(),
    getAllActivities: vi.fn(),
  },
}));

// Helper to create mock activity
const createMockActivity = (
  overrides: Partial<Activity> = {}
): Activity => ({
  id: 'test-id',
  timestamp: new Date().toISOString(),
  user_id: 'user-123',
  activity_type: 'user_login',
  details: {
    user_id: 'user-123',
    user_email: 'test@example.com',
    user_name: 'Test User',
    user_role: 'OWNER' as const,
  },
  ...overrides,
});

// Helper to create mock paginated response
const createMockResponse = (
  activities: Activity[],
  total: number = activities.length
): PaginatedActivityResponse => ({
  data: activities,
  total,
});

const renderActivityTimeline = (props = {}) => {
  return render(
    <BrowserRouter>
      <ActivityTimeline {...props} />
    </BrowserRouter>
  );
};

describe('ActivityTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Helper Functions', () => {
    describe('getUserDisplayName', () => {
      it('returns "System" for system activities', () => {
        const systemActivity = createMockActivity({
          user_id: 'system',
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([systemActivity])
        );

        renderActivityTimeline();

        waitFor(() => {
          expect(screen.getByText('System')).toBeInTheDocument();
        });
      });

      it('returns user_name from details for regular users', () => {
        const userActivity = createMockActivity({
          details: {
            user_id: 'user-123',
            user_email: 'john@example.com',
            user_name: 'John Doe',
            user_role: 'OWNER',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([userActivity])
        );

        renderActivityTimeline();

        waitFor(() => {
          expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        });
      });

      it('returns "Unknown User" for missing user_name', () => {
        const activity = createMockActivity({
          details: {
            event_type: 'vehicle_created',
            vehicle_id: 'vehicle-123',
            entity_id: 'entity-123',
            user_id: 'user-123',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        waitFor(() => {
          expect(screen.getByText(/Unknown User/)).toBeInTheDocument();
        });
      });
    });

    describe('formatTimestamp', () => {
      it('shows relative time for activities < 24 hours old', async () => {
        const recentActivity = createMockActivity({
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([recentActivity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
        });
      });

      it('shows exact date for activities >= 24 hours old', async () => {
        const oldActivity = createMockActivity({
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([oldActivity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          // Should show month and day instead of relative time
          const timestampElements = screen.getAllByText(/\w+\s+\d+/); // e.g., "Oct 23"
          expect(timestampElements.length).toBeGreaterThan(0);
        });
      });
    });

    describe('formatActivityMessage', () => {
      it('formats user_registered message correctly', async () => {
        const activity = createMockActivity({
          activity_type: 'user_registered',
          details: {
            user_id: 'user-123',
            user_email: 'john@example.com',
            user_name: 'John Doe',
            user_role: 'OWNER',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/John Doe registered as OWNER/i)).toBeInTheDocument();
        });
      });

      it('formats user_login with login count', async () => {
        const activity = createMockActivity({
          activity_type: 'user_login',
          details: {
            user_id: 'user-123',
            user_email: 'john@example.com',
            user_name: 'John Doe',
            user_role: 'OWNER',
            login_count: 5,
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/John Doe logged in \(5 logins\)/i)).toBeInTheDocument();
        });
      });

      it('formats vehicle_created message', async () => {
        const activity = createMockActivity({
          activity_type: 'vehicle_created',
          details: {
            event_type: 'vehicle_created',
            vehicle_id: 'vehicle-123',
            name: 'Tesla Model 3',
            status: 'draft' as const,
            entity_id: 'entity-123',
            user_id: 'user-123',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/Tesla Model 3 created by owner/i)).toBeInTheDocument();
        });
      });

      it('formats reservation_created with price', async () => {
        const activity = createMockActivity({
          activity_type: 'reservation_created',
          details: {
            event_type: 'reservation_created',
            reservation_id: 'reservation-123',
            status: 'pending' as const,
            total_price: 250.0,
            entity_id: 'entity-123',
            user_id: 'user-123',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/New booking for €250/i)).toBeInTheDocument();
        });
      });

      it('shows fallback message for unknown activity types', async () => {
        const activity = createMockActivity({
          activity_type: 'unknown_activity_type' as any,
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/Unknown Activity Type/i)).toBeInTheDocument();
        });
      });
    });

    describe('getEntityUrl', () => {
      it('generates vehicle URL for vehicle activities', async () => {
        const activity = createMockActivity({
          activity_type: 'vehicle_created',
          details: {
            event_type: 'vehicle_created',
            vehicle_id: 'vehicle-123',
            name: 'Tesla Model 3',
            entity_id: 'entity-123',
            user_id: 'user-123',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          const link = screen.getByText('View Details →');
          expect(link).toHaveAttribute('href', '/dashboard/vehicles/vehicle-123');
        });
      });

      it('generates reservation URL for reservation activities', async () => {
        const activity = createMockActivity({
          activity_type: 'reservation_created',
          details: {
            event_type: 'reservation_created',
            reservation_id: 'reservation-123',
            status: 'pending' as const,
            total_price: 250.0,
            entity_id: 'entity-123',
            user_id: 'user-123',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          const link = screen.getByText('View Details →');
          expect(link).toHaveAttribute('href', '/dashboard/reservations/reservation-123');
        });
      });

      it('generates user URL for user activities', async () => {
        const activity = createMockActivity({
          activity_type: 'user_registered',
          details: {
            user_id: 'user-123',
            user_email: 'john@example.com',
            user_name: 'John Doe',
            user_role: 'OWNER',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          const link = screen.getByText('View Details →');
          expect(link).toHaveAttribute('href', '/dashboard/users/user-123');
        });
      });

      it('does not show link when entity ID is missing', async () => {
        const activity = createMockActivity({
          activity_type: 'vehicle_created',
          details: {
            event_type: 'vehicle_created',
            name: 'Tesla Model 3',
            entity_id: 'entity-123',
            user_id: 'user-123',
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.queryByText('View Details →')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Component Behavior', () => {
    describe('Initial Load', () => {
      it('fetches activities on mount with default category "all"', async () => {
        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(adminService.getAllActivities).toHaveBeenCalledWith(0, 25);
        });
      });

      it('fetches activities with specified category', async () => {
        vi.mocked(adminService.getActivityUsers).mockResolvedValue(
          createMockResponse([])
        );

        renderActivityTimeline({ category: 'users' });

        await waitFor(() => {
          expect(adminService.getActivityUsers).toHaveBeenCalledWith(0, 25);
        });
      });

      it('uses custom initial limit when provided', async () => {
        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([])
        );

        renderActivityTimeline({ initialLimit: 50 });

        await waitFor(() => {
          expect(adminService.getAllActivities).toHaveBeenCalledWith(0, 50);
        });
      });

      it('displays loading state during initial fetch', () => {
        vi.mocked(adminService.getAllActivities).mockImplementation(
          () => new Promise(() => {}) // Never resolves
        );

        const { container } = renderActivityTimeline();

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });

      it('displays activities after successful fetch', async () => {
        const activities = [
          createMockActivity({
            id: '1',
            activity_type: 'user_login',
            details: {
              user_id: 'user-123',
              user_email: 'john@example.com',
              user_name: 'John Doe',
              user_role: 'OWNER',
            },
          }),
          createMockActivity({
            id: '2',
            activity_type: 'vehicle_created',
            details: {
              event_type: 'vehicle_created',
              vehicle_id: 'vehicle-123',
              name: 'Tesla Model 3',
              entity_id: 'entity-123',
              user_id: 'user-123',
            },
          }),
        ];

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse(activities)
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/John Doe logged in/i)).toBeInTheDocument();
          expect(screen.getByText(/Tesla Model 3 created/i)).toBeInTheDocument();
        });
      });
    });

    describe('Category Switching', () => {
      it('resets skip and activities when switching categories', async () => {
        const userActivities = [createMockActivity({ id: 'user-1', activity_type: 'user_login' })];
        const vehicleActivities = [createMockActivity({ id: 'vehicle-1', activity_type: 'vehicle_created' })];

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse(userActivities)
        );
        vi.mocked(adminService.getActivityVehicles).mockResolvedValue(
          createMockResponse(vehicleActivities)
        );

        const user = userEvent.setup();
        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/logged in/i)).toBeInTheDocument();
        });

        // Click on Vehicles tab
        const vehiclesTab = screen.getByText('Vehicles');
        await user.click(vehiclesTab);

        await waitFor(() => {
          expect(adminService.getActivityVehicles).toHaveBeenCalledWith(0, 25);
          expect(screen.getByText(/created/i)).toBeInTheDocument();
        });
      });

      it('clears previous activities when switching categories', async () => {
        const allActivities = [createMockActivity({ id: 'all-1' })];
        const userActivities = [createMockActivity({ id: 'user-1' })];

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse(allActivities)
        );
        vi.mocked(adminService.getActivityUsers).mockResolvedValue(
          createMockResponse(userActivities)
        );

        const user = userEvent.setup();
        renderActivityTimeline();

        await waitFor(() => {
          expect(adminService.getAllActivities).toHaveBeenCalled();
        });

        const usersTab = screen.getByText('Users');
        await user.click(usersTab);

        await waitFor(() => {
          expect(adminService.getActivityUsers).toHaveBeenCalledWith(0, 25);
        });
      });
    });

    describe('Pagination', () => {
      it('shows "Load More" button when hasMore is true', async () => {
        const activities = Array(25).fill(null).map((_, i) =>
          createMockActivity({ id: `activity-${i}` })
        );

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse(activities, 50) // total is 50, so more available
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText('Load More')).toBeInTheDocument();
        });
      });

      it('hides "Load More" button when no more activities', async () => {
        const activities = Array(10).fill(null).map((_, i) =>
          createMockActivity({ id: `activity-${i}` })
        );

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse(activities, 10) // Only 10 activities returned (less than limit)
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.queryByText('Load More')).not.toBeInTheDocument();
        });
      });

      it('loads more activities when "Load More" is clicked', async () => {
        const initialActivities = Array(25).fill(null).map((_, i) =>
          createMockActivity({ id: `initial-${i}` })
        );
        const moreActivities = Array(25).fill(null).map((_, i) =>
          createMockActivity({ id: `more-${i}` })
        );

        vi.mocked(adminService.getAllActivities)
          .mockResolvedValueOnce(createMockResponse(initialActivities, 50))
          .mockResolvedValueOnce(createMockResponse(moreActivities, 50));

        const user = userEvent.setup();
        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText('Load More')).toBeInTheDocument();
        });

        const loadMoreButton = screen.getByText('Load More');
        await user.click(loadMoreButton);

        await waitFor(() => {
          // Second call should have skip=25
          expect(adminService.getAllActivities).toHaveBeenCalledWith(25, 25);
        });
      });

      it('appends new activities without removing old ones', async () => {
        const initialActivities = [
          createMockActivity({ id: '1', activity_type: 'user_login' }),
        ];
        const moreActivities = [
          createMockActivity({ id: '2', activity_type: 'vehicle_created' }),
        ];

        vi.mocked(adminService.getAllActivities)
          .mockResolvedValueOnce(createMockResponse(initialActivities, 50))
          .mockResolvedValueOnce(createMockResponse(moreActivities, 50));

        const user = userEvent.setup();
        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/logged in/i)).toBeInTheDocument();
        });

        const loadMoreButton = screen.getByText('Load More');
        await user.click(loadMoreButton);

        await waitFor(() => {
          // Both activities should be visible
          expect(screen.getByText(/logged in/i)).toBeInTheDocument();
          expect(screen.getByText(/created/i)).toBeInTheDocument();
        });
      });

      it('disables "Load More" button while loading', async () => {
        const activities = Array(25).fill(null).map((_, i) =>
          createMockActivity({ id: `activity-${i}` })
        );

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse(activities, 50)
        );

        const user = userEvent.setup();
        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText('Load More')).toBeInTheDocument();
        });

        const loadMoreButton = screen.getByText('Load More');

        // Start clicking but don't wait
        vi.mocked(adminService.getAllActivities).mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(createMockResponse([])), 100))
        );

        await user.click(loadMoreButton);

        // Button should be disabled during loading
        expect(loadMoreButton).toBeDisabled();
      });
    });

    describe('Error Handling', () => {
      it('displays error message when fetch fails', async () => {
        vi.mocked(adminService.getAllActivities).mockRejectedValue(
          new Error('Network error')
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/Failed to load activities/i)).toBeInTheDocument();
        });
      });

      it('retains previously loaded activities on pagination error', async () => {
        const initialActivities = [
          createMockActivity({ id: '1', activity_type: 'user_login' }),
        ];

        vi.mocked(adminService.getAllActivities)
          .mockResolvedValueOnce(createMockResponse(initialActivities, 50))
          .mockRejectedValueOnce(new Error('Network error'));

        const user = userEvent.setup();
        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/logged in/i)).toBeInTheDocument();
        });

        const loadMoreButton = screen.getByText('Load More');
        await user.click(loadMoreButton);

        await waitFor(() => {
          // Original activity should still be visible
          expect(screen.getByText(/logged in/i)).toBeInTheDocument();
          // Error message should be displayed
          expect(screen.getByText(/Failed to load activities/i)).toBeInTheDocument();
        });
      });
    });

    describe('Empty State', () => {
      it('shows empty state message when no activities', async () => {
        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/No activities yet/i)).toBeInTheDocument();
        });
      });
    });

    describe('Activity Display', () => {
      it('renders activity icons correctly', async () => {
        const activity = createMockActivity({
          activity_type: 'user_login',
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        const { container } = renderActivityTimeline();

        await waitFor(() => {
          // Check that an SVG icon is rendered
          const icon = container.querySelector('svg');
          expect(icon).toBeInTheDocument();
        });
      });

      it('displays changes for activities with changes field', async () => {
        const activity = createMockActivity({
          activity_type: 'vehicle_updated',
          details: {
            event_type: 'vehicle_updated',
            vehicle_id: 'vehicle-123',
            name: 'Tesla Model 3',
            entity_id: 'entity-123',
            user_id: 'user-123',
            changes: {
              status: { from: 'draft', to: 'free' },
              price: { from: 100, to: 150 },
            },
          },
        });

        vi.mocked(adminService.getAllActivities).mockResolvedValue(
          createMockResponse([activity])
        );

        renderActivityTimeline();

        await waitFor(() => {
          expect(screen.getByText(/status:/i)).toBeInTheDocument();
          expect(screen.getByText(/price:/i)).toBeInTheDocument();
          expect(screen.getByText('draft')).toBeInTheDocument();
          expect(screen.getByText('free')).toBeInTheDocument();
        });
      });
    });
  });
});
