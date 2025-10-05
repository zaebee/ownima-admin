import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiClient } from './api'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

describe('ApiClient', () => {
  beforeEach(() => {
    localStorage.clear()
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })
  })

  describe('Token Injection', () => {
    it('includes auth token in request headers when token exists', async () => {
      let authHeader: string | null = null

      localStorage.setItem('auth_token', 'test-token-123')

      server.use(
        http.get(`${API_BASE}/test`, ({ request }) => {
          authHeader = request.headers.get('authorization')
          return HttpResponse.json({ success: true })
        })
      )

      await apiClient.get('/test')

      expect(authHeader).toBe('Bearer test-token-123')
    })

    it('does not include auth header when no token exists', async () => {
      let authHeader: string | null = null

      server.use(
        http.get(`${API_BASE}/test`, ({ request }) => {
          authHeader = request.headers.get('authorization')
          return HttpResponse.json({ success: true })
        })
      )

      await apiClient.get('/test')

      expect(authHeader).toBeNull()
    })

    it('updates auth header when token changes', async () => {
      const authHeaders: (string | null)[] = []

      server.use(
        http.get(`${API_BASE}/test`, ({ request }) => {
          authHeaders.push(request.headers.get('authorization'))
          return HttpResponse.json({ success: true })
        })
      )

      // First request with token
      localStorage.setItem('auth_token', 'token-1')
      await apiClient.get('/test')

      // Second request with different token
      localStorage.setItem('auth_token', 'token-2')
      await apiClient.get('/test')

      expect(authHeaders[0]).toBe('Bearer token-1')
      expect(authHeaders[1]).toBe('Bearer token-2')
    })
  })

  describe('401 Handling', () => {
    it('removes token and redirects to login on 401 response', async () => {
      localStorage.setItem('auth_token', 'invalid-token')

      server.use(
        http.get(`${API_BASE}/test`, () => {
          return HttpResponse.json(
            { detail: 'Unauthorized' },
            { status: 401 }
          )
        })
      )

      await expect(apiClient.get('/test')).rejects.toThrow()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(window.location.href).toBe('/login')
    })

    it('does not redirect on other error codes', async () => {
      localStorage.setItem('auth_token', 'valid-token')

      server.use(
        http.get(`${API_BASE}/test`, () => {
          return HttpResponse.json(
            { detail: 'Server error' },
            { status: 500 }
          )
        })
      )

      await expect(apiClient.get('/test')).rejects.toThrow()

      expect(localStorage.getItem('auth_token')).toBe('valid-token')
      expect(window.location.href).toBe('')
    })
  })

  describe('HTTP Methods', () => {
    it('performs GET requests', async () => {
      server.use(
        http.get(`${API_BASE}/test`, () => {
          return HttpResponse.json({ data: 'test' })
        })
      )

      const result = await apiClient.get<{ data: string }>('/test')

      expect(result).toEqual({ data: 'test' })
    })

    it('performs POST requests', async () => {
      let requestBody: { name?: string } = {}

      server.use(
        http.post(`${API_BASE}/test`, async ({ request }) => {
          requestBody = await request.json() as { name?: string }
          return HttpResponse.json({ id: '1', ...requestBody })
        })
      )

      const result = await apiClient.post<{ id: string; name: string }>('/test', { name: 'Test' })

      expect(result).toEqual({ id: '1', name: 'Test' })
      expect(requestBody.name).toBe('Test')
    })

    it('performs PUT requests', async () => {
      let requestBody: { name?: string } = {}

      server.use(
        http.put(`${API_BASE}/test/1`, async ({ request }) => {
          requestBody = await request.json() as { name?: string }
          return HttpResponse.json({ id: '1', ...requestBody })
        })
      )

      const result = await apiClient.put<{ id: string; name: string }>('/test/1', { name: 'Updated' })

      expect(result).toEqual({ id: '1', name: 'Updated' })
      expect(requestBody.name).toBe('Updated')
    })

    it('performs PATCH requests', async () => {
      let requestBody: { name?: string } = {}

      server.use(
        http.patch(`${API_BASE}/test/1`, async ({ request }) => {
          requestBody = await request.json() as { name?: string }
          return HttpResponse.json({ id: '1', ...requestBody })
        })
      )

      const result = await apiClient.patch<{ id: string; name: string }>('/test/1', { name: 'Patched' })

      expect(result).toEqual({ id: '1', name: 'Patched' })
      expect(requestBody.name).toBe('Patched')
    })

    it('performs DELETE requests', async () => {
      server.use(
        http.delete(`${API_BASE}/test/1`, () => {
          return HttpResponse.json({ message: 'Deleted' })
        })
      )

      const result = await apiClient.delete<{ message: string }>('/test/1')

      expect(result).toEqual({ message: 'Deleted' })
    })
  })

  describe('Query Parameters', () => {
    it('includes query parameters in GET requests', async () => {
      let searchParams: URLSearchParams | null = null

      server.use(
        http.get(`${API_BASE}/test`, ({ request }) => {
          searchParams = new URL(request.url).searchParams
          return HttpResponse.json({ success: true })
        })
      )

      await apiClient.get('/test', { page: 1, limit: 10, search: 'test' })

      expect(searchParams?.get('page')).toBe('1')
      expect(searchParams?.get('limit')).toBe('10')
      expect(searchParams?.get('search')).toBe('test')
    })

    it('handles undefined query parameters', async () => {
      let searchParams: URLSearchParams | null = null

      server.use(
        http.get(`${API_BASE}/test`, ({ request }) => {
          searchParams = new URL(request.url).searchParams
          return HttpResponse.json({ success: true })
        })
      )

      await apiClient.get('/test', { page: 1, search: undefined })

      expect(searchParams?.get('page')).toBe('1')
      expect(searchParams?.has('search')).toBe(false)
    })
  })

  describe('Content-Type Header', () => {
    it('sets JSON content-type by default', async () => {
      let contentType: string | null = null

      server.use(
        http.post(`${API_BASE}/test`, ({ request }) => {
          contentType = request.headers.get('content-type')
          return HttpResponse.json({ success: true })
        })
      )

      await apiClient.post('/test', { data: 'test' })

      expect(contentType).toBe('application/json')
    })
  })

  describe('Error Handling', () => {
    it('throws error on network failure', async () => {
      server.use(
        http.get(`${API_BASE}/test`, () => {
          return HttpResponse.error()
        })
      )

      await expect(apiClient.get('/test')).rejects.toThrow()
    })

    it('throws error on 4xx responses', async () => {
      server.use(
        http.get(`${API_BASE}/test`, () => {
          return HttpResponse.json(
            { detail: 'Bad request' },
            { status: 400 }
          )
        })
      )

      await expect(apiClient.get('/test')).rejects.toThrow()
    })

    it('throws error on 5xx responses', async () => {
      server.use(
        http.get(`${API_BASE}/test`, () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      await expect(apiClient.get('/test')).rejects.toThrow()
    })
  })
})
