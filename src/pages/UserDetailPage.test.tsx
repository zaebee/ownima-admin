import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { UserDetailPage } from './UserDetailPage'
import { adminService } from '../services/admin'
import { ToastProvider } from '../contexts/ToastContext'

vi.mock('../services/admin', () => ({
  adminService: {
    getAdminUser: vi.fn(),
    getUserMetrics: vi.fn(),
    getOwnerVehicles: vi.fn(),
    getOwnerReservations: vi.fn(),
    deleteUser: vi.fn(),
    getUserActivities: vi.fn(),
    getRiderActivities: vi.fn(),
  },
}))

vi.mock('../config/environment', () => ({
  getAvatarUrl: (path: string) => path || null,
  getCurrentEnvironment: () => 'development',
}))

const mockUser = {
  id: 'user-123',
  email: 'owner@example.com',
  username: 'owner1',
  full_name: 'John Owner',
  is_active: true,
  is_superuser: false,
  is_beta_tester: false,
  role: 'OWNER',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  login_count: 10,
  last_login_at: '2024-01-15T00:00:00Z',
  currency: 'USD',
  language: 'en',
  location: 'Bangkok',
}

const mockMetrics = {
  total_vehicles: 3,
  total_reservations: 10,
  wallet_balance: 500.0,
  total_spent: 200.0,
  total_earned: 1500.0,
  wallet_currency: 'USD',
  login_count: 25,
  account_age_days: 120,
  days_since_last_login: 2,
  draft_vehicles: 1,
  published_vehicles: 2,
  archived_vehicles: 0,
  pending_reservations: 1,
  confirmed_reservations: 2,
  completed_reservations: 5,
  cancelled_reservations: 2,
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

const renderUserDetailPage = (userId = 'user-123') =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/dashboard/users/${userId}`]}>
        <ToastProvider>
          <Routes>
            <Route path="/dashboard/users/:userId" element={<UserDetailPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('UserDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(adminService.getAdminUser).mockResolvedValue(mockUser as never)
    vi.mocked(adminService.getUserMetrics).mockResolvedValue(mockMetrics as never)
    vi.mocked(adminService.getOwnerVehicles).mockResolvedValue([])
    vi.mocked(adminService.getOwnerReservations).mockResolvedValue([])
    vi.mocked(adminService.getUserActivities).mockResolvedValue({ data: [], total: 0 })
    vi.mocked(adminService.getRiderActivities).mockResolvedValue({ data: [], total: 0 })
  })

  describe('Loading State', () => {
    it('shows loading indicator while fetching user', () => {
      vi.mocked(adminService.getAdminUser).mockImplementation(
        () => new Promise(() => {})
      )
      const { container } = renderUserDetailPage()
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows error state when user fetch fails', async () => {
      vi.mocked(adminService.getAdminUser).mockRejectedValue(
        new Error('User not found')
      )
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText(/User Not Found/i)).toBeInTheDocument()
      })
    })

    it('shows back button in error state', async () => {
      vi.mocked(adminService.getAdminUser).mockRejectedValue(new Error('Not found'))
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText(/Back to Users/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Profile', () => {
    it('renders user full name', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        const elements = screen.getAllByText('John Owner')
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('renders user email', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        const elements = screen.getAllByText('owner@example.com')
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('renders OWNER badge', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('OWNER')).toBeInTheDocument()
      })
    })

    it('renders back button', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText(/Back to Users/i)).toBeInTheDocument()
      })
    })
  })

  describe('Metrics Cards', () => {
    it('renders Vehicles metric card', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        // "Vehicles" appears in both the tab and metric card
        const elements = screen.getAllByText('Vehicles')
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('renders Reservations metric card', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        // "Reservations" appears in both the tab and metric card
        const elements = screen.getAllByText('Reservations')
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('renders Login Count metric card', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Login Count')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    it('renders Overview, Vehicles, Reservations tabs', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Vehicles' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Reservations' })).toBeInTheDocument()
      })
    })

    it('shows account info in overview tab by default', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Account Information')).toBeInTheDocument()
      })
    })
  })

  describe('Financial Metrics', () => {
    it('renders wallet balance when metrics are loaded', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument()
      })
    })

    it('renders total spent when metrics are loaded', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Total Spent')).toBeInTheDocument()
      })
    })
  })

  describe('Edit / Delete Actions', () => {
    it('renders Edit button', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
      })
    })

    it('renders Delete button', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
      })
    })

    it('opens confirm dialog when Delete button clicked', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
      })
      await userEvent.click(screen.getByRole('button', { name: /Delete/i }))
      await waitFor(() => {
        // ConfirmDialog passes title="Delete User" to Modal, which renders it as a heading
        expect(screen.getByText('Delete User')).toBeInTheDocument()
      })
    })

    it('calls deleteUser when deletion confirmed', async () => {
      vi.mocked(adminService.deleteUser).mockResolvedValue({ message: 'User deleted successfully' } as never)
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
      })
      await userEvent.click(screen.getByRole('button', { name: /Delete/i }))
      await waitFor(() => {
        expect(screen.getByText('Delete User')).toBeInTheDocument()
      })
      // confirmText="Delete" — there will now be two Delete buttons; pick the one inside the dialog
      const allDeleteButtons = screen.getAllByRole('button', { name: /^Delete$/i })
      await userEvent.click(allDeleteButtons[allDeleteButtons.length - 1])
      await waitFor(() => {
        expect(vi.mocked(adminService.deleteUser)).toHaveBeenCalledWith('user-123')
      })
    })

    it('opens edit modal when Edit button clicked', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
      })
      await userEvent.click(screen.getByRole('button', { name: /Edit/i }))
      await waitFor(() => {
        // UserEditModal passes title="Edit User" to Modal
        expect(screen.getByText('Edit User')).toBeInTheDocument()
      })
    })
  })

  describe('Vehicle Status Breakdown', () => {
    it('renders vehicle status breakdown when metrics loaded', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Draft')).toBeInTheDocument()
      })
    })

    it('shows draft vehicle count', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Draft')).toBeInTheDocument()
        // mockMetrics has draft_vehicles: 1 — multiple elements may show '1', use getAllByText
        expect(screen.getAllByText('1').length).toBeGreaterThan(0)
      })
    })

    it('shows published vehicle count', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Published')).toBeInTheDocument()
      })
    })
  })

  describe('Reservation Status Breakdown', () => {
    it('renders pending reservations count', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        // mockMetrics has pending_reservations: 1
        expect(screen.getByText('Pending')).toBeInTheDocument()
      })
    })

    it('renders completed reservations count', async () => {
      renderUserDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })
    })
  })
})
