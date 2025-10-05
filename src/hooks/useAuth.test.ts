import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'
import { AuthProvider } from '../contexts/AuthContext'

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = console.error
    console.error = () => {}

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')

    console.error = consoleError
  })

  it('returns auth context when used within AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('token')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('logout')
    expect(result.current).toHaveProperty('isAuthenticated')
  })

  it('provides correct initial values', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    // The component starts with isLoading: true, but it may complete very quickly
    // So we just verify the final state after loading completes
    const { waitFor } = await import('@testing-library/react')
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })
})
