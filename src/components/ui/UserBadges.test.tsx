import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { UserBadges } from './UserBadges';

describe('UserBadges', () => {
  describe('Role Badge', () => {
    it('displays OWNER role badge with blue styling', () => {
      render(<UserBadges role="OWNER" isActive={true} />);

      const roleBadge = screen.getByText('OWNER');
      expect(roleBadge).toBeInTheDocument();
      expect(roleBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('displays RIDER role badge with green styling', () => {
      render(<UserBadges role="RIDER" isActive={true} />);

      const roleBadge = screen.getByText('RIDER');
      expect(roleBadge).toBeInTheDocument();
      expect(roleBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('displays custom role badge with gray styling', () => {
      render(<UserBadges role="ADMIN" isActive={true} />);

      const roleBadge = screen.getByText('ADMIN');
      expect(roleBadge).toBeInTheDocument();
      expect(roleBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('does not display role badge when role is undefined', () => {
      render(<UserBadges isActive={true} />);

      expect(screen.queryByText('OWNER')).not.toBeInTheDocument();
      expect(screen.queryByText('RIDER')).not.toBeInTheDocument();
    });

    it('does not display role badge when role is empty string', () => {
      render(<UserBadges role="" isActive={true} />);

      // Should not render role badge for empty string
      const container = screen.getByText('Active').parentElement;
      expect(container?.children).toHaveLength(1); // Only Active badge
    });
  });

  describe('Active Status Badge', () => {
    it('displays "Active" badge when isActive is true', () => {
      render(<UserBadges isActive={true} />);

      const activeBadge = screen.getByText('Active');
      expect(activeBadge).toBeInTheDocument();
      expect(activeBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('displays "Inactive" badge when isActive is false', () => {
      render(<UserBadges isActive={false} />);

      const inactiveBadge = screen.getByText('Inactive');
      expect(inactiveBadge).toBeInTheDocument();
      expect(inactiveBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('shows CheckCircleIcon for active users', () => {
      const { container } = render(<UserBadges isActive={true} />);

      // Check for icon in Active badge
      const activeBadge = screen.getByText('Active').closest('span');
      const icon = activeBadge?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('shows XCircleIcon for inactive users', () => {
      const { container } = render(<UserBadges isActive={false} />);

      // Check for icon in Inactive badge
      const inactiveBadge = screen.getByText('Inactive').closest('span');
      const icon = inactiveBadge?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Superuser Badge', () => {
    it('displays Admin badge when isSuperuser is true', () => {
      render(<UserBadges isActive={true} isSuperuser={true} />);

      const adminBadge = screen.getByText('Admin');
      expect(adminBadge).toBeInTheDocument();
      expect(adminBadge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('does not display Admin badge when isSuperuser is false', () => {
      render(<UserBadges isActive={true} isSuperuser={false} />);

      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('does not display Admin badge when isSuperuser is undefined', () => {
      render(<UserBadges isActive={true} />);

      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('shows ShieldCheckIcon in Admin badge', () => {
      const { container } = render(<UserBadges isActive={true} isSuperuser={true} />);

      const adminBadge = screen.getByText('Admin').closest('span');
      const icon = adminBadge?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Beta Tester Badge', () => {
    it('displays Beta Tester badge when isBetaTester is true', () => {
      render(<UserBadges isActive={true} isBetaTester={true} />);

      const betaBadge = screen.getByText('Beta Tester');
      expect(betaBadge).toBeInTheDocument();
      expect(betaBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('does not display Beta Tester badge when isBetaTester is false', () => {
      render(<UserBadges isActive={true} isBetaTester={false} />);

      expect(screen.queryByText('Beta Tester')).not.toBeInTheDocument();
    });

    it('does not display Beta Tester badge when isBetaTester is undefined', () => {
      render(<UserBadges isActive={true} />);

      expect(screen.queryByText('Beta Tester')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Badges', () => {
    it('displays all badges when all props are true', () => {
      render(<UserBadges role="OWNER" isActive={true} isSuperuser={true} isBetaTester={true} />);

      expect(screen.getByText('OWNER')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Beta Tester')).toBeInTheDocument();
    });

    it('displays only mandatory badges when optional props are false', () => {
      render(<UserBadges role="RIDER" isActive={false} isSuperuser={false} isBetaTester={false} />);

      expect(screen.getByText('RIDER')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      expect(screen.queryByText('Beta Tester')).not.toBeInTheDocument();
    });

    it('displays only isActive badge when all others are false/undefined', () => {
      render(<UserBadges isActive={true} />);

      // Only Active badge should be present
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.queryByText('OWNER')).not.toBeInTheDocument();
      expect(screen.queryByText('RIDER')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      expect(screen.queryByText('Beta Tester')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to container', () => {
      const { container } = render(<UserBadges isActive={true} className="custom-badges" />);

      const badgesContainer = container.firstChild;
      expect(badgesContainer).toHaveClass('custom-badges');
    });

    it('applies default flex classes along with custom className', () => {
      const { container } = render(<UserBadges isActive={true} className="my-custom-class" />);

      const badgesContainer = container.firstChild;
      expect(badgesContainer).toHaveClass('flex', 'items-center', 'flex-wrap', 'gap-2', 'my-custom-class');
    });

    it('renders with default className when className prop is not provided', () => {
      const { container } = render(<UserBadges isActive={true} />);

      const badgesContainer = container.firstChild;
      expect(badgesContainer).toHaveClass('flex', 'items-center', 'flex-wrap', 'gap-2');
    });
  });

  describe('Badge Layout', () => {
    it('renders badges in a flex container with gap', () => {
      const { container } = render(<UserBadges role="OWNER" isActive={true} />);

      const badgesContainer = container.firstChild;
      expect(badgesContainer).toHaveClass('flex');
      expect(badgesContainer).toHaveClass('gap-2');
    });

    it('allows badges to wrap with flex-wrap', () => {
      const { container } = render(<UserBadges role="RIDER" isActive={true} isSuperuser={true} isBetaTester={true} />);

      const badgesContainer = container.firstChild;
      expect(badgesContainer).toHaveClass('flex-wrap');
    });

    it('aligns badges vertically with items-center', () => {
      const { container } = render(<UserBadges isActive={true} />);

      const badgesContainer = container.firstChild;
      expect(badgesContainer).toHaveClass('items-center');
    });
  });

  describe('Integration: Real-world scenarios', () => {
    it('renders OWNER user with admin privileges', () => {
      render(<UserBadges role="OWNER" isActive={true} isSuperuser={true} />);

      expect(screen.getByText('OWNER')).toHaveClass('bg-blue-100');
      expect(screen.getByText('Active')).toHaveClass('bg-green-100');
      expect(screen.getByText('Admin')).toHaveClass('bg-purple-100');
    });

    it('renders inactive RIDER beta tester', () => {
      render(<UserBadges role="RIDER" isActive={false} isBetaTester={true} />);

      expect(screen.getByText('RIDER')).toHaveClass('bg-green-100');
      expect(screen.getByText('Inactive')).toHaveClass('bg-red-100');
      expect(screen.getByText('Beta Tester')).toHaveClass('bg-yellow-100');
    });

    it('renders minimal user (only status)', () => {
      render(<UserBadges isActive={true} />);

      // Should only show Active badge
      const allBadges = screen.getByText('Active').closest('div')?.children;
      expect(allBadges).toHaveLength(1);
    });

    it('renders fully privileged user (all badges)', () => {
      render(<UserBadges role="OWNER" isActive={true} isSuperuser={true} isBetaTester={true} />);

      const container = screen.getByText('Active').closest('div');
      expect(container?.children).toHaveLength(4); // Role, Active, Admin, Beta Tester
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(<UserBadges role="OWNER" isActive={true} />);

      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThan(0);
    });

    it('includes descriptive text in badges', () => {
      render(<UserBadges role="RIDER" isActive={true} isSuperuser={true} isBetaTester={true} />);

      // All badges should have clear, readable text
      expect(screen.getByText('RIDER')).toBeVisible();
      expect(screen.getByText('Active')).toBeVisible();
      expect(screen.getByText('Admin')).toBeVisible();
      expect(screen.getByText('Beta Tester')).toBeVisible();
    });
  });
});
