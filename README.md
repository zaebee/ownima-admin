# Ownima Admin Dashboard

[![CI](https://github.com/zaebee/ownima-admin/workflows/CI/badge.svg)](https://github.com/zaebee/ownima-admin/actions)
[![Coverage Status](https://coveralls.io/repos/github/zaebee/ownima-admin/badge.svg?branch=main)](https://coveralls.io/github/zaebee/ownima-admin?branch=main)
[![Tests](https://img.shields.io/badge/tests-264%20passing-brightgreen)](https://github.com/zaebee/ownima-admin/actions)
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
   - The app is configured to connect to `https://beta.ownima.com/api/v1`
   - Update the API base URL in `src/services/api.ts` if needed

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

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

## Key Components

### Authentication
- JWT-based authentication with automatic token refresh
- Protected routes that redirect to login when unauthenticated
- Persistent login state using localStorage

### User Management
- Paginated user listings with search functionality
- Filter by user status (active/inactive)
- User profile display with role-based badges


### Dashboard
- Key metrics overview cards
- Real-time data updates

## API Integration

The admin dashboard integrates with the Ownima backend API:

- **Authentication**: OAuth2 password flow
- **Users**: CRUD operations and user management
- **Analytics**: Statistics and metrics endpoints

## Testing

The project has comprehensive test coverage using Vitest and React Testing Library.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage

Current test coverage:
- **264 tests** across 14 test files
- **44.38%** statement coverage
- **73.27%** branch coverage
- **56.25%** function coverage

**Fully tested components:**
- ✅ Authentication (LoginPage, AuthContext, ProtectedRoute)
- ✅ Dashboard (DashboardPage with metrics)
- ✅ User Management (UsersPage)
- ✅ UI Components (Button, Modal, Toast, MetricCard, LoadingSpinner)
- ✅ Services (API client, auth, users, admin)

### Test Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   ├── MetricCard.test.tsx
│   │   ├── Modal.test.tsx
│   │   └── Toast.test.tsx
│   └── ProtectedRoute.test.tsx
├── contexts/
│   └── AuthContext.test.tsx
├── hooks/
│   └── useAuth.test.ts
├── pages/
│   ├── LoginPage.test.tsx
│   ├── DashboardPage.test.tsx
│   └── UsersPage.test.tsx
└── services/
    ├── api.test.ts
    ├── auth.test.ts
    ├── admin.test.ts
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

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Implement proper error handling and loading states
4. Add appropriate type definitions
5. **Write tests for new features** - aim for 80% coverage
6. Run linter and tests before committing:
   ```bash
   npm run lint
   npm run test:run
   ```

## License

This project is proprietary software for Ownima platform administration.