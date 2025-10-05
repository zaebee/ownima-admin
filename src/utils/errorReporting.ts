import { ErrorInfo } from 'react';

/**
 * Error reporting utility for logging errors to external services
 */

interface ErrorReport {
  error: Error;
  errorInfo?: ErrorInfo;
  context?: Record<string, unknown>;
  timestamp: string;
  userAgent: string;
  url: string;
}

/**
 * Log error to console in development
 */
const logToConsole = (report: ErrorReport): void => {
  if (import.meta.env.DEV) {
    console.error('Error Report:', {
      message: report.error.message,
      stack: report.error.stack,
      componentStack: report.errorInfo?.componentStack,
      context: report.context,
      timestamp: report.timestamp,
      url: report.url,
    });
  }
};

/**
 * Send error to external service (e.g., Sentry, LogRocket)
 * This is a placeholder - implement with your error tracking service
 */
const sendToErrorService = (report: ErrorReport): void => {
  // Example: Sentry integration
  // if (window.Sentry) {
  //   window.Sentry.captureException(report.error, {
  //     contexts: {
  //       react: {
  //         componentStack: report.errorInfo?.componentStack,
  //       },
  //     },
  //     extra: report.context,
  //   });
  // }

  // For now, just log in development
  if (import.meta.env.DEV) {
    console.warn('Error would be sent to error tracking service:', report);
  }
};

/**
 * Store error in localStorage for debugging
 */
const storeErrorLocally = (report: ErrorReport): void => {
  try {
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push({
      message: report.error.message,
      stack: report.error.stack,
      timestamp: report.timestamp,
      url: report.url,
    });

    // Keep only last 10 errors
    const recentErrors = errors.slice(-10);
    localStorage.setItem('app_errors', JSON.stringify(recentErrors));
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Main error reporting function
 */
export const reportError = (
  error: Error,
  errorInfo?: ErrorInfo,
  context?: Record<string, unknown>
): void => {
  const report: ErrorReport = {
    error,
    errorInfo,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  logToConsole(report);

  // Store locally for debugging
  storeErrorLocally(report);

  // Send to external service
  sendToErrorService(report);
};

/**
 * Get stored errors from localStorage
 */
export const getStoredErrors = (): Array<{
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
}> => {
  try {
    return JSON.parse(localStorage.getItem('app_errors') || '[]');
  } catch {
    return [];
  }
};

/**
 * Clear stored errors
 */
export const clearStoredErrors = (): void => {
  try {
    localStorage.removeItem('app_errors');
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Initialize error reporting (call this in your app entry point)
 */
export const initErrorReporting = (): void => {
  // Global error handler for unhandled errors
  window.addEventListener('error', (event) => {
    reportError(new Error(event.message), undefined, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Global handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      undefined,
      { type: 'unhandledRejection' }
    );
  });
};
