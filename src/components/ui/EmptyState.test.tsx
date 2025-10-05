import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  EmptyState, 
  EmptySearchResults, 
  EmptyDataState, 
  EmptyUsersState, 
  ErrorState 
} from './EmptyState';

describe('EmptyState', () => {
  describe('Basic Rendering', () => {
    it('renders with title and description', () => {
      render(
        <EmptyState
          title="No items"
          description="There are no items to display"
        />
      );

      expect(screen.getByText('No items')).toBeInTheDocument();
      expect(screen.getByText('There are no items to display')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <EmptyState
          title="Test"
          description="Test description"
          className="custom-class"
        />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Illustrations', () => {
    it('renders search illustration', () => {
      const { container } = render(
        <EmptyState
          illustration="search"
          title="No results"
          description="Try a different search"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-24', 'w-24', 'text-gray-300');
    });

    it('renders data illustration', () => {
      const { container } = render(
        <EmptyState
          illustration="data"
          title="No data"
          description="No data available"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders users illustration', () => {
      const { container } = render(
        <EmptyState
          illustration="users"
          title="No users"
          description="No users found"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders error illustration', () => {
      const { container } = render(
        <EmptyState
          illustration="error"
          title="Error"
          description="Something went wrong"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Custom Icon', () => {
    const TestIcon = ({ className }: { className?: string }) => (
      <svg className={className} data-testid="custom-icon">
        <circle cx="12" cy="12" r="10" />
      </svg>
    );

    it('renders custom icon when provided', () => {
      render(
        <EmptyState
          icon={TestIcon}
          title="Custom"
          description="With custom icon"
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('custom icon has correct wrapper styling', () => {
      const { container } = render(
        <EmptyState
          icon={TestIcon}
          title="Custom"
          description="With custom icon"
        />
      );

      const wrapper = container.querySelector('.rounded-full.bg-gray-100');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('h-24', 'w-24');
    });

    it('prefers illustration over custom icon when both provided', () => {
      const { container } = render(
        <EmptyState
          icon={TestIcon}
          illustration="search"
          title="Test"
          description="Test"
        />
      );

      // Should render illustration SVG, not custom icon
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('renders action button when provided', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Test"
          description="Test"
          action={{
            label: 'Click me',
            onClick: handleClick,
          }}
        />
      );

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('calls onClick when action button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <EmptyState
          title="Test"
          description="Test"
          action={{
            label: 'Click me',
            onClick: handleClick,
          }}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Click me' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders primary variant button by default', () => {
      render(
        <EmptyState
          title="Test"
          description="Test"
          action={{
            label: 'Primary',
            onClick: vi.fn(),
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button).toHaveClass('bg-gradient-to-r', 'from-primary-600', 'to-indigo-600');
    });

    it('renders secondary variant button when specified', () => {
      render(
        <EmptyState
          title="Test"
          description="Test"
          action={{
            label: 'Secondary',
            onClick: vi.fn(),
            variant: 'secondary',
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toHaveClass('bg-white', 'text-gray-700', 'border');
    });

    it('does not render button when action is not provided', () => {
      render(
        <EmptyState
          title="Test"
          description="Test"
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('renders title with correct styling', () => {
      render(
        <EmptyState
          title="Test Title"
          description="Test"
        />
      );

      const title = screen.getByText('Test Title');
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
    });

    it('renders description with correct styling', () => {
      render(
        <EmptyState
          title="Test"
          description="Test Description"
        />
      );

      const description = screen.getByText('Test Description');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-sm', 'text-gray-600');
    });

    it('has correct layout structure', () => {
      const { container } = render(
        <EmptyState
          title="Test"
          description="Test"
        />
      );

      const wrapper = container.querySelector('.text-center.py-12.px-4');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(
        <EmptyState
          title="Accessible Title"
          description="Description"
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Accessible Title');
    });

    it('action button has focus styles', () => {
      render(
        <EmptyState
          title="Test"
          description="Test"
          action={{
            label: 'Action',
            onClick: vi.fn(),
          }}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });
});

describe('EmptySearchResults', () => {
  it('renders with correct default content', () => {
    render(<EmptySearchResults />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText(/couldn't find any matches/)).toBeInTheDocument();
  });

  it('renders search illustration', () => {
    const { container } = render(<EmptySearchResults />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders clear filters button when onReset provided', () => {
    const handleReset = vi.fn();
    render(<EmptySearchResults onReset={handleReset} />);

    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('calls onReset when clear filters is clicked', async () => {
    const user = userEvent.setup();
    const handleReset = vi.fn();
    render(<EmptySearchResults onReset={handleReset} />);

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('does not render button when onReset not provided', () => {
    render(<EmptySearchResults />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses secondary button variant', () => {
    render(<EmptySearchResults onReset={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white', 'text-gray-700');
  });
});

describe('EmptyDataState', () => {
  it('renders with correct default content', () => {
    render(<EmptyDataState />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText(/no data to display/)).toBeInTheDocument();
  });

  it('renders data illustration', () => {
    const { container } = render(<EmptyDataState />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders refresh button when onRefresh provided', () => {
    const handleRefresh = vi.fn();
    render(<EmptyDataState onRefresh={handleRefresh} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const handleRefresh = vi.fn();
    render(<EmptyDataState onRefresh={handleRefresh} />);

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not render button when onRefresh not provided', () => {
    render(<EmptyDataState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('EmptyUsersState', () => {
  it('renders with correct default content', () => {
    render(<EmptyUsersState />);

    expect(screen.getByText('No users yet')).toBeInTheDocument();
    expect(screen.getByText(/Get started by creating/)).toBeInTheDocument();
  });

  it('renders users illustration', () => {
    const { container } = render(<EmptyUsersState />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders create user button when onCreate provided', () => {
    const handleCreate = vi.fn();
    render(<EmptyUsersState onCreate={handleCreate} />);

    expect(screen.getByRole('button', { name: 'Create user' })).toBeInTheDocument();
  });

  it('calls onCreate when create button is clicked', async () => {
    const user = userEvent.setup();
    const handleCreate = vi.fn();
    render(<EmptyUsersState onCreate={handleCreate} />);

    await user.click(screen.getByRole('button', { name: 'Create user' }));
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  it('uses primary button variant', () => {
    render(<EmptyUsersState onCreate={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gradient-to-r', 'from-primary-600');
  });

  it('does not render button when onCreate not provided', () => {
    render(<EmptyUsersState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renders with default error message', () => {
    render(<ErrorState />);

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong while loading/)).toBeInTheDocument();
  });

  it('renders with custom error message', () => {
    render(<ErrorState message="Custom error message" />);

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders error illustration', () => {
    const { container } = render(<ErrorState />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders try again button when onRetry provided', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('calls onRetry when try again button is clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('uses primary button variant', () => {
    render(<ErrorState onRetry={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gradient-to-r', 'from-primary-600');
  });

  it('does not render button when onRetry not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('handles both custom message and onRetry', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(
      <ErrorState 
        message="Network error occurred" 
        onRetry={handleRetry} 
      />
    );

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

describe('Edge Cases', () => {
  it('handles very long title text', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines in the UI and should still be displayed correctly';
    render(
      <EmptyState
        title={longTitle}
        description="Description"
      />
    );

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('handles very long description text', () => {
    const longDescription = 'This is a very long description that contains a lot of text and might wrap to multiple lines. It should still be readable and properly formatted in the UI with appropriate line height and spacing.';
    render(
      <EmptyState
        title="Title"
        description={longDescription}
      />
    );

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('handles empty string title gracefully', () => {
    render(
      <EmptyState
        title=""
        description="Description"
      />
    );

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('');
  });

  it('handles empty string description gracefully', () => {
    render(
      <EmptyState
        title="Title"
        description=""
      />
    );

    const description = screen.getByText('', { selector: 'p' });
    expect(description).toBeInTheDocument();
  });

  it('handles multiple rapid button clicks', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="Test"
        description="Test"
        action={{
          label: 'Click',
          onClick: handleClick,
        }}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(3);
  });
});
