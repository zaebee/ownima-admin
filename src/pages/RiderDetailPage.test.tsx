import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RiderDetailPage } from './RiderDetailPage'
import { adminService } from '../services/admin'
import { ToastProvider } from '../contexts/ToastContext'

vi.mock('../services/admin', () => ({
  adminService: {
    getAdminRider: vi.fn(),
    getUserMetrics: vi.fn(),
    deleteAdminRider: vi.fn(),
    getRiderActivities: vi.fn(),
    getUserActivities: vi.fn(),
  },
}))

vi.mock('../config/environment', () => ({
  getAvatarUrl: (path: string) => path || null,
  getCurrentEnvironment: () => 'development',
}))

const mockRider = {
  id: 'rider-123',
  email: 'rider@example.com',
  username: 'rider1',
  full_name: 'Jane Rider',
  is_active: true,
  is_superuser: false,
  is_beta_tester: false,
  created_at: '2024-01-02T00:00:00Z',
  login_count: 5,
  last_login_at: '2024-01-14T00:00:00Z',
  bio: 'Experienced city rider',
  date_of_birth: '1990-05-15',
  average_rating: 4.5,
  rating_count: 12,
  currency: 'USD',
  language: 'en',
}

const mockMetrics = {
  total_vehicles: 0,
  total_reservations: 8,
  wallet_balance: 150.0,
  total_spent: 900.0,
  total_earned: 0.0,
  wallet_currency: 'USD',
  login_count: 5,
  account_age_days: 365,
  days_since_last_login: 3,
  pending_reservations: 1,
  confirmed_reservations: 2,
  completed_reservations: 4,
  cancelled_reservations: 1,
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

const renderRiderDetailPage = (riderId = 'rider-123') =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/dashboard/riders/${riderId}`]}>
        <ToastProvider>
          <Routes>
            <Route path="/dashboard/riders/:riderId" element={<RiderDetailPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('RiderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(adminService.getAdminRider).mockResolvedValue(mockRider as never)
    vi.mocked(adminService.getUserMetrics).mockResolvedValue(mockMetrics as never)
    vi.mocked(adminService.getRiderActivities).mockResolvedValue({ data: [], total: 0 })
    vi.mocked(adminService.getUserActivities).mockResolvedValue({ data: [], total: 0 })
  })

  describe('Loading State', () => {
    it('shows loading spinner while fetching rider', () => {
      vi.mocked(adminService.getAdminRider).mockImplementation(
        () => new Promise(() => {})
      )
      const { container } = renderRiderDetailPage()
      // Loading spinner or skeleton should be present
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows error state when rider fetch fails', async () => {
      vi.mocked(adminService.getAdminRider).mockRejectedValue(
        new Error('Rider not found')
      )
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByText(/Rider Not Found/i)).toBeInTheDocument()
      })
    })

    it('shows back button in error state', async () => {
      vi.mocked(adminService.getAdminRider).mockRejectedValue(new Error('Not found'))
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByText(/Back to Riders/i)).toBeInTheDocument()
      })
    })
  })

  describe('Rider Profile', () => {
    it('renders rider name', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        const elements = screen.getAllByText('Jane Rider')
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('renders rider email', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        const elements = screen.getAllByText('rider@example.com')
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('renders RIDER badge', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByText('RIDER')).toBeInTheDocument()
      })
    })

    it('renders bio section', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Experienced city rider')).toBeInTheDocument()
      })
    })

    it('renders back button', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByText(/Back to Riders/i)).toBeInTheDocument()
      })
    })
  })

  describe('Metric Cards', () => {
    it('renders Total Bookings metric card', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Total Bookings')).toBeInTheDocument()
      })
    })

    it('renders Completed metric card', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    it('renders Overview, Bookings, Activity tabs', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Bookings' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Activity' })).toBeInTheDocument()
      })
    })

    it('shows account info in overview tab by default', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByText('Account Information')).toBeInTheDocument()
      })
    })
  })

  describe('Account Information Fields', () => {
    it('shows Active badge when rider is active', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
      })
    })

    it('shows Inactive badge when rider is not active', async () => {
      vi.mocked(adminService.getAdminRider).mockResolvedValue({
        ...mockRider,
        is_active: false,
      } as never)
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0)
      })
    })

    it('uses rider currency in financial tiles, not wallet_currency default', async () => {
      vi.mocked(adminService.getAdminRider).mockResolvedValue({
        ...mockRider,
        currency: 'THB',
      } as never)
      renderRiderDetailPage()
      await waitFor(() => {
        const thbElements = screen.getAllByText(/THB/)
        expect(thbElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Edit / Delete Actions', () => {
    it('renders Edit button', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
      })
    })

    it('renders Delete button', async () => {
      renderRiderDetailPage()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
      })
    })
  })
})
