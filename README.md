# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev                          # Start dev server (localhost:5173)
npm run dev:development              # Dev with local backend (localhost:8000)
npm run dev:staging                  # Dev with staging API
npm run build                        # TypeScript check + production build
npm run lint                         # ESLint (or `bun run lint` for speed)
npm run preview                      # Preview production build
```

### Testing
```bash
npm test                             # Watch mode
npm run test:run                     # Single run (use before commits)
npm run test:coverage                # Coverage report
npm run test:ui                      # Interactive test UI
vitest src/path/to/file.test.tsx     # Run single test file
```

### Type Generation
```bash
npm run generate-types               # From beta.ownima.com
npm run generate-types:development   # From localhost:8080
npm run generate-types:staging       # From stage.ownima.com
npm run generate-types:production    # From api.ownima.com
```

## Critical Architecture Patterns

### API Integration Layer

**Three-tier approach:**
1. **API Client** (`src/services/api.ts`) - Singleton with lazy initialization, auto JWT injection, 401 handling
2. **Services** (`src/services/`) - `authService`, `adminService`, `userService` with response transformation
3. **React Query** - Server state management with 5-minute stale time

**Important:** API client has `setTestBaseUrl()` and `resetClient()` methods for test isolation.

### Type Safety System

**Dual type sources:**
- **Manual types** (`src/types/index.ts`) - Application-level interfaces, UI models
- **Generated types** (`src/types/api-generated.ts`) - Auto-generated from OpenAPI schema

**When to use which:**
- Use **manual types** for: Page props, component interfaces, UI state
- Use **generated types** for: API request/response bodies, form schemas (e.g., `UserRegister`, `UserUpdate`)

**Critical field mappings (backend ≠ frontend):**
- Backend `role` → Frontend `user_type` (for users)
- Backend `created_at` → Frontend `registration_date` (in some contexts)
- Riders from `/admin/riders` don't have `role` field → Set to 'RIDER' in normalization

### State Management

**Three state layers:**
1. **Auth State** - React Context (`AuthContext`) + localStorage persistence
2. **Server State** - TanStack Query (automatic retries, 5-min stale time)
3. **UI State** - Component-level `useState` for forms and local UI

### Component Hierarchy

**Dashboard metrics pattern (DRY):**
- `MetricBlock` - Collapsible container with primary/secondary sections
- `MetricRow` - Horizontal layout (icon + label | value + trend)
- **Metric Factories** - Use factory functions to generate metric configs (avoid duplication)
- **Calculation Utilities** - Centralize business logic (KISS principle)

**Reusable UI components:**
- `Modal`, `Button`, `SkeletonLoader`, `EmptyState`, `ConfirmDialog` - Use these instead of creating new ones
- All UI components are fully tested with accessibility checks

### Routing & User Types

**Protected routes:** `/dashboard/*` requires authentication (JWT in localStorage)

**User type routing (critical):**
- OWNER → `/dashboard/users/:userId` (uses `/admin/users/:userId`)
- RIDER → `/dashboard/riders/:riderId` (uses `/admin/riders/:riderId`)
- **System auto-routes** based on `user_type` field

**Key endpoints:**
- `/admin/users` - List all users (owners + riders)
- `/admin/riders` - Rider-only list with rider-specific fields
- `/admin/riders/:riderId` - Rider detail (has `bio`, `date_of_birth`, `rating`)
- `/admin/users/:userId` - Owner detail
- `/admin/users/:userId/metrics` - User metrics (works for both owners and riders)

### API Response Normalization

**Handle multiple response formats:**
- Direct arrays: `AdminUser[]`
- Paginated: `{data: AdminUser[], count: number}`
- Standard: `PaginatedResponse<AdminUser>`

Always include normalization logic in components/services to handle these variations.

### Environment Configuration

**Auto-detection hierarchy:**
1. `VITE_ENVIRONMENT` env var (if set)
2. Hostname detection (`stage.ownima.com` → staging, `beta.ownima.com` → beta)
3. Default to `beta`

**API Base URLs:**
- Development: `http://localhost:8000/api/v1`
- Staging: `https://stage.ownima.com/api/v1`
- Beta: `https://beta.ownima.com/api/v1`
- Production: `https://beta.ownima.com/api/v1` (currently same as beta)

**Environment config file:** `src/config/environment.ts` contains all detection logic.

## Testing Strategy

**Coverage thresholds (enforced):**
- Statements: 40%, Branches: 70%, Functions: 50%

**Test patterns:**
1. **Component tests** - User interactions, rendering, accessibility
2. **Service tests** - Mock API calls, test transformations
3. **Integration tests** - Complete user flows

**Critical testing utilities:**
- MSW for API mocking (handlers in `src/mocks/`)
- `@testing-library/react` for component testing
- `@testing-library/user-event` for interactions
- API client uses fetch adapter in test env (configured in `src/services/api.ts`)

**When writing tests:**
- Always include accessibility checks (`getByRole`, `getByLabelText`)
- Test loading states and error boundaries
- Mock TanStack Query with `QueryClientProvider`

## Code Quality Rules

**Strictly enforced:**
1. **No `console.log`** - Use toast notifications for user feedback, remove debug logs
2. **No magic numbers** - Define as named constants
3. **Write tests** - Aim for 80% coverage for new features
4. **Run before commit:**
   ```bash
   npm run lint
   npm run test:run
   ```

**Style guidelines:**
- TypeScript for all code
- Use generated types for API schemas
- Implement proper error handling with loading states
- Follow existing patterns (don't over-engineer)

## Key Files for Context

**When modifying API integration:**
- Read `src/services/api.ts` (API client singleton)
- Read `src/types/index.ts` (manual types)
- Check `src/types/api-generated.ts` (generated types)

**When adding new pages:**
- Reference `src/pages/DashboardPage.tsx` (metrics pattern)
- Reference `src/pages/UsersPage.tsx` (CRUD pattern)
- Check `src/App.tsx` (routing structure)

**When working with auth:**
- Read `src/contexts/AuthContext.tsx` (auth state management)
- Read `src/components/ProtectedRoute.tsx` (route protection)

**When modifying UI components:**
- Check existing components in `src/components/ui/` before creating new ones
- All UI components have corresponding `.test.tsx` files

## Common Pitfalls

1. **API Response Mapping** - Backend field names differ from frontend (e.g., `role` vs `user_type`)
2. **Rider vs Owner Endpoints** - Riders have separate endpoints with different fields
3. **Activity Types** - Backend sends lowercase, normalize to uppercase in frontend
4. **Multiple Response Formats** - Always handle array, paginated, and standard responses
5. **Test Isolation** - Always call `apiClient.resetClient()` in `afterEach` hooks
6. **Environment Detection** - Don't hardcode URLs, use `getApiBaseUrl()` from `src/config/environment.ts`

## Architecture Philosophy

**This codebase follows:**
- **KISS** (Keep It Simple) - Don't over-engineer
- **DRY** (Don't Repeat Yourself) - Use factories and utilities
- **Component Reusability** - Favor composition over new components
- **Type Safety** - Leverage TypeScript and generated types
- **Test Coverage** - Write tests for all new features

**When in doubt:**
- Read existing code patterns before implementing new approaches
- Use existing UI components instead of creating new ones
- Follow the service layer pattern for API calls
- Write tests alongside implementation
