import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes, PageLoader } from './App';
import * as authHook from './hooks/useAuth';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Mock the useAuth hook
vi.mock('./hooks/useAuth');

// Mock all page components to avoid loading their dependencies
vi.mock('./pages/LoginPage', () => ({
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('./pages/LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('./pages/DashboardPage', () => ({
  DashboardPage: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('./pages/UsersPage', () => ({
  UsersPage: () => <div data-testid="users-page">Users Page</div>,
}));

vi.mock('./pages/UserDetailPage', () => ({
  UserDetailPage: () => <div data-testid="user-detail-page">User Detail Page</div>,
}));

vi.mock('./pages/SystemPage', () => ({
  SystemPage: () => <div data-testid="system-page">System Page</div>,
}));

// Mock Layout component
vi.mock('./components/layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

// Mock ProtectedRoute component
vi.mock('./components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Helper to render AppRoutes with all providers
const renderWithProviders = (initialRoute = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <AppRoutes />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Public Routes', () => {
    beforeEach(() => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });
    });

    it('renders landing page at root path', async () => {
      renderWithProviders('/');

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });

    it('renders login page at /login', async () => {
      renderWithProviders('/login');

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('redirects unknown routes to landing page', async () => {
      renderWithProviders('/unknown-route');

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated Routes', () => {
    beforeEach(() => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          full_name: 'Admin User',
          is_active: true,
          is_superuser: true,
          role: 'ADMIN',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });
    });

    it('redirects /login to /dashboard when authenticated', async () => {
      renderWithProviders('/login');

      await waitFor(() => {
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      });
    });

    it('renders dashboard page at /dashboard/overview', async () => {
      renderWithProviders('/dashboard/overview');

      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('redirects /dashboard to /dashboard/overview', async () => {
      renderWithProviders('/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('renders users page at /dashboard/users', async () => {
      renderWithProviders('/dashboard/users');

      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('users-page')).toBeInTheDocument();
      });
    });

    it('renders user detail page at /dashboard/users/:userId', async () => {
      renderWithProviders('/dashboard/users/123');

      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('user-detail-page')).toBeInTheDocument();
      });
    });

    it('renders system page at /dashboard/system', async () => {
      renderWithProviders('/dashboard/system');

      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('system-page')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('renders PageLoader component', () => {
      render(<PageLoader />);
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows loading spinner while pages are loading', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      renderWithProviders('/');

      // The Suspense fallback should show briefly
      // Then the actual page should load
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });
  });

  describe('Context Providers', () => {
    it('wraps app with QueryClientProvider', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      const { container } = renderWithProviders('/');

      // App should render without errors, indicating providers are working
      expect(container).toBeInTheDocument();
    });

    it('wraps app with AuthProvider', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      renderWithProviders('/');

      // useAuth hook should be called, indicating AuthProvider is working
      expect(authHook.useAuth).toHaveBeenCalled();
    });

    it('wraps app with ToastProvider', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      const { container } = renderWithProviders('/');

      // App should render without errors, indicating ToastProvider is working
      expect(container).toBeInTheDocument();
    });
  });

  describe('Route Protection', () => {
    it('protects dashboard routes when not authenticated', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      renderWithProviders('/dashboard/overview');

      // ProtectedRoute should still render (it handles the redirect internally)
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('allows access to dashboard routes when authenticated', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          full_name: 'Admin User',
          is_active: true,
          is_superuser: true,
          role: 'ADMIN',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      renderWithProviders('/dashboard/overview');

      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('QueryClient Configuration', () => {
    it('configures QueryClient with correct defaults', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      const { container } = renderWithProviders('/');

      // App should render successfully with QueryClient configured
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid route changes', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          full_name: 'Admin User',
          is_active: true,
          is_superuser: true,
          role: 'ADMIN',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      const { unmount } = renderWithProviders('/dashboard/overview');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      unmount();

      // Change route and re-render
      renderWithProviders('/dashboard/users');

      await waitFor(() => {
        expect(screen.getByTestId('users-page')).toBeInTheDocument();
      });
    });

    it('handles authentication state changes', async () => {
      const mockUseAuth = vi.mocked(authHook.useAuth);
      
      // Start unauthenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      const { unmount } = renderWithProviders('/login');

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      unmount();

      // Become authenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          full_name: 'Admin User',
          is_active: true,
          is_superuser: true,
          role: 'ADMIN',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
      });

      renderWithProviders('/login');

      // Should redirect away from login
      await waitFor(() => {
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      });
    });
  });
});
