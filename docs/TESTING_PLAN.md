# Testing Strategy & Tech Debt Resolution Plan

## Executive Summary

This document outlines a comprehensive 4-week plan to introduce testing infrastructure, achieve 80%+ code coverage, and resolve identified technical debt in the Ownima Admin Dashboard.

**Current State:** Zero test coverage, no testing infrastructure
**Target State:** 80%+ coverage with Vitest, React Testing Library, MSW, and Playwright

---

## Tech Debt Findings

### 1. **No Test Coverage** ❌ CRITICAL
- Zero test files in the entire codebase
- No test configuration (Vitest, Jest, or any testing framework)
- No test utilities or mocks
- **Risk Level: CRITICAL**

### 2. **Deprecated API Methods** ⚠️ MEDIUM
Found 7 deprecated methods in `src/services/admin.ts`:
- `getMetricsOverview()` - Fallback to `getBlockMetrics()`
- `getUserStats()` - Fallback to `getBlockMetrics()`
- `getBookingStats()` - Fallback to `getBlockMetrics()`
- `getDailyStats()` - Fallback to `getBlockMetrics()`
- `getUserBlockMetrics()` - Fallback to `getBlockMetrics()`
- `getVehicleBlockMetrics()` - Fallback to `getBlockMetrics()`
- `getReservationBlockMetrics()` - Fallback to `getBlockMetrics()`

**Status:** Properly marked as deprecated with fallback implementations. Not actively used.
**Action:** Can be safely removed in next major version.

### 3. **Console Statements** ⚠️ LOW
Found 7 console statements (debugging code left in production):
- `src/pages/UsersPage.tsx` - 3 console.log statements (lines 118-120)
- `src/components/modals/UserCreateModal.tsx` - 1 console.error (line 50)
- `src/components/modals/UserEditModal.tsx` - 1 console.error (line 58)
- `src/pages/UsersPage.tsx` - 1 console.error (line 138)
- `src/pages/UserDetailPage.tsx` - 1 console.error (line 75)

**Action:** Replace with proper error handling/logging service.

### 4. **Complex Component: UsersPage** ⚠️ MEDIUM
- **714 lines** - largest component
- **19 hooks** (useState, useEffect, useMemo, useCallback)
- **10+ state variables** for filters, modals, pagination
- **Inline debounce function** (lines 6-16)
- **Complex data normalization logic** (lines 143-200)

**Action:** Needs refactoring into smaller components and custom hooks.

### 5. **No Error Boundaries** ❌ MEDIUM
- No try-catch blocks in the codebase (0 found)
- Relies entirely on React Query's error handling
- No global error boundary component

**Action:** Add error boundaries for graceful degradation.

### 6. **Inconsistent Query Keys** ⚠️ LOW
- `['admin-users']` vs `['users']` - different keys for similar data
- Could cause cache invalidation issues

### 7. **Code Duplication** ⚠️ MEDIUM
- **8 useMutation patterns** with similar structure
- **4 files** with `queryClient.invalidateQueries` patterns
- Modal validation logic duplicated between UserCreate and UserEdit

### 8. **Type Safety** ✅ GOOD
- Only **2 instances** of `: any` type (excluding auto-generated)
- Generally excellent type safety

---

## Critical Areas Needing Test Coverage

### **Priority 1: Authentication & Authorization** 🔴
**Files:**
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`
- `src/services/auth.ts`
- `src/components/ProtectedRoute.tsx`

**Why Critical:**
- Security-sensitive
- Affects entire application
- Token management and storage
- 401 redirect logic

**Test Coverage Needed:**
- Login flow (success/failure)
- Token persistence in localStorage
- Auto-logout on 401
- Protected route redirects
- getCurrentUser error handling

---

### **Priority 2: API Services** 🔴
**Files:**
- `src/services/api.ts` - API client with interceptors
- `src/services/admin.ts` - Admin operations
- `src/services/users.ts` - User CRUD

**Why Critical:**
- All data flows through these services
- Token injection logic
- Error handling and retries
- Response transformation

**Test Coverage Needed:**
- Token injection in requests
- 401 handling and redirect
- API response normalization
- Error handling for network failures
- Query parameter building

---

### **Priority 3: User Management** 🟡
**Files:**
- `src/pages/UsersPage.tsx` (714 lines!)
- `src/components/modals/UserCreateModal.tsx`
- `src/components/modals/UserEditModal.tsx`

**Why Important:**
- Core admin functionality
- Complex state management
- Data mutations (create, update, delete)
- Form validation

**Test Coverage Needed:**
- User list rendering with pagination
- Search and filtering
- User creation with validation
- User editing with validation
- User deletion with confirmation
- Error handling for failed operations

---

### **Priority 4: Dashboard Metrics** 🟡
**Files:**
- `src/pages/DashboardPage.tsx`
- `src/components/ui/MetricCard.tsx`
- `src/components/ui/MetricBlock.tsx`

**Why Important:**
- Primary admin view
- Real-time data updates
- Filter functionality

**Test Coverage Needed:**
- Metrics loading states
- Filter application
- Auto-refresh behavior
- Error states

---

### **Priority 5: Reusable Components** 🟢
**Files:**
- `src/components/ui/Button.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/LoadingSpinner.tsx`
- `src/components/ui/Toast.tsx`

**Why Important:**
- Used throughout application
- UI consistency
- Accessibility

**Test Coverage Needed:**
- Component rendering
- Props handling
- Accessibility attributes
- Click handlers

---

## Implementation Plan

### **Phase 1: Foundation (Week 1)** 🏗️

#### Setup Testing Infrastructure

**Install Dependencies:**
```bash
bun add -D vitest @vitest/ui @vitest/coverage-v8
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
bun add -D jsdom
bun add -D msw
bun add -D @types/node  # If not already installed
```

**Create Configuration Files:**

1. **vitest.config.ts** - Test runner configuration
2. **vitest.setup.ts** - Global test setup
3. **src/test-utils.tsx** - Custom render functions with providers
4. **src/mocks/handlers.ts** - MSW API mocks
5. **src/mocks/server.ts** - MSW server setup
6. **src/mocks/browser.ts** - MSW browser setup (optional for dev)

**Add Scripts to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

**Deliverables:**
- ✅ All testing dependencies installed
- ✅ Vitest configuration complete
- ✅ MSW setup with basic handlers
- ✅ Test utilities with provider wrappers
- ✅ First passing test (Button component)

**Time Estimate:** 8-10 hours

---

### **Phase 2: Critical Path Tests (Week 2)** 🔴

#### Priority Order:

**1. Authentication Tests (2-3 days)**
- `src/contexts/AuthContext.test.tsx`
- `src/hooks/useAuth.test.ts`
- `src/services/auth.test.ts`
- `src/components/ProtectedRoute.test.tsx`

**Test Cases:**
- Login with valid credentials
- Login with invalid credentials
- Token persistence in localStorage
- Auto-logout on 401
- Protected route redirects
- getCurrentUser success/failure

**2. API Service Tests (2-3 days)**
- `src/services/api.test.ts` - Interceptors, token injection
- `src/services/admin.test.ts` - Admin operations
- `src/services/users.test.ts` - User CRUD

**Test Cases:**
- Token injection in requests
- 401 handling and redirect
- API response normalization
- Error handling for network failures
- Query parameter building
- Response transformation

**3. MSW Handlers (1 day)**
- Mock all API endpoints
- Create reusable handlers
- Test error scenarios

**Deliverables:**
- ✅ 80%+ coverage for authentication
- ✅ 80%+ coverage for API services
- ✅ Complete MSW handler coverage
- ✅ Documentation for test patterns

**Target Coverage:** 60% overall, 90%+ for critical paths

**Time Estimate:** 20-25 hours

---

### **Phase 3: Component Tests (Week 3)** 🟡

#### Priority Order:

**1. User Management (3-4 days)**
- `src/pages/UsersPage.test.tsx` - List, search, filter, pagination
- `src/components/modals/UserCreateModal.test.tsx` - Form validation, submission
- `src/components/modals/UserEditModal.test.tsx` - Form validation, update

**Test Cases:**
- User list rendering with data
- Search functionality
- Filter application (type, active, date range)
- Pagination navigation
- User creation with validation
- User editing with validation
- User deletion with confirmation
- Error handling for failed operations

**2. Dashboard (2-3 days)**
- `src/pages/DashboardPage.test.tsx` - Metrics display, filters
- `src/components/ui/MetricCard.test.tsx` - Rendering, props
- `src/components/ui/MetricBlock.test.tsx` - Rendering, loading states

**Test Cases:**
- Metrics loading states
- Filter application
- Auto-refresh behavior
- Error states
- Navigation to detail pages

**3. Reusable Components (1-2 days)**
- `src/components/ui/Button.test.tsx`
- `src/components/ui/Modal.test.tsx`
- `src/components/ui/LoadingSpinner.test.tsx`
- `src/components/ui/Toast.test.tsx`

**Deliverables:**
- ✅ 70%+ coverage for components
- ✅ All user management flows tested
- ✅ Dashboard metrics tested
- ✅ Reusable components tested

**Target Coverage:** 75% overall

**Time Estimate:** 20-25 hours

---

### **Phase 4: E2E Tests & Polish (Week 4)** 🟢

#### Setup Playwright

**Install:**
```bash
bun create playwright
```

**Critical User Flows:**

**1. Authentication Flow (auth.spec.ts)**
- Login with valid credentials
- Login with invalid credentials
- Auto-logout on 401
- Protected route access

**2. User Management Flow (users.spec.ts)**
- View user list
- Search and filter users
- Create new user
- Edit existing user
- Delete user

**3. Dashboard Flow (dashboard.spec.ts)**
- View metrics
- Apply filters
- Navigate to user details

**Deliverables:**
- ✅ Playwright configured
- ✅ 5-10 critical E2E tests
- ✅ CI/CD integration ready
- ✅ Test documentation

**Target Coverage:** 80%+ overall

**Time Estimate:** 15-20 hours

---

### **Phase 5: Refactoring & Optimization (Ongoing)** 🔧

#### Refactoring Priorities:

**1. Extract Custom Hooks**
```typescript
// src/hooks/useUserFilters.ts
export function useUserFilters() {
  // Extract filter logic from UsersPage
}

// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  // Extract debounce logic
}

// src/hooks/useUserMutations.ts
export function useUserMutations() {
  // Extract mutation logic
}
```

**2. Break Down UsersPage**
```
UsersPage.tsx (main container)
├── UserFilters.tsx (filter panel)
├── UserTable.tsx (table display)
├── UserTableRow.tsx (individual row)
└── UserPagination.tsx (pagination controls)
```

**3. Create Shared Mutation Hook**
```typescript
// src/hooks/useOptimisticMutation.ts
export function useOptimisticMutation<T>({
  mutationFn,
  queryKey,
  successMessage,
  errorMessage,
}) {
  // Shared mutation logic with toast notifications
}
```

**4. Remove Console Statements**
- Replace with proper logging service
- Use environment-based logging

**5. Add Error Boundaries**
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  // Catch and display errors gracefully
}
```

**6. Remove Deprecated Methods**
- Clean up `admin.service.ts`
- Remove fallback implementations

**Deliverables:**
- ✅ UsersPage refactored into smaller components
- ✅ Custom hooks extracted
- ✅ Console statements removed
- ✅ Error boundaries added
- ✅ Deprecated methods removed

**Time Estimate:** Ongoing, 10-15 hours

---

## Testing Best Practices

### 1. Test Structure
```typescript
// ✅ Good: Descriptive test names
describe('UserCreateModal', () => {
  describe('Form Validation', () => {
    it('shows error when email is invalid', async () => {
      // Test implementation
    })
    
    it('shows error when password is too short', async () => {
      // Test implementation
    })
  })
  
  describe('Form Submission', () => {
    it('creates user with valid data', async () => {
      // Test implementation
    })
  })
})
```

### 2. Query Priority
```typescript
// ✅ Good: Use accessible queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)

// ❌ Bad: Use test IDs or implementation details
screen.getByTestId('submit-button')
container.querySelector('.submit-btn')
```

### 3. User Interactions
```typescript
// ✅ Good: Use userEvent
const user = userEvent.setup()
await user.type(screen.getByLabelText(/email/i), 'test@example.com')
await user.click(screen.getByRole('button', { name: /submit/i }))

// ❌ Bad: Use fireEvent
fireEvent.change(input, { target: { value: 'test@example.com' } })
fireEvent.click(button)
```

### 4. Async Testing
```typescript
// ✅ Good: Use findBy for async elements
expect(await screen.findByText(/success/i)).toBeInTheDocument()

// ❌ Bad: Use waitFor unnecessarily
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})
```

---

## Coverage Goals

### Target Coverage by Phase:
- **Phase 1:** 0% → 20% (Infrastructure setup)
- **Phase 2:** 20% → 60% (Critical paths)
- **Phase 3:** 60% → 75% (Components)
- **Phase 4:** 75% → 80% (E2E + edge cases)

### Final Target:
- **Overall:** 80%+ coverage
- **Critical paths:** 90%+ coverage (auth, API services)
- **Components:** 75%+ coverage
- **Utils/helpers:** 85%+ coverage

---

## Estimated Effort

**Total Time:** 4-5 weeks (1 developer)

**Breakdown:**
- **Week 1:** Setup & infrastructure (8-10 hours)
- **Week 2:** Critical path tests (20-25 hours)
- **Week 3:** Component tests (20-25 hours)
- **Week 4:** E2E tests + refactoring (15-20 hours)
- **Ongoing:** Maintenance & new feature tests

**ROI:**
- Catch bugs before production
- Faster development (confidence in changes)
- Better code quality through refactoring
- Easier onboarding for new developers
- Reduced manual testing time

---

## Quick Wins (Can Start Today)

1. **Remove console statements** (30 minutes)
2. **Add Vitest configuration** (1 hour)
3. **Create first test** - Button component (1 hour)
4. **Setup MSW** (2 hours)
5. **Test AuthContext** (2-3 hours)

These quick wins will establish the testing foundation and demonstrate value immediately.

---

## Success Metrics

### Quantitative:
- ✅ 80%+ overall test coverage
- ✅ 90%+ coverage for critical paths
- ✅ 5-10 E2E tests covering critical flows
- ✅ Zero console statements in production
- ✅ All deprecated methods removed

### Qualitative:
- ✅ Developers confident making changes
- ✅ Faster PR review cycles
- ✅ Reduced production bugs
- ✅ Better code documentation through tests
- ✅ Easier onboarding for new team members

---

## Maintenance Plan

### Ongoing Practices:
1. **Test-First Development:** Write tests before implementing new features
2. **Coverage Monitoring:** Run coverage reports in CI/CD
3. **Regular Refactoring:** Address tech debt as it arises
4. **Test Review:** Include test quality in PR reviews
5. **Documentation:** Keep test patterns documented

### Monthly Reviews:
- Review coverage trends
- Identify untested areas
- Update test utilities
- Refactor complex tests
- Update MSW handlers for API changes

---

## Resources

### Documentation:
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)

### Internal:
- Test utilities: `src/test-utils.tsx`
- MSW handlers: `src/mocks/handlers.ts`
- Example tests: `src/components/ui/Button.test.tsx`

---

## Appendix: Testing Stack Rationale

### Why Vitest?
- Native Vite integration (shares config)
- Faster execution than Jest
- Jest-compatible API
- Better DX with instant feedback
- React 19 ready

### Why React Testing Library?
- Tests user behavior, not implementation
- Encourages accessibility
- Industry standard
- Great documentation

### Why MSW?
- Works at network level
- Same mocks for dev and test
- Type-safe with TypeScript
- Supports REST, GraphQL, WebSocket

### Why Playwright?
- Multi-browser support
- Faster than Cypress
- Better API with auto-waiting
- Modern and actively maintained
- Better CI/CD integration

---

**Document Version:** 1.0
**Last Updated:** 2025-10-05
**Owner:** Engineering Team
