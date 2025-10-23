import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

// Mock users data
const mockUsers = [
  {
    id: '1',
    email: 'owner@example.com',
    username: 'owner1',
    full_name: 'John Owner',
    is_active: true,
    is_superuser: false,
    role: 'OWNER',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    login_count: 10,
    last_login_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    email: 'rider@example.com',
    username: 'rider1',
    full_name: 'Jane Rider',
    is_active: true,
    is_superuser: false,
    role: 'RIDER',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    login_count: 5,
    last_login_at: '2024-01-14T00:00:00Z',
  },
]

const mockBlockMetrics = {
  users: {
    total: 100,
    online_last_30_days: 75,
    internal: 10,
    external: 90,
    owners: 40,
    riders: 60,
    logins: 250,
  },
  vehicles: {
    total: 50,
    draft: 5,
    free: 20,
    collected: 15,
    maintenance: 5,
    archived: 5,
  },
  reservations: {
    total: 200,
    pending: 10,
    confirmed: 50,
    collected: 30,
    completed: 100,
    cancelled: 8,
    maintenance: 2,
  },
}

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/access-token`, async ({ request }) => {
    const formData = await request.formData()
    const username = formData.get('username')
    const password = formData.get('password')

    if (username === 'admin@example.com' && password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
      })
    }

    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json({
      id: 'admin-1',
      email: 'admin@example.com',
      username: 'admin',
      full_name: 'Admin User',
      is_active: true,
      is_superuser: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    })
  }),

  // Admin endpoints
  http.get(`${API_BASE}/admin/users`, () => {
    return HttpResponse.json({
      data: mockUsers,
      count: mockUsers.length,
    })
  }),

  http.get(`${API_BASE}/admin/metrics/blocks`, () => {
    return HttpResponse.json(mockBlockMetrics)
  }),

  http.get(`${API_BASE}/admin/system/info`, () => {
    return HttpResponse.json({
      backend_version: '1.0.0',
      api_version: 'v1',
      environment: 'development',
      project_name: 'Ownima Admin',
      domain: 'localhost',
      python_version: '3.11',
      git_version: 'main',
      git_commit: 'abc123',
      frontend_version: '1.0.0',
      build_date: '2024-01-01',
      last_deployment: '2024-01-01',
      database: {
        status: 'healthy',
        database_type: 'postgresql',
        uri: 'postgresql://localhost:5432/ownima',
        test_query_result: 1,
      },
      uptime_seconds: 3600,
    })
  }),

  http.get(`${API_BASE}/admin/system/errors`, () => {
    return HttpResponse.json([])
  }),

  // Activity endpoints
  http.get(`${API_BASE}/admin/activity/users`, ({ request }) => {
    const url = new URL(request.url)
    const skip = Number(url.searchParams.get('skip')) || 0
    const limit = Number(url.searchParams.get('limit')) || 10

    const mockUserActivities = [
      {
        id: 'user-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        activity_type: 'user_registered',
        details: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          user_email: 'john@example.com',
          user_name: 'John Doe',
          user_role: 'OWNER',
        },
      },
      {
        id: 'user-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        user_id: '456e7890-e89b-12d3-a456-426614174001',
        activity_type: 'rider_registered',
        details: {
          user_id: '456e7890-e89b-12d3-a456-426614174001',
          user_email: 'jane@example.com',
          user_name: 'Jane Smith',
          user_role: 'RIDER',
        },
      },
      {
        id: 'user-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        activity_type: 'user_login',
        details: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          user_email: 'john@example.com',
          user_name: 'John Doe',
          user_role: 'OWNER',
          login_count: 5,
        },
      },
    ]

    const paginatedData = mockUserActivities.slice(skip, skip + limit)

    return HttpResponse.json({
      data: paginatedData,
      total: paginatedData.length,
    })
  }),

  http.get(`${API_BASE}/admin/activity/vehicles`, ({ request }) => {
    const url = new URL(request.url)
    const skip = Number(url.searchParams.get('skip')) || 0
    const limit = Number(url.searchParams.get('limit')) || 10

    const mockVehicleActivities = [
      {
        id: 'vehicle-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        activity_type: 'vehicle_created',
        details: {
          event_type: 'vehicle_created',
          vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Tesla Model 3',
          status: 'draft',
          vehicle_type: 'sedan',
          brand: 'Tesla',
          model: 'Model 3',
          entity_id: '550e8400-e29b-41d4-a716-446655440000',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      {
        id: 'vehicle-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        activity_type: 'vehicle_updated',
        details: {
          event_type: 'vehicle_updated',
          vehicle_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'BMW X5',
          status: 'free',
          entity_id: '550e8400-e29b-41d4-a716-446655440001',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          changes: {
            status: { from: 'draft', to: 'free' },
            name: { from: 'BMW X3', to: 'BMW X5' },
          },
        },
      },
      {
        id: 'vehicle-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), // 40 minutes ago
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        activity_type: 'vehicle_published',
        details: {
          event_type: 'vehicle_published',
          vehicle_id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Audi A4',
          status: 'free',
          entity_id: '550e8400-e29b-41d4-a716-446655440002',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          changes: {
            status: { from: 'draft', to: 'free' },
          },
        },
      },
      {
        id: 'vehicle-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        activity_type: 'vehicle_drafts_deleted',
        details: {
          event_type: 'vehicle_drafts_deleted',
          deleted_count: 5,
          entity_id: 'bulk-operation-uuid',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    ]

    const paginatedData = mockVehicleActivities.slice(skip, skip + limit)

    return HttpResponse.json({
      data: paginatedData,
      total: paginatedData.length,
    })
  }),

  http.get(`${API_BASE}/admin/activity/reservations`, ({ request }) => {
    const url = new URL(request.url)
    const skip = Number(url.searchParams.get('skip')) || 0
    const limit = Number(url.searchParams.get('limit')) || 10

    const mockReservationActivities = [
      {
        id: 'reservation-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(), // 7 minutes ago
        user_id: '456e7890-e89b-12d3-a456-426614174001',
        activity_type: 'reservation_created',
        details: {
          event_type: 'reservation_created',
          reservation_id: '750e8400-e29b-41d4-a716-446655440000',
          status: 'pending',
          total_price: 250.0,
          start_date: '2025-10-25',
          end_date: '2025-10-27',
          vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
          entity_id: '750e8400-e29b-41d4-a716-446655440000',
          user_id: '456e7890-e89b-12d3-a456-426614174001',
        },
      },
      {
        id: 'reservation-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
        user_id: '456e7890-e89b-12d3-a456-426614174001',
        activity_type: 'reservation_status_updated_collected',
        details: {
          event_type: 'reservation_status_updated_collected',
          reservation_id: '750e8400-e29b-41d4-a716-446655440001',
          status: 'collected',
          total_price: 180.0,
          entity_id: '750e8400-e29b-41d4-a716-446655440001',
          user_id: '456e7890-e89b-12d3-a456-426614174001',
          changes: {
            status: { from: 'confirmed', to: 'collected' },
          },
        },
      },
      {
        id: 'reservation-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(), // 50 minutes ago
        user_id: '456e7890-e89b-12d3-a456-426614174002',
        activity_type: 'reservation_status_updated_completed',
        details: {
          event_type: 'reservation_status_updated_completed',
          reservation_id: '750e8400-e29b-41d4-a716-446655440002',
          status: 'completed',
          total_price: 320.0,
          entity_id: '750e8400-e29b-41d4-a716-446655440002',
          user_id: '456e7890-e89b-12d3-a456-426614174002',
          changes: {
            status: { from: 'collected', to: 'completed' },
          },
        },
      },
      {
        id: 'reservation-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(), // 70 minutes ago
        user_id: '456e7890-e89b-12d3-a456-426614174003',
        activity_type: 'reservation_status_updated_cancelled',
        details: {
          event_type: 'reservation_status_updated_cancelled',
          reservation_id: '750e8400-e29b-41d4-a716-446655440003',
          status: 'cancelled',
          total_price: 150.0,
          entity_id: '750e8400-e29b-41d4-a716-446655440003',
          user_id: '456e7890-e89b-12d3-a456-426614174003',
          changes: {
            status: { from: 'pending', to: 'cancelled' },
          },
        },
      },
    ]

    const paginatedData = mockReservationActivities.slice(skip, skip + limit)

    return HttpResponse.json({
      data: paginatedData,
      total: paginatedData.length,
    })
  }),

  // User CRUD endpoints
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json({
      data: mockUsers,
      count: mockUsers.length,
    })
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const user = mockUsers.find(u => u.id === params.id)
    
    if (!user) {
      return HttpResponse.json(
        { detail: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(user)
  }),

  http.post(`${API_BASE}/users`, async ({ request }) => {
    const newUser = await request.json()
    
    return HttpResponse.json(
      {
        id: '3',
        ...newUser,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.patch(`${API_BASE}/users/:id`, async ({ params, request }) => {
    const updates = await request.json()
    const user = mockUsers.find(u => u.id === params.id)
    
    if (!user) {
      return HttpResponse.json(
        { detail: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      ...user,
      ...updates,
      updated_at: new Date().toISOString(),
    })
  }),

  http.delete(`${API_BASE}/users/:id`, ({ params }) => {
    const user = mockUsers.find(u => u.id === params.id)
    
    if (!user) {
      return HttpResponse.json(
        { detail: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({ message: 'User deleted successfully' })
  }),
]
