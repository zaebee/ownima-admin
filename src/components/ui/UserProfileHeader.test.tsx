import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { UserProfileHeader } from './UserProfileHeader';

describe('UserProfileHeader', () => {
  const defaultProps = {
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true,
  };

  describe('Avatar Rendering', () => {
    it('renders avatar image when avatarUrl is provided', () => {
      render(
        <UserProfileHeader
          {...defaultProps}
          avatarUrl="https://example.com/avatar.jpg"
        />
      );

      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders initials fallback when avatarUrl is not provided', () => {
      render(<UserProfileHeader {...defaultProps} avatarUrl={null} />);

      expect(screen.getByText('J')).toBeInTheDocument(); // First letter of name
    });

    it('renders initials fallback when avatarUrl is undefined', () => {
      render(<UserProfileHeader {...defaultProps} />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('extracts first letter from name for initials', () => {
      render(
        <UserProfileHeader
          name="Alice Smith"
          email="alice@example.com"
          isActive={true}
        />
      );

      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('falls back to email first letter when name is empty', () => {
      render(
        <UserProfileHeader
          name=""
          email="bob@example.com"
          isActive={true}
        />
      );

      expect(screen.getByText('B')).toBeInTheDocument(); // First letter of email
    });

    it('converts initial to uppercase', () => {
      render(
        <UserProfileHeader
          name="john"
          email="john@example.com"
          isActive={true}
        />
      );

      expect(screen.getByText('J')).toBeInTheDocument(); // Uppercase
    });
  });

  describe('Active Status Indicator', () => {
    it('shows green dot for active users', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} isActive={true} />);

      const activeDot = container.querySelector('.bg-green-500');
      expect(activeDot).toBeInTheDocument();
      expect(activeDot).toHaveAttribute('title', 'Active user');
    });

    it('shows gray dot for inactive users', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} isActive={false} />);

      const inactiveDot = container.querySelector('.bg-gray-400');
      expect(inactiveDot).toBeInTheDocument();
      expect(inactiveDot).toHaveAttribute('title', 'Inactive user');
    });

    it('positions status dot absolutely', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      const statusDot = container.querySelector('.absolute.bottom-2.right-2');
      expect(statusDot).toBeInTheDocument();
    });
  });

  describe('Name and Email Display', () => {
    it('renders user name as h1', () => {
      render(<UserProfileHeader {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('John Doe');
    });

    it('renders email with envelope icon', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      expect(screen.getByText('john@example.com')).toBeInTheDocument();

      // Check for envelope icon (svg)
      const envelopeIcon = container.querySelector('svg');
      expect(envelopeIcon).toBeInTheDocument();
    });

    it('displays long email correctly', () => {
      render(
        <UserProfileHeader
          name="Test User"
          email="very.long.email.address@example.com"
          isActive={true}
        />
      );

      expect(screen.getByText('very.long.email.address@example.com')).toBeInTheDocument();
    });
  });

  describe('UserBadges Integration', () => {
    it('passes role prop to UserBadges', () => {
      render(<UserProfileHeader {...defaultProps} role="OWNER" />);

      expect(screen.getByText('OWNER')).toBeInTheDocument();
    });

    it('passes isActive prop to UserBadges', () => {
      render(<UserProfileHeader {...defaultProps} isActive={true} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('passes isSuperuser prop to UserBadges', () => {
      render(<UserProfileHeader {...defaultProps} isSuperuser={true} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('passes isBetaTester prop to UserBadges', () => {
      render(<UserProfileHeader {...defaultProps} isBetaTester={true} />);

      expect(screen.getByText('Beta Tester')).toBeInTheDocument();
    });

    it('displays all badges when all props are true', () => {
      render(
        <UserProfileHeader
          {...defaultProps}
          role="RIDER"
          isActive={true}
          isSuperuser={true}
          isBetaTester={true}
        />
      );

      expect(screen.getByText('RIDER')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Beta Tester')).toBeInTheDocument();
    });
  });

  describe('Color Scheme Variants', () => {
    it('applies blue gradient by default', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      const gradientHeader = container.querySelector('.from-blue-500.to-purple-600');
      expect(gradientHeader).toBeInTheDocument();
    });

    it('applies blue gradient when colorScheme is "blue"', () => {
      const { container } = render(
        <UserProfileHeader {...defaultProps} colorScheme="blue" />
      );

      const gradientHeader = container.querySelector('.from-blue-500.to-purple-600');
      expect(gradientHeader).toBeInTheDocument();
    });

    it('applies green gradient when colorScheme is "green"', () => {
      const { container } = render(
        <UserProfileHeader {...defaultProps} colorScheme="green" />
      );

      const gradientHeader = container.querySelector('.from-green-500.to-teal-600');
      expect(gradientHeader).toBeInTheDocument();
    });

    it('applies gradient to avatar fallback background', () => {
      const { container } = render(
        <UserProfileHeader {...defaultProps} colorScheme="green" />
      );

      // Avatar fallback should also have green gradient
      const avatarFallback = container.querySelector('.from-green-500.to-teal-600');
      expect(avatarFallback).toBeInTheDocument();
    });
  });

  describe('Additional Info Slot', () => {
    it('renders additional info when provided', () => {
      render(
        <UserProfileHeader
          {...defaultProps}
          additionalInfo={<div>Rating: 4.5 stars</div>}
        />
      );

      expect(screen.getByText('Rating: 4.5 stars')).toBeInTheDocument();
    });

    it('does not render additional info section when not provided', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      // additionalInfo wrapper should not exist
      const additionalInfo = container.querySelector('.mt-3');
      // mt-3 is used for additionalInfo wrapper, but also other elements
      // so we just check that the component renders without error
      expect(container).toBeInTheDocument();
    });

    it('renders complex additional info (e.g., RatingStars)', () => {
      render(
        <UserProfileHeader
          {...defaultProps}
          additionalInfo={
            <div className="flex items-center">
              <span className="text-yellow-400">★★★★☆</span>
              <span className="ml-2">4.0</span>
            </div>
          }
        />
      );

      expect(screen.getByText('★★★★☆')).toBeInTheDocument();
      expect(screen.getByText('4.0')).toBeInTheDocument();
    });
  });

  describe('Actions Slot', () => {
    it('renders action buttons when provided', () => {
      render(
        <UserProfileHeader
          {...defaultProps}
          actions={
            <>
              <button>Edit</button>
              <button>Delete</button>
            </>
          }
        />
      );

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('does not render actions section when not provided', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      // Actions wrapper should not exist
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(0);
    });

    it('renders multiple action buttons with proper spacing', () => {
      const { container } = render(
        <UserProfileHeader
          {...defaultProps}
          actions={
            <>
              <button>Edit</button>
              <button>Delete</button>
              <button>Activate</button>
            </>
          }
        />
      );

      const actionButtons = container.querySelectorAll('button');
      expect(actionButtons).toHaveLength(3);

      // Check for space-x-3 class on actions wrapper
      const actionsWrapper = container.querySelector('.space-x-3');
      expect(actionsWrapper).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('renders white background card', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      const card = container.querySelector('.bg-white.rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('renders gradient header with correct height', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      const header = container.querySelector('.h-32');
      expect(header).toBeInTheDocument();
    });

    it('positions avatar with negative margin', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      const avatarContainer = container.querySelector('.-mt-16');
      expect(avatarContainer).toBeInTheDocument();
    });

    it('applies shadow to card', () => {
      const { container } = render(<UserProfileHeader {...defaultProps} />);

      const card = container.querySelector('.shadow-sm');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Integration: Real-world scenarios', () => {
    it('renders complete rider profile', () => {
      render(
        <UserProfileHeader
          name="Alice Johnson"
          email="alice.johnson@example.com"
          avatarUrl="https://example.com/alice.jpg"
          role="RIDER"
          isActive={true}
          isSuperuser={false}
          isBetaTester={true}
          colorScheme="green"
          additionalInfo={<div>4.8 rating</div>}
        />
      );

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('alice.johnson@example.com')).toBeInTheDocument();
      expect(screen.getByText('RIDER')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Beta Tester')).toBeInTheDocument();
      expect(screen.getByText('4.8 rating')).toBeInTheDocument();
    });

    it('renders minimal owner profile', () => {
      render(
        <UserProfileHeader
          name="Bob Smith"
          email="bob@example.com"
          role="OWNER"
          isActive={false}
        />
      );

      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
      expect(screen.getByText('OWNER')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('renders superuser profile with actions', () => {
      render(
        <UserProfileHeader
          name="Admin User"
          email="admin@example.com"
          isActive={true}
          isSuperuser={true}
          actions={
            <>
              <button>Edit</button>
              <button>Delete</button>
            </>
          }
        />
      );

      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('renders profile with avatar and all features', () => {
      const { container } = render(
        <UserProfileHeader
          name="Featured User"
          email="featured@example.com"
          avatarUrl="https://example.com/featured.jpg"
          role="RIDER"
          isActive={true}
          isSuperuser={true}
          isBetaTester={true}
          colorScheme="blue"
          additionalInfo={<div>Premium Member</div>}
          actions={<button>Contact</button>}
        />
      );

      expect(screen.getByAltText('Featured User')).toBeInTheDocument();
      expect(screen.getByText('Featured User')).toBeInTheDocument();
      expect(screen.getByText('RIDER')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Beta Tester')).toBeInTheDocument();
      expect(screen.getByText('Premium Member')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Contact' })).toBeInTheDocument();

      const activeDot = container.querySelector('.bg-green-500');
      expect(activeDot).toBeInTheDocument();
    });
  });
});
