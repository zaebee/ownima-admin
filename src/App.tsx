import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './hooks/useAuth';
import { useAuthErrorHandler } from './hooks/useAuthErrorHandler';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { reportError } from './utils/errorReporting';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const UsersPage = lazy(() => import('./pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const UserDetailPage = lazy(() =>
  import('./pages/UserDetailPage').then((m) => ({ default: m.UserDetailPage }))
);
const SystemPage = lazy(() =>
  import('./pages/SystemPage').then((m) => ({ default: m.SystemPage }))
);
const ActivityPage = lazy(() =>
  import('./pages/ActivityPage').then((m) => ({ default: m.ActivityPage }))
);
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <LoadingSpinner size="lg" />
  </div>
);

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Handle authentication errors from API interceptor
  useAuthErrorHandler();

  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <ErrorFallback error={error} errorInfo={errorInfo} resetError={reset} />
      )}
      onError={(error, errorInfo) => reportError(error, errorInfo, { location: 'AppRoutes' })}
    >
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary
                    fallback={(error, errorInfo, reset) => (
                      <ErrorFallback error={error} errorInfo={errorInfo} resetError={reset} />
                    )}
                    onError={(error, errorInfo) =>
                      reportError(error, errorInfo, { location: 'Dashboard' })
                    }
                  >
                    <Suspense fallback={<LoadingSpinner size="lg" />}>
                      <Routes>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<DashboardPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="users/:userId" element={<UserDetailPage />} />
                        <Route path="activity" element={<ActivityPage />} />
                        <Route path="system" element={<SystemPage />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => reportError(error, errorInfo, { location: 'App' })}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
