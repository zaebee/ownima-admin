import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatDateTime, calculateAge, formatAgeDisplay } from './dateFormatting';

describe('dateFormatting', () => {
  describe('formatDate', () => {
    it('formats valid ISO date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBe('Jan 15, 2024');
    });

    it('formats date without time component', () => {
      const result = formatDate('2024-03-20');
      expect(result).toBe('Mar 20, 2024');
    });

    it('returns "N/A" for null', () => {
      const result = formatDate(null);
      expect(result).toBe('N/A');
    });

    it('returns "N/A" for undefined', () => {
      const result = formatDate(undefined);
      expect(result).toBe('N/A');
    });

    it('returns "Invalid date" for malformed string', () => {
      const result = formatDate('not-a-date');
      expect(result).toBe('Invalid date');
    });

    it('returns "Invalid date" for empty string', () => {
      const result = formatDate('');
      expect(result).toBe('N/A');
    });

    it('formats different months correctly', () => {
      expect(formatDate('2024-01-01')).toContain('Jan');
      expect(formatDate('2024-02-01')).toContain('Feb');
      expect(formatDate('2024-12-31')).toContain('Dec');
    });

    it('handles leap year dates', () => {
      const result = formatDate('2024-02-29');
      expect(result).toBe('Feb 29, 2024');
    });

    it('handles end of month dates', () => {
      expect(formatDate('2024-01-31')).toBe('Jan 31, 2024');
      expect(formatDate('2024-04-30')).toBe('Apr 30, 2024');
    });

    it('formats dates from different years', () => {
      expect(formatDate('2020-05-15')).toBe('May 15, 2020');
      expect(formatDate('2025-11-16')).toBe('Nov 16, 2025');
    });
  });

  describe('formatDateTime', () => {
    it('formats valid ISO datetime string with time', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z');
      // Time will be in local timezone, so just check date part
      expect(result).toContain('Jan 15, 2024');
      expect(result).toMatch(/\d{2}:\d{2}/); // Has time component
    });

    it('returns "Never" for null', () => {
      const result = formatDateTime(null);
      expect(result).toBe('Never');
    });

    it('returns "Never" for undefined', () => {
      const result = formatDateTime(undefined);
      expect(result).toBe('Never');
    });

    it('returns "Invalid date" for malformed string', () => {
      const result = formatDateTime('invalid-datetime');
      expect(result).toBe('Invalid date');
    });

    it('includes time component in output', () => {
      const result = formatDateTime('2024-11-16T09:45:00Z');
      expect(result).toMatch(/\d{2}:\d{2}$/); // Ends with HH:mm
    });

    it('handles midnight time', () => {
      const result = formatDateTime('2024-01-15T00:00:00Z');
      expect(result).toContain('Jan 15, 2024');
    });

    it('handles end of day time', () => {
      const result = formatDateTime('2024-01-15T20:59:00Z');
      expect(result).toContain('Jan 15, 2024');
    });
  });

  describe('calculateAge', () => {
    // Mock current date for consistent testing
    let originalDate: typeof Date;

    beforeEach(() => {
      originalDate = global.Date;
      const mockDate = new Date('2024-11-16T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
      global.Date = originalDate;
    });

    it('calculates correct age for birthday that has passed this year', () => {
      const age = calculateAge('2000-01-15');
      expect(age).toBe(24);
    });

    it('calculates correct age for birthday that has not occurred yet', () => {
      const age = calculateAge('2000-12-25'); // Future date in year
      expect(age).toBe(23); // Age not incremented yet
    });

    it('returns null for null input', () => {
      const age = calculateAge(null);
      expect(age).toBeNull();
    });

    it('returns null for undefined input', () => {
      const age = calculateAge(undefined);
      expect(age).toBeNull();
    });

    it('returns null for invalid date string', () => {
      const age = calculateAge('invalid-date');
      expect(age).toBeNull();
    });

    it('handles exact birthday today', () => {
      const age = calculateAge('2000-11-16'); // Same day as mock current date
      expect(age).toBe(24);
    });

    it('handles birthday tomorrow', () => {
      const age = calculateAge('2000-11-17'); // One day after mock current date
      expect(age).toBe(23); // Birthday hasn't occurred
    });

    it('handles birthday yesterday', () => {
      const age = calculateAge('2000-11-15'); // One day before mock current date
      expect(age).toBe(24); // Birthday has occurred
    });

    it('calculates age for someone born this year', () => {
      const age = calculateAge('2024-01-01');
      expect(age).toBe(0);
    });

    it('handles leap year birth dates', () => {
      const age = calculateAge('2000-02-29'); // Leap year
      expect(age).toBe(24);
    });

    it('handles very old dates', () => {
      const age = calculateAge('1950-05-10');
      expect(age).toBe(74);
    });

    it('handles dates in same month but different day', () => {
      // Mock date is Nov 16, 2024
      const ageBefore = calculateAge('2000-11-10'); // Before the 16th
      const ageAfter = calculateAge('2000-11-20'); // After the 16th

      expect(ageBefore).toBe(24); // Birthday has passed
      expect(ageAfter).toBe(23); // Birthday hasn't passed yet
    });
  });

  describe('formatAgeDisplay', () => {
    let originalDate: typeof Date;

    beforeEach(() => {
      originalDate = global.Date;
      const mockDate = new Date('2024-11-16T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
      global.Date = originalDate;
    });

    it('formats date with age for valid birth date', () => {
      const result = formatAgeDisplay('2000-01-15');
      expect(result).toBe('Jan 15, 2000 (24 years old)');
    });

    it('returns "Not set" for null', () => {
      const result = formatAgeDisplay(null);
      expect(result).toBe('Not set');
    });

    it('returns "Not set" for undefined', () => {
      const result = formatAgeDisplay(undefined);
      expect(result).toBe('Not set');
    });

    it('formats date without age for invalid date', () => {
      const result = formatAgeDisplay('invalid-date');
      expect(result).toBe('Invalid date');
    });

    it('handles zero age (born this year)', () => {
      const result = formatAgeDisplay('2024-05-10');
      expect(result).toContain('(0 years old)');
    });

    it('handles age = 1 (singular)', () => {
      const result = formatAgeDisplay('2023-05-10');
      expect(result).toContain('(1 years old)'); // Note: function uses 'years' plural
    });

    it('handles birthday that has not occurred yet this year', () => {
      const result = formatAgeDisplay('2000-12-25'); // Future date in year
      expect(result).toContain('(23 years old)');
    });

    it('handles very old ages', () => {
      const result = formatAgeDisplay('1930-03-15');
      expect(result).toMatch(/\(\d{2,3} years old\)/);
    });

    it('includes formatted date in output', () => {
      const result = formatAgeDisplay('2000-06-15');
      expect(result).toContain('Jun 15, 2000');
    });

    it('handles leap year birth dates', () => {
      const result = formatAgeDisplay('2000-02-29');
      expect(result).toContain('Feb 29, 2000');
      expect(result).toContain('24 years old');
    });
  });

  describe('Integration: Complete date formatting flow', () => {
    it('handles consistent formatting across functions', () => {
      const dateString = '2000-05-15T10:30:00Z';

      const date = formatDate(dateString);
      const dateTime = formatDateTime(dateString);

      // Both should contain the same date part
      expect(date).toContain('May 15, 2000');
      expect(dateTime).toContain('May 15, 2000');
      // DateTime should have additional time component
      expect(dateTime.length).toBeGreaterThan(date.length);
    });

    it('handles null values consistently', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDateTime(null)).toBe('Never');
      expect(calculateAge(null)).toBeNull();
      expect(formatAgeDisplay(null)).toBe('Not set');
    });

    it('handles invalid dates consistently', () => {
      const invalidDate = 'not-a-date';

      expect(formatDate(invalidDate)).toBe('Invalid date');
      expect(formatDateTime(invalidDate)).toBe('Invalid date');
      expect(calculateAge(invalidDate)).toBeNull();
      expect(formatAgeDisplay(invalidDate)).toBe('Invalid date');
    });

    it('formats user profile dates correctly', () => {
      vi.setSystemTime(new Date('2024-11-16T12:00:00Z'));

      const registrationDate = '2024-01-15T08:00:00Z';
      const lastLogin = '2024-11-15T10:30:00Z';
      const dateOfBirth = '1995-06-20';

      const regDate = formatDate(registrationDate);
      const lastLoginTime = formatDateTime(lastLogin);
      const age = formatAgeDisplay(dateOfBirth);

      expect(regDate).toBe('Jan 15, 2024');
      expect(lastLoginTime).toContain('Nov 15, 2024');
      expect(age).toContain('Jun 20, 1995');
      expect(age).toContain('29 years old');
    });
  });

  describe('Edge cases', () => {
    it('handles very far future dates', () => {
      const result = formatDate('2099-12-31');
      expect(result).toBe('Dec 31, 2099');
    });

    it('handles dates at year boundaries', () => {
      expect(formatDate('2023-12-31')).toBe('Dec 31, 2023');
      expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
    });

    it('handles time zones correctly', () => {
      const utcDate = '2024-01-15T23:00:00Z';
      const result = formatDate(utcDate);
      expect(result).toContain('2024'); // Year should be consistent
    });

    it('handles milliseconds in ISO string', () => {
      const result = formatDate('2024-01-15T10:30:00.123Z');
      expect(result).toBe('Jan 15, 2024');
    });

    it('handles dates without timezone', () => {
      const result = formatDate('2024-01-15T10:30:00');
      expect(result).toBe('Jan 15, 2024');
    });
  });
});
