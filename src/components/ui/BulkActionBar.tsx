import React from 'react';
import { Button } from './Button';
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface BulkActionBarProps {
  /**
   * Number of selected items
   */
  selectedCount: number;

  /**
   * Total number of items available
   */
  totalCount?: number;

  /**
   * Callback when "Select All" is clicked
   */
  onSelectAll?: () => void;

  /**
   * Callback when "Clear Selection" is clicked
   */
  onClearSelection: () => void;

  /**
   * Callback when "Activate" is clicked
   */
  onActivate?: () => void;

  /**
   * Callback when "Deactivate" is clicked
   */
  onDeactivate?: () => void;

  /**
   * Callback when "Delete" is clicked
   */
  onDelete?: () => void;

  /**
   * Whether bulk operations are loading
   */
  isLoading?: boolean;
}

/**
 * BulkActionBar Component
 *
 * Displays a sticky action bar when items are selected, allowing bulk operations.
 * Appears at the bottom of the screen with available actions.
 *
 * @example
 * ```tsx
 * <BulkActionBar
 *   selectedCount={5}
 *   totalCount={50}
 *   onSelectAll={() => selectAllUsers()}
 *   onClearSelection={() => setSelectedIds(new Set())}
 *   onActivate={() => bulkActivate()}
 *   onDeactivate={() => bulkDeactivate()}
 *   onDelete={() => bulkDelete()}
 * />
 * ```
 */
export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onActivate,
  onDeactivate,
  onDelete,
  isLoading = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Selection info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-900">
                {selectedCount} selected
              </span>
            </div>

            {totalCount !== undefined && onSelectAll && selectedCount < totalCount && (
              <button
                onClick={onSelectAll}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                disabled={isLoading}
              >
                Select all {totalCount}
              </button>
            )}

            <button
              onClick={onClearSelection}
              className="text-sm text-gray-600 hover:text-gray-700 flex items-center space-x-1"
              disabled={isLoading}
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {onActivate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onActivate}
                disabled={isLoading}
                className="flex items-center"
              >
                <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                Activate
              </Button>
            )}

            {onDeactivate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDeactivate}
                disabled={isLoading}
                className="flex items-center"
              >
                <XCircleIcon className="w-4 h-4 mr-1.5" />
                Deactivate
              </Button>
            )}

            {onDelete && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDelete}
                disabled={isLoading}
                className="flex items-center text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-1.5" />
                Delete {selectedCount}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
