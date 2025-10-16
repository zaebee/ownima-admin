import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  reportError,
  getStoredErrors,
  clearStoredErrors,
  initErrorReporting,
} from './errorReporting';

describe('errorReporting', () => {
  const mockError = new Error('Test error');
  const mockErrorInfo = {
    componentStack: '\n    at Component\n    at ErrorBoundary',
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear console spies
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up event listeners
    window.removeEventListener('error', () => {});
    window.removeEventListener('unhandledrejection', () => {});
  });

  describe('reportError', () => {
    it('stores error in localStorage', () => {
      reportError(mockError);

      const stored = getStoredErrors();
      expect(stored).toHaveLength(1);
      expect(stored[0].message).toBe('Test error');
      expect(stored[0].timestamp).toBeDefined();
      expect(stored[0].url).toBeDefined();
    });

    it('stores error with errorInfo', () => {
      reportError(mockError, mockErrorInfo);

      const stored = getStoredErrors();
      expect(stored).toHaveLength(1);
      expect(stored[0].message).toBe('Test error');
    });

    it('stores error with context', () => {
      reportError(mockError, undefined, { userId: '123', action: 'submit' });

      const stored = getStoredErrors();
      expect(stored).toHaveLength(1);
      expect(stored[0].message).toBe('Test error');
    });

    it('stores multiple errors', () => {
      reportError(new Error('Error 1'));
      reportError(new Error('Error 2'));
      reportError(new Error('Error 3'));

      const stored = getStoredErrors();
      expect(stored).toHaveLength(3);
      expect(stored[0].message).toBe('Error 1');
      expect(stored[1].message).toBe('Error 2');
      expect(stored[2].message).toBe('Error 3');
    });

    it('keeps only last 10 errors', () => {
      // Store 15 errors
      for (let i = 1; i <= 15; i++) {
        reportError(new Error(`Error ${i}`));
      }

      const stored = getStoredErrors();
      expect(stored).toHaveLength(10);
      expect(stored[0].message).toBe('Error 6');
      expect(stored[9].message).toBe('Error 15');
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage full');
      });

      // Should not throw
      expect(() => reportError(mockError)).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('includes error stack trace', () => {
      const errorWithStack = new Error('Error with stack');
      reportError(errorWithStack);

      const stored = getStoredErrors();
      expect(stored[0].stack).toBeDefined();
    });

    it('includes timestamp in ISO format', () => {
      reportError(mockError);

      const stored = getStoredErrors();
      expect(stored[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('includes current URL', () => {
      reportError(mockError);

      const stored = getStoredErrors();
      expect(stored[0].url).toBe(window.location.href);
    });
  });

  describe('getStoredErrors', () => {
    it('returns empty array when no errors stored', () => {
      const errors = getStoredErrors();
      expect(errors).toEqual([]);
    });

    it('returns stored errors', () => {
      reportError(new Error('Error 1'));
      reportError(new Error('Error 2'));

      const errors = getStoredErrors();
      expect(errors).toHaveLength(2);
    });

    it('handles corrupted localStorage data', () => {
      localStorage.setItem('app_errors', 'invalid json');

      const errors = getStoredErrors();
      expect(errors).toEqual([]);
    });

    it('handles localStorage errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const errors = getStoredErrors();
      expect(errors).toEqual([]);

      getItemSpy.mockRestore();
    });
  });

  describe('clearStoredErrors', () => {
    it('clears stored errors', () => {
      reportError(new Error('Error 1'));
      reportError(new Error('Error 2'));

      expect(getStoredErrors()).toHaveLength(2);

      clearStoredErrors();

      expect(getStoredErrors()).toHaveLength(0);
    });

    it('handles localStorage errors gracefully', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => clearStoredErrors()).not.toThrow();

      removeItemSpy.mockRestore();
    });

    it('works when no errors are stored', () => {
      expect(() => clearStoredErrors()).not.toThrow();
    });
  });

  describe('initErrorReporting', () => {
    it('sets up global error handler', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      initErrorReporting();

      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('handles global errors', () => {
      initErrorReporting();

      // Trigger error event
      const errorEvent = new ErrorEvent('error', {
        message: 'Global error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
      });
      window.dispatchEvent(errorEvent);

      const stored = getStoredErrors();
      expect(stored.length).toBeGreaterThan(0);
      expect(stored[stored.length - 1].message).toBe('Global error');
    });

    it('handles unhandled promise rejections with Error', () => {
      initErrorReporting();

      // Create a resolved promise to avoid actual rejection
      const mockPromise = Promise.resolve();

      // Trigger unhandledrejection event with Error
      const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: mockPromise,
        reason: new Error('Promise rejection'),
      });
      window.dispatchEvent(rejectionEvent);

      const stored = getStoredErrors();
      expect(stored.length).toBeGreaterThan(0);
      expect(stored[stored.length - 1].message).toBe('Promise rejection');
    });

    it('handles unhandled promise rejections with string', () => {
      initErrorReporting();

      // Create a resolved promise to avoid actual rejection
      const mockPromise = Promise.resolve();

      // Trigger unhandledrejection event with string
      const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: mockPromise,
        reason: 'String rejection',
      });
      window.dispatchEvent(rejectionEvent);

      const stored = getStoredErrors();
      expect(stored.length).toBeGreaterThan(0);
      expect(stored[stored.length - 1].message).toBe('String rejection');
    });

    it('can be called multiple times safely', () => {
      expect(() => {
        initErrorReporting();
        initErrorReporting();
      }).not.toThrow();
    });
  });

  describe('Error Report Structure', () => {
    it('includes all required fields', () => {
      reportError(mockError, mockErrorInfo, { custom: 'data' });

      const stored = getStoredErrors();
      const report = stored[0];

      expect(report).toHaveProperty('message');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('url');
    });

    it('handles errors without stack trace', () => {
      const errorWithoutStack = new Error('No stack');
      delete errorWithoutStack.stack;

      reportError(errorWithoutStack);

      const stored = getStoredErrors();
      expect(stored[0].message).toBe('No stack');
    });
  });

  describe('Integration', () => {
    it('full workflow: report, get, clear', () => {
      // Report errors
      reportError(new Error('Error 1'));
      reportError(new Error('Error 2'));

      // Get errors
      let errors = getStoredErrors();
      expect(errors).toHaveLength(2);

      // Clear errors
      clearStoredErrors();

      // Verify cleared
      errors = getStoredErrors();
      expect(errors).toHaveLength(0);
    });

    it('handles concurrent error reporting', () => {
      const errors = Array.from({ length: 5 }, (_, i) => new Error(`Error ${i + 1}`));

      errors.forEach((error) => reportError(error));

      const stored = getStoredErrors();
      expect(stored).toHaveLength(5);
    });
  });
});
