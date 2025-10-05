import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render as rtlRender, screen, waitFor } from '@testing-library/react'
import { ProtectedRoute } from './ProtectedRoute'
import { AuthContext } from '../contexts/AuthContext'
import type { AuthContextType } from '../contexts/AuthContext'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const mockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  token: null,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  ...overrides,
})

const TestComponent = () => <div>Protected Content</div>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Loading State', () => {
    it('shows loading spinner while checking authentication', () => {
      const authValue = mockAuthContext({ isLoading: true })

      rtlRender(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      expect(screen.getByRole('status')).toBeInTheDocument() // LoadingSpinner has role="status"
    })

    it('does not show protected content while loading', () => {
      const authValue = mockAuthContext({ isLoading: true })

      rtlRender(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('Authenticated Access', () => {
    it('renders children when user is authenticated', async () => {
      const authValue = mockAuthContext({
        isLoading: false,
        isAuthenticated: true,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          is_active: true,
          is_superuser: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        token: 'valid-token',
      })

      rtlRender(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('does not redirect when authenticated', () => {
      const authValue = mockAuthContext({
        isLoading: false,
        isAuthenticated: true,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          is_active: true,
          is_superuser: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        token: 'valid-token',
      })

      rtlRender(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
    })
  })

  describe('Unauthenticated Access', () => {
    it('redirects to login when not authenticated', async () => {
      const authValue = mockAuthContext({
        isLoading: false,
        isAuthenticated: false,
      })

      rtlRender(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      // Wait for the redirect to complete
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument()
      })
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('does not render children when not authenticated', () => {
      const authValue = mockAuthContext({
        isLoading: false,
        isAuthenticated: false,
      })

      rtlRender(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles transition from loading to authenticated', async () => {
      const authValue = mockAuthContext({ isLoading: true })

      const { rerender } = rtlRender(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      expect(screen.getByRole('status')).toBeInTheDocument()

      const updatedAuthValue = mockAuthContext({
        isLoading: false,
        isAuthenticated: true,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          is_active: true,
          is_superuser: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        token: 'valid-token',
      })

      rerender(
        <AuthContext.Provider value={updatedAuthValue}>
          <MemoryRouter>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('handles transition from loading to unauthenticated', async () => {
      const authValue = mockAuthContext({ isLoading: true })

      const { rerender } = rtlRender(
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      expect(screen.getByRole('status')).toBeInTheDocument()

      const updatedAuthValue = mockAuthContext({
        isLoading: false,
        isAuthenticated: false,
      })

      rerender(
        <AuthContext.Provider value={updatedAuthValue}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument()
      })
    })
  })
})
