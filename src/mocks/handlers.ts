import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

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
];

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
};

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/access-token`, async ({ request }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (username === 'admin@example.com' && password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
      });
    }

    return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
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
    });
  }),

  // Admin endpoints
  http.get(`${API_BASE}/admin/users`, () => {
    return HttpResponse.json({
      data: mockUsers,
      count: mockUsers.length,
    });
  }),

  http.get(`${API_BASE}/admin/metrics/blocks`, () => {
    return HttpResponse.json(mockBlockMetrics);
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
    });
  }),

  http.get(`${API_BASE}/admin/system/errors`, () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE}/admin/activity/recent`, () => {
    return HttpResponse.json({
      users: [],
      vehicles: [],
      reservations: [],
    });
  }),

  http.get(`${API_BASE}/admin/activity/users`, () => {
    return HttpResponse.json({
      data: [{ id: '1', timestamp: '2024-01-01T12:00:00Z', activity_type: 'LOGIN', details: {} }],
      total: 1,
    });
  }),

  http.get(`${API_BASE}/admin/activity/vehicles`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          timestamp: '2024-01-01T12:00:00Z',
          activity_type: 'VEHICLE_CREATED',
          details: {},
        },
      ],
      total: 1,
    });
  }),

  http.get(`${API_BASE}/admin/activity/reservations`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          timestamp: '2024-01-01T12:00:00Z',
          activity_type: 'RESERVATION_CREATED',
          details: {},
        },
      ],
      total: 1,
    });
  }),

  // User CRUD endpoints
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json({
      data: mockUsers,
      count: mockUsers.length,
    });
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);

    if (!user) {
      return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  http.post(`${API_BASE}/users`, async ({ request }) => {
    const newUser = await request.json();

    return HttpResponse.json(
      {
        id: '3',
        ...newUser,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.patch(`${API_BASE}/users/:id`, async ({ params, request }) => {
    const updates = await request.json();
    const user = mockUsers.find((u) => u.id === params.id);

    if (!user) {
      return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({
      ...user,
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${API_BASE}/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);

    if (!user) {
      return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({ message: 'User deleted successfully' });
  }),
];
