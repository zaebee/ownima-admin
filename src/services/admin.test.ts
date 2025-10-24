import { describe, it, expect, beforeEach } from 'vitest'
import { adminService } from './admin'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

describe('AdminService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAdminUsers', () => {
    it('fetches admin users successfully', async () => {
      const result = await adminService.getAdminUsers()

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('count')
      expect(Array.isArray((result as { data: unknown[] }).data)).toBe(true)
      expect((result as { count: number }).count).toBe(2)
    })

    it('includes query parameters', async () => {
      let searchParams: URLSearchParams | null = null

      server.use(
        http.get(`${API_BASE}/admin/users`, ({ request }) => {
          searchParams = new URL(request.url).searchParams
          return HttpResponse.json({ data: [], count: 0 })
        })
      )

      await adminService.getAdminUsers({
        skip: 10,
        limit: 20,
        search: 'test',
        user_type: 'OWNER',
      })

      expect(searchParams?.get('skip')).toBe('10')
      expect(searchParams?.get('limit')).toBe('20')
      expect(searchParams?.get('search')).toBe('test')
      expect(searchParams?.get('user_type')).toBe('OWNER')
    })
  })

  describe('getBlockMetrics', () => {
    it('fetches block metrics successfully', async () => {
      const result = await adminService.getBlockMetrics()

      expect(result).toHaveProperty('users')
      expect(result).toHaveProperty('vehicles')
      expect(result).toHaveProperty('reservations')

      expect(result.users).toHaveProperty('owners')
      expect(result.users).toHaveProperty('riders')
      expect(result.users).toHaveProperty('total_users')
      expect(result.users.owners).toHaveProperty('total')
      expect(result.users.riders).toHaveProperty('total')

      expect(result.vehicles).toHaveProperty('total')
      expect(result.vehicles).toHaveProperty('free')

      expect(result.reservations).toHaveProperty('total')
      expect(result.reservations).toHaveProperty('pending')
    })

    it('includes filter parameters', async () => {
      let searchParams: URLSearchParams | null = null

      server.use(
        http.get(`${API_BASE}/admin/metrics/blocks`, ({ request }) => {
          searchParams = new URL(request.url).searchParams
          return HttpResponse.json({
            users: {
              owners: {
                total: 0,
                online_last_30_days: 0,
                logins_today: 0,
                internal: 0,
                external: 0,
                verified: 0,
                with_vehicles: 0,
                with_active_rentals: 0,
              },
              riders: {
                total: 0,
                online_last_30_days: 0,
                logins_today: 0,
                internal: 0,
                external: 0,
                with_bookings: 0,
                with_completed_trips: 0,
                with_active_bookings: 0,
              },
              total_users: 0,
            },
            vehicles: { total: 0, draft: 0, free: 0, collected: 0, maintenance: 0, archived: 0 },
            reservations: { total: 0, pending: 0, confirmed: 0, collected: 0, completed: 0, cancelled: 0, maintenance: 0 },
          })
        })
      )

      await adminService.getBlockMetrics({
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        role: 'OWNER',
      })

      expect(searchParams?.get('date_start')).toBe('2024-01-01')
      expect(searchParams?.get('date_end')).toBe('2024-01-31')
      expect(searchParams?.get('role')).toBe('OWNER')
    })

    it('excludes ALL role from parameters', async () => {
      let searchParams: URLSearchParams | null = null

      server.use(
        http.get(`${API_BASE}/admin/metrics/blocks`, ({ request }) => {
          searchParams = new URL(request.url).searchParams
          return HttpResponse.json({
            users: {
              owners: {
                total: 0,
                online_last_30_days: 0,
                logins_today: 0,
                internal: 0,
                external: 0,
                verified: 0,
                with_vehicles: 0,
                with_active_rentals: 0,
              },
              riders: {
                total: 0,
                online_last_30_days: 0,
                logins_today: 0,
                internal: 0,
                external: 0,
                with_bookings: 0,
                with_completed_trips: 0,
                with_active_bookings: 0,
              },
              total_users: 0,
            },
            vehicles: { total: 0, draft: 0, free: 0, collected: 0, maintenance: 0, archived: 0 },
            reservations: { total: 0, pending: 0, confirmed: 0, collected: 0, completed: 0, cancelled: 0, maintenance: 0 },
          })
        })
      )

      await adminService.getBlockMetrics({
        role: 'ALL',
      })

      expect(searchParams?.has('role')).toBe(false)
    })
  })

  describe('getSystemInfo', () => {
    it('fetches system info successfully', async () => {
      const result = await adminService.getSystemInfo()

      expect(result).toHaveProperty('backend_version')
      expect(result).toHaveProperty('api_version')
      expect(result).toHaveProperty('environment')
      expect(result).toHaveProperty('database')
      expect(result.database).toHaveProperty('status')
    })
  })

  describe('getSystemErrors', () => {
    it('fetches system errors successfully', async () => {
      const result = await adminService.getSystemErrors()

      expect(Array.isArray(result)).toBe(true)
    })

    it('includes query parameters', async () => {
      let searchParams: URLSearchParams | null = null

      server.use(
        http.get(`${API_BASE}/admin/system/errors`, ({ request }) => {
          searchParams = new URL(request.url).searchParams
          return HttpResponse.json([])
        })
      )

      await adminService.getSystemErrors({
        _limit: 50,
        level: 'ERROR',
      })

      expect(searchParams?.get('_limit')).toBe('50')
      expect(searchParams?.get('level')).toBe('ERROR')
    })
  })

  describe('Activity Feed Methods', () => {
    describe('getActivityUsers', () => {
      it('fetches user activities successfully', async () => {
        const result = await adminService.getActivityUsers(0, 10)

        expect(result).toHaveProperty('data')
        expect(result).toHaveProperty('total')
        expect(Array.isArray(result.data)).toBe(true)
      })

      it('passes skip and limit parameters correctly', async () => {
        let searchParams: URLSearchParams | null = null

        server.use(
          http.get(`${API_BASE}/admin/activity/users`, ({ request }) => {
            searchParams = new URL(request.url).searchParams
            return HttpResponse.json({ data: [], total: 0 })
          })
        )

        await adminService.getActivityUsers(25, 50)

        expect(searchParams?.get('skip')).toBe('25')
        expect(searchParams?.get('limit')).toBe('50')
      })

      it('uses default values when parameters not provided', async () => {
        let searchParams: URLSearchParams | null = null

        server.use(
          http.get(`${API_BASE}/admin/activity/users`, ({ request }) => {
            searchParams = new URL(request.url).searchParams
            return HttpResponse.json({ data: [], total: 0 })
          })
        )

        await adminService.getActivityUsers()

        expect(searchParams?.get('skip')).toBe('0')
        expect(searchParams?.get('limit')).toBe('10')
      })
    })

    describe('getActivityVehicles', () => {
      it('fetches vehicle activities successfully', async () => {
        const result = await adminService.getActivityVehicles(0, 10)

        expect(result).toHaveProperty('data')
        expect(result).toHaveProperty('total')
        expect(Array.isArray(result.data)).toBe(true)
      })

      it('passes pagination parameters correctly', async () => {
        let searchParams: URLSearchParams | null = null

        server.use(
          http.get(`${API_BASE}/admin/activity/vehicles`, ({ request }) => {
            searchParams = new URL(request.url).searchParams
            return HttpResponse.json({ data: [], total: 0 })
          })
        )

        await adminService.getActivityVehicles(10, 20)

        expect(searchParams?.get('skip')).toBe('10')
        expect(searchParams?.get('limit')).toBe('20')
      })
    })

    describe('getActivityReservations', () => {
      it('fetches reservation activities successfully', async () => {
        const result = await adminService.getActivityReservations(0, 10)

        expect(result).toHaveProperty('data')
        expect(result).toHaveProperty('total')
        expect(Array.isArray(result.data)).toBe(true)
      })

      it('passes pagination parameters correctly', async () => {
        let searchParams: URLSearchParams | null = null

        server.use(
          http.get(`${API_BASE}/admin/activity/reservations`, ({ request }) => {
            searchParams = new URL(request.url).searchParams
            return HttpResponse.json({ data: [], total: 0 })
          })
        )

        await adminService.getActivityReservations(15, 30)

        expect(searchParams?.get('skip')).toBe('15')
        expect(searchParams?.get('limit')).toBe('30')
      })
    })

    describe('getAllActivities', () => {
      it('fetches and merges all activity types successfully', async () => {
        const result = await adminService.getAllActivities(0, 10)

        expect(result).toHaveProperty('data')
        expect(result).toHaveProperty('total')
        expect(Array.isArray(result.data)).toBe(true)
        // Total should be sum of all activity types
        expect(result.total).toBeGreaterThan(0)
      })

      it('sorts merged activities by timestamp (newest first)', async () => {
        const result = await adminService.getAllActivities(0, 10)

        // Verify activities are sorted by timestamp descending
        for (let i = 1; i < result.data.length; i++) {
          const prevTime = new Date(result.data[i - 1].timestamp).getTime()
          const currTime = new Date(result.data[i].timestamp).getTime()
          expect(prevTime).toBeGreaterThanOrEqual(currTime)
        }
      })

      it('limits results to specified limit after merging', async () => {
        const result = await adminService.getAllActivities(0, 5)

        expect(result.data.length).toBeLessThanOrEqual(5)
      })

      it('passes skip and limit to all three endpoints', async () => {
        // const userParams: URLSearchParams | null = null
        // const vehicleParams: URLSearchParams | null = null
        // const reservationParams: URLSearchParams | null = null

        server.use(
          http.get(`${API_BASE}/admin/activity/users`, ({ request }) => {
            const params = new URL(request.url).searchParams
            expect(params.get('skip')).toBe('10')
            expect(params.get('limit')).toBe('20')
            return HttpResponse.json({ data: [], total: 0 })
          }),
          http.get(`${API_BASE}/admin/activity/vehicles`, ({ request }) => {
            const params = new URL(request.url).searchParams
            expect(params.get('skip')).toBe('10')
            expect(params.get('limit')).toBe('20')
            return HttpResponse.json({ data: [], total: 0 })
          }),
          http.get(`${API_BASE}/admin/activity/reservations`, ({ request }) => {
            const params = new URL(request.url).searchParams
            expect(params.get('skip')).toBe('10')
            expect(params.get('limit')).toBe('20')
            return HttpResponse.json({ data: [], total: 0 })
          })
        )

        await adminService.getAllActivities(10, 20)
      })

      describe('Partial Success Handling', () => {
        it('returns data from successful endpoints when one fails', async () => {
          server.use(
            http.get(`${API_BASE}/admin/activity/users`, () => {
              return HttpResponse.json({
                data: [
                  {
                    id: 'user-1',
                    timestamp: new Date().toISOString(),
                    user_id: 'user-123',
                    activity_type: 'user_login',
                    details: { user_name: 'John Doe', user_email: 'john@test.com', user_role: 'OWNER', user_id: 'user-123' },
                  },
                ],
                total: 1,
              })
            }),
            http.get(`${API_BASE}/admin/activity/vehicles`, () => {
              return HttpResponse.error() // Simulate failure
            }),
            http.get(`${API_BASE}/admin/activity/reservations`, () => {
              return HttpResponse.json({
                data: [
                  {
                    id: 'reservation-1',
                    timestamp: new Date().toISOString(),
                    user_id: 'user-456',
                    activity_type: 'reservation_created',
                    details: { reservation_id: 'res-123', status: 'pending', total_price: 250, entity_id: 'entity-123', user_id: 'user-456', event_type: 'reservation_created' },
                  },
                ],
                total: 1,
              })
            })
          )

          const result = await adminService.getAllActivities(0, 10)

          // Should have data from users and reservations, but not vehicles
          expect(result.data.length).toBe(2)
          expect(result.total).toBe(2) // 1 from users + 1 from reservations
        })

        it('returns empty result when all endpoints fail', async () => {
          server.use(
            http.get(`${API_BASE}/admin/activity/users`, () => HttpResponse.error()),
            http.get(`${API_BASE}/admin/activity/vehicles`, () => HttpResponse.error()),
            http.get(`${API_BASE}/admin/activity/reservations`, () => HttpResponse.error())
          )

          const result = await adminService.getAllActivities(0, 10)

          expect(result.data).toEqual([])
          expect(result.total).toBe(0)
        })

        it('returns data when two endpoints fail', async () => {
          server.use(
            http.get(`${API_BASE}/admin/activity/users`, () => HttpResponse.error()),
            http.get(`${API_BASE}/admin/activity/vehicles`, () => {
              return HttpResponse.json({
                data: [
                  {
                    id: 'vehicle-1',
                    timestamp: new Date().toISOString(),
                    user_id: 'user-123',
                    activity_type: 'vehicle_created',
                    details: { vehicle_id: 'vehicle-123', name: 'Tesla Model 3', status: 'draft', entity_id: 'entity-123', user_id: 'user-123', event_type: 'vehicle_created' },
                  },
                ],
                total: 1,
              })
            }),
            http.get(`${API_BASE}/admin/activity/reservations`, () => HttpResponse.error())
          )

          const result = await adminService.getAllActivities(0, 10)

          expect(result.data.length).toBe(1)
          expect(result.data[0].activity_type).toBe('vehicle_created')
          expect(result.total).toBe(1)
        })

        it('continues execution without throwing when endpoints fail', async () => {
          server.use(
            http.get(`${API_BASE}/admin/activity/users`, () => HttpResponse.error()),
            http.get(`${API_BASE}/admin/activity/vehicles`, () => HttpResponse.error()),
            http.get(`${API_BASE}/admin/activity/reservations`, () => HttpResponse.error())
          )

          // Should not throw an error
          await expect(adminService.getAllActivities(0, 10)).resolves.toBeDefined()
        })
      })

      describe('Data Merging and Sorting', () => {
        it('merges activities from all three sources', async () => {
          server.use(
            http.get(`${API_BASE}/admin/activity/users`, () => {
              return HttpResponse.json({
                data: [
                  {
                    id: 'user-1',
                    timestamp: new Date(Date.now() - 1000).toISOString(), // 1 second ago
                    user_id: 'user-123',
                    activity_type: 'user_login',
                    details: { user_name: 'User 1', user_email: 'user1@test.com', user_role: 'OWNER', user_id: 'user-123' },
                  },
                ],
                total: 1,
              })
            }),
            http.get(`${API_BASE}/admin/activity/vehicles`, () => {
              return HttpResponse.json({
                data: [
                  {
                    id: 'vehicle-1',
                    timestamp: new Date(Date.now() - 3000).toISOString(), // 3 seconds ago
                    user_id: 'user-123',
                    activity_type: 'vehicle_created',
                    details: { vehicle_id: 'vehicle-123', name: 'Vehicle 1', status: 'draft', entity_id: 'entity-123', user_id: 'user-123', event_type: 'vehicle_created' },
                  },
                ],
                total: 1,
              })
            }),
            http.get(`${API_BASE}/admin/activity/reservations`, () => {
              return HttpResponse.json({
                data: [
                  {
                    id: 'reservation-1',
                    timestamp: new Date(Date.now() - 2000).toISOString(), // 2 seconds ago
                    user_id: 'user-456',
                    activity_type: 'reservation_created',
                    details: { reservation_id: 'res-123', status: 'pending', total_price: 250, entity_id: 'entity-123', user_id: 'user-456', event_type: 'reservation_created' },
                  },
                ],
                total: 1,
              })
            })
          )

          const result = await adminService.getAllActivities(0, 10)

          // Should have all 3 activities
          expect(result.data.length).toBe(3)
          expect(result.total).toBe(3)

          // Should be sorted newest first
          expect(result.data[0].id).toBe('user-1') // Most recent
          expect(result.data[1].id).toBe('reservation-1') // Middle
          expect(result.data[2].id).toBe('vehicle-1') // Oldest
        })
      })
    })
  })

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      server.use(
        http.patch(`${API_BASE}/users/1`, async ({ request }) => {
          const updates = await request.json()
          return HttpResponse.json({
            id: '1',
            email: 'test@example.com',
            is_active: true,
            is_superuser: false,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: new Date().toISOString(),
            ...updates,
          })
        })
      )

      const result = await adminService.updateUser('1', {
        full_name: 'Updated Name',
      })

      expect(result.id).toBe('1')
      expect(result.full_name).toBe('Updated Name')
    })
  })

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      const result = await adminService.deleteUser('1')

      expect(result).toHaveProperty('message')
      expect(result.message).toBe('User deleted successfully')
    })

    it('throws error when user not found', async () => {
      server.use(
        http.delete(`${API_BASE}/users/999`, () => {
          return HttpResponse.json(
            { detail: 'User not found' },
            { status: 404 }
          )
        })
      )

      await expect(adminService.deleteUser('999')).rejects.toThrow()
    })
  })

  describe('getUserMetrics', () => {
    it('fetches user metrics successfully', async () => {
      server.use(
        http.get(`${API_BASE}/admin/users/1/metrics`, () => {
          return HttpResponse.json({
            user_id: '1',
            total_bookings: 10,
            total_vehicles: 2,
            last_activity: '2024-01-15T00:00:00Z',
          })
        })
      )

      const result = await adminService.getUserMetrics('1')

      expect(result).toHaveProperty('user_id')
      expect(result.user_id).toBe('1')
    })
  })

  describe('Deprecated Methods', () => {
    it('getMetricsOverview falls back to getBlockMetrics', async () => {
      const result = await adminService.getMetricsOverview()

      expect(result).toHaveProperty('total_owners')
      expect(result).toHaveProperty('total_riders')
      expect(result).toHaveProperty('total_bookings')
      // Now returns nested total from owners/riders objects
      expect(result.total_owners).toBe(40)
      expect(result.total_riders).toBe(60)
    })

    it('getUserStats falls back to getBlockMetrics', async () => {
      const result = await adminService.getUserStats()

      expect(result).toHaveProperty('owners')
      expect(result).toHaveProperty('riders')
      expect(result).toHaveProperty('total')
      // Now extracts total from nested owners/riders objects
      expect(result.owners).toBe(40)
      expect(result.riders).toBe(60)
      expect(result.total).toBe(100)
    })

    it('getBookingStats falls back to getBlockMetrics', async () => {
      const result = await adminService.getBookingStats()

      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('pending')
      expect(result).toHaveProperty('confirmed')
      expect(result.total).toBe(200)
      expect(result.pending).toBe(10)
      expect(result.confirmed).toBe(50)
    })
  })
})
