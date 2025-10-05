import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  describe('Basic Rendering', () => {
    it('renders when open', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to perform this action?')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });

    it('renders custom title and message', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          title="Delete User"
          message="This action cannot be undone."
        />
      );

      expect(screen.getByText('Delete User')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });

    it('renders custom button text', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmText="Delete"
          cancelText="Go Back"
        />
      );

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders warning variant by default', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);

      const iconWrapper = container.querySelector('.bg-yellow-100');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('renders danger variant', () => {
      const { container } = render(
        <ConfirmDialog {...defaultProps} variant="danger" />
      );

      const iconWrapper = container.querySelector('.bg-red-100');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('renders info variant', () => {
      const { container } = render(
        <ConfirmDialog {...defaultProps} variant="info" />
      );

      const iconWrapper = container.querySelector('.bg-blue-100');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('applies correct button styling for danger variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="danger" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('applies correct button styling for info variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="info" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('bg-blue-600');
    });

    it('applies correct button styling for warning variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="warning" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('bg-yellow-600');
    });
  });

  describe('User Interactions', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when loading', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <ConfirmDialog {...defaultProps} onClose={onClose} isLoading={true} />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toBeDisabled();

      await user.click(cancelButton);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('shows loading state on confirm button', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('disables both buttons when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('enables buttons when not loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={false} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(confirmButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Modal Integration', () => {
    it('passes correct props to Modal', () => {
      render(<ConfirmDialog {...defaultProps} />);

      // Modal should be rendered with content
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('uses small size for modal', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);

      // Check that modal has small size class
      const modalContent = container.querySelector('.max-w-md');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<ConfirmDialog {...defaultProps} title="Delete Item" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Delete Item');
    });

    it('has accessible button labels', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmText="Delete"
          cancelText="Cancel"
        />
      );

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders icon with proper styling', () => {
      const { container } = render(<ConfirmDialog {...defaultProps} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-6', 'w-6');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button clicks', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await user.click(confirmButton);
      await user.click(confirmButton);
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(3);
    });

    it('handles empty strings for title and message', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          title=""
          message=""
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('');
    });

    it('handles very long title text', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines in the dialog';
      render(<ConfirmDialog {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles very long message text', () => {
      const longMessage = 'This is a very long message that contains a lot of text and might wrap to multiple lines. It should still be displayed correctly in the dialog with proper formatting and spacing.';
      render(<ConfirmDialog {...defaultProps} message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe('Component Composition', () => {
    it('renders with all custom props', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Custom Title"
          message="Custom Message"
          confirmText="Yes"
          cancelText="No"
          variant="danger"
          isLoading={false}
        />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    });

    it('maintains button minimum width', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(confirmButton).toHaveClass('min-w-[80px]');
      expect(cancelButton).toHaveClass('min-w-[80px]');
    });
  });
});
