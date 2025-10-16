import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { AuthContext } from '../contexts/AuthContext'
import type { AuthContextType } from '../contexts/AuthContext'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  token: null,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  ...overrides,
})

const renderLoginPage = (authContext: AuthContextType = mockAuthContext()) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContext}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the login form', () => {
      renderLoginPage()

      expect(screen.getByText('Ownima Admin')).toBeInTheDocument()
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to access your admin dashboard')).toBeInTheDocument()
    })

    it('renders username input field', () => {
      renderLoginPage()

      const usernameInput = screen.getByLabelText(/username or email/i)
      expect(usernameInput).toBeInTheDocument()
      expect(usernameInput).toHaveAttribute('type', 'text')
      expect(usernameInput).toHaveAttribute('required')
    })

    it('renders password input field', () => {
      renderLoginPage()

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
    })

    it('renders submit button', () => {
      renderLoginPage()

      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('renders branding elements', () => {
      renderLoginPage()

      expect(screen.getByText('Manage your platform with confidence')).toBeInTheDocument()
      expect(screen.getByText(/secure admin access/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('disables submit button when username is empty', () => {
      renderLoginPage()

      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      expect(submitButton).toBeDisabled()
    })

    it('disables submit button when password is empty', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const usernameInput = screen.getByLabelText(/username or email/i)
      await user.type(usernameInput, 'testuser')

      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when both fields are filled', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
      expect(submitButton).toBeEnabled()
    })
  })

  describe('Form Interaction', () => {
    it('updates username field on input', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const usernameInput = screen.getByLabelText(/username or email/i) as HTMLInputElement
      await user.type(usernameInput, 'testuser')

      expect(usernameInput.value).toBe('testuser')
    })

    it('updates password field on input', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      await user.type(passwordInput, 'password123')

      expect(passwordInput.value).toBe('password123')
    })

    it('clears fields after typing and clearing', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const usernameInput = screen.getByLabelText(/username or email/i) as HTMLInputElement
      await user.type(usernameInput, 'testuser')
      await user.clear(usernameInput)

      expect(usernameInput.value).toBe('')
    })
  })

  describe('Successful Login', () => {
    it('calls login function with correct credentials', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, 'admin@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(mockLogin).toHaveBeenCalledWith({
        username: 'admin@example.com',
        password: 'password123',
      })
    })

    it('navigates to dashboard on successful login', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, 'admin@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('shows loading state during login', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, 'admin@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should show loading text
      expect(screen.getByText('Signing in...')).toBeInTheDocument()

      // Wait for login to complete
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled()
      })
    })

    it('disables submit button during login', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, 'admin@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled()

      // Wait for login to complete
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled()
      })
    })
  })

  describe('Failed Login', () => {
    it('displays error message on login failure', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockRejectedValue({
        response: {
          data: {
            detail: 'Invalid credentials',
          },
        },
      })
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('displays generic error message when error detail is not available', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockRejectedValue(new Error('Network error'))
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, 'user@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
      })
    })

    it('clears error message on new submission', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn()
        .mockRejectedValueOnce({
          response: { data: { detail: 'Invalid credentials' } },
        })
        .mockResolvedValueOnce(undefined)

      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      // First attempt - fail
      await user.type(usernameInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Second attempt - success
      await user.clear(usernameInput)
      await user.clear(passwordInput)
      await user.type(usernameInput, 'correct@example.com')
      await user.type(passwordInput, 'correctpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
      })
    })

    it('does not navigate on failed login', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockRejectedValue({
        response: { data: { detail: 'Invalid credentials' } },
      })
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles form submission with Enter key', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(usernameInput, 'admin@example.com')
      await user.type(passwordInput, 'password123{Enter}')

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })

    it('handles very long username', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const longUsername = 'a'.repeat(200)
      const usernameInput = screen.getByLabelText(/username or email/i) as HTMLInputElement

      await user.type(usernameInput, longUsername)

      expect(usernameInput.value).toBe(longUsername)
    })

    it('handles special characters in credentials', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, 'user+test@example.com')
      await user.type(passwordInput, 'P@ssw0rd!#$%')
      await user.click(submitButton)

      expect(mockLogin).toHaveBeenCalledWith({
        username: 'user+test@example.com',
        password: 'P@ssw0rd!#$%',
      })
    })

    it('handles whitespace in credentials', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      const authContext = mockAuthContext({ login: mockLogin })

      renderLoginPage(authContext)

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })

      await user.type(usernameInput, '  user@example.com  ')
      await user.type(passwordInput, '  password  ')
      await user.click(submitButton)

      // Should submit with whitespace (no trimming)
      expect(mockLogin).toHaveBeenCalledWith({
        username: '  user@example.com  ',
        password: '  password  ',
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for form fields', () => {
      renderLoginPage()

      expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('has required attributes on inputs', () => {
      renderLoginPage()

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(usernameInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })

    it('has proper input types', () => {
      renderLoginPage()

      const usernameInput = screen.getByLabelText(/username or email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(usernameInput).toHaveAttribute('type', 'text')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('has placeholder text', () => {
      renderLoginPage()

      const usernameInput = screen.getByPlaceholderText(/enter your username or email/i)
      const passwordInput = screen.getByPlaceholderText(/enter your password/i)

      expect(usernameInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
    })
  })
})
