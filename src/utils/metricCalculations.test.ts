import { describe, it, expect } from 'vitest';
import {
  calculateActivityRate,
  calculateAverage,
  calculateVehiclesPerOwner,
  calculateBookingsPerRider,
} from './metricCalculations';

describe('metricCalculations', () => {
  describe('calculateActivityRate', () => {
    it('calculates activity rate correctly for valid inputs', () => {
      expect(calculateActivityRate(25, 100)).toBe(25);
      expect(calculateActivityRate(50, 100)).toBe(50);
      expect(calculateActivityRate(75, 100)).toBe(75);
    });

    it('rounds to nearest integer', () => {
      expect(calculateActivityRate(33, 100)).toBe(33);
      expect(calculateActivityRate(66, 100)).toBe(66);
      expect(calculateActivityRate(1, 3)).toBe(33); // 33.33... -> 33
      expect(calculateActivityRate(2, 3)).toBe(67); // 66.66... -> 67
    });

    it('handles 0% activity rate', () => {
      expect(calculateActivityRate(0, 100)).toBe(0);
    });

    it('handles 100% activity rate', () => {
      expect(calculateActivityRate(100, 100)).toBe(100);
    });

    it('returns 0 when total is 0 (division by zero protection)', () => {
      expect(calculateActivityRate(10, 0)).toBe(0);
      expect(calculateActivityRate(0, 0)).toBe(0);
    });

    it('handles negative inputs gracefully', () => {
      expect(calculateActivityRate(-10, 100)).toBe(-10); // -10% activity
      expect(calculateActivityRate(10, -100)).toBe(0); // Negative total is invalid, returns 0
    });

    it('handles decimal inputs', () => {
      expect(calculateActivityRate(12.5, 50)).toBe(25);
      expect(calculateActivityRate(33.33, 100)).toBe(33);
    });

    it('handles large numbers', () => {
      expect(calculateActivityRate(1000, 10000)).toBe(10);
      expect(calculateActivityRate(500000, 1000000)).toBe(50);
    });

    it('handles very small numbers', () => {
      expect(calculateActivityRate(1, 1000)).toBe(0); // 0.1% -> 0
      expect(calculateActivityRate(5, 1000)).toBe(1); // 0.5% -> 1
    });
  });

  describe('calculateAverage', () => {
    it('calculates average with 1 decimal place by default', () => {
      expect(calculateAverage(10, 3)).toBe('3.3');
      expect(calculateAverage(20, 6)).toBe('3.3');
      expect(calculateAverage(100, 3)).toBe('33.3');
    });

    it('calculates average with custom decimal places', () => {
      expect(calculateAverage(10, 3, 0)).toBe('3');
      expect(calculateAverage(10, 3, 2)).toBe('3.33');
      expect(calculateAverage(10, 3, 3)).toBe('3.333');
    });

    it('handles whole number results', () => {
      expect(calculateAverage(10, 2, 1)).toBe('5.0');
      expect(calculateAverage(100, 10, 1)).toBe('10.0');
    });

    it('returns "N/A" when denominator is 0', () => {
      expect(calculateAverage(10, 0)).toBe('N/A');
      expect(calculateAverage(0, 0)).toBe('N/A');
      expect(calculateAverage(100, 0, 2)).toBe('N/A');
    });

    it('handles 0 numerator correctly', () => {
      expect(calculateAverage(0, 10, 1)).toBe('0.0');
      expect(calculateAverage(0, 100, 2)).toBe('0.00');
    });

    it('handles negative numbers', () => {
      expect(calculateAverage(-10, 2, 1)).toBe('-5.0'); // Negative numerator is valid
      expect(calculateAverage(10, -2, 1)).toBe('N/A'); // Negative denominator is invalid
      expect(calculateAverage(-10, -2, 1)).toBe('N/A'); // Negative denominator is invalid
    });

    it('handles decimal inputs', () => {
      expect(calculateAverage(10.5, 3, 1)).toBe('3.5');
      expect(calculateAverage(100.75, 4, 2)).toBe('25.19');
    });

    it('handles very small decimals', () => {
      expect(calculateAverage(1, 1000, 3)).toBe('0.001');
      expect(calculateAverage(1, 10000, 4)).toBe('0.0001');
    });

    it('handles large numbers', () => {
      expect(calculateAverage(1000000, 1000, 1)).toBe('1000.0');
      expect(calculateAverage(500000, 1000, 2)).toBe('500.00');
    });
  });

  describe('calculateVehiclesPerOwner', () => {
    it('calculates vehicles per owner correctly', () => {
      expect(calculateVehiclesPerOwner(100, 50)).toBe('2.0');
      expect(calculateVehiclesPerOwner(150, 50)).toBe('3.0');
      expect(calculateVehiclesPerOwner(75, 50)).toBe('1.5');
    });

    it('returns "N/A" when there are no owners', () => {
      expect(calculateVehiclesPerOwner(100, 0)).toBe('N/A');
    });

    it('handles 0 vehicles', () => {
      expect(calculateVehiclesPerOwner(0, 50)).toBe('0.0');
    });

    it('handles fractional results', () => {
      expect(calculateVehiclesPerOwner(10, 3)).toBe('3.3');
      expect(calculateVehiclesPerOwner(100, 7)).toBe('14.3');
    });

    it('handles edge case of 1 owner', () => {
      expect(calculateVehiclesPerOwner(5, 1)).toBe('5.0');
    });

    it('handles edge case of 1 vehicle', () => {
      expect(calculateVehiclesPerOwner(1, 100)).toBe('0.0'); // 0.01 -> rounds to 0.0
    });

    it('uses 1 decimal place precision', () => {
      expect(calculateVehiclesPerOwner(100, 3)).toBe('33.3'); // not 33.33
      expect(calculateVehiclesPerOwner(10, 7)).toBe('1.4'); // not 1.43
    });
  });

  describe('calculateBookingsPerRider', () => {
    it('calculates bookings per rider correctly', () => {
      expect(calculateBookingsPerRider(200, 50)).toBe('4.0');
      expect(calculateBookingsPerRider(150, 50)).toBe('3.0');
      expect(calculateBookingsPerRider(75, 50)).toBe('1.5');
    });

    it('returns "N/A" when there are no riders', () => {
      expect(calculateBookingsPerRider(100, 0)).toBe('N/A');
    });

    it('handles 0 bookings', () => {
      expect(calculateBookingsPerRider(0, 50)).toBe('0.0');
    });

    it('handles fractional results', () => {
      expect(calculateBookingsPerRider(10, 3)).toBe('3.3');
      expect(calculateBookingsPerRider(100, 7)).toBe('14.3');
    });

    it('handles edge case of 1 rider', () => {
      expect(calculateBookingsPerRider(10, 1)).toBe('10.0');
    });

    it('handles edge case of 1 booking', () => {
      expect(calculateBookingsPerRider(1, 100)).toBe('0.0'); // 0.01 -> rounds to 0.0
    });

    it('uses 1 decimal place precision', () => {
      expect(calculateBookingsPerRider(100, 3)).toBe('33.3'); // not 33.33
      expect(calculateBookingsPerRider(10, 7)).toBe('1.4'); // not 1.43
    });

    it('handles high booking volume', () => {
      expect(calculateBookingsPerRider(10000, 100)).toBe('100.0');
      expect(calculateBookingsPerRider(50000, 1000)).toBe('50.0');
    });
  });

  describe('Integration tests', () => {
    it('calculateVehiclesPerOwner and calculateBookingsPerRider use consistent precision', () => {
      const vehiclesResult = calculateVehiclesPerOwner(100, 3);
      const bookingsResult = calculateBookingsPerRider(100, 3);

      expect(vehiclesResult).toBe(bookingsResult); // Both should use same averaging logic
      expect(vehiclesResult).toBe('33.3');
    });

    it('all calculation functions handle edge cases consistently', () => {
      // All should handle division by zero gracefully
      expect(calculateActivityRate(10, 0)).toBe(0);
      expect(calculateAverage(10, 0)).toBe('N/A');
      expect(calculateVehiclesPerOwner(10, 0)).toBe('N/A');
      expect(calculateBookingsPerRider(10, 0)).toBe('N/A');
    });

    it('calculation functions can be composed', () => {
      // Calculate activity rate from average
      const avg = parseFloat(calculateAverage(25, 100, 2));
      const rate = Math.round(avg * 100);
      expect(rate).toBe(25);
    });
  });

  describe('Performance', () => {
    it('handles calculations efficiently for large datasets', () => {
      const start = performance.now();

      // Run 10000 calculations
      for (let i = 0; i < 10000; i++) {
        calculateActivityRate(i, 10000);
        calculateAverage(i, 100);
        calculateVehiclesPerOwner(i, 50);
        calculateBookingsPerRider(i, 75);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
