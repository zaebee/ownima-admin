import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemErrorsPanel } from './SystemErrorsPanel';
import { type SystemError } from '../mocks/systemErrors';

describe('SystemErrorsPanel', () => {
  const mockErrors: SystemError[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      level: 'CRITICAL',
      source: 'Database',
      message: 'Connection pool exhausted',
      error_code: 'DB_POOL_EXHAUSTED',
      affected_users: 45,
      resolved: false,
      tags: ['database', 'performance'],
      stack_trace: 'at ConnectionPool.acquire (pool.js:234)',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      level: 'ERROR',
      source: 'API Gateway',
      message: 'Rate limit exceeded',
      error_code: 'RATE_LIMIT_EXCEEDED',
      user_id: 'user_123',
      request_id: 'req_abc',
      resolved: true,
      resolution_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      tags: ['rate-limiting'],
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      level: 'WARNING',
      source: 'Payment Service',
      message: 'Payment gateway slow response',
      error_code: 'PAYMENT_SLOW',
      affected_users: 3,
      resolved: true,
      tags: ['payment'],
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      level: 'INFO',
      source: 'Cache Service',
      message: 'Cache miss rate high',
      resolved: false,
      tags: ['cache'],
    },
  ];

  const mockStatistics = {
    total: 4,
    critical: 1,
    errors: 1,
    warnings: 1,
    resolved: 2,
    unresolved: 2,
    resolutionRate: '50.0',
  };

  describe('Basic Rendering', () => {
    it('renders panel header', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('Recent System Errors')).toBeInTheDocument();
    });

    it('renders live monitoring indicator', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('Live monitoring')).toBeInTheDocument();
    });

    it('renders all errors', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('Connection pool exhausted')).toBeInTheDocument();
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
      expect(screen.getByText('Payment gateway slow response')).toBeInTheDocument();
      expect(screen.getByText('Cache miss rate high')).toBeInTheDocument();
    });

    it('renders empty state when no errors', () => {
      render(<SystemErrorsPanel errors={[]} />);

      expect(screen.getByText('No errors found')).toBeInTheDocument();
      expect(screen.getByText('System is running smoothly')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('renders statistics cards when provided', () => {
      render(<SystemErrorsPanel errors={mockErrors} statistics={mockStatistics} />);

      // Check for statistics labels
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.getByText('Warnings')).toBeInTheDocument();
      expect(screen.getByText('Unresolved')).toBeInTheDocument();
      expect(screen.getByText('Resolution')).toBeInTheDocument();
      expect(screen.getByText('50.0%')).toBeInTheDocument();

      // Check that statistics values are displayed
      const statsSection = screen.getByText('Total').closest('.grid');
      expect(statsSection).toHaveTextContent('4');
      expect(statsSection).toHaveTextContent('1');
      expect(statsSection).toHaveTextContent('2');

      // Check for "Resolved" in statistics (not in error status)
      const resolvedStats = screen.getAllByText('Resolved');
      expect(resolvedStats.length).toBeGreaterThan(0);
    });

    it('does not render statistics when not provided', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.queryByText('Total')).not.toBeInTheDocument();
    });
  });

  describe('Error Level Display', () => {
    it('displays CRITICAL level with correct styling', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      // Find the badge within the error card (not the filter button)
      const criticalBadges = screen.getAllByText('CRITICAL');
      const criticalBadge = criticalBadges.find((el) => el.classList.contains('bg-red-100'));
      expect(criticalBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('displays ERROR level with correct styling', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const errorBadges = screen.getAllByText('ERROR');
      const errorBadge = errorBadges.find((el) => el.classList.contains('bg-orange-100'));
      expect(errorBadge).toHaveClass('bg-orange-100', 'text-orange-800');
    });

    it('displays WARNING level with correct styling', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const warningBadges = screen.getAllByText('WARNING');
      const warningBadge = warningBadges.find((el) => el.classList.contains('bg-yellow-100'));
      expect(warningBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('displays INFO level with correct styling', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const infoBadges = screen.getAllByText('INFO');
      const infoBadge = infoBadges.find((el) => el.classList.contains('bg-blue-100'));
      expect(infoBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  describe('Error Metadata', () => {
    it('displays error code when present', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('DB_POOL_EXHAUSTED')).toBeInTheDocument();
      expect(screen.getByText('RATE_LIMIT_EXCEEDED')).toBeInTheDocument();
    });

    it('displays affected users count', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('45 users affected')).toBeInTheDocument();
      expect(screen.getByText('3 users affected')).toBeInTheDocument();
    });

    it('displays user ID when present', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('user_123')).toBeInTheDocument();
    });

    it('displays request ID when present', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('req_abc')).toBeInTheDocument();
    });

    it('displays source system', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('API Gateway')).toBeInTheDocument();
      expect(screen.getByText('Payment Service')).toBeInTheDocument();
    });

    it('displays tags', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByText('#database')).toBeInTheDocument();
      expect(screen.getByText('#performance')).toBeInTheDocument();
      expect(screen.getByText('#rate-limiting')).toBeInTheDocument();
      expect(screen.getByText('#payment')).toBeInTheDocument();
    });
  });

  describe('Status Indicators', () => {
    it('shows resolved status for resolved errors', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const resolvedStatuses = screen.getAllByText('Resolved');
      expect(resolvedStatuses).toHaveLength(2);
    });

    it('shows active status for unresolved errors', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses).toHaveLength(2);
    });
  });

  describe('Filtering', () => {
    it('renders all filter buttons', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'CRITICAL' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ERROR' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'WARNING' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'INFO' })).toBeInTheDocument();
    });

    it('filters by CRITICAL level', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      await user.click(screen.getByRole('button', { name: 'CRITICAL' }));

      expect(screen.getByText('Connection pool exhausted')).toBeInTheDocument();
      expect(screen.queryByText('Rate limit exceeded')).not.toBeInTheDocument();
      expect(screen.queryByText('Payment gateway slow response')).not.toBeInTheDocument();
    });

    it('filters by ERROR level', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      await user.click(screen.getByRole('button', { name: 'ERROR' }));

      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
      expect(screen.queryByText('Connection pool exhausted')).not.toBeInTheDocument();
    });

    it('filters by WARNING level', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      await user.click(screen.getByRole('button', { name: 'WARNING' }));

      expect(screen.getByText('Payment gateway slow response')).toBeInTheDocument();
      expect(screen.queryByText('Connection pool exhausted')).not.toBeInTheDocument();
    });

    it('filters by INFO level', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      await user.click(screen.getByRole('button', { name: 'INFO' }));

      expect(screen.getByText('Cache miss rate high')).toBeInTheDocument();
      expect(screen.queryByText('Connection pool exhausted')).not.toBeInTheDocument();
    });

    it('shows all errors when ALL filter is selected', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      // First filter to CRITICAL
      await user.click(screen.getByRole('button', { name: 'CRITICAL' }));
      expect(screen.queryByText('Rate limit exceeded')).not.toBeInTheDocument();

      // Then back to ALL
      await user.click(screen.getByRole('button', { name: 'ALL' }));
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
    });

    it('highlights active filter button', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      const criticalButton = screen.getByRole('button', { name: 'CRITICAL' });
      await user.click(criticalButton);

      expect(criticalButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  describe('Show/Hide Resolved Toggle', () => {
    it('renders show resolved checkbox', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      expect(screen.getByRole('checkbox', { name: /show resolved/i })).toBeInTheDocument();
    });

    it('checkbox is checked by default', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const checkbox = screen.getByRole('checkbox', { name: /show resolved/i });
      expect(checkbox).toBeChecked();
    });

    it('hides resolved errors when unchecked', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      const checkbox = screen.getByRole('checkbox', { name: /show resolved/i });
      await user.click(checkbox);

      expect(screen.getByText('Connection pool exhausted')).toBeInTheDocument();
      expect(screen.queryByText('Rate limit exceeded')).not.toBeInTheDocument();
      expect(screen.queryByText('Payment gateway slow response')).not.toBeInTheDocument();
    });

    it('shows resolved errors when checked', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      const checkbox = screen.getByRole('checkbox', { name: /show resolved/i });

      // Uncheck first
      await user.click(checkbox);
      expect(screen.queryByText('Rate limit exceeded')).not.toBeInTheDocument();

      // Check again
      await user.click(checkbox);
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
    });
  });

  describe('Expandable Details', () => {
    it('shows expand button when stack trace is present', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const expandButtons = screen.getAllByText('Show details');
      expect(expandButtons.length).toBeGreaterThan(0);
    });

    it('expands error details on click', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      const expandButton = screen.getAllByText('Show details')[0];
      await user.click(expandButton);

      expect(screen.getByText('Stack Trace:')).toBeInTheDocument();
      expect(screen.getByText(/at ConnectionPool.acquire/)).toBeInTheDocument();
    });

    it('collapses error details on second click', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      const expandButton = screen.getAllByText('Show details')[0];

      // Expand
      await user.click(expandButton);
      expect(screen.getByText('Stack Trace:')).toBeInTheDocument();

      // Collapse
      const collapseButton = screen.getByText('Hide details');
      await user.click(collapseButton);
      expect(screen.queryByText('Stack Trace:')).not.toBeInTheDocument();
    });

    it('shows resolution time when expanded', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      // Find the error with resolution time (Rate limit exceeded)
      const errorCards = screen.getAllByText('Show details');
      await user.click(errorCards[1]); // Second error has resolution_time

      expect(screen.getByText('Resolved at:')).toBeInTheDocument();
    });

    it('only expands one error at a time', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      const expandButtons = screen.getAllByText('Show details');

      // Expand first error
      await user.click(expandButtons[0]);
      expect(screen.getByText(/at ConnectionPool.acquire/)).toBeInTheDocument();

      // Expand second error
      await user.click(expandButtons[1]);
      expect(screen.queryByText(/at ConnectionPool.acquire/)).not.toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    it('combines level filter and resolved toggle', async () => {
      const user = userEvent.setup();
      render(<SystemErrorsPanel errors={mockErrors} />);

      // Filter to ERROR level
      await user.click(screen.getByRole('button', { name: 'ERROR' }));
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();

      // Hide resolved
      const checkbox = screen.getByRole('checkbox', { name: /show resolved/i });
      await user.click(checkbox);

      // Should show no errors (ERROR level error is resolved)
      expect(screen.queryByText('Rate limit exceeded')).not.toBeInTheDocument();
      expect(screen.getByText('No errors found')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows appropriate message when filtered to level with no errors', async () => {
      const user = userEvent.setup();
      const singleError: SystemError[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'CRITICAL',
          source: 'Test',
          message: 'Test error',
          resolved: false,
        },
      ];

      render(<SystemErrorsPanel errors={singleError} />);

      await user.click(screen.getByRole('button', { name: 'WARNING' }));

      expect(screen.getByText('No errors found')).toBeInTheDocument();
      expect(screen.getByText('No warning level errors to display')).toBeInTheDocument();
    });

    it('shows appropriate message when all errors are hidden by resolved filter', async () => {
      const user = userEvent.setup();
      const resolvedErrors: SystemError[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          source: 'Test',
          message: 'Test error',
          resolved: true,
        },
      ];

      render(<SystemErrorsPanel errors={resolvedErrors} />);

      const checkbox = screen.getByRole('checkbox', { name: /show resolved/i });
      await user.click(checkbox);

      expect(screen.getByText('No errors found')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible filter buttons', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const allButton = screen.getByRole('button', { name: 'ALL' });
      expect(allButton).toBeInTheDocument();
    });

    it('has accessible checkbox with label', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const checkbox = screen.getByRole('checkbox', { name: /show resolved/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('has accessible expand/collapse buttons', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      const expandButtons = screen.getAllByRole('button', { name: /show details/i });
      expect(expandButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Timestamp Formatting', () => {
    it('displays relative time for recent errors', () => {
      render(<SystemErrorsPanel errors={mockErrors} />);

      // Should show "5m ago", "15m ago", etc.
      const timestamps = screen.getAllByText(/ago/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });
});
