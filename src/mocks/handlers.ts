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
    owners: {
      total: 40,
      online_last_30_days: 28,
      logins_today: 12,
      internal: 0,
      external: 0,
      verified: 0,
      with_vehicles: 0,
      with_active_rentals: 0,
    },
    riders: {
      total: 60,
      online_last_30_days: 47,
      logins_today: 23,
      internal: 0,
      external: 0,
      with_bookings: 0,
      with_completed_trips: 0,
      with_active_bookings: 0,
    },
    total_users: 100,
  },
  vehicles: {
    total: 50,
    draft: 5,
    free: 20,
    collected: 15,
    maintenance: 5,
    archived: 5,
    unspecified: 0, // NEW FIELD
  },
  reservations: {
    total: 200,
    pending: 10,
    confirmed: 50,
    collected: 30,
    completed: 100,
    cancelled: 8,
    maintenance: 2,
    // NEW FIELDS from api-generated.ts
    confirmation_by_rider: 3,
    confirmation_by_owner: 2,
    overdue: 1,
    conflict: 0,
    no_response: 1,
    unspecified: 0,
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
  http.get(`${API_BASE}/admin/users/:userId`, ({ params }) => {
    const user = mockUsers.find(u => u.id === params.userId)
    if (!user) {
      return HttpResponse.json({ detail: 'User not found' }, { status: 404 })
    }
    return HttpResponse.json(user)
  }),

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
      // System activity (> 24 hours old)
      {
        id: 'user-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
        user_id: 'system',
        activity_type: 'user_registered',
        details: {
          user_id: 'system',
          user_email: 'admin@ownima.com',
          user_name: 'System Admin',
          user_role: 'OWNER',
        },
      },
      // Very old activity (3 days ago)
      {
        id: 'user-5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        user_id: '789e1234-e89b-12d3-a456-426614174002',
        activity_type: 'rider_login',
        details: {
          user_id: '789e1234-e89b-12d3-a456-426614174002',
          user_email: 'bob@example.com',
          user_name: 'Bob Wilson',
          user_role: 'RIDER',
          login_count: 12,
        },
      },
      // Edge case: Activity with minimal details
      {
        id: 'user-6',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        user_id: '999e9999-e89b-12d3-a456-426614174999',
        activity_type: 'user_login',
        details: {
          user_id: '999e9999-e89b-12d3-a456-426614174999',
          user_email: 'minimal@example.com',
          user_name: '', // Empty name to test fallback
          user_role: 'RIDER',
        },
      },
    ]

    const paginatedData = mockUserActivities.slice(skip, skip + limit)

    return HttpResponse.json({
      data: paginatedData,
      total: mockUserActivities.length,
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

    // Add edge cases and system activities
    const edgeCaseVehicleActivities = [
      ...mockVehicleActivities,
      // System activity for archived vehicle
      {
        id: 'vehicle-5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago (> 24hrs)
        user_id: 'system',
        activity_type: 'vehicle_archived',
        details: {
          event_type: 'vehicle_archived',
          vehicle_id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Mercedes-Benz C-Class',
          status: 'archived',
          entity_id: '550e8400-e29b-41d4-a716-446655440003',
          user_id: 'system',
        },
      },
      // Very old activity (2 days ago)
      {
        id: 'vehicle-6',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        activity_type: 'vehicle_deleted',
        details: {
          event_type: 'vehicle_deleted',
          vehicle_id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'Old Vehicle',
          status: 'deleted',
          entity_id: '550e8400-e29b-41d4-a716-446655440004',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      // Edge case: Activity without vehicle name
      {
        id: 'vehicle-7',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 minutes ago
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        activity_type: 'vehicle_created',
        details: {
          event_type: 'vehicle_created',
          vehicle_id: '550e8400-e29b-41d4-a716-446655440005',
          name: '', // Empty name to test fallback
          status: 'draft',
          entity_id: '550e8400-e29b-41d4-a716-446655440005',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    ]

    const paginatedData = edgeCaseVehicleActivities.slice(skip, skip + limit)

    return HttpResponse.json({
      data: paginatedData,
      total: edgeCaseVehicleActivities.length,
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

    // Add edge cases and system activities
    const edgeCaseReservationActivities = [
      ...mockReservationActivities,
      // System activity (> 24 hours old)
      {
        id: 'reservation-5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(), // 27 hours ago
        user_id: 'system',
        activity_type: 'reservation_status_updated_cancelled',
        details: {
          event_type: 'reservation_status_updated_cancelled',
          reservation_id: '750e8400-e29b-41d4-a716-446655440004',
          status: 'cancelled',
          total_price: 200.0,
          entity_id: '750e8400-e29b-41d4-a716-446655440004',
          user_id: 'system',
          changes: {
            status: { from: 'pending', to: 'cancelled' },
          },
        },
      },
      // Very old activity (5 days ago)
      {
        id: 'reservation-6',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        user_id: '456e7890-e89b-12d3-a456-426614174004',
        activity_type: 'reservation_status_updated_completed',
        details: {
          event_type: 'reservation_status_updated_completed',
          reservation_id: '750e8400-e29b-41d4-a716-446655440005',
          status: 'completed',
          total_price: 400.0,
          entity_id: '750e8400-e29b-41d4-a716-446655440005',
          user_id: '456e7890-e89b-12d3-a456-426614174004',
          changes: {
            status: { from: 'collected', to: 'completed' },
          },
        },
      },
    ]

    const paginatedData = edgeCaseReservationActivities.slice(skip, skip + limit)

    return HttpResponse.json({
      data: paginatedData,
      total: edgeCaseReservationActivities.length,
    })
  }),

  // User metrics endpoint
  http.get(`${API_BASE}/admin/users/:userId/metrics`, () => {
    return HttpResponse.json({
      total_vehicles: 3,
      total_reservations: 10,
      wallet_balance: 500.00,
      total_spent: 200.00,
      total_earned: 1500.00,
      wallet_currency: 'USD',
      login_count: 25,
      account_age_days: 120,
      days_since_last_login: 2,
      draft_vehicles: 1,
      published_vehicles: 2,
      archived_vehicles: 0,
      pending_reservations: 1,
      confirmed_reservations: 2,
      completed_reservations: 5,
      cancelled_reservations: 2,
    })
  }),

  // Admin riders endpoints
  http.get(`${API_BASE}/admin/riders/:riderId`, ({ params }) => {
    return HttpResponse.json({
      id: params.riderId,
      email: 'rider@example.com',
      username: 'rider1',
      full_name: 'Jane Rider',
      is_active: true,
      is_superuser: false,
      is_beta_tester: false,
      created_at: '2024-01-02T00:00:00Z',
      login_count: 5,
      last_login_at: '2024-01-14T00:00:00Z',
      bio: 'Experienced rider',
      date_of_birth: '1990-05-15',
      average_rating: 4.5,
      rating_count: 12,
    })
  }),

  // Owner Vehicles endpoint
  http.get(`${API_BASE}/admin/users/:userId/vehicles`, ({ params, request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase()

    // Mock vehicles for owner
    const mockVehicles = [
      {
        id: 'vehicle-uuid-1',
        owner_id: params.userId,
        name: 'Tesla Model 3',
        status: 2, // FREE
        type: 0, // CAR
        sub_type: 1, // SEDAN
        picture: {
          url: 'https://beta.ownima.com/media/vehicles/tesla.jpg',
          thumbnail: 'https://beta.ownima.com/media/vehicles/tesla-thumb.jpg',
        },
        price: 75.00,
        currency: 'USD',
        minimal_price: 75.00,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-03-20T14:45:00Z',
        general_info: {
          year: 2023,
          seats: 5,
          doors: 4,
        },
        rating_stats: {
          average: 4.5,
          count: 12,
        },
      },
      {
        id: 'vehicle-uuid-2',
        owner_id: params.userId,
        name: 'BMW X5',
        status: 4, // COLLECTED
        type: 0, // CAR
        sub_type: 2, // SUV
        picture: {
          url: 'https://beta.ownima.com/media/vehicles/bmw.jpg',
          thumbnail: 'https://beta.ownima.com/media/vehicles/bmw-thumb.jpg',
        },
        price: 120.00,
        currency: 'USD',
        minimal_price: 120.00,
        created_at: '2024-02-01T08:15:00Z',
        updated_at: '2024-03-15T16:20:00Z',
        general_info: {
          year: 2024,
          seats: 7,
          doors: 5,
        },
        rating_stats: {
          average: 4.8,
          count: 8,
        },
      },
      {
        id: 'vehicle-uuid-3',
        owner_id: params.userId,
        name: 'Honda Civic Draft',
        status: 1, // DRAFT
        type: 0, // CAR
        sub_type: 1, // SEDAN
        price: 50.00,
        currency: 'USD',
        minimal_price: 50.00,
        created_at: '2024-03-10T12:00:00Z',
        updated_at: '2024-03-10T12:00:00Z',
        general_info: {
          year: 2023,
          seats: 5,
          doors: 4,
        },
      },
      {
        id: 'vehicle-uuid-4',
        owner_id: params.userId,
        name: 'Mercedes-Benz C-Class',
        status: 5, // ARCHIVED
        type: 0, // CAR
        sub_type: 1, // SEDAN
        price: 95.00,
        currency: 'USD',
        minimal_price: 95.00,
        created_at: '2023-12-01T09:30:00Z',
        updated_at: '2024-02-28T11:45:00Z',
        general_info: {
          year: 2022,
          seats: 5,
          doors: 4,
        },
        rating_stats: {
          average: 4.3,
          count: 15,
        },
      },
    ]

    let filteredVehicles = mockVehicles

    // Apply status filter
    if (status) {
      filteredVehicles = filteredVehicles.filter(v => v.status === parseInt(status))
    }

    // Apply search filter
    if (search) {
      filteredVehicles = filteredVehicles.filter(v =>
        v.name.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json(filteredVehicles)
  }),

  // Owner Reservations endpoint
  http.get(`${API_BASE}/admin/users/:userId/reservations`, ({ params, request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const dateFrom = url.searchParams.get('date_from')
    const dateTo = url.searchParams.get('date_to')
    const search = url.searchParams.get('search')?.toLowerCase()

    // Mock reservations for owner's vehicles
    const mockReservations = [
      {
        id: 'reservation-uuid-1',
        status: 4, // CONFIRMED
        date_from: '2024-04-20T10:00:00Z',
        date_to: '2024-04-25T10:00:00Z',
        total_price: 375.00,
        currency: 'USD',
        is_paid: true,
        rider: {
          id: 'rider-uuid-1',
          full_name: 'John Rider',
          email: 'john.rider@example.com',
          phone_number: '+1234567890',
          avatar: 'https://beta.ownima.com/media/avatars/john.jpg',
        },
        vehicle: {
          id: 'vehicle-uuid-1',
          name: 'Tesla Model 3',
          type: 0,
          status: 2,
          picture: {
            url: 'https://beta.ownima.com/media/vehicles/tesla.jpg',
          },
        },
        owner_id: params.userId,
        created_date: '2024-04-15T14:30:00Z',
        last_updated_date: '2024-04-18T09:15:00Z',
        pick_up: {
          location: '123 Main St, San Francisco, CA',
          date: '2024-04-20T10:00:00Z',
        },
        drop_off: {
          location: '123 Main St, San Francisco, CA',
          date: '2024-04-25T10:00:00Z',
        },
        duration: {
          days: 5,
          hours: 0,
        },
      },
      {
        id: 'reservation-uuid-2',
        status: 1, // PENDING
        date_from: '2024-05-01T12:00:00Z',
        date_to: '2024-05-03T12:00:00Z',
        total_price: 240.00,
        currency: 'USD',
        is_paid: false,
        rider: {
          id: 'rider-uuid-2',
          full_name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone_number: '+1987654321',
        },
        vehicle: {
          id: 'vehicle-uuid-2',
          name: 'BMW X5',
          type: 0,
          status: 2,
          picture: {
            url: 'https://beta.ownima.com/media/vehicles/bmw.jpg',
          },
        },
        owner_id: params.userId,
        created_date: '2024-04-28T16:45:00Z',
        last_updated_date: '2024-04-28T16:45:00Z',
        pick_up: {
          location: '456 Oak Ave, Oakland, CA',
          date: '2024-05-01T12:00:00Z',
        },
        drop_off: {
          location: '456 Oak Ave, Oakland, CA',
          date: '2024-05-03T12:00:00Z',
        },
        duration: {
          days: 2,
          hours: 0,
        },
      },
      {
        id: 'reservation-uuid-3',
        status: 7, // COMPLETED
        date_from: '2024-03-10T09:00:00Z',
        date_to: '2024-03-15T09:00:00Z',
        total_price: 375.00,
        currency: 'USD',
        is_paid: true,
        rider: {
          id: 'rider-uuid-3',
          full_name: 'Bob Wilson',
          email: 'bob.wilson@example.com',
          phone_number: '+1555666777',
          avatar: 'https://beta.ownima.com/media/avatars/bob.jpg',
        },
        vehicle: {
          id: 'vehicle-uuid-1',
          name: 'Tesla Model 3',
          type: 0,
          status: 2,
          picture: {
            url: 'https://beta.ownima.com/media/vehicles/tesla.jpg',
          },
        },
        owner_id: params.userId,
        created_date: '2024-03-05T10:20:00Z',
        last_updated_date: '2024-03-15T09:30:00Z',
        pick_up: {
          location: '789 Pine St, Berkeley, CA',
          date: '2024-03-10T09:00:00Z',
        },
        drop_off: {
          location: '789 Pine St, Berkeley, CA',
          date: '2024-03-15T09:00:00Z',
        },
        duration: {
          days: 5,
          hours: 0,
        },
      },
      {
        id: 'reservation-uuid-4',
        status: 8, // CANCELLED
        date_from: '2024-04-05T14:00:00Z',
        date_to: '2024-04-07T14:00:00Z',
        total_price: 150.00,
        currency: 'USD',
        is_paid: false,
        rider: {
          id: 'rider-uuid-4',
          full_name: 'Alice Johnson',
          email: 'alice.j@example.com',
          phone_number: '+1444555666',
        },
        vehicle: {
          id: 'vehicle-uuid-2',
          name: 'BMW X5',
          type: 0,
          status: 2,
        },
        owner_id: params.userId,
        created_date: '2024-04-01T11:00:00Z',
        last_updated_date: '2024-04-03T15:30:00Z',
        pick_up: {
          location: '321 Elm St, San Jose, CA',
          date: '2024-04-05T14:00:00Z',
        },
        drop_off: {
          location: '321 Elm St, San Jose, CA',
          date: '2024-04-07T14:00:00Z',
        },
        duration: {
          days: 2,
          hours: 0,
        },
      },
      {
        id: 'reservation-uuid-5',
        status: 5, // COLLECTED
        date_from: '2024-04-30T08:00:00Z',
        date_to: '2024-05-05T08:00:00Z',
        total_price: 600.00,
        currency: 'USD',
        is_paid: true,
        rider: {
          id: 'rider-uuid-5',
          full_name: 'Charlie Brown',
          email: 'charlie@example.com',
          phone_number: '+1222333444',
          avatar: 'https://beta.ownima.com/media/avatars/charlie.jpg',
        },
        vehicle: {
          id: 'vehicle-uuid-2',
          name: 'BMW X5',
          type: 0,
          status: 4, // Collected
          picture: {
            url: 'https://beta.ownima.com/media/vehicles/bmw.jpg',
          },
        },
        owner_id: params.userId,
        created_date: '2024-04-25T13:15:00Z',
        last_updated_date: '2024-04-30T08:10:00Z',
        pick_up: {
          location: '555 Market St, San Francisco, CA',
          date: '2024-04-30T08:00:00Z',
        },
        drop_off: {
          location: '555 Market St, San Francisco, CA',
          date: '2024-05-05T08:00:00Z',
        },
        duration: {
          days: 5,
          hours: 0,
        },
      },
    ]

    let filteredReservations = mockReservations

    // Apply status filter
    if (status) {
      filteredReservations = filteredReservations.filter(r => r.status === parseInt(status))
    }

    // Apply date range filter
    if (dateFrom) {
      filteredReservations = filteredReservations.filter(r =>
        new Date(r.date_from) >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      filteredReservations = filteredReservations.filter(r =>
        new Date(r.date_to) <= new Date(dateTo)
      )
    }

    // Apply search filter (rider name or reservation ID)
    if (search) {
      filteredReservations = filteredReservations.filter(r =>
        r.rider.full_name.toLowerCase().includes(search) ||
        r.id.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json(filteredReservations)
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

  http.patch(`${API_BASE}/admin/users/:id`, async ({ params, request }) => {
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

  http.delete(`${API_BASE}/admin/users/:id`, ({ params }) => {
    const user = mockUsers.find(u => u.id === params.id)

    if (!user) {
      return HttpResponse.json(
        { detail: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({ message: 'User deleted successfully' })
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
