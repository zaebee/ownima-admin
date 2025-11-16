import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test-utils';
import { userEvent } from '@testing-library/user-event';
import { BulkActionBar } from './BulkActionBar';

describe('BulkActionBar', () => {
  const mockOnClearSelection = vi.fn();
  const mockOnSelectAll = vi.fn();
  const mockOnActivate = vi.fn();
  const mockOnDeactivate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility', () => {
    it('renders when selectedCount is greater than 0', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('3 selected')).toBeInTheDocument();
    });

    it('does not render when selectedCount is 0', () => {
      render(
        <BulkActionBar
          selectedCount={0}
          onClearSelection={mockOnClearSelection}
        />
      );

      // Component returns null, so selection text shouldn't exist
      expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    });

    it('renders when selectedCount is 1', () => {
      render(
        <BulkActionBar
          selectedCount={1}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });

  describe('Selection Count Display', () => {
    it('displays correct count for single selection', () => {
      render(
        <BulkActionBar
          selectedCount={1}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('displays correct count for multiple selections', () => {
      render(
        <BulkActionBar
          selectedCount={10}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('10 selected')).toBeInTheDocument();
    });

    it('displays correct count for large selections', () => {
      render(
        <BulkActionBar
          selectedCount={999}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('999 selected')).toBeInTheDocument();
    });

    it('renders CheckCircleIcon next to count', () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={5}
          onClearSelection={mockOnClearSelection}
        />
      );

      const icon = container.querySelector('.text-indigo-600');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Select All Button', () => {
    it('shows "Select All" button when totalCount and onSelectAll are provided', () => {
      render(
        <BulkActionBar
          selectedCount={5}
          totalCount={50}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('Select all 50')).toBeInTheDocument();
    });

    it('does not show "Select All" when totalCount is not provided', () => {
      render(
        <BulkActionBar
          selectedCount={5}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.queryByText(/Select all/)).not.toBeInTheDocument();
    });

    it('does not show "Select All" when onSelectAll is not provided', () => {
      render(
        <BulkActionBar
          selectedCount={5}
          totalCount={50}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.queryByText(/Select all/)).not.toBeInTheDocument();
    });

    it('does not show "Select All" when all items are selected', () => {
      render(
        <BulkActionBar
          selectedCount={50}
          totalCount={50}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.queryByText('Select all 50')).not.toBeInTheDocument();
    });

    it('calls onSelectAll when clicked', async () => {
      const user = userEvent.setup();
      render(
        <BulkActionBar
          selectedCount={5}
          totalCount={50}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
        />
      );

      const selectAllButton = screen.getByText('Select all 50');
      await user.click(selectAllButton);

      expect(mockOnSelectAll).toHaveBeenCalledTimes(1);
    });

    it('is disabled when loading', () => {
      render(
        <BulkActionBar
          selectedCount={5}
          totalCount={50}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          isLoading={true}
        />
      );

      const selectAllButton = screen.getByText('Select all 50');
      expect(selectAllButton).toBeDisabled();
    });
  });

  describe('Clear Selection Button', () => {
    it('always renders when selectedCount > 0', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('calls onClearSelection when clicked', async () => {
      const user = userEvent.setup();
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);

      expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });

    it('is disabled when loading', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          isLoading={true}
        />
      );

      const clearButton = screen.getByText('Clear').closest('button');
      expect(clearButton).toBeDisabled();
    });

    it('renders XMarkIcon', () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const clearButton = screen.getByText('Clear').closest('button');
      const icon = clearButton?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Activate Button', () => {
    it('renders when onActivate is provided', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByRole('button', { name: /Activate/ })).toBeInTheDocument();
    });

    it('does not render when onActivate is not provided', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
    });

    it('calls onActivate when clicked', async () => {
      const user = userEvent.setup();
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onActivate={mockOnActivate}
        />
      );

      const activateButton = screen.getByRole('button', { name: /Activate/ });
      await user.click(activateButton);

      expect(mockOnActivate).toHaveBeenCalledTimes(1);
    });

    it('is disabled when loading', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onActivate={mockOnActivate}
          isLoading={true}
        />
      );

      const activateButton = screen.getByRole('button', { name: /Activate/ });
      expect(activateButton).toBeDisabled();
    });
  });

  describe('Deactivate Button', () => {
    it('renders when onDeactivate is provided', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onDeactivate={mockOnDeactivate}
        />
      );

      expect(screen.getByRole('button', { name: /Deactivate/ })).toBeInTheDocument();
    });

    it('does not render when onDeactivate is not provided', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.queryByRole('button', { name: /Deactivate/ })).not.toBeInTheDocument();
    });

    it('calls onDeactivate when clicked', async () => {
      const user = userEvent.setup();
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onDeactivate={mockOnDeactivate}
        />
      );

      const deactivateButton = screen.getByRole('button', { name: /Deactivate/ });
      await user.click(deactivateButton);

      expect(mockOnDeactivate).toHaveBeenCalledTimes(1);
    });

    it('is disabled when loading', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onDeactivate={mockOnDeactivate}
          isLoading={true}
        />
      );

      const deactivateButton = screen.getByRole('button', { name: /Deactivate/ });
      expect(deactivateButton).toBeDisabled();
    });
  });

  describe('Delete Button', () => {
    it('renders when onDelete is provided', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /Delete 3/ })).toBeInTheDocument();
    });

    it('does not render when onDelete is not provided', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument();
    });

    it('calls onDelete when clicked', async () => {
      const user = userEvent.setup();
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /Delete 3/ });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('displays selected count in delete button text', () => {
      render(
        <BulkActionBar
          selectedCount={10}
          onClearSelection={mockOnClearSelection}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /Delete 10/ })).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /Delete 3/ });
      expect(deleteButton).toBeDisabled();
    });

    it('applies red color styling', () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /Delete 3/ });
      expect(deleteButton).toHaveClass('text-red-600');
    });
  });

  describe('Loading State', () => {
    it('disables all action buttons when loading', () => {
      render(
        <BulkActionBar
          selectedCount={5}
          totalCount={50}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onActivate={mockOnActivate}
          onDeactivate={mockOnDeactivate}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      expect(screen.getByText('Select all 50')).toBeDisabled();
      expect(screen.getByText('Clear').closest('button')).toBeDisabled();
      expect(screen.getByRole('button', { name: /Activate/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Deactivate/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Delete 5/ })).toBeDisabled();
    });

    it('enables all action buttons when not loading', () => {
      render(
        <BulkActionBar
          selectedCount={5}
          totalCount={50}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onActivate={mockOnActivate}
          onDeactivate={mockOnDeactivate}
          onDelete={mockOnDelete}
          isLoading={false}
        />
      );

      expect(screen.getByText('Select all 50')).not.toBeDisabled();
      expect(screen.getByText('Clear').closest('button')).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /Activate/ })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /Deactivate/ })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /Delete 5/ })).not.toBeDisabled();
    });
  });

  describe('Sticky Positioning', () => {
    it('applies fixed positioning', () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const bar = container.firstChild;
      expect(bar).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0');
    });

    it('applies z-index for stacking', () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const bar = container.firstChild;
      expect(bar).toHaveClass('z-50');
    });

    it('applies shadow and border styling', () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      const bar = container.firstChild;
      expect(bar).toHaveClass('shadow-lg', 'border-t', 'border-gray-200');
    });
  });

  describe('Integration: Real-world scenarios', () => {
    it('renders with all actions available', () => {
      render(
        <BulkActionBar
          selectedCount={15}
          totalCount={100}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onActivate={mockOnActivate}
          onDeactivate={mockOnDeactivate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('15 selected')).toBeInTheDocument();
      expect(screen.getByText('Select all 100')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Activate/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Deactivate/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete 15/ })).toBeInTheDocument();
    });

    it('renders with minimal props (only clear)', () => {
      render(
        <BulkActionBar
          selectedCount={3}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('3 selected')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
      expect(screen.queryByText(/Select all/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Deactivate/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument();
    });

    it('handles partial selection with select all option', () => {
      render(
        <BulkActionBar
          selectedCount={25}
          totalCount={100}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('25 selected')).toBeInTheDocument();
      expect(screen.getByText('Select all 100')).toBeInTheDocument();
    });

    it('hides select all when all items selected', () => {
      render(
        <BulkActionBar
          selectedCount={100}
          totalCount={100}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
        />
      );

      expect(screen.getByText('100 selected')).toBeInTheDocument();
      expect(screen.queryByText('Select all 100')).not.toBeInTheDocument();
    });
  });
});
