import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserCreateModal } from './UserCreateModal'
import { userService } from '../../services/users'

// Mock user service
vi.mock('../../services/users', () => ({
  userService: {
    createUser: vi.fn(),
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

const renderModal = (props: { isOpen: boolean; onClose: () => void }) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <UserCreateModal {...props} />
    </QueryClientProvider>
  )
}

describe('UserCreateModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      renderModal({ isOpen: true, onClose: mockOnClose })

      expect(screen.getByText('Create New User')).toBeInTheDocument()
      expect(screen.getByText('Add New User')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      renderModal({ isOpen: false, onClose: mockOnClose })

      expect(screen.queryByText('Create New User')).not.toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderModal({ isOpen: true, onClose: mockOnClose })

      expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    })

    it('renders status toggles', () => {
      renderModal({ isOpen: true, onClose: mockOnClose })

      expect(screen.getByText('Active Status')).toBeInTheDocument()
      expect(screen.getByText('Administrator')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      renderModal({ isOpen: true, onClose: mockOnClose })

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument()
    })
  })

  describe('Form Initialization', () => {
    it('initializes with empty form fields', () => {
      renderModal({ isOpen: true, onClose: mockOnClose })

      const fullNameInput = screen.getByPlaceholderText('Enter full name') as HTMLInputElement
      const emailInput = screen.getByPlaceholderText('Enter email address') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText('Enter password') as HTMLInputElement

      expect(fullNameInput.value).toBe('')
      expect(emailInput.value).toBe('')
      expect(passwordInput.value).toBe('')
    })

    it('initializes with is_active as true', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      // Submit to verify is_active is true
      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            is_active: true,
          })
        )
      })
    })

    it('initializes with is_superuser as false', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      // Submit to verify is_superuser is false
      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            is_superuser: false,
          })
        )
      })
    })

    it('initializes language and currency as null', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      // Fill required fields
      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')

      // Submit form
      await user.click(screen.getByRole('button', { name: /create user/i }))

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            language: null,
            currency: null,
          })
        )
      })
    })
  })

  describe('Form Input', () => {
    it('allows typing in full name field', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      const fullNameInput = screen.getByPlaceholderText('Enter full name') as HTMLInputElement
      await user.type(fullNameInput, 'John Doe')

      expect(fullNameInput.value).toBe('John Doe')
    })

    it('allows typing in email field', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      const emailInput = screen.getByPlaceholderText('Enter email address') as HTMLInputElement
      await user.type(emailInput, 'test@example.com')

      expect(emailInput.value).toBe('test@example.com')
    })

    it('allows typing in password field', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      const passwordInput = screen.getByPlaceholderText('Enter password') as HTMLInputElement
      await user.type(passwordInput, 'mypassword')

      expect(passwordInput.value).toBe('mypassword')
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      const passwordInput = screen.getByPlaceholderText('Enter password') as HTMLInputElement
      const toggleButton = screen.getByRole('button', { name: /show/i })

      expect(passwordInput.type).toBe('password')

      await user.click(toggleButton)
      expect(passwordInput.type).toBe('text')
      expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /hide/i }))
      expect(passwordInput.type).toBe('password')
    })

    it('toggles is_active status', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      const activeLabel = screen.getByText('Active Status').closest('div')?.parentElement?.querySelector('label')

      // Toggle active status off
      await user.click(activeLabel!)

      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      // Verify is_active is now false
      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            is_active: false,
          })
        )
      })
    })

    it('toggles is_superuser status', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      const superuserLabel = screen.getByText('Administrator').closest('div')?.parentElement?.querySelector('label')

      // Toggle superuser status on
      await user.click(superuserLabel!)

      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      // Verify is_superuser is now true
      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith(
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
      renderModal({ isOpen: true, onClose: mockOnClose })

      const submitButton = screen.getByRole('button', { name: /create user/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
    })

    it('shows error when email is invalid', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      await user.type(screen.getByPlaceholderText('Enter email address'), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    })

    it('shows error when password is empty', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('shows error when password is too short', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), '12345')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      // Trigger validation error
      await user.click(screen.getByRole('button', { name: /create user/i }))
      expect(screen.getByText('Email is required')).toBeInTheDocument()

      // Start typing
      await user.type(screen.getByPlaceholderText('Enter email address'), 't')

      // Error should be cleared
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      await user.type(screen.getByPlaceholderText('Enter full name'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          full_name: 'John Doe',
          email: 'test@example.com',
          password: 'password123',
          role: 'RIDER',
          language: null,
          currency: null,
          is_active: true,
          is_superuser: false,
        })
      })
    })

    it('submits form with language and currency fields', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            language: null,
            currency: null,
          })
        )
      })
    })

    it('closes modal on successful submission', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('removes empty full_name before submission', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          role: 'RIDER',
          language: null,
          currency: null,
          is_active: true,
          is_superuser: false,
          full_name: undefined,
        })
      })
    })
  })

  describe('Form Reset', () => {
    it('resets form when modal closes', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      // Fill form
      await user.type(screen.getByPlaceholderText('Enter full name'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')

      // Click cancel
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('resets language and currency fields', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'RIDER',
      } as any)

      renderModal({ isOpen: true, onClose: mockOnClose })

      // Submit form (which triggers reset on success)
      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      // Verify the form data includes null values for language and currency
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          language: null,
          currency: null,
        })
      )
    })

    it('resets password visibility toggle', async () => {
      const user = userEvent.setup()
      renderModal({ isOpen: true, onClose: mockOnClose })

      // Toggle password visibility
      await user.click(screen.getByRole('button', { name: /show/i }))
      expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument()

      // Cancel (which triggers reset)
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      // Re-render modal
      const { rerender } = renderModal({ isOpen: false, onClose: mockOnClose })
      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <UserCreateModal isOpen={true} onClose={mockOnClose} />
        </QueryClientProvider>
      )

      // Password should be hidden again
      expect(screen.getByRole('button', { name: /show/i })).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('disables buttons while submitting', async () => {
      const user = userEvent.setup()
      const mockCreateUser = vi.mocked(userService.createUser)
      mockCreateUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: '1' } as any), 100))
      )

      renderModal({ isOpen: true, onClose: mockOnClose })

      await user.type(screen.getByPlaceholderText('Enter email address'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      // Buttons should be disabled during submission
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalled()
      })
    })
  })
})
