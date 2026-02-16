import React, { useState } from 'react';
import clsx from 'clsx';
import { CalendarIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { FilterParams, DateRange, DateRangePreset } from '../../types';

interface FilterPanelProps {
  filters: FilterParams;
  onFiltersChange: (filters: FilterParams) => void;
  onReset: () => void;
}

const datePresets: { key: DateRangePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last_7_days', label: 'Last 7 days' },
  { key: 'last_30_days', label: 'Last 30 days' },
  { key: 'custom', label: 'Custom range' }
];

const roleOptions = [
  { value: 'ALL', label: 'All Users' },
  { value: 'OWNER', label: 'Owners' },
  { value: 'RIDER', label: 'Riders' }
];

const getDateRangeFromPreset = (preset: DateRangePreset): DateRange | null => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return {
        start: formatDate(today),
        end: formatDate(today)
      };
    case 'yesterday':
      return {
        start: formatDate(yesterday),
        end: formatDate(yesterday)
      };
    case 'last_7_days': {
      const week = new Date(today);
      week.setDate(week.getDate() - 7);
      return {
        start: formatDate(week),
        end: formatDate(today)
      };
    }
    case 'last_30_days': {
      const month = new Date(today);
      month.setDate(month.getDate() - 30);
      return {
        start: formatDate(month),
        end: formatDate(today)
      };
    }
    default:
      return null;
  }
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('last_7_days');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);

    if (preset === 'custom') {
      setShowCustomDate(true);
      return;
    }

    setShowCustomDate(false);
    const dateRange = getDateRangeFromPreset(preset);
    if (dateRange) {
      onFiltersChange({
        ...filters,
        dateRange
      });
    }
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const currentRange = filters.dateRange || { start: '', end: '' };
    const newRange = {
      ...currentRange,
      [field]: value
    };

    onFiltersChange({
      ...filters,
      dateRange: newRange
    });
  };

  const handleRoleChange = (role: 'OWNER' | 'RIDER' | 'ALL') => {
    onFiltersChange({
      ...filters,
      role
    });
  };

  const handleExcludeBetaTestersChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      excludeBetaTesters: checked || undefined,
    });
  };

  const hasActiveFilters = () => {
    return filters.dateRange || (filters.role && filters.role !== 'ALL') || filters.excludeBetaTesters;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters() && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>

        {hasActiveFilters() && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            Date Range
          </label>

          {/* Preset buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {datePresets.slice(0, 4).map((preset) => (
              <button
                key={preset.key}
                onClick={() => handlePresetChange(preset.key)}
                className={clsx(
                  'px-3 py-2 text-xs font-medium rounded-md transition-colors',
                  selectedPreset === preset.key
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
                  'border'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom range toggle */}
          <button
            onClick={() => handlePresetChange('custom')}
            className={clsx(
              'w-full px-3 py-2 text-xs font-medium rounded-md transition-colors border',
              selectedPreset === 'custom' || showCustomDate
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            )}
          >
            Custom range
          </button>

          {/* Custom date inputs */}
          {showCustomDate && (
            <div className="mt-3 space-y-2">
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="End date"
              />
            </div>
          )}
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Role
          </label>
          <select
            value={filters.role || 'ALL'}
            onChange={(e) => handleRoleChange(e.target.value as 'OWNER' | 'RIDER' | 'ALL')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Beta Testers Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Segment
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.excludeBetaTesters ?? false}
              onChange={(e) => handleExcludeBetaTestersChange(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Exclude beta testers
          </label>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.dateRange && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📅 {filters.dateRange.start} → {filters.dateRange.end}
              </span>
            )}
            {filters.role && filters.role !== 'ALL' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                👤 {filters.role}
              </span>
            )}
            {filters.excludeBetaTesters && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                No beta testers
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};