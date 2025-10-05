import { describe, it, expect, beforeEach } from 'vitest'
import { userService } from './users'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

describe('UserService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getUsers', () => {
    it('fetches users successfully', async () => {
      const result = await userService.getUsers()

      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('size')
      expect(result).toHaveProperty('pages')
      expect(Array.isArray(result.items)).toBe(true)
      expect(result.total).toBe(2)
    })

    it('transforms API response to paginated format', async () => {
      const result = await userService.getUsers({ page: 1, size: 10 })

      expect(result.page).toBe(1)
      expect(result.size).toBe(10)
      expect(result.pages).toBe(1) // 2 items / 10 per page = 1 page
    })

    it('includes query parameters', async () => {
      let searchParams: URLSearchParams | null = null

      server.use(
        http.get(`${API_BASE}/users`, ({ request }) => {
          searchParams = new URL(request.url).searchParams
          return HttpResponse.json({ data: [], count: 0 })
        })
      )

      await userService.getUsers({
        page: 2,
        size: 20,
        search: 'test',
        is_active: true,
      })

      expect(searchParams?.get('page')).toBe('2')
      expect(searchParams?.get('size')).toBe('20')
      expect(searchParams?.get('search')).toBe('test')
      expect(searchParams?.get('is_active')).toBe('true')
    })

    it('calculates pages correctly', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json({ data: [], count: 25 })
        })
      )

      const result = await userService.getUsers({ page: 1, size: 10 })

      expect(result.pages).toBe(3) // 25 items / 10 per page = 3 pages
    })
  })

  describe('getUser', () => {
    it('fetches single user successfully', async () => {
      const result = await userService.getUser('1')

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email')
      expect(result.id).toBe('1')
      expect(result.email).toBe('owner@example.com')
    })

    it('throws error when user not found', async () => {
      await expect(userService.getUser('999')).rejects.toThrow()
    })
  })

  describe('createUser', () => {
    it('creates user successfully', async () => {
      const newUser = {
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User',
        is_active: true,
      }

      const result = await userService.createUser(newUser)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email')
      expect(result.email).toBe('new@example.com')
      expect(result.full_name).toBe('New User')
    })

    it('sends correct data to API', async () => {
      let requestBody: Record<string, unknown> = {}

      server.use(
        http.post(`${API_BASE}/users`, async ({ request }) => {
          requestBody = await request.json() as Record<string, unknown>
          return HttpResponse.json(
            {
              id: '3',
              ...requestBody,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { status: 201 }
          )
        })
      )

      await userService.createUser({
        email: 'test@example.com',
        password: 'password',
        full_name: 'Test User',
        is_active: true,
        is_superuser: false,
      })

      expect(requestBody.email).toBe('test@example.com')
      expect(requestBody.password).toBe('password')
      expect(requestBody.full_name).toBe('Test User')
      expect(requestBody.is_active).toBe(true)
      expect(requestBody.is_superuser).toBe(false)
    })

    it('returns 201 status code', async () => {
      server.use(
        http.post(`${API_BASE}/users`, () => {
          return HttpResponse.json(
            {
              id: '3',
              email: 'new@example.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { status: 201 }
          )
        })
      )

      const result = await userService.createUser({
        email: 'new@example.com',
        password: 'password',
      })

      expect(result.id).toBe('3')
    })
  })

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      const result = await userService.updateUser('1', {
        full_name: 'Updated Name',
      })

      expect(result).toHaveProperty('id')
      expect(result.id).toBe('1')
      expect(result.full_name).toBe('Updated Name')
    })

    it('sends only provided fields', async () => {
      let requestBody: Record<string, unknown> = {}

      server.use(
        http.patch(`${API_BASE}/users/1`, async ({ request }) => {
          requestBody = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            id: '1',
            email: 'test@example.com',
            ...requestBody,
            updated_at: new Date().toISOString(),
          })
        })
      )

      await userService.updateUser('1', {
        full_name: 'New Name',
      })

      expect(requestBody).toHaveProperty('full_name')
      expect(requestBody.full_name).toBe('New Name')
      expect(Object.keys(requestBody).length).toBe(1)
    })

    it('throws error when user not found', async () => {
      await expect(
        userService.updateUser('999', { full_name: 'Test' })
      ).rejects.toThrow()
    })
  })

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      await expect(userService.deleteUser('1')).resolves.not.toThrow()
    })

    it('throws error when user not found', async () => {
      await expect(userService.deleteUser('999')).rejects.toThrow()
    })
  })

  describe('activateUser', () => {
    it('activates user successfully', async () => {
      server.use(
        http.patch(`${API_BASE}/users/1`, async ({ request }) => {
          const body = await request.json() as { is_active?: boolean }
          return HttpResponse.json({
            id: '1',
            email: 'test@example.com',
            is_active: body.is_active,
            updated_at: new Date().toISOString(),
          })
        })
      )

      const result = await userService.activateUser('1')

      expect(result.is_active).toBe(true)
    })
  })

  describe('deactivateUser', () => {
    it('deactivates user successfully', async () => {
      server.use(
        http.patch(`${API_BASE}/users/1`, async ({ request }) => {
          const body = await request.json() as { is_active?: boolean }
          return HttpResponse.json({
            id: '1',
            email: 'test@example.com',
            is_active: body.is_active,
            updated_at: new Date().toISOString(),
          })
        })
      )

      const result = await userService.deactivateUser('1')

      expect(result.is_active).toBe(false)
    })
  })

  describe('toggleSuperuser', () => {
    it('grants superuser status', async () => {
      server.use(
        http.patch(`${API_BASE}/users/1`, async ({ request }) => {
          const body = await request.json() as { is_superuser?: boolean }
          return HttpResponse.json({
            id: '1',
            email: 'test@example.com',
            is_superuser: body.is_superuser,
            updated_at: new Date().toISOString(),
          })
        })
      )

      const result = await userService.toggleSuperuser('1', true)

      expect(result.is_superuser).toBe(true)
    })

    it('revokes superuser status', async () => {
      server.use(
        http.patch(`${API_BASE}/users/1`, async ({ request }) => {
          const body = await request.json() as { is_superuser?: boolean }
          return HttpResponse.json({
            id: '1',
            email: 'test@example.com',
            is_superuser: body.is_superuser,
            updated_at: new Date().toISOString(),
          })
        })
      )

      const result = await userService.toggleSuperuser('1', false)

      expect(result.is_superuser).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.error()
        })
      )

      await expect(userService.getUsers()).rejects.toThrow()
    })

    it('handles server errors', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      await expect(userService.getUsers()).rejects.toThrow()
    })
  })
})
