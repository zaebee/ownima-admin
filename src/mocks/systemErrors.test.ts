import { describe, it, expect } from 'vitest';
import { mockSystemErrors, getMockSystemErrors, getErrorStatistics } from './systemErrors';

describe('systemErrors mock data', () => {
  describe('mockSystemErrors', () => {
    it('contains 10 error entries', () => {
      expect(mockSystemErrors).toHaveLength(10);
    });

    it('all errors have required fields', () => {
      mockSystemErrors.forEach((error) => {
        expect(error).toHaveProperty('id');
        expect(error).toHaveProperty('timestamp');
        expect(error).toHaveProperty('level');
        expect(error).toHaveProperty('source');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('resolved');
      });
    });

    it('has valid error levels', () => {
      const validLevels = ['CRITICAL', 'ERROR', 'WARNING', 'INFO'];
      mockSystemErrors.forEach((error) => {
        expect(validLevels).toContain(error.level);
      });
    });

    it('has valid timestamps', () => {
      mockSystemErrors.forEach((error) => {
        const timestamp = new Date(error.timestamp);
        expect(timestamp.getTime()).not.toBeNaN();
        expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
      });
    });

    it('has valid resolved boolean values', () => {
      mockSystemErrors.forEach((error) => {
        expect(typeof error.resolved).toBe('boolean');
      });
    });

    it('contains CRITICAL level errors', () => {
      const criticalErrors = mockSystemErrors.filter((e) => e.level === 'CRITICAL');
      expect(criticalErrors.length).toBeGreaterThan(0);
    });

    it('contains ERROR level errors', () => {
      const errors = mockSystemErrors.filter((e) => e.level === 'ERROR');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('contains WARNING level errors', () => {
      const warnings = mockSystemErrors.filter((e) => e.level === 'WARNING');
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('contains INFO level errors', () => {
      const infoErrors = mockSystemErrors.filter((e) => e.level === 'INFO');
      expect(infoErrors.length).toBeGreaterThan(0);
    });

    it('has both resolved and unresolved errors', () => {
      const resolved = mockSystemErrors.filter((e) => e.resolved);
      const unresolved = mockSystemErrors.filter((e) => !e.resolved);

      expect(resolved.length).toBeGreaterThan(0);
      expect(unresolved.length).toBeGreaterThan(0);
    });

    it('has diverse error sources', () => {
      const sources = new Set(mockSystemErrors.map((e) => e.source));
      expect(sources.size).toBeGreaterThan(5);
    });

    it('includes errors with error codes', () => {
      const withErrorCode = mockSystemErrors.filter((e) => e.error_code);
      expect(withErrorCode.length).toBeGreaterThan(0);
    });

    it('includes errors with affected users', () => {
      const withAffectedUsers = mockSystemErrors.filter((e) => e.affected_users);
      expect(withAffectedUsers.length).toBeGreaterThan(0);
    });

    it('includes errors with tags', () => {
      const withTags = mockSystemErrors.filter((e) => e.tags && e.tags.length > 0);
      expect(withTags.length).toBeGreaterThan(0);
    });

    it('includes errors with stack traces', () => {
      const withStackTrace = mockSystemErrors.filter((e) => e.stack_trace);
      expect(withStackTrace.length).toBeGreaterThan(0);
    });

    it('includes errors with user IDs', () => {
      const withUserId = mockSystemErrors.filter((e) => e.user_id);
      expect(withUserId.length).toBeGreaterThan(0);
    });

    it('includes errors with request IDs', () => {
      const withRequestId = mockSystemErrors.filter((e) => e.request_id);
      expect(withRequestId.length).toBeGreaterThan(0);
    });

    it('resolved errors have resolution times', () => {
      const resolvedErrors = mockSystemErrors.filter((e) => e.resolved);
      resolvedErrors.forEach((error) => {
        if (error.resolution_time) {
          const resolutionTime = new Date(error.resolution_time);
          const errorTime = new Date(error.timestamp);
          expect(resolutionTime.getTime()).toBeGreaterThan(errorTime.getTime());
        }
      });
    });

    it('has chronologically ordered timestamps (newest first)', () => {
      for (let i = 0; i < mockSystemErrors.length - 1; i++) {
        const current = new Date(mockSystemErrors[i].timestamp);
        const next = new Date(mockSystemErrors[i + 1].timestamp);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });
  });

  describe('getMockSystemErrors', () => {
    it('returns a promise', () => {
      const result = getMockSystemErrors();
      expect(result).toBeInstanceOf(Promise);
    });

    it('resolves with array of errors', async () => {
      const errors = await getMockSystemErrors();
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBe(10);
    });

    it('simulates network delay', async () => {
      const startTime = Date.now();
      await getMockSystemErrors();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 400ms (allowing for some variance)
      expect(duration).toBeGreaterThanOrEqual(400);
    });

    it('returns same data as mockSystemErrors', async () => {
      const errors = await getMockSystemErrors();
      expect(errors).toEqual(mockSystemErrors);
    });
  });

  describe('getErrorStatistics', () => {
    it('returns statistics object', () => {
      const stats = getErrorStatistics();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('critical');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('warnings');
      expect(stats).toHaveProperty('resolved');
      expect(stats).toHaveProperty('unresolved');
      expect(stats).toHaveProperty('resolutionRate');
    });

    it('calculates total correctly', () => {
      const stats = getErrorStatistics();
      expect(stats.total).toBe(mockSystemErrors.length);
    });

    it('calculates critical count correctly', () => {
      const stats = getErrorStatistics();
      const expectedCritical = mockSystemErrors.filter((e) => e.level === 'CRITICAL').length;
      expect(stats.critical).toBe(expectedCritical);
    });

    it('calculates error count correctly', () => {
      const stats = getErrorStatistics();
      const expectedErrors = mockSystemErrors.filter((e) => e.level === 'ERROR').length;
      expect(stats.errors).toBe(expectedErrors);
    });

    it('calculates warning count correctly', () => {
      const stats = getErrorStatistics();
      const expectedWarnings = mockSystemErrors.filter((e) => e.level === 'WARNING').length;
      expect(stats.warnings).toBe(expectedWarnings);
    });

    it('calculates resolved count correctly', () => {
      const stats = getErrorStatistics();
      const expectedResolved = mockSystemErrors.filter((e) => e.resolved).length;
      expect(stats.resolved).toBe(expectedResolved);
    });

    it('calculates unresolved count correctly', () => {
      const stats = getErrorStatistics();
      const expectedUnresolved = mockSystemErrors.filter((e) => !e.resolved).length;
      expect(stats.unresolved).toBe(expectedUnresolved);
    });

    it('resolved and unresolved sum to total', () => {
      const stats = getErrorStatistics();
      expect(stats.resolved + stats.unresolved).toBe(stats.total);
    });

    it('calculates resolution rate correctly', () => {
      const stats = getErrorStatistics();
      const expectedRate = ((stats.resolved / stats.total) * 100).toFixed(1);
      expect(stats.resolutionRate).toBe(expectedRate);
    });

    it('resolution rate is a string with one decimal', () => {
      const stats = getErrorStatistics();
      expect(typeof stats.resolutionRate).toBe('string');
      expect(stats.resolutionRate).toMatch(/^\d+\.\d$/);
    });

    it('resolution rate is between 0 and 100', () => {
      const stats = getErrorStatistics();
      const rate = parseFloat(stats.resolutionRate);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });

    it('all level counts sum correctly', () => {
      const stats = getErrorStatistics();
      const levelSum =
        stats.critical +
        stats.errors +
        stats.warnings +
        mockSystemErrors.filter((e) => e.level === 'INFO').length;
      expect(levelSum).toBe(stats.total);
    });
  });

  describe('Data Integrity', () => {
    it('has unique error IDs', () => {
      const ids = mockSystemErrors.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('error codes follow naming convention', () => {
      mockSystemErrors.forEach((error) => {
        if (error.error_code) {
          // Should be uppercase with underscores
          expect(error.error_code).toMatch(/^[A-Z_]+$/);
        }
      });
    });

    it('affected users are positive numbers', () => {
      mockSystemErrors.forEach((error) => {
        if (error.affected_users !== undefined) {
          expect(error.affected_users).toBeGreaterThan(0);
        }
      });
    });

    it('tags are lowercase with hyphens', () => {
      mockSystemErrors.forEach((error) => {
        if (error.tags) {
          error.tags.forEach((tag) => {
            expect(tag).toMatch(/^[a-z-]+$/);
          });
        }
      });
    });

    it('sources are properly capitalized', () => {
      mockSystemErrors.forEach((error) => {
        expect(error.source.length).toBeGreaterThan(0);
        expect(error.source[0]).toMatch(/[A-Z]/);
      });
    });

    it('messages are non-empty strings', () => {
      mockSystemErrors.forEach((error) => {
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Realistic Data Scenarios', () => {
    it('has database-related errors', () => {
      const dbErrors = mockSystemErrors.filter(
        (e) =>
          e.source.toLowerCase().includes('database') || e.tags?.some((t) => t.includes('database'))
      );
      expect(dbErrors.length).toBeGreaterThan(0);
    });

    it('has API-related errors', () => {
      const apiErrors = mockSystemErrors.filter(
        (e) => e.source.toLowerCase().includes('api') || e.source.toLowerCase().includes('gateway')
      );
      expect(apiErrors.length).toBeGreaterThan(0);
    });

    it('has performance-related errors', () => {
      const perfErrors = mockSystemErrors.filter((e) =>
        e.tags?.some((t) => t.includes('performance'))
      );
      expect(perfErrors.length).toBeGreaterThan(0);
    });

    it('has security-related errors', () => {
      const securityErrors = mockSystemErrors.filter(
        (e) =>
          e.tags?.some((t) => t.includes('security')) || e.source.toLowerCase().includes('auth')
      );
      expect(securityErrors.length).toBeGreaterThan(0);
    });

    it('critical errors have high affected user counts', () => {
      const criticalErrors = mockSystemErrors.filter(
        (e) => e.level === 'CRITICAL' && e.affected_users
      );

      if (criticalErrors.length > 0) {
        criticalErrors.forEach((error) => {
          expect(error.affected_users).toBeGreaterThan(10);
        });
      }
    });
  });
});
