import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date string to a human-readable short date format
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string (e.g., "Jan 15, 2024") or "N/A" if invalid
 * @example
 * formatDate("2024-01-15T10:30:00Z") // "Jan 15, 2024"
 * formatDate(null) // "N/A"
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a date string to include time
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date-time string (e.g., "Jan 15, 2024 14:30") or "Never" if invalid
 * @example
 * formatDateTime("2024-01-15T14:30:00Z") // "Jan 15, 2024 14:30"
 * formatDateTime(null) // "Never"
 */
export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return 'Never';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy HH:mm') : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

/**
 * Calculate age from date of birth
 * Handles month and day adjustments correctly (e.g., if birthday hasn't occurred this year)
 * @param dateOfBirth - ISO date string of birth date
 * @returns Age in years, or null if invalid date
 * @example
 * calculateAge("2000-01-15") // 24 (if current year is 2024 and date has passed)
 * calculateAge("2000-06-15") // 23 (if current year is 2024 but date hasn't occurred yet)
 * calculateAge(null) // null
 */
export const calculateAge = (dateOfBirth?: string | null): number | null => {
  if (!dateOfBirth) return null;
  try {
    const birthDate = parseISO(dateOfBirth);
    if (!isValid(birthDate)) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch {
    return null;
  }
};

/**
 * Format age display with date of birth
 * @param dateOfBirth - ISO date string of birth date
 * @returns Formatted string like "Jan 15, 2000 (24 years old)" or just the date if age can't be calculated
 * @example
 * formatAgeDisplay("2000-01-15") // "Jan 15, 2000 (24 years old)"
 * formatAgeDisplay(null) // "Not set"
 */
export const formatAgeDisplay = (dateOfBirth?: string | null): string => {
  if (!dateOfBirth) return 'Not set';

  const formattedDate = formatDate(dateOfBirth);
  const age = calculateAge(dateOfBirth);

  if (age !== null) {
    return `${formattedDate} (${age} years old)`;
  }

  return formattedDate;
};
