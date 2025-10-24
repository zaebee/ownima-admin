/**
 * Metric Calculation Utilities
 *
 * Centralized calculation logic for dashboard metrics.
 * Follows KISS principle - simple, focused functions.
 */

/**
 * Calculate activity rate as a percentage
 * @param active - Number of active users
 * @param total - Total number of users
 * @returns Activity rate percentage (0-100)
 */
export const calculateActivityRate = (active: number, total: number): number => {
  return total > 0 ? Math.round((active / total) * 100) : 0;
};

/**
 * Calculate average with configurable decimal places
 * @param numerator - Numerator value
 * @param denominator - Denominator value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted average or 'N/A' if denominator is 0
 */
export const calculateAverage = (
  numerator: number,
  denominator: number,
  decimals: number = 1
): string => {
  return denominator > 0
    ? (numerator / denominator).toFixed(decimals)
    : 'N/A';
};

/**
 * Calculate vehicles per owner
 * @param vehicleCount - Total vehicles
 * @param ownerCount - Total owners
 * @returns Average vehicles per owner
 */
export const calculateVehiclesPerOwner = (
  vehicleCount: number,
  ownerCount: number
): string => {
  return calculateAverage(vehicleCount, ownerCount, 1);
};

/**
 * Calculate bookings per rider
 * @param reservationCount - Total reservations/bookings
 * @param riderCount - Total riders
 * @returns Average bookings per rider
 */
export const calculateBookingsPerRider = (
  reservationCount: number,
  riderCount: number
): string => {
  return calculateAverage(reservationCount, riderCount, 1);
};
