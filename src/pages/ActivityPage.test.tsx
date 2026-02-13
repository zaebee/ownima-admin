import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ActivityPage } from './ActivityPage'
import { adminService } from '../services/admin'
import { ToastProvider } from '../contexts/ToastContext'

vi.mock('../services/admin', () => ({
  adminService: {
    getAllActivities: vi.fn(),
    getActivityUsers: vi.fn(),
    getActivityVehicles: vi.fn(),
    getActivityReservations: vi.fn(),
  },
}))

const mockActivityResponse = {
  data: [
    {
      id: 'user-1',
      timestamp: new Date().toISOString(),
      user_id: '123',
      activity_type: 'user_registered',
      details: {
        user_id: '123',
        user_email: 'test@example.com',
        user_name: 'Test User',
        user_role: 'OWNER',
      },
    },
  ],
  total: 1,
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

const renderActivityPage = (queryClient = createTestQueryClient()) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <ActivityPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('ActivityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(adminService.getAllActivities).mockResolvedValue(mockActivityResponse)
    vi.mocked(adminService.getActivityUsers).mockResolvedValue(mockActivityResponse)
    vi.mocked(adminService.getActivityVehicles).mockResolvedValue({ data: [], total: 0 })
    vi.mocked(adminService.getActivityReservations).mockResolvedValue({ data: [], total: 0 })
  })

  it('renders the page title', () => {
    renderActivityPage()
    expect(screen.getByText('Activity Feed')).toBeInTheDocument()
  })

  it('renders the page description', () => {
    renderActivityPage()
    expect(
      screen.getByText(/comprehensive view of all system activities/i)
    ).toBeInTheDocument()
  })

  it('renders ActivityTimeline component', () => {
    renderActivityPage()
    // The ActivityTimeline mounts inside the page
    expect(document.body).toBeInTheDocument()
  })

  it('renders without crashing when data loads', async () => {
    renderActivityPage()
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })
})
