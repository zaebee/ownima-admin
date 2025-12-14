import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserEditModal } from './UserEditModal'
import { userService } from '../../services/users'
import { ToastProvider } from '../../contexts/ToastContext'
import type { User } from '../../types'
import type { components } from '../../types/api-generated'

type UserResponse = components['schemas']['User-Output']

// Mock user service
vi.mock('../../services/users', () => ({
  userService: {
    updateUser: vi.fn(),
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  full_name: 'Test User',
  is_active: true,
  is_superuser: false,
  is_beta_tester: false,
  role: 'OWNER',
  user_type: 'OWNER',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  currency: 'USD',
  language: 'en',
  location: 'New York',
}

const renderModal = (props: { isOpen: boolean; onClose: () => void; user: User | null }) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <UserEditModal {...props} />
      </ToastProvider>
    </QueryClientProvider>
  )
}

describe('UserEditModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      expect(screen.getByText('Edit User')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      renderModal({ isOpen: false, onClose: mockOnClose, user: mockUser })

      expect(screen.queryByText('Edit User')).not.toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument()
    })

    it('renders status toggles', () => {
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      expect(screen.getByText('Active Status')).toBeInTheDocument()
      expect(screen.getByText('Administrator')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })
  })

  describe('Form Initialization', () => {
    it('initializes form with user data', () => {
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const fullNameInput = screen.getByPlaceholderText('Enter full name') as HTMLInputElement
      const emailInput = screen.getByPlaceholderText('Enter email address') as HTMLInputElement

      expect(fullNameInput.value).toBe('Test User')
      expect(emailInput.value).toBe('test@example.com')
    })

    it('initializes booking_website_published as false', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      // Submit form to verify booking_website_published is included
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            booking_website_published: false,
          })
        )
      })
    })

    it('initializes with active status from user', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      // Submit to verify is_active is initialized correctly
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            is_active: true,
          })
        )
      })
    })

    it('initializes with superuser status from user', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      const superUser = { ...mockUser, is_superuser: true }
      renderModal({ isOpen: true, onClose: mockOnClose, user: superUser })

      // Submit to verify is_superuser is initialized correctly
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            is_superuser: true,
          })
        )
      })
    })

    it('initializes with currency and language from user', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            currency: 'USD',
            language: 'en',
          })
        )
      })
    })

    it('resets form when modal reopens with different user', async () => {
      const { rerender } = renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const emailInput = screen.getByPlaceholderText('Enter email address') as HTMLInputElement
      expect(emailInput.value).toBe('test@example.com')

      // Close and reopen with different user
      const newUser = { ...mockUser, id: '456', email: 'new@example.com' }
      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <ToastProvider>
            <UserEditModal isOpen={true} onClose={mockOnClose} user={newUser} />
          </ToastProvider>
        </QueryClientProvider>
      )

      await waitFor(() => {
        expect(emailInput.value).toBe('new@example.com')
      })
    })
  })

  describe('Form Input', () => {
    it('allows editing full name field', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const fullNameInput = screen.getByPlaceholderText('Enter full name') as HTMLInputElement
      await user.clear(fullNameInput)
      await user.type(fullNameInput, 'Updated Name')

      expect(fullNameInput.value).toBe('Updated Name')
    })

    it('allows editing email field', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const emailInput = screen.getByPlaceholderText('Enter email address') as HTMLInputElement
      await user.clear(emailInput)
      await user.type(emailInput, 'updated@example.com')

      expect(emailInput.value).toBe('updated@example.com')
    })

    it('toggles is_active status', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const activeLabel = screen.getByText('Active Status').closest('div')?.parentElement?.querySelector('label')

      // Toggle active status off
      await user.click(activeLabel!)

      // Submit form
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      // Verify is_active is now false
      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            is_active: false,
          })
        )
      })
    })

    it('toggles is_superuser status', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const superuserLabel = screen.getByText('Administrator').closest('div')?.parentElement?.querySelector('label')

      // Toggle superuser status on
      await user.click(superuserLabel!)

      // Submit form
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      // Verify is_superuser is now true
      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            is_superuser: true,
          })
        )
      })
    })
  })

  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const emailInput = screen.getByPlaceholderText('Enter email address')
      await user.clear(emailInput)
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('shows error when email is invalid', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const emailInput = screen.getByPlaceholderText('Enter email address')
      await user.clear(emailInput)
      await user.type(emailInput, 'invalid-email')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    })

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      // Trigger validation error
      const emailInput = screen.getByPlaceholderText('Enter email address')
      await user.clear(emailInput)
      await user.click(screen.getByRole('button', { name: /save changes/i }))
      expect(screen.getByText('Email is required')).toBeInTheDocument()

      // Start typing
      await user.type(emailInput, 't')

      // Error should be cleared
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('submits form with updated data', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'updated@example.com',
        full_name: 'Updated Name',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const fullNameInput = screen.getByPlaceholderText('Enter full name')
      const emailInput = screen.getByPlaceholderText('Enter email address')

      await user.clear(fullNameInput)
      await user.type(fullNameInput, 'Updated Name')
      await user.clear(emailInput)
      await user.type(emailInput, 'updated@example.com')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith('123', {
          email: 'updated@example.com',
          full_name: 'Updated Name',
          is_active: true,
          is_superuser: false,
          is_beta_tester: false,
          role: 'OWNER',
          currency: 'USD',
          language: 'en',
          location: 'New York',
          booking_website_published: false,
        })
      })
    })

    it('includes booking_website_published field in submission', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            booking_website_published: false,
          })
        )
      })
    })

    it('closes modal on successful update', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('removes empty full_name before submission', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      const fullNameInput = screen.getByPlaceholderText('Enter full name')
      await user.clear(fullNameInput)

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            full_name: null,
          })
        )
      })
    })

    it('does not submit if user is null', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)

      renderModal({ isOpen: true, onClose: mockOnClose, user: null })

      // Try to submit (button may not be visible, but we can still test the logic)
      const form = screen.queryByRole('form')
      if (form) {
        await user.click(screen.getByRole('button', { name: /save changes/i }))
      }

      expect(mockUpdateUser).not.toHaveBeenCalled()
    })
  })

  describe('Cancel Action', () => {
    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not close while update is pending', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockImplementation(
        () => new Promise<UserResponse>((resolve) => setTimeout(() => resolve({ id: '123' } as UserResponse), 100))
      )

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      // Try to cancel while pending
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    it('disables buttons while submitting', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockImplementation(
        () => new Promise<UserResponse>((resolve) => setTimeout(() => resolve({ id: '123' } as UserResponse), 100))
      )

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      // Buttons should be disabled during submission
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalled()
      })
    })
  })

  describe('Toast Notifications', () => {
    it('shows success toast on successful update', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as UserResponse)

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText('User updated')).toBeInTheDocument()
      })
    })

    it('shows error toast on failed update', async () => {
      const user = userEvent.setup()
      const mockUpdateUser = vi.mocked(userService.updateUser)
      mockUpdateUser.mockRejectedValue(new Error('Update failed'))

      renderModal({ isOpen: true, onClose: mockOnClose, user: mockUser })

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument()
      })
    })
  })
})
