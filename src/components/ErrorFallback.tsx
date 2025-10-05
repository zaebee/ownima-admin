import React from 'react';
import { ErrorInfo } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo;
  resetError?: () => void;
  showDetails?: boolean;
}

/**
 * User-friendly error fallback component with multiple recovery options
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  showDetails = import.meta.env.DEV,
}) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="mt-6 text-2xl font-bold text-gray-900 text-center">
            Oops! Something went wrong
          </h1>

          {/* Description */}
          <p className="mt-3 text-base text-gray-600 text-center leading-relaxed">
            We encountered an unexpected error. Don't worry, your data is safe. Please try one of
            the options below to continue.
          </p>

          {/* Error Details (Development only) */}
          {showDetails && error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                Error Details (Development Mode)
              </h3>
              <p className="text-xs font-mono text-red-800 break-all mb-2">{error.toString()}</p>
              {errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-700 cursor-pointer hover:text-red-900 font-medium">
                    View stack trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-48 p-2 bg-red-100 rounded">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {resetError && (
              <button
                onClick={resetError}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg text-base font-medium text-white hover:from-primary-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Try Again
              </button>
            )}

            <button
              onClick={handleReload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Reload Page
            </button>

            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <HomeIcon className="w-5 h-5" />
              Go to Home
            </button>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            If the problem persists, please contact support or try again later.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Minimal error fallback for critical errors
 */
export const MinimalErrorFallback: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Application Error</h1>
        <p className="text-sm text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  );
};
