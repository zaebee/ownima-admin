# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - TypeScript check and production build
- `npm run lint` - Run ESLint (or use `bun run lint` for faster execution)
- `npm run preview` - Preview production build locally

### Type Generation
- `npm run generate-types` - Generate TypeScript types from live API (https://beta.ownima.com/api/v1/openapi.json)
- `npm run generate-types:local` - Generate types from local API (http://localhost:8000/api/v1/openapi.json)

## Architecture Overview

### API Integration Pattern
The application follows a layered API integration approach:

1. **API Client Layer** (`src/services/api.ts`):
   - Centralized Axios instance with automatic JWT token injection
   - Automatic 401 handling with redirect to login
   - Base URL: `https://beta.ownima.com/api/v1`

2. **Service Layer** (`src/services/`):
   - `authService` - Authentication operations (login, getCurrentUser)
   - `adminService` - Admin dashboard metrics, user management, system monitoring
   - `userService` - User CRUD operations with generated types
   - Services handle API response transformation and error handling

3. **Type Safety**:
   - Manual types in `src/types/index.ts` for application-level interfaces
   - Auto-generated types in `src/types/api-generated.ts` from OpenAPI schema
   - User forms use generated types (`UserRegister`, `UserUpdate`) to ensure schema compliance

### State Management Architecture
- **Authentication**: React Context (`AuthContext`) with localStorage persistence
- **Server State**: TanStack Query with 5-minute stale time and automatic retries
- **UI State**: Component-level useState for form data and local UI state

### Component Architecture
The application uses a component hierarchy optimized for reusability:

```
Layout (persistent shell)
├── Sidebar (collapsible, localStorage persistence)
├── Header (user menu, logout)
└── Page Content
    ├── MetricCard (reusable dashboard cards)
    ├── Modal (UserCreateModal, UserEditModal)
    └── UI Components (Button, LoadingSpinner, etc.)
```

### Data Flow Patterns

#### User Management Flow
1. **UsersPage** queries `/admin/users` via `adminService.getAdminUsers()`
2. **API Response Mapping**: Backend uses different field names (`role` vs `user_type`, `created_at` vs `registration_date`)
3. **Data Normalization**: Transform API response to UI-compatible format in component
4. **Form Handling**: User modals use auto-generated types to ensure API schema compliance

#### Dashboard Metrics Flow
1. **DashboardPage** queries `/admin/metrics/overview` for 9 key metrics
2. **Real-time Updates**: Automatic refresh every 30-60 seconds via TanStack Query
3. **MetricCard Components**: Reusable cards with loading states, colors, and icons

#### System Monitoring Flow
1. **SystemPage** fetches system info, errors, and user activities
2. **Activity Handling**: Backend sends `type` field (lowercase), frontend normalizes to uppercase
3. **Error Display**: Color-coded system errors with resolution status

### Authentication & Routing
- **Protected Routes**: `/dashboard/*` requires authentication
- **Token Management**: JWT stored in localStorage with automatic injection
- **Route Structure**: Nested routes under `/dashboard` (overview, users, system)
- **Public Routes**: Landing page (`/`) and login (`/login`)

### API Response Handling
The application handles multiple API response formats:
- Direct arrays: `AdminUser[]`
- Paginated: `{data: AdminUser[], count: number}`
- Standard: `PaginatedResponse<AdminUser>`

Components include normalization logic to handle these variations consistently.

### Styling & UI
- **Tailwind CSS 4** with utility-first approach
- **Headless UI** for accessible components (Modal, forms)
- **Heroicons** for consistent iconography
- **Gradient themes** throughout UI with primary/indigo color scheme
- **Responsive design** with mobile-first approach

### Key Integration Points
- **OpenAPI Schema**: Auto-generate types to maintain API compatibility
- **Field Mapping**: Handle backend/frontend field name differences in data transformation
- **Error Boundaries**: Automatic error handling with user-friendly fallbacks
- **Loading States**: Consistent loading patterns across all async operations