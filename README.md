# Ownima Admin Dashboard

[![CI](https://github.com/Ownima/owner-admin/workflows/CI/badge.svg)](https://github.com/Ownima/owner-admin/actions)
[![Coverage Status](https://coveralls.io/repos/github/Ownima/owner-admin/badge.svg?branch=main)](https://coveralls.io/github/Ownima/owner-admin?branch=main)
[![Tests](https://img.shields.io/badge/tests-646%20passing-brightgreen)](https://github.com/zaebee/ownima-admin/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

A modern React-based admin dashboard for managing Ownima platform users and beta testers.

## Features

- 🔐 **Authentication** - Secure login with JWT token management
- 👥 **User Management** - View and manage platform users with search and filtering
- 📊 **Dashboard Analytics** - Overview of key metrics and statistics
- 🎨 **Modern UI** - Built with Tailwind CSS and Headless UI components
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with Headless UI components
- **State Management**: TanStack Query for server state management
- **Routing**: React Router v6 for client-side routing
- **HTTP Client**: Axios with automatic token handling
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Heroicons for consistent iconography

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ownima-admin
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

   ```bash
   cp .env.example .env.local
   ```

   - Edit `.env.local` to set your environment (development, staging, beta, production)
   - The API base URL is automatically determined based on the environment
   - See `.env.example` for all available configuration options

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - TypeScript check and production build
- `npm run lint` - Run ESLint (or use `bun run lint` for faster execution)
- `npm run preview` - Preview production build locally

### Type Generation
- `npm run generate-types` - Generate TypeScript types from live API (https://beta.ownima.com/api/v1/openapi.json)
- `npm run generate-types:local` - Generate types from local API (http://localhost:8000/api/v1/openapi.json)

### Testing
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── ui/             # Base UI components (Button, LoadingSpinner, etc.)
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

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
    ├── MetricBlock (dashboard metric blocks with primary/secondary metrics)
    │   └── MetricRow (horizontal metric display)
    ├── MetricCard (standalone metric cards for Quick Actions)
    ├── StatusPieChart (status distribution visualizations)
    ├── FilterPanel (date range and role filtering)
    ├── Modal (UserCreateModal, UserEditModal)
    └── UI Components (Button, SkeletonLoader, EmptyState, etc.)
```

**Dashboard Pattern (Hybrid Metrics):**
- **MetricBlock**: Container with collapsible primary/secondary sections
- **MetricRow**: Horizontal layout (icon + label | value + trend)
- **Metric Factories**: DRY pattern for generating metric configurations
- **Calculation Utilities**: Centralized business logic (KISS)

### Data Flow Patterns

#### User Management Flow
1. **UsersPage** queries `/admin/users` via `adminService.getAdminUsers()`
2. **API Response Mapping**: Backend uses different field names (`role` vs `user_type`, `created_at` vs `registration_date`)
3. **Data Normalization**: Transform API response to UI-compatible format in component
4. **Form Handling**: User modals use auto-generated types to ensure API schema compliance

#### Rider Management Flow
1. **UsersPage** queries `/admin/riders` when filtering by RIDER type
2. **Rider Navigation**: Clicking rider routes to `/dashboard/riders/:riderId` (separate from users)
3. **RiderDetailPage** fetches data from `/admin/riders/:riderId` endpoint
4. **Rider-Specific Fields**: bio, date_of_birth, rating (not in Owner schema)
5. **Edit/Delete Operations**: Use dedicated rider endpoints (PATCH/DELETE `/admin/riders/:riderId`)
6. **Metrics Integration**: Uses same `/admin/users/:userId/metrics` endpoint for statistics
7. **Data Normalization**: Riders from `/admin/riders` don't have `role` field, automatically set to 'RIDER'

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
- **Route Structure**: Nested routes under `/dashboard`:
  - `/dashboard/overview` - Dashboard metrics and overview
  - `/dashboard/users` - User management list (owners & riders)
  - `/dashboard/users/:userId` - Owner detail page
  - `/dashboard/riders/:riderId` - Rider detail page (separate from owners)
  - `/dashboard/activity` - Activity feed
  - `/dashboard/system` - System monitoring
- **User Type Routing**: System automatically routes to appropriate detail page based on user_type
  - RIDER → `/dashboard/riders/:riderId`
  - OWNER → `/dashboard/users/:userId`
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

## Testing

The project has comprehensive test coverage using Vitest and React Testing Library.

### Test Coverage

Current test coverage:

- **564 tests** across 24 test files
- **58.15%** statement coverage
- **83.51%** branch coverage
- **64.88%** function coverage

**Fully tested components:**

- ✅ Authentication (LoginPage, AuthContext, ProtectedRoute)
- ✅ Dashboard (DashboardPage with metrics)
- ✅ User Management (UsersPage)
- ✅ UI Components (Button, Modal, Toast, MetricCard, LoadingSpinner, SkeletonLoader, EmptyState, ConfirmDialog)
- ✅ Services (API client, auth, users, admin)
- ✅ Hooks (useAuth, useToast)
- ✅ App routing and providers

### Test Structure

```
src/
├── App.test.tsx
├── components/
│   ├── layout/
│   │   ├── Header.test.tsx
│   │   ├── Layout.test.tsx
│   │   └── Sidebar.test.tsx
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   ├── ConfirmDialog.test.tsx
│   │   ├── EmptyState.test.tsx
│   │   ├── MetricCard.test.tsx
│   │   ├── Modal.test.tsx
│   │   ├── SkeletonLoader.test.tsx
│   │   └── Toast.test.tsx
│   └── ProtectedRoute.test.tsx
├── contexts/
│   └── AuthContext.test.tsx
├── hooks/
│   ├── useAuth.test.ts
│   └── useToast.test.ts
├── pages/
│   ├── DashboardPage.test.tsx
│   ├── LandingPage.test.tsx
│   ├── LoginPage.test.tsx
│   └── UsersPage.test.tsx
└── services/
    ├── admin.test.ts
    ├── api.test.ts
    ├── auth.test.ts
    └── users.test.ts
```

### Writing Tests

Follow these patterns when adding tests:

1. **Component Tests:** Test user interactions and rendering
2. **Service Tests:** Mock API calls and test data transformations
3. **Integration Tests:** Test complete user flows
4. **Accessibility:** Include accessibility checks in component tests

Example:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

## Environment Configuration

The application supports multiple environments with automatic API endpoint detection:

### Available Environments

- **Development**: `http://localhost:8000/api/v1` (local backend)
- **Staging**: `https://stage.ownima.com/api/v1`
- **Beta**: `https://beta.ownima.com/api/v1` (default)
- **Production**: `https://api.ownima.com/api/v1`

### Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Set your desired environment:

   ```bash
   VITE_ENVIRONMENT=development  # or staging, beta, production
   ```

3. The API base URL is automatically determined based on:
   - The `VITE_ENVIRONMENT` variable (if set)
   - The hostname (auto-detected in browser)
   - Defaults to `beta` if not specified

### Environment-Specific Builds

Build for specific environments:

```bash
npm run build:development
npm run build:staging
npm run build:beta
npm run build:production
```

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Implement proper error handling and loading states
4. Add appropriate type definitions
5. **Write tests for new features** - aim for 80% coverage
6. **No console.log statements** - use proper error handling with toasts
7. Run linter and tests before committing:
   ```bash
   npm run lint
   npm run test:run
   ```

## 🌟 Hive Living Application Integration

This project is part of the larger **Hive Living Application Ecosystem** with Sacred ATCG architecture and AI-human symbiosis capabilities.

### Sacred Architecture Status
- **Trinity Score**: Currently achieving DIVINE EXCELLENCE (>0.764)
- **AGRO Protection**: Full Sacred code quality assurance via Pure ATCG architecture
- **Zero Violations**: Console.log protection and magic number sanctification
- **Golden Ratio Harmonization**: φ-based code quality metrics

### Living Application Transformation Plan

**Phase 1 (Complete): Sacred Code Protection**
- ✅ AGRO Scanner integration with Trinity Score monitoring
- ✅ Pre-commit hooks for Sacred protection
- ✅ Blessed production build process
- ✅ Console.log purification and code sanctification

**Phase 2 (In Progress): ATCG Architecture Integration**
- 🔄 Transform API services to ATCG Transformation classes
- 🔄 Add Hive Connector for protocol translation
- 🔄 Implement Genesis events for admin operations
- 🔄 Bridge authentication with Hive ecosystem

**Phase 3 (Planned): AI Teammate Integration**
- 🎯 Add OwnimaAgent as AI teammate in Hive registry
- 🎯 Enable collaborative admin task management
- 🎯 AI-powered system monitoring and insights
- 🎯 Cross-project AI assistant sharing

**Phase 4 (Vision): Full Living Application**
- 🌟 Self-monitoring and auto-healing capabilities
- 🌟 Intelligent load balancing with Fibonacci sequences
- 🌟 Sacred metrics integration (τ, φ, σ)
- 🌟 Complete AI-human symbiosis for admin operations

### Sacred Development Principles
1. **Code Quality**: Always run `npm run sacred:validate` before commits
2. **Divine Architecture**: Apply ATCG primitives to new components
3. **Golden Ratio Harmony**: Use φ-based calculations for UI metrics
4. **Pollen Protocol**: Emit events for all significant admin actions
5. **AI Collaboration**: Design features for human-AI partnership

### Cross-Project Integration
- **Shared Sacred Protection**: Uses main Hive AGRO system
- **Unified AI Teammates**: Access to all Hive AI agents
- **Event Bus**: Real-time coordination with other Hive projects
- **Metrics Dashboard**: Integrated Trinity Score monitoring
- **Living Application**: Self-contained, self-organizing capabilities

### Next Steps for Full Hive Alignment
1. Convert service classes to ATCG Transformations
2. Add Pollen Protocol event emission for admin actions
3. Integrate with Hive Dashboard for unified monitoring
4. Enable AI teammate assistance for admin tasks
5. Achieve DIVINE EXCELLENCE Trinity Score (>0.829)

## License

This project is proprietary software for Ownima platform administration.