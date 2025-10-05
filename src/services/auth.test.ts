import { describe, it, expect, beforeEach } from 'vitest'
import { authService } from './auth'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      const result = await authService.login({
        username: 'admin@example.com',
        password: 'password',
      })

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
      })
    })

    it('throws error with invalid credentials', async () => {
      await expect(
        authService.login({
          username: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow()
    })

    it('sends credentials as form data', async () => {
      let requestBody: string | null = null

      server.use(
        http.post(`${API_BASE}/auth/access-token`, async ({ request }) => {
          requestBody = await request.text()
          return HttpResponse.json({
            access_token: 'test-token',
            token_type: 'bearer',
            expires_in: 3600,
          })
        })
      )

      await authService.login({
        username: 'test@example.com',
        password: 'testpass',
      })

      expect(requestBody).toContain('username=test%40example.com')
      expect(requestBody).toContain('password=testpass')
    })

    it('uses correct content type header', async () => {
      let contentType: string | null = null

      server.use(
        http.post(`${API_BASE}/auth/access-token`, ({ request }) => {
          contentType = request.headers.get('content-type')
          return HttpResponse.json({
            access_token: 'test-token',
            token_type: 'bearer',
            expires_in: 3600,
          })
        })
      )

      await authService.login({
        username: 'test@example.com',
        password: 'password',
      })

      expect(contentType).toBe('application/x-www-form-urlencoded')
    })
  })

  describe('getCurrentUser', () => {
    it('successfully fetches current user', async () => {
      const user = await authService.getCurrentUser()

      expect(user).toEqual({
        id: 'admin-1',
        email: 'admin@example.com',
        username: 'admin',
        full_name: 'Admin User',
        is_active: true,
        is_superuser: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })
    })

    it('throws error when not authenticated', async () => {
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json(
            { detail: 'Not authenticated' },
            { status: 401 }
          )
        })
      )

      await expect(authService.getCurrentUser()).rejects.toThrow()
    })

    it('includes auth token in request', async () => {
      let authHeader: string | null = null

      localStorage.setItem('auth_token', 'test-token-123')

      server.use(
        http.get(`${API_BASE}/users/me`, ({ request }) => {
          authHeader = request.headers.get('authorization')
          return HttpResponse.json({
            id: 'user-1',
            email: 'test@example.com',
            is_active: true,
            is_superuser: false,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          })
        })
      )

      await authService.getCurrentUser()

      expect(authHeader).toBe('Bearer test-token-123')
    })
  })

  describe('refreshToken', () => {
    it('successfully refreshes token', async () => {
      server.use(
        http.post(`${API_BASE}/auth/refresh`, () => {
          return HttpResponse.json({
            access_token: 'new-token-456',
            token_type: 'bearer',
            expires_in: 3600,
          })
        })
      )

      const result = await authService.refreshToken('old-refresh-token')

      expect(result).toEqual({
        access_token: 'new-token-456',
        token_type: 'bearer',
        expires_in: 3600,
      })
    })

    it('sends refresh token in request body', async () => {
      let requestBody: { refresh_token?: string } = {}

      server.use(
        http.post(`${API_BASE}/auth/refresh`, async ({ request }) => {
          requestBody = await request.json() as { refresh_token?: string }
          return HttpResponse.json({
            access_token: 'new-token',
            token_type: 'bearer',
            expires_in: 3600,
          })
        })
      )

      await authService.refreshToken('my-refresh-token')

      expect(requestBody.refresh_token).toBe('my-refresh-token')
    })

    it('throws error with invalid refresh token', async () => {
      server.use(
        http.post(`${API_BASE}/auth/refresh`, () => {
          return HttpResponse.json(
            { detail: 'Invalid refresh token' },
            { status: 401 }
          )
        })
      )

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      server.use(
        http.post(`${API_BASE}/auth/access-token`, () => {
          return HttpResponse.error()
        })
      )

      await expect(
        authService.login({
          username: 'test@example.com',
          password: 'password',
        })
      ).rejects.toThrow()
    })

    it('handles server errors', async () => {
      server.use(
        http.post(`${API_BASE}/auth/access-token`, () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      await expect(
        authService.login({
          username: 'test@example.com',
          password: 'password',
        })
      ).rejects.toThrow()
    })
  })
})
