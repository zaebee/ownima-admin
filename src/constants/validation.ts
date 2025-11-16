/**
 * Validation constants for forms and data validation
 * Centralized location for magic numbers to ensure consistency and maintainability
 */

// Form field constraints
export const MAX_BIO_LENGTH = 500;
export const MIN_PASSWORD_LENGTH = 6;

// Rating system
export const MAX_RATING_STARS = 5;
export const MIN_RATING = 0;
export const MAX_RATING = 5;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Date validation
export const MIN_VALID_YEAR = 1900;

// Regex patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[\d\s-()]{10,}$/;

/**
 * Validation functions
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export const isValidPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

/**
 * Validate date is not in the future
 * @param dateString - ISO date string
 * @returns True if date is valid and not in the future
 */
export const isNotFutureDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return date <= new Date();
  } catch {
    return false;
  }
};

/**
 * Validate date is realistic (not before MIN_VALID_YEAR)
 * @param dateString - ISO date string
 * @returns True if date is after MIN_VALID_YEAR
 */
export const isRealisticDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return date.getFullYear() >= MIN_VALID_YEAR;
  } catch {
    return false;
  }
};
