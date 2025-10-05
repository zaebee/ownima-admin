# Testing Implementation - Day 1 Start Plan

## Executive Summary

This document provides a step-by-step plan to start implementing the testing infrastructure **TODAY**. Follow these steps in exact order to minimize risk and ensure success.

**Total Time Estimate:** 3-4 hours for core setup
**Goal:** Have first test passing by end of session

---

## Pre-Flight Checklist

Before starting, verify:

- [ ] Git working directory is clean (`git status`)
- [ ] All dependencies are installed (`bun install`)
- [ ] Application runs successfully (`bun dev`)
- [ ] No uncommitted changes that could be lost
- [ ] You have 3-4 hours of uninterrupted time
- [ ] You've read TESTING_PLAN.md and TESTING_IMPLEMENTATION_GUIDE.md

**Create a safety branch:**
```bash
git checkout -b feature/testing-infrastructure
git push -u origin feature/testing-infrastructure
```

---

## Implementation Order (Dependency Graph)

```
1. Install Dependencies (no dependencies)
   ↓
2. Create vitest.config.ts (depends on: vite.config.ts)
   ↓
3. Create src/mocks/handlers.ts (no dependencies)
   ↓
4. Create src/mocks/server.ts (depends on: handlers.ts)
   ↓
5. Create vitest.setup.ts (depends on: server.ts)
   ↓
6. Create src/test-utils.tsx (depends on: contexts, providers)
   ↓
7. Update package.json scripts (no dependencies)
   ↓
8. Update .gitignore (no dependencies)
   ↓
9. Create src/components/ui/Button.test.tsx (depends on: test-utils.tsx)
   ↓
10. Run tests and verify (depends on: all above)
```

---

## Step-by-Step Implementation

### Step 1: Install Dependencies (15 minutes)

**Action:**
```bash
bun add -D vitest @vitest/ui @vitest/coverage-v8
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
bun add -D jsdom
bun add -D msw
```

**Validation:**
```bash
# Verify all packages installed
bun pm ls | grep -E "vitest|testing-library|msw|jsdom"
```

**Expected Output:**
```
vitest 2.x.x
@vitest/ui 2.x.x
@vitest/coverage-v8 2.x.x
@testing-library/react 16.x.x
@testing-library/jest-dom 6.x.x
@testing-library/user-event 14.x.x
jsdom 25.x.x
msw 2.x.x
```

**Rollback if needed:**
```bash
git checkout package.json bun.lock
bun install
```

**Decision Point:**
- ✅ All packages installed → Continue
- ❌ Installation errors → Check bun version, try `bun install --force`

---

### Step 2: Create vitest.config.ts (10 minutes)

**Action:**
Create `vitest.config.ts` in project root:

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

**Validation:**
```bash
# Check TypeScript compilation
bunx tsc --noEmit vitest.config.ts
```

**Expected Output:**
No errors

**Rollback if needed:**
```bash
rm vitest.config.ts
```

**Decision Point:**
- ✅ No TypeScript errors → Continue
- ❌ TypeScript errors → Check imports, verify vite.config.ts exists

---

### Step 3: Create src/mocks/handlers.ts (30 minutes)

**Action:**
Create directory and file:
```bash
mkdir -p src/mocks
```

Create `src/mocks/handlers.ts`:

```typescript
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
  // Auth
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

  // User CRUD
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

**Validation:**
```bash
bunx tsc --noEmit src/mocks/handlers.ts
```

**Expected Output:**
No errors

**Decision Point:**
- ✅ No TypeScript errors → Continue
- ❌ TypeScript errors → Check MSW imports, verify msw is installed

---

### Step 4: Create src/mocks/server.ts (5 minutes)

**Action:**
Create `src/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

**Validation:**
```bash
bunx tsc --noEmit src/mocks/server.ts
```

**Expected Output:**
No errors

---

### Step 5: Create vitest.setup.ts (20 minutes)

**Action:**
Create `vitest.setup.ts` in project root:

```typescript
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './src/mocks/server'

// Start MSW server
beforeAll(() => {
  server.listen({ 
    onUnhandledRequest: 'warn'
  })
})

// Reset handlers and cleanup after each test
afterEach(() => {
  server.resetHandlers()
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})

// Close server after all tests
afterAll(() => {
  server.close()
})

// Mock window.matchMedia
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

// Mock IntersectionObserver
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

**Validation:**
```bash
bunx tsc --noEmit vitest.setup.ts
```

**Expected Output:**
No errors

---

### Step 6: Create src/test-utils.tsx (30 minutes)

**Action:**
Create `src/test-utils.tsx`:

```typescript
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'

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
      error: () => {},
    },
  })
}

interface AllProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

export function AllProviders({ 
  children, 
  queryClient,
}: AllProvidersProps) {
  const testQueryClient = queryClient || createTestQueryClient()

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

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient
  }
) {
  const { queryClient, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }
```

**Validation:**
```bash
bunx tsc --noEmit src/test-utils.tsx
```

**Expected Output:**
No errors

**Decision Point:**
- ✅ No TypeScript errors → Continue
- ❌ TypeScript errors → Check context imports, verify all providers exist

---

### Step 7: Update package.json (5 minutes)

**Action:**
Add test scripts to `package.json`:

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
    "test:watch": "vitest --watch",
    "generate-types": "bunx openapi-typescript https://beta.ownima.com/api/v1/openapi.json -o src/types/api-generated.ts"
  }
}
```

**Validation:**
```bash
bun test --version
```

**Expected Output:**
```
Vitest v2.x.x
```

---

### Step 8: Update .gitignore (2 minutes)

**Action:**
Add to `.gitignore`:

```gitignore
# Testing
coverage
.vitest
*.lcov
```

**Validation:**
```bash
cat .gitignore | grep -E "coverage|vitest"
```

**Expected Output:**
```
coverage
.vitest
```

---

### Step 9: Create First Test (30 minutes)

**Action:**
Create `src/components/ui/Button.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
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
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders medium size', () => {
      render(<Button size="md">Medium</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('disables button when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
```

**Validation:**
```bash
bunx tsc --noEmit src/components/ui/Button.test.tsx
```

**Expected Output:**
No errors

---

### Step 10: Run Tests (10 minutes)

**Action:**
```bash
bun test:run
```

**Expected Output:**
```
✓ src/components/ui/Button.test.tsx (13)
  ✓ Button (13)
    ✓ Rendering (3)
      ✓ renders with text
      ✓ renders as disabled when disabled prop is true
      ✓ applies custom className
    ✓ Interactions (2)
      ✓ calls onClick when clicked
      ✓ does not call onClick when disabled
    ✓ Variants (4)
      ✓ renders primary variant
      ✓ renders secondary variant
      ✓ renders danger variant
      ✓ renders ghost variant
    ✓ Sizes (3)
      ✓ renders small size
      ✓ renders medium size
      ✓ renders large size
    ✓ Loading State (2)
      ✓ shows loading spinner when isLoading is true
      ✓ disables button when isLoading is true

Test Files  1 passed (1)
     Tests  13 passed (13)
  Start at  XX:XX:XX
  Duration  XXXms
```

**Decision Point:**
- ✅ All tests passing → SUCCESS! Continue to Step 11
- ❌ Tests failing → See Troubleshooting section below

---

### Step 11: Generate Coverage Report (5 minutes)

**Action:**
```bash
bun test:coverage
```

**Expected Output:**
```
Coverage report:
File                     | % Stmts | % Branch | % Funcs | % Lines
-------------------------|---------|----------|---------|--------
All files                |    5.2  |    2.1   |   4.8   |   5.2
 components/ui           |   90.0  |   80.0   |  95.0   |  90.0
  Button.tsx             |   90.0  |   80.0   |  95.0   |  90.0
```

**Validation:**
```bash
ls -la coverage/
```

**Expected Output:**
```
coverage/
├── index.html
├── lcov.info
└── coverage-final.json
```

---

## Validation Checklist

After completing all steps, verify:

- [ ] `bun test:run` passes all tests
- [ ] `bun test:coverage` generates report
- [ ] Coverage report shows Button.tsx with 80%+ coverage
- [ ] No TypeScript errors (`bunx tsc --noEmit`)
- [ ] No console errors in test output
- [ ] `coverage/` directory created
- [ ] All new files committed to git

---

## Troubleshooting

### Issue: "Cannot find module 'vitest'"

**Solution:**
```bash
bun install
# or
bun add -D vitest --force
```

---

### Issue: "Cannot find module '@testing-library/jest-dom/vitest'"

**Solution:**
```bash
bun add -D @testing-library/jest-dom
```

---

### Issue: "ReferenceError: describe is not defined"

**Solution:**
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

Then restart TypeScript server.

---

### Issue: Tests hang or timeout

**Solution:**
1. Check test query client has `retry: false`
2. Verify MSW server is started in setup file
3. Add timeout to specific test:
```typescript
it('test name', async () => {
  // test code
}, 10000) // 10 second timeout
```

---

### Issue: MSW not intercepting requests

**Solution:**
1. Verify API base URL matches: `http://localhost:8000/api/v1`
2. Add logging to handler:
```typescript
http.get('/api/users', ({ request }) => {
  console.log('MSW intercepted:', request.url)
  return HttpResponse.json([])
})
```
3. Check MSW server is started in `beforeAll`

---

### Issue: CSS import errors

**Solution:**
Verify `css: true` in `vitest.config.ts`:
```typescript
test: {
  css: true,
}
```

---

## Rollback Strategy

If something goes wrong and you need to start over:

```bash
# Discard all changes
git checkout .
git clean -fd

# Remove installed packages
rm -rf node_modules
bun install

# Start fresh
git checkout -b feature/testing-infrastructure-v2
```

---

## Success Criteria

✅ **Phase 1 Complete When:**
- All 13 Button tests passing
- Coverage report generated
- No TypeScript errors
- No console errors
- Documentation complete

**Next Steps:**
- Commit changes
- Push to remote
- Create PR for review
- Start Phase 2: Authentication tests

---

## Commit Strategy

After successful completion:

```bash
# Stage all new files
git add vitest.config.ts vitest.setup.ts
git add src/mocks/
git add src/test-utils.tsx
git add src/components/ui/Button.test.tsx
git add package.json .gitignore

# Commit with descriptive message
git commit -m "feat: add testing infrastructure with Vitest, RTL, and MSW

- Install Vitest, React Testing Library, MSW
- Configure Vitest with jsdom environment
- Setup MSW handlers for API mocking
- Create test utilities with all providers
- Add first test for Button component (13 tests passing)
- Configure coverage reporting with 80% thresholds

Coverage: Button component at 90%+
Tests: 13/13 passing"

# Push to remote
git push origin feature/testing-infrastructure
```

---

## Time Tracking

Track your actual time vs estimates:

| Step | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| 1. Install deps | 15 min | ___ | |
| 2. vitest.config | 10 min | ___ | |
| 3. MSW handlers | 30 min | ___ | |
| 4. MSW server | 5 min | ___ | |
| 5. vitest.setup | 20 min | ___ | |
| 6. test-utils | 30 min | ___ | |
| 7. package.json | 5 min | ___ | |
| 8. .gitignore | 2 min | ___ | |
| 9. First test | 30 min | ___ | |
| 10. Run tests | 10 min | ___ | |
| 11. Coverage | 5 min | ___ | |
| **Total** | **~3 hours** | ___ | |

---

## What's Next?

After Phase 1 is complete and merged:

**Phase 2 - Week 2: Critical Path Tests**
1. Authentication tests (AuthContext, useAuth, auth service)
2. API service tests (api client, interceptors)
3. Admin service tests (user management, metrics)

**Estimated Time:** 20-25 hours
**Goal:** 60% overall coverage, 90%+ for critical paths

---

**Document Version:** 1.0
**Last Updated:** 2025-10-05
**Owner:** Engineering Team
