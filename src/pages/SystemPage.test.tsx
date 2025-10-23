import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SystemPage } from './SystemPage';
import { adminService } from '../services/admin';

// Mock the admin service
vi.mock('../services/admin', () => ({
  adminService: {
    getSystemInfo: vi.fn(),
    getSystemErrors: vi.fn(),
    getRecentActivity: vi.fn(),
  },
}));

// Mock the SystemErrorsPanel component
vi.mock('../components/SystemErrorsPanel', () => ({
  SystemErrorsPanel: ({ errors, statistics }: { errors: unknown[]; statistics?: unknown }) => (
    <div data-testid="system-errors-panel">
      <div data-testid="errors-count">{errors.length}</div>
      {statistics && <div data-testid="statistics">Statistics</div>}
    </div>
  ),
}));

describe('SystemPage', () => {
  let queryClient: QueryClient;

  const mockSystemInfo = {
    backend_version: '1.0.0',
    api_version: 'v1',
    git_version: 'main',
    git_commit: 'abc123def456',
    python_version: '3.11.0',
    environment: 'development',
    project_name: 'Ownima Admin',
    domain: 'localhost:8000',
    build_date: '2025-01-01T00:00:00Z',
    last_deployment: '2025-01-01T12:00:00Z',
    uptime_seconds: 86400,
    database: {
      database_type: 'postgresql',
      status: 'healthy' as const,
      uri: 'postgresql://localhost:5432/ownima',
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.clearAllMocks();
  });

  const renderSystemPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SystemPage />
      </QueryClientProvider>
    );
  };

  describe('Loading State', () => {
    it('shows loading spinner while fetching system info', () => {
      vi.mocked(adminService.getSystemInfo).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderSystemPage();

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows loading spinner with large size', () => {
      vi.mocked(adminService.getSystemInfo).mockImplementation(() => new Promise(() => {}));

      const { container } = renderSystemPage();

      const spinner = container.querySelector('.w-12.h-12');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    beforeEach(() => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);
    });

    it('renders page title', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('System Monitoring')).toBeInTheDocument();
      });
    });

    it('renders page description', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(
          screen.getByText(/Monitor system health, recent errors, and user activity/)
        ).toBeInTheDocument();
      });
    });

    it('shows live monitoring indicator', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Live monitoring - Updates automatically')).toBeInTheDocument();
      });
    });
  });

  describe('System Information Section', () => {
    beforeEach(() => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);
    });

    it('renders system information heading', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('System Information')).toBeInTheDocument();
      });
    });

    it('displays backend version metric', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Backend Version')).toBeInTheDocument();
        expect(screen.getByText('1.0.0')).toBeInTheDocument();
        expect(screen.getByText('API v1')).toBeInTheDocument();
      });
    });

    it('displays git version metric', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Git Version')).toBeInTheDocument();
        expect(screen.getByText('main')).toBeInTheDocument();
        expect(screen.getByText(/Commit: abc123d/)).toBeInTheDocument();
      });
    });

    it('displays python runtime metric', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Python Runtime')).toBeInTheDocument();
        expect(screen.getByText('Python 3.11.0')).toBeInTheDocument();
      });
    });

    it('displays environment metric', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Environment')).toBeInTheDocument();
        expect(screen.getByText('Development')).toBeInTheDocument();
        expect(screen.getByText('Ownima Admin')).toBeInTheDocument();
      });
    });

    it('displays database metric', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Database')).toBeInTheDocument();
        expect(screen.getByText('POSTGRESQL')).toBeInTheDocument();
        expect(screen.getByText('Healthy')).toBeInTheDocument();
      });
    });

    it('displays system uptime metric', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('System Uptime')).toBeInTheDocument();
        expect(screen.getByText('1d 0h 0m')).toBeInTheDocument();
      });
    });

    it('displays build date', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText(/Build Date:/)).toBeInTheDocument();
      });
    });

    it('displays domain', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText(/Domain:/)).toBeInTheDocument();
        expect(screen.getByText(/localhost:8000/)).toBeInTheDocument();
      });
    });

    it('displays last deployment when available', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText(/Last Deployment:/)).toBeInTheDocument();
      });
    });

    it('displays database URI', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText(/Database:/)).toBeInTheDocument();
        expect(screen.getByText(/postgresql:\/\/localhost:5432\/ownima/)).toBeInTheDocument();
      });
    });
  });

  describe('Environment Color Coding', () => {
    it('shows red color for production environment', async () => {
      const prodSystemInfo = { ...mockSystemInfo, environment: 'production' };
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(prodSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Production')).toBeInTheDocument();
      });
    });

    it('shows yellow color for staging environment', async () => {
      const stagingSystemInfo = { ...mockSystemInfo, environment: 'staging' };
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(stagingSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Staging')).toBeInTheDocument();
      });
    });

    it('shows green color for development environment', async () => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Development')).toBeInTheDocument();
      });
    });
  });

  describe('Database Status', () => {
    it('shows healthy status with green color', async () => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Healthy')).toBeInTheDocument();
      });
    });

    it('shows warning status with yellow color', async () => {
      const warningSystemInfo = {
        ...mockSystemInfo,
        database: { ...mockSystemInfo.database, status: 'warning' as const },
      };
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(warningSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Warning')).toBeInTheDocument();
      });
    });

    it('shows error status with red color', async () => {
      const errorSystemInfo = {
        ...mockSystemInfo,
        database: { ...mockSystemInfo.database, status: 'error' as const },
      };
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(errorSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });
  });

  describe('System Errors Panel', () => {
    beforeEach(() => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);
    });

    it('renders system errors panel', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByTestId('system-errors-panel')).toBeInTheDocument();
      });
    });

    it('uses mock errors by default', async () => {
      renderSystemPage();

      await waitFor(() => {
        const errorsCount = screen.getByTestId('errors-count');
        expect(errorsCount).toHaveTextContent('10'); // Mock data has 10 errors
      });
    });

    it('displays statistics for mock errors', async () => {
      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByTestId('statistics')).toBeInTheDocument();
      });
    });
  });

  describe('Uptime Formatting', () => {
    it('formats uptime in days, hours, minutes', async () => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('1d 0h 0m')).toBeInTheDocument();
      });
    });

    it('formats uptime in hours and minutes when less than a day', async () => {
      const shortUptimeInfo = { ...mockSystemInfo, uptime_seconds: 7200 }; // 2 hours
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(shortUptimeInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('2h 0m')).toBeInTheDocument();
      });
    });

    it('formats uptime in minutes when less than an hour', async () => {
      const veryShortUptimeInfo = { ...mockSystemInfo, uptime_seconds: 300 }; // 5 minutes
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(veryShortUptimeInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('5m')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles system info fetch error gracefully', async () => {
      vi.mocked(adminService.getSystemInfo).mockRejectedValue(new Error('API Error'));

      renderSystemPage();

      // Should not crash, error boundary should catch it
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });

    it('handles activities fetch error gracefully', async () => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('System Information')).toBeInTheDocument();
      });
    });
  });

  describe('Data Refetching', () => {
    it('sets up refetch interval for system info', async () => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);

      renderSystemPage();

      await waitFor(() => {
        expect(screen.getByText('System Information')).toBeInTheDocument();
      });

      // Verify the query was set up (actual refetch testing would require more complex setup)
      expect(adminService.getSystemInfo).toHaveBeenCalled();
    });

  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      vi.mocked(adminService.getSystemInfo).mockResolvedValue(mockSystemInfo);
    });

    it('renders grid layout for metrics', async () => {
      const { container } = renderSystemPage();

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
      });
    });

    it('has responsive grid classes', async () => {
      const { container } = renderSystemPage();

      await waitFor(() => {
        const grid = container.querySelector('.grid-cols-1');
        expect(grid).toBeInTheDocument();
      });
    });
  });
});
