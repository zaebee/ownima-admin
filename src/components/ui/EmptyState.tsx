import React from 'react';
import clsx from 'clsx';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  illustration?: 'search' | 'data' | 'users' | 'error';
  className?: string;
}

const illustrations = {
  search: (
    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  data: (
    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  users: (
    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  error: (
    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  className,
}) => {
  return (
    <div className={clsx('text-center py-12 px-4', className)}>
      {/* Icon or Illustration */}
      {illustration && illustrations[illustration]}
      {Icon && !illustration && (
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="mt-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Action Button */}
      {action && (
        <div className="mt-8">
          <button
            onClick={action.onClick}
            className={clsx(
              'inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              action.variant === 'secondary'
                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
                : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:from-primary-700 hover:to-indigo-700 focus:ring-primary-500 shadow-sm hover:shadow-md'
            )}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};

// Specialized empty states for common scenarios
export const EmptySearchResults: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <EmptyState
    illustration="search"
    title="No results found"
    description="We couldn't find any matches for your search. Try adjusting your filters or search terms."
    action={onReset ? {
      label: 'Clear filters',
      onClick: onReset,
      variant: 'secondary',
    } : undefined}
  />
);

export const EmptyDataState: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    illustration="data"
    title="No data available"
    description="There's no data to display at the moment. This could be because no data has been created yet."
    action={onRefresh ? {
      label: 'Refresh',
      onClick: onRefresh,
      variant: 'secondary',
    } : undefined}
  />
);

export const EmptyUsersState: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    illustration="users"
    title="No users yet"
    description="Get started by creating your first user. Users will appear here once they're added to the system."
    action={onCreate ? {
      label: 'Create user',
      onClick: onCreate,
      variant: 'primary',
    } : undefined}
  />
);

export const ErrorState: React.FC<{ onRetry?: () => void; message?: string }> = ({ 
  onRetry, 
  message = "Something went wrong while loading this data. Please try again." 
}) => (
  <EmptyState
    illustration="error"
    title="Oops! Something went wrong"
    description={message}
    action={onRetry ? {
      label: 'Try again',
      onClick: onRetry,
      variant: 'primary',
    } : undefined}
  />
);
