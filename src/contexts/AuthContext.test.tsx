import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, AuthContext } from './AuthContext'
import { authService } from '../services/auth'
import type { User, LoginResponse } from '../types'

// Mock auth service
vi.mock('../services/auth', () => ({
  authService: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  is_active: true,
  is_superuser: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockLoginResponse: LoginResponse = {
  access_token: 'mock-token-123',
  token_type: 'bearer',
  expires_in: 3600,
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('starts with loading state', () => {
      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      expect(result.current?.isLoading).toBe(true)
    })

    it('initializes with no user when no token in localStorage', async () => {
      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      expect(result.current?.user).toBeNull()
      expect(result.current?.token).toBeNull()
      expect(result.current?.isAuthenticated).toBe(false)
    })

    it('restores user from localStorage token on mount', async () => {
      localStorage.setItem('auth_token', 'existing-token')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      expect(result.current?.user).toEqual(mockUser)
      expect(result.current?.token).toBe('existing-token')
      expect(result.current?.isAuthenticated).toBe(true)
      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('removes invalid token from localStorage on mount', async () => {
      localStorage.setItem('auth_token', 'invalid-token')
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Unauthorized'))

      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      expect(result.current?.user).toBeNull()
      expect(result.current?.token).toBeNull()
      expect(result.current?.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('Login', () => {
    it('successfully logs in user', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      await result.current?.login({
        username: 'test@example.com',
        password: 'password123',
      })

      expect(authService.login).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
      })
      expect(authService.getCurrentUser).toHaveBeenCalled()
      expect(result.current?.user).toEqual(mockUser)
      expect(result.current?.token).toBe('mock-token-123')
      expect(result.current?.isAuthenticated).toBe(true)
      expect(localStorage.getItem('auth_token')).toBe('mock-token-123')
    })

    it('throws error on failed login', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      await expect(
        result.current?.login({
          username: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials')

      expect(result.current?.user).toBeNull()
      expect(result.current?.token).toBeNull()
      expect(result.current?.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('handles getCurrentUser failure after successful login', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Failed to fetch user'))

      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      await expect(
        result.current?.login({
          username: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Failed to fetch user')

      // Token is set but user is not
      expect(result.current?.token).toBe('mock-token-123')
      expect(result.current?.user).toBeNull()
      expect(result.current?.isAuthenticated).toBe(false)
    })
  })

  describe('Logout', () => {
    it('clears user and token on logout', async () => {
      localStorage.setItem('auth_token', 'existing-token')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      expect(result.current?.isAuthenticated).toBe(true)

      result.current?.logout()

      expect(result.current?.user).toBeNull()
      expect(result.current?.token).toBeNull()
      expect(result.current?.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('can logout when not authenticated', () => {
      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      // Should not throw
      expect(() => result.current?.logout()).not.toThrow()

      expect(result.current?.user).toBeNull()
      expect(result.current?.token).toBeNull()
      expect(result.current?.isAuthenticated).toBe(false)
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when no user or token', async () => {
      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      expect(result.current?.isAuthenticated).toBe(false)
    })

    it('returns false when token exists but no user', async () => {
      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      // Manually set token without user (edge case)
      localStorage.setItem('auth_token', 'token-without-user')

      expect(result.current?.isAuthenticated).toBe(false)
    })

    it('returns true when both user and token exist', async () => {
      localStorage.setItem('auth_token', 'valid-token')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const { result } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false)
      })

      expect(result.current?.isAuthenticated).toBe(true)
    })
  })

  describe('Token Persistence', () => {
    it('persists token across provider remounts', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      // First mount - login
      const { result: result1, unmount } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result1.current?.isLoading).toBe(false)
      })

      await result1.current?.login({
        username: 'test@example.com',
        password: 'password123',
      })

      expect(localStorage.getItem('auth_token')).toBe('mock-token-123')

      unmount()

      // Second mount - should restore from localStorage
      const { result: result2 } = renderHook(() => React.useContext(AuthContext), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result2.current?.isLoading).toBe(false)
      })

      expect(result2.current?.user).toEqual(mockUser)
      expect(result2.current?.token).toBe('mock-token-123')
      expect(result2.current?.isAuthenticated).toBe(true)
    })
  })
})
