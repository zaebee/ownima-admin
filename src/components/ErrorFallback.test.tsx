import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorFallback, MinimalErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockErrorInfo = {
    componentStack: '\n    at Component\n    at ErrorBoundary',
  };

  describe('Basic Rendering', () => {
    it('renders error fallback UI', () => {
      render(<ErrorFallback error={mockError} />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('displays user-friendly message', () => {
      render(<ErrorFallback error={mockError} />);

      expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
      expect(screen.getByText(/your data is safe/)).toBeInTheDocument();
    });

    it('shows error icon', () => {
      const { container } = render(<ErrorFallback error={mockError} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('shows Try Again button when resetError is provided', () => {
      const resetError = vi.fn();
      render(<ErrorFallback error={mockError} resetError={resetError} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('does not show Try Again button when resetError is not provided', () => {
      render(<ErrorFallback error={mockError} />);

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('shows Reload Page button', () => {
      render(<ErrorFallback error={mockError} />);

      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    it('shows Go to Home button', () => {
      render(<ErrorFallback error={mockError} />);

      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
    });

    it('calls resetError when Try Again is clicked', async () => {
      const user = userEvent.setup();
      const resetError = vi.fn();

      render(<ErrorFallback error={mockError} resetError={resetError} />);

      await user.click(screen.getByRole('button', { name: /try again/i }));

      expect(resetError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Details', () => {
    it('shows error details in development mode by default', () => {
      render(<ErrorFallback error={mockError} errorInfo={mockErrorInfo} />);

      if (import.meta.env.DEV) {
        expect(screen.getByText(/Error Details/)).toBeInTheDocument();
        expect(screen.getByText(/Test error message/)).toBeInTheDocument();
      }
    });

    it('hides error details when showDetails is false', () => {
      render(<ErrorFallback error={mockError} errorInfo={mockErrorInfo} showDetails={false} />);

      expect(screen.queryByText(/Error Details/)).not.toBeInTheDocument();
    });

    it('shows error details when showDetails is true', () => {
      render(<ErrorFallback error={mockError} errorInfo={mockErrorInfo} showDetails={true} />);

      expect(screen.getByText(/Error Details/)).toBeInTheDocument();
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
    });

    it('shows stack trace when available', () => {
      render(<ErrorFallback error={mockError} errorInfo={mockErrorInfo} showDetails={true} />);

      expect(screen.getByText('View stack trace')).toBeInTheDocument();
    });

    it('expands stack trace on click', async () => {
      const user = userEvent.setup();

      render(<ErrorFallback error={mockError} errorInfo={mockErrorInfo} showDetails={true} />);

      const summary = screen.getByText('View stack trace');
      await user.click(summary);

      expect(screen.getByText(/at Component/)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has proper layout classes', () => {
      const { container } = render(<ErrorFallback error={mockError} />);

      const wrapper = container.querySelector('.min-h-screen');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('has gradient background', () => {
      const { container } = render(<ErrorFallback error={mockError} />);

      const wrapper = container.querySelector('.bg-gradient-to-br');
      expect(wrapper).toBeInTheDocument();
    });

    it('has rounded card with shadow', () => {
      const { container } = render(<ErrorFallback error={mockError} />);

      const card = container.querySelector('.rounded-xl.shadow-xl');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    it('shows help text at bottom', () => {
      render(<ErrorFallback error={mockError} />);

      expect(screen.getByText(/If the problem persists/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible heading', () => {
      render(<ErrorFallback error={mockError} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Oops! Something went wrong');
    });

    it('has accessible button labels', () => {
      const resetError = vi.fn();
      render(<ErrorFallback error={mockError} resetError={resetError} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
    });

    it('buttons have proper focus styles', () => {
      render(<ErrorFallback error={mockError} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles error without message', () => {
      const emptyError = new Error();
      render(<ErrorFallback error={emptyError} showDetails={true} />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('handles missing errorInfo', () => {
      render(<ErrorFallback error={mockError} showDetails={true} />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('handles very long error messages', () => {
      const longError = new Error('A'.repeat(500));
      render(<ErrorFallback error={longError} showDetails={true} />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });
});

describe('MinimalErrorFallback', () => {
  const mockError = new Error('Minimal error');

  describe('Basic Rendering', () => {
    it('renders minimal error UI', () => {
      render(<MinimalErrorFallback error={mockError} />);

      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(<MinimalErrorFallback error={mockError} />);

      expect(screen.getByText('Minimal error')).toBeInTheDocument();
    });

    it('shows reload button', () => {
      render(<MinimalErrorFallback error={mockError} />);

      expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    });
  });

  describe('Fallback Message', () => {
    it('shows default message when error has no message', () => {
      const emptyError = new Error();
      render(<MinimalErrorFallback error={emptyError} />);

      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has minimal styling', () => {
      const { container } = render(<MinimalErrorFallback error={mockError} />);

      const wrapper = container.querySelector('.min-h-screen');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('has centered text', () => {
      const { container } = render(<MinimalErrorFallback error={mockError} />);

      const textCenter = container.querySelector('.text-center');
      expect(textCenter).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible heading', () => {
      render(<MinimalErrorFallback error={mockError} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Application Error');
    });

    it('has accessible button', () => {
      render(<MinimalErrorFallback error={mockError} />);

      expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    });
  });
});
