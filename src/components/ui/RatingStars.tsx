import React from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { MAX_RATING_STARS } from '../../constants/validation';

interface RatingStarsProps {
  /**
   * Rating value from 0-5
   * If undefined or null, displays "No rating yet"
   */
  rating?: number | null;

  /**
   * Size of the stars
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show the numeric rating value
   * @default true
   */
  showValue?: boolean;

  /**
   * Custom class name for the container
   */
  className?: string;
}

/**
 * RatingStars Component
 *
 * Displays a visual star rating (0-5 stars) with support for half-stars.
 * Used for rider ratings, vehicle ratings, and review displays.
 *
 * @example
 * ```tsx
 * <RatingStars rating={4.5} />
 * <RatingStars rating={3} size="sm" showValue={false} />
 * <RatingStars rating={null} /> // Shows "No rating yet"
 * ```
 */
export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'md',
  showValue = true,
  className = '',
}) => {
  // Size mappings for star icons and text
  const sizeClasses = {
    sm: { star: 'w-4 h-4', text: 'text-xs' },
    md: { star: 'w-5 h-5', text: 'text-sm' },
    lg: { star: 'w-6 h-6', text: 'text-base' },
  };

  const { star: starSize, text: textSize } = sizeClasses[size];

  // Handle no rating case
  if (!rating) {
    return (
      <span className={`text-gray-400 ${textSize} ${className}`}>
        No rating yet
      </span>
    );
  }

  // Calculate full and half stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const stars = [];

  // Generate star icons
  for (let i = 0; i < MAX_RATING_STARS; i++) {
    if (i < fullStars) {
      // Full star
      stars.push(
        <StarIconSolid
          key={i}
          className={`${starSize} text-yellow-400`}
          aria-hidden="true"
        />
      );
    } else if (i === fullStars && hasHalfStar) {
      // Half star (using clip technique)
      stars.push(
        <div key={i} className={`relative ${starSize}`}>
          <StarIcon
            className={`${starSize} text-yellow-400 absolute`}
            aria-hidden="true"
          />
          <div className="overflow-hidden w-1/2 absolute">
            <StarIconSolid
              className={`${starSize} text-yellow-400`}
              aria-hidden="true"
            />
          </div>
        </div>
      );
    } else {
      // Empty star
      stars.push(
        <StarIcon
          key={i}
          className={`${starSize} text-gray-300`}
          aria-hidden="true"
        />
      );
    }
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {stars}
      {showValue && (
        <span className={`ml-2 font-medium text-gray-700 ${textSize}`}>
          {rating.toFixed(1)}
        </span>
      )}
      <span className="sr-only">{rating} out of {MAX_RATING_STARS} stars</span>
    </div>
  );
};
