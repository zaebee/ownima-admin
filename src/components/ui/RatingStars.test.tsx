import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { RatingStars } from './RatingStars';
import { MAX_RATING_STARS } from '../../constants/validation';

describe('RatingStars', () => {
  describe('Full Star Rendering', () => {
    it('treats rating 0 as "No rating yet"', () => {
      // Component treats 0 as falsy, showing "No rating yet"
      render(<RatingStars rating={0} />);
      expect(screen.getByText('No rating yet')).toBeInTheDocument();
    });

    it('renders 1 full star for rating 1', () => {
      render(<RatingStars rating={1} />);
      expect(screen.getByText('1.0')).toBeInTheDocument();
    });

    it('renders 2 full stars for rating 2', () => {
      render(<RatingStars rating={2} />);
      expect(screen.getByText('2.0')).toBeInTheDocument();
    });

    it('renders 3 full stars for rating 3', () => {
      render(<RatingStars rating={3} />);
      expect(screen.getByText('3.0')).toBeInTheDocument();
    });

    it('renders 4 full stars for rating 4', () => {
      render(<RatingStars rating={4} />);
      expect(screen.getByText('4.0')).toBeInTheDocument();
    });

    it('renders 5 full stars for rating 5', () => {
      render(<RatingStars rating={5} />);
      expect(screen.getByText('5.0')).toBeInTheDocument();
    });
  });

  describe('Half Star Rendering', () => {
    it('renders half star for rating 0.5', () => {
      const { container } = render(<RatingStars rating={0.5} />);

      expect(screen.getByText('0.5')).toBeInTheDocument();
      // Should have the half-star container div
      const halfStarContainer = container.querySelector('.relative');
      expect(halfStarContainer).toBeInTheDocument();
    });

    it('renders half star for rating 1.5', () => {
      render(<RatingStars rating={1.5} />);
      expect(screen.getByText('1.5')).toBeInTheDocument();
    });

    it('renders half star for rating 2.5', () => {
      render(<RatingStars rating={2.5} />);
      expect(screen.getByText('2.5')).toBeInTheDocument();
    });

    it('renders half star for rating 3.5', () => {
      render(<RatingStars rating={3.5} />);
      expect(screen.getByText('3.5')).toBeInTheDocument();
    });

    it('renders half star for rating 4.5', () => {
      render(<RatingStars rating={4.5} />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('does not render half star for rating 1.4', () => {
      const { container } = render(<RatingStars rating={1.4} />);

      // Rating below 0.5 threshold should round down
      expect(screen.getByText('1.4')).toBeInTheDocument();
      // Should have 1 full star, no half star
      const halfStarContainer = container.querySelector('.relative');
      expect(halfStarContainer).not.toBeInTheDocument();
    });

    it('renders half star for rating 2.6', () => {
      const { container } = render(<RatingStars rating={2.6} />);

      // Rating >= 0.5 should show half star
      expect(screen.getByText('2.6')).toBeInTheDocument();
      const halfStarContainer = container.querySelector('.relative');
      expect(halfStarContainer).toBeInTheDocument();
    });
  });

  describe('No Rating State', () => {
    it('displays "No rating yet" for null', () => {
      render(<RatingStars rating={null} />);
      expect(screen.getByText('No rating yet')).toBeInTheDocument();
    });

    it('displays "No rating yet" for undefined', () => {
      render(<RatingStars rating={undefined} />);
      expect(screen.getByText('No rating yet')).toBeInTheDocument();
    });

    it('applies gray color for no rating text', () => {
      render(<RatingStars rating={null} />);
      const noRatingText = screen.getByText('No rating yet');
      expect(noRatingText).toHaveClass('text-gray-400');
    });
  });

  describe('Size Variants', () => {
    it('renders small size stars', () => {
      const { container } = render(<RatingStars rating={3} size="sm" />);
      const stars = container.querySelectorAll('svg');

      // Check star size class
      expect(stars[0]).toHaveClass('w-4', 'h-4');

      // Check text size class
      const ratingText = screen.getByText('3.0');
      expect(ratingText).toHaveClass('text-xs');
    });

    it('renders medium size stars (default)', () => {
      const { container } = render(<RatingStars rating={3} size="md" />);
      const stars = container.querySelectorAll('svg');

      expect(stars[0]).toHaveClass('w-5', 'h-5');

      const ratingText = screen.getByText('3.0');
      expect(ratingText).toHaveClass('text-sm');
    });

    it('renders large size stars', () => {
      const { container } = render(<RatingStars rating={3} size="lg" />);
      const stars = container.querySelectorAll('svg');

      expect(stars[0]).toHaveClass('w-6', 'h-6');

      const ratingText = screen.getByText('3.0');
      expect(ratingText).toHaveClass('text-base');
    });

    it('defaults to medium size when size is not provided', () => {
      const { container } = render(<RatingStars rating={3} />);
      const stars = container.querySelectorAll('svg');

      expect(stars[0]).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Show/Hide Value', () => {
    it('shows numeric value when showValue is true', () => {
      render(<RatingStars rating={3.7} showValue={true} />);
      expect(screen.getByText('3.7')).toBeInTheDocument();
    });

    it('hides numeric value when showValue is false', () => {
      render(<RatingStars rating={3.7} showValue={false} />);
      expect(screen.queryByText('3.7')).not.toBeInTheDocument();
    });

    it('shows numeric value by default', () => {
      render(<RatingStars rating={4.2} />);
      expect(screen.getByText('4.2')).toBeInTheDocument();
    });

    it('formats value to 1 decimal place', () => {
      render(<RatingStars rating={4} />);
      expect(screen.getByText('4.0')).toBeInTheDocument();
    });

    it('formats fractional value to 1 decimal place', () => {
      render(<RatingStars rating={3.678} />);
      expect(screen.getByText('3.7')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to container when rating exists', () => {
      const { container } = render(<RatingStars rating={3} className="custom-class" />);
      const ratingContainer = container.firstChild;
      expect(ratingContainer).toHaveClass('custom-class');
    });

    it('applies custom className to no-rating text', () => {
      render(<RatingStars rating={null} className="custom-class" />);
      const noRatingText = screen.getByText('No rating yet');
      expect(noRatingText).toHaveClass('custom-class');
    });

    it('applies default flex layout classes', () => {
      const { container } = render(<RatingStars rating={3} />);
      const ratingContainer = container.firstChild;
      expect(ratingContainer).toHaveClass('flex', 'items-center', 'space-x-1');
    });
  });

  describe('Accessibility', () => {
    it('includes screen reader text with rating value', () => {
      render(<RatingStars rating={4.5} />);
      const srText = screen.getByText(`4.5 out of ${MAX_RATING_STARS} stars`);
      expect(srText).toHaveClass('sr-only');
    });

    it('marks star icons as aria-hidden', () => {
      const { container } = render(<RatingStars rating={3} />);
      const stars = container.querySelectorAll('svg');

      stars.forEach((star) => {
        expect(star).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('provides accessible text for screen readers', () => {
      render(<RatingStars rating={2.5} />);
      const srText = screen.getByText(`2.5 out of ${MAX_RATING_STARS} stars`);
      expect(srText).toBeInTheDocument();
    });
  });

  describe('Star Colors', () => {
    it('applies yellow color to filled stars', () => {
      const { container } = render(<RatingStars rating={3} />);
      const stars = container.querySelectorAll('svg');

      // First 3 should be yellow (filled)
      expect(stars[0]).toHaveClass('text-yellow-400');
      expect(stars[1]).toHaveClass('text-yellow-400');
      expect(stars[2]).toHaveClass('text-yellow-400');
    });

    it('applies gray color to empty stars', () => {
      const { container } = render(<RatingStars rating={2} />);
      const stars = container.querySelectorAll('svg');

      // Last 3 should be gray (empty)
      expect(stars[2]).toHaveClass('text-gray-300');
      expect(stars[3]).toHaveClass('text-gray-300');
      expect(stars[4]).toHaveClass('text-gray-300');
    });
  });

  describe('Edge Cases', () => {
    it('handles rating of 0 as no rating', () => {
      // Component treats 0 as falsy, same as null/undefined
      render(<RatingStars rating={0} />);
      expect(screen.getByText('No rating yet')).toBeInTheDocument();
    });

    it('handles maximum rating of 5 correctly', () => {
      const { container } = render(<RatingStars rating={5} />);
      const stars = container.querySelectorAll('svg');

      // All stars should be yellow (filled)
      stars.forEach((star) => {
        expect(star).toHaveClass('text-yellow-400');
      });
      expect(screen.getByText('5.0')).toBeInTheDocument();
    });

    it('handles decimal rating just below half-star threshold', () => {
      const { container } = render(<RatingStars rating={3.49} />);

      // Should show 3 full stars, no half star
      const halfStarContainer = container.querySelector('.relative');
      expect(halfStarContainer).not.toBeInTheDocument();
      expect(screen.getByText('3.5')).toBeInTheDocument(); // Formatted to 1 decimal
    });

    it('handles decimal rating at half-star threshold', () => {
      const { container } = render(<RatingStars rating={3.5} />);

      // Should show 3 full stars + 1 half star
      const halfStarContainer = container.querySelector('.relative');
      expect(halfStarContainer).toBeInTheDocument();
      expect(screen.getByText('3.5')).toBeInTheDocument();
    });

    it('handles very small rating', () => {
      render(<RatingStars rating={0.1} />);
      expect(screen.getByText('0.1')).toBeInTheDocument();
    });

    it('handles rating very close to 5', () => {
      render(<RatingStars rating={4.99} />);
      expect(screen.getByText('5.0')).toBeInTheDocument(); // Formatted to 1 decimal
    });
  });

  describe('Integration: Real-world scenarios', () => {
    it('renders rider rating with default settings', () => {
      render(<RatingStars rating={4.3} />);

      expect(screen.getByText('4.3')).toBeInTheDocument();
      expect(screen.getByText(`4.3 out of ${MAX_RATING_STARS} stars`)).toBeInTheDocument();
    });

    it('renders compact rating without value', () => {
      const { container } = render(<RatingStars rating={3.8} size="sm" showValue={false} />);

      const stars = container.querySelectorAll('svg');
      expect(stars[0]).toHaveClass('w-4', 'h-4');
      expect(screen.queryByText('3.8')).not.toBeInTheDocument();
    });

    it('renders new rider with no rating', () => {
      render(<RatingStars rating={null} size="sm" />);

      const noRatingText = screen.getByText('No rating yet');
      expect(noRatingText).toHaveClass('text-gray-400', 'text-xs');
    });

    it('renders featured rating with large stars', () => {
      const { container } = render(<RatingStars rating={4.9} size="lg" />);

      const stars = container.querySelectorAll('svg');
      expect(stars[0]).toHaveClass('w-6', 'h-6');
      expect(screen.getByText('4.9')).toBeInTheDocument();
    });
  });
});
