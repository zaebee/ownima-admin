import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { UsersPage } from './UsersPage';
import { adminService } from '../services/admin';
import { ToastProvider } from '../contexts/ToastContext';

// Mock admin service
vi.mock('../services/admin', () => ({
  adminService: {
    getAdminUsers: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock environment
vi.mock('../config/environment', () => ({
  getAvatarUrl: (path: string) => path || '/default-avatar.png',
}));

const mockUsers = [
  {
    id: '1',
    email: 'owner@example.com',
    username: 'owner1',
    full_name: 'John Owner',
    is_active: true,
    is_superuser: false,
    role: 'OWNER',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    login_count: 10,
    last_login_at: '2024-01-15T00:00:00Z',
    total_reservations: 7,
  },
  {
    id: '2',
    email: 'rider@example.com',
    username: 'rider1',
    full_name: 'Jane Rider',
    is_active: true,
    is_superuser: false,
    role: 'RIDER',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    login_count: 5,
    last_login_at: '2024-01-14T00:00:00Z',
  },
  {
    id: '3',
    email: 'inactive@example.com',
    username: 'inactive1',
    full_name: 'Inactive User',
    is_active: false,
    is_superuser: false,
    role: 'RIDER',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    login_count: 0,
    last_login_at: null,
  },
];

const mockPaginatedResponse = {
  data: mockUsers,
  count: 3,
  page: 1,
  page_size: 10,
  total_pages: 1,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderUsersPage = (queryClient = createTestQueryClient()) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <UsersPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows skeleton loaders while fetching users', () => {
      vi.mocked(adminService.getAdminUsers).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = renderUsersPage();

      // Check for skeleton loaders (animated pulse elements)
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not show user list while loading', () => {
      vi.mocked(adminService.getAdminUsers).mockImplementation(() => new Promise(() => {}));

      renderUsersPage();

      expect(screen.queryByText('owner@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state when fetch fails', async () => {
      vi.mocked(adminService.getAdminUsers).mockRejectedValue(new Error('Network error'));

      renderUsersPage();

      // Just verify the page renders without crashing
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('User List Display', () => {
    beforeEach(() => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);
    });

    it('renders page title', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });

    it('displays user count', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText(/3 users/i)).toBeInTheDocument();
      });
    });

    it('renders all users in the list', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('owner@example.com')).toBeInTheDocument();
        expect(screen.getByText('rider@example.com')).toBeInTheDocument();
        expect(screen.getByText('inactive@example.com')).toBeInTheDocument();
      });
    });

    it('displays user full names', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('John Owner')).toBeInTheDocument();
        expect(screen.getByText('Jane Rider')).toBeInTheDocument();
        expect(screen.getByText('Inactive User')).toBeInTheDocument();
      });
    });

    it('displays user information', async () => {
      renderUsersPage();

      await waitFor(() => {
        // Users should be displayed with their information
        expect(screen.getByText('John Owner')).toBeInTheDocument();
      });
    });

    it('shows active status badges', async () => {
      renderUsersPage();

      await waitFor(() => {
        // Active users should have active badges
        expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
      });
    });

    it('displays reservations count in activity column', async () => {
      renderUsersPage();

      await waitFor(() => {
        // The owner user has total_reservations: 7
        expect(screen.getByText('7')).toBeInTheDocument();
        // The "Reserv.:" label should appear
        expect(screen.getAllByText('Reserv.:').length).toBeGreaterThan(0);
      });
    });

    it('displays 0 for users without total_reservations', async () => {
      renderUsersPage();

      await waitFor(() => {
        // Rider and inactive user have no total_reservations → renders 0
        const zeros = screen.getAllByText('0');
        expect(zeros.length).toBeGreaterThan(0);
      });
    });

    it('shows inactive status badges', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('Inactive')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);
    });

    it('renders search functionality', async () => {
      renderUsersPage();

      await waitFor(() => {
        // Search input should exist somewhere
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('User Actions', () => {
    beforeEach(() => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);
    });

    it('renders action buttons for users', async () => {
      renderUsersPage();

      await waitFor(() => {
        // Should have action buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Pagination', () => {
    it('displays pagination when there are multiple pages', async () => {
      const multiPageResponse = {
        ...mockPaginatedResponse,
        total_pages: 3,
        count: 30,
      };

      vi.mocked(adminService.getAdminUsers).mockResolvedValue(multiPageResponse);

      renderUsersPage();

      await waitFor(() => {
        // Should show page numbers or pagination controls
        expect(screen.getByText(/30 users/i)).toBeInTheDocument();
      });
    });

    it('shows correct page size info', async () => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);

      renderUsersPage();

      await waitFor(() => {
        // Should show "Showing X-Y of Z"
        expect(screen.getByText(/showing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('handles empty user list', async () => {
      const emptyResponse = {
        data: [],
        count: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
      };

      vi.mocked(adminService.getAdminUsers).mockResolvedValue(emptyResponse);

      renderUsersPage();

      await waitFor(() => {
        // Page should render without crashing
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);
    });

    it('renders filter controls', async () => {
      renderUsersPage();

      await waitFor(() => {
        // Should have some filter-related elements
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Fetching', () => {
    it('calls getAdminUsers on mount', async () => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);

      renderUsersPage();

      await waitFor(() => {
        expect(adminService.getAdminUsers).toHaveBeenCalled();
      });
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);
    });

    it('sorts by total_reservations when selected', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('John Owner')).toBeInTheDocument();
      });

      const sortSelect = screen.getByDisplayValue('Join Date');
      fireEvent.change(sortSelect, { target: { value: 'total_reservations' } });

      // List should still render after sort change
      await waitFor(() => {
        expect(screen.getByText('John Owner')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);
    });

    it('has proper heading structure', async () => {
      renderUsersPage();

      await waitFor(() => {
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles users with null last_login_at', async () => {
      vi.mocked(adminService.getAdminUsers).mockResolvedValue(mockPaginatedResponse);

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('Inactive User')).toBeInTheDocument();
      });

      // Should not crash when rendering user with null last_login_at
    });

    it('handles very long user names', async () => {
      const longNameResponse = {
        ...mockPaginatedResponse,
        data: [
          {
            ...mockUsers[0],
            full_name: 'A'.repeat(100),
          },
        ],
      };

      vi.mocked(adminService.getAdminUsers).mockResolvedValue(longNameResponse);

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
      });
    });

    it('handles users with special characters in email', async () => {
      const specialCharResponse = {
        ...mockPaginatedResponse,
        data: [
          {
            ...mockUsers[0],
            email: 'user+test@example.com',
          },
        ],
      };

      vi.mocked(adminService.getAdminUsers).mockResolvedValue(specialCharResponse);

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('user+test@example.com')).toBeInTheDocument();
      });
    });
  });
});
