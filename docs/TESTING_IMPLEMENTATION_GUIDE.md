# Testing Implementation Guide - Step by Step

## Overview

This guide provides a detailed, step-by-step approach to implementing the testing infrastructure for the Ownima Admin Dashboard. Follow these steps in order to ensure a smooth setup.

---

## Phase 1: Foundation Setup (Week 1)

### Step 1: Install Testing Dependencies (15 minutes)

**Install core testing libraries:**
```bash
bun add -D vitest @vitest/ui @vitest/coverage-v8
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
bun add -D jsdom
bun add -D msw
bun add -D happy-dom  # Alternative to jsdom, faster
```

**Verify installation:**
```bash
bun pm ls | grep -E "vitest|testing-library|msw"
```

**Expected output:**
- vitest
- @vitest/ui
- @vitest/coverage-v8
- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom
- msw

---

### Step 2: Create Vitest Configuration (30 minutes)

**Create `vitest.config.ts` in project root:**

```typescript
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.spec.{ts,tsx}',
          'src/mocks/**',
          'src/types/api-generated.ts',
          'src/**/*.d.ts',
          'src/main.tsx',
          'src/vite-env.d.ts',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  })
)
```

**Key decisions:**
- ✅ Use `jsdom` for DOM environment (can switch to `happy-dom` if needed)
- ✅ Enable `globals: true` for Jest-like API (describe, it, expect)
- ✅ Enable CSS processing for component tests
- ✅ Set 80% coverage thresholds
- ✅ Exclude generated files and test files from coverage

---

### Step 3: Create Vitest Setup File (30 minutes)

**Create `vitest.setup.ts` in project root:**

```typescript
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from './src/mocks/handlers'

// Setup MSW server
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => {
  server.listen({ 
    onUnhandledRequest: 'warn' // Change to 'error' once all handlers are complete
  })
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
  cleanup() // Cleanup React Testing Library
  vi.clearAllMocks() // Clear all mocks
})

// Close server after all tests
afterAll(() => {
  server.close()
})

// Mock window.matchMedia (used by some UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as Storage

// Mock IntersectionObserver (used by some UI components)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver
```

**Key decisions:**
- ✅ Setup MSW server for API mocking
- ✅ Auto-cleanup after each test
- ✅ Mock browser APIs (matchMedia, localStorage, IntersectionObserver)
- ✅ Clear mocks between tests

---

### Step 4: Create Test Utilities (1 hour)

**Create `src/test-utils.tsx`:**

```typescript
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import type { User } from './types'

// Create a test query client with disabled retries and caching
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  })
}

interface AllProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
  initialUser?: User | null
  initialRoute?: string
}

// Wrapper with all providers
export function AllProviders({ 
  children, 
  queryClient,
  initialUser = null,
  initialRoute = '/',
}: AllProvidersProps) {
  const testQueryClient = queryClient || createTestQueryClient()

  // Mock AuthProvider with initial user if provided
  if (initialUser) {
    // Store token in localStorage for tests
    localStorage.setItem('auth_token', 'test-token')
  }

  return (
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

// Custom render function with all providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient
    initialUser?: User | null
    initialRoute?: string
  }
) {
  const { queryClient, initialUser, initialRoute, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders 
        queryClient={queryClient}
        initialUser={initialUser}
        initialRoute={initialRoute}
      >
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }
```

**Key features:**
- ✅ Custom render function with all providers
- ✅ Test query client with disabled retries
- ✅ Support for initial user state
- ✅ Support for initial route
- ✅ Re-export all RTL utilities

---

### Step 5: Create MSW Handlers (1-2 hours)

**Create `src/mocks/handlers.ts`:**

```typescript
import { http, HttpResponse } from 'msw'

// Base URL for API (matches test environment)
const API_BASE = 'http://localhost:8000/api/v1'

// Mock data
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
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }

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
  http.get(`${API_BASE}/admin/users`, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const userType = url.searchParams.get('user_type')
    
    let filteredUsers = [...mockUsers]
    
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.email.includes(search) || 
        user.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (userType) {
      filteredUsers = filteredUsers.filter(user => user.role === userType)
    }

    return HttpResponse.json({
      data: filteredUsers,
      count: filteredUsers.length,
    })
  }),

  http.get(`${API_BASE}/admin/metrics/blocks`, () => {
    return HttpResponse.json(mockBlockMetrics)
  }),

  http.get(`${API_BASE}/admin/system/info`, () => {
    return HttpResponse.json({
      backend_version: '1.0.0',
      api_version: 'v1',
      frontend_version: '1.0.0',
      git_version: 'main',
      git_commit: 'abc123',
      python_version: '3.11',
      environment: 'development',
      project_name: 'Ownima Admin',
      domain: 'localhost',
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

  http.get(`${API_BASE}/admin/activity/recent`, () => {
    return HttpResponse.json({
      users: [],
      vehicles: [],
      reservations: [],
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
```

**Key features:**
- ✅ All API endpoints mocked
- ✅ Realistic mock data
- ✅ Support for query parameters
- ✅ Error scenarios (401, 404)
- ✅ CRUD operations

---

### Step 6: Create MSW Server Setup (15 minutes)

**Create `src/mocks/server.ts`:**

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server for Node.js (tests)
export const server = setupServer(...handlers)
```

**Create `src/mocks/browser.ts` (optional, for development):**

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker for browser (development)
export const worker = setupWorker(...handlers)
```

---

### Step 7: Update package.json Scripts (5 minutes)

**Add test scripts to `package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

### Step 8: Update .gitignore (2 minutes)

**Add test coverage to `.gitignore`:**

```gitignore
# Testing
coverage
.vitest
*.lcov
```

---

### Step 9: Create First Test - Button Component (1 hour)

**Create `src/components/ui/Button.test.tsx`:**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('renders as disabled when disabled prop is true', () => {
      render(<Button disabled>Click me</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies custom className', () => {
      render(<Button className="custom-class">Click me</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick} disabled>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Variants', () => {
    it('renders primary variant', () => {
      render(<Button variant="primary">Primary</Button>)
      const button = screen.getByRole('button')
      // Check for primary variant classes (adjust based on your implementation)
      expect(button).toBeInTheDocument()
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })
})
```

---

### Step 10: Run First Test (5 minutes)

**Run the test:**
```bash
bun test
```

**Expected output:**
```
✓ src/components/ui/Button.test.tsx (8)
  ✓ Button (8)
    ✓ Rendering (3)
      ✓ renders with text
      ✓ renders as disabled when disabled prop is true
      ✓ applies custom className
    ✓ Interactions (2)
      ✓ calls onClick when clicked
      ✓ does not call onClick when disabled
    ✓ Variants (2)
      ✓ renders primary variant
      ✓ renders secondary variant

Test Files  1 passed (1)
     Tests  8 passed (8)
```

---

### Step 11: Verify Coverage (5 minutes)

**Run coverage:**
```bash
bun test:coverage
```

**Expected output:**
```
Coverage report:
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
All files           |    5.2  |    2.1   |   4.8   |   5.2
 components/ui      |   85.0  |   75.0   |  90.0   |  85.0
  Button.tsx        |   85.0  |   75.0   |  90.0   |  85.0
```

---

## Phase 1 Checklist

**Before moving to Phase 2, verify:**

- [ ] All dependencies installed
- [ ] `vitest.config.ts` created and working
- [ ] `vitest.setup.ts` created with MSW setup
- [ ] `src/test-utils.tsx` created with providers
- [ ] `src/mocks/handlers.ts` created with all endpoints
- [ ] `src/mocks/server.ts` created
- [ ] Test scripts added to `package.json`
- [ ] `.gitignore` updated
- [ ] First test (Button) passing
- [ ] Coverage report generated
- [ ] No errors in test output

**Verification command:**
```bash
bun test:run && bun test:coverage
```

---

## Decision Points & Considerations

### 1. **jsdom vs happy-dom**
**Decision:** Start with `jsdom` (more mature)
**Alternative:** Switch to `happy-dom` if tests are slow

### 2. **Test file location**
**Decision:** Co-locate tests with source files (`Button.tsx` → `Button.test.tsx`)
**Alternative:** Separate `__tests__` directory

**Rationale:**
- ✅ Easier to find tests
- ✅ Better for component-specific tests
- ✅ Follows React Testing Library conventions

### 3. **Mock strategy**
**Decision:** Use MSW for API mocking
**Alternative:** Mock axios directly

**Rationale:**
- ✅ Works at network level
- ✅ Reusable in development
- ✅ More realistic tests

### 4. **Coverage thresholds**
**Decision:** 80% for all metrics
**Alternative:** Different thresholds per metric

**Rationale:**
- ✅ Balanced approach
- ✅ Achievable target
- ✅ Industry standard

### 5. **Global test utilities**
**Decision:** Enable `globals: true` in Vitest
**Alternative:** Import describe/it/expect in each file

**Rationale:**
- ✅ Less boilerplate
- ✅ Jest-like experience
- ✅ Easier migration

---

## Potential Blockers & Solutions

### Blocker 1: TypeScript Errors in Test Files
**Symptom:** `Cannot find name 'describe'` or `Cannot find name 'it'`

**Solution:**
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

---

### Blocker 2: MSW Not Intercepting Requests
**Symptom:** Tests fail with network errors

**Solution:**
1. Verify MSW server is started in `vitest.setup.ts`
2. Check API base URL matches handlers
3. Add logging to handlers:
```typescript
http.get('/api/users', ({ request }) => {
  console.log('MSW intercepted:', request.url)
  return HttpResponse.json([])
})
```

---

### Blocker 3: React Query Tests Hanging
**Symptom:** Tests timeout or never complete

**Solution:**
Ensure test query client has retries disabled:
```typescript
new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})
```

---

### Blocker 4: localStorage Not Defined
**Symptom:** `ReferenceError: localStorage is not defined`

**Solution:**
Already handled in `vitest.setup.ts` with mock. If still occurring, verify setup file is loaded.

---

### Blocker 5: CSS Import Errors
**Symptom:** `Unknown file extension ".css"`

**Solution:**
Ensure `css: true` in `vitest.config.ts`:
```typescript
test: {
  css: true,
}
```

---

## Next Steps After Phase 1

Once Phase 1 is complete:

1. **Create authentication tests** (Priority 1)
   - `src/contexts/AuthContext.test.tsx`
   - `src/hooks/useAuth.test.ts`
   - `src/services/auth.test.ts`

2. **Create API service tests** (Priority 1)
   - `src/services/api.test.ts`
   - `src/services/admin.test.ts`
   - `src/services/users.test.ts`

3. **Expand MSW handlers** (Priority 1)
   - Add error scenarios
   - Add edge cases
   - Add delay simulation

4. **Document test patterns** (Priority 2)
   - Create testing guidelines
   - Add examples to README
   - Create test templates

---

## Quick Reference Commands

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with UI
bun test:ui

# Run tests once (CI mode)
bun test:run

# Generate coverage report
bun test:coverage

# Run specific test file
bun test Button.test.tsx

# Run tests matching pattern
bun test --grep "Button"

# Update snapshots
bun test -u
```

---

## Troubleshooting

### Tests are slow
1. Check if retries are disabled in query client
2. Consider switching to `happy-dom`
3. Use `test.concurrent` for independent tests

### Coverage is lower than expected
1. Check excluded files in `vitest.config.ts`
2. Verify test files are running
3. Add more test cases for branches

### MSW handlers not working
1. Verify base URL matches
2. Check handler order (specific before generic)
3. Add logging to handlers
4. Check MSW server is started

### TypeScript errors
1. Verify `types` in `tsconfig.json`
2. Check `vitest/globals` is installed
3. Restart TypeScript server

---

## Success Criteria for Phase 1

✅ **All tests passing**
✅ **Coverage report generated**
✅ **No console errors**
✅ **MSW intercepting requests**
✅ **Test utilities working**
✅ **Documentation complete**

**Time to complete:** 8-10 hours
**Next phase:** Authentication & API tests (Week 2)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-05
**Owner:** Engineering Team
