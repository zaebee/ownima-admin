import React from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { ReservationStatusLabels, type ReservationFilters as ReservationFiltersType } from '../types';

interface ReservationFiltersProps {
  filters: ReservationFiltersType;
  onFiltersChange: (filters: ReservationFiltersType) => void;
  onClearFilters: () => void;
}

export const ReservationFilters: React.FC<ReservationFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const hasActiveFilters = () => {
    return (
      filters.status !== undefined ||
      filters.dateFrom !== undefined ||
      filters.dateTo !== undefined ||
      (filters.search && filters.search.trim().length > 0)
    );
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : parseInt(status, 10),
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search.trim().length > 0 ? search : undefined,
    });
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* First Row: Title, Status, Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Filter Icon and Title */}
        <div className="flex items-center space-x-2 sm:min-w-fit">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters() && (
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
          <label htmlFor="reservation-status-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Status:
          </label>
          <select
            id="reservation-status-filter"
            value={filters.status !== undefined ? filters.status.toString() : 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="flex-1 sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="all">All Statuses</option>
            {Object.entries(ReservationStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by rider name or reservation ID..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Second Row: Date Range Filters */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center space-x-2 sm:min-w-fit">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Date Range:</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="flex items-center space-x-2 flex-1">
            <label htmlFor="reservation-date-from" className="text-sm text-gray-600 whitespace-nowrap">
              From:
            </label>
            <input
              id="reservation-date-from"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 flex-1">
            <label htmlFor="reservation-date-to" className="text-sm text-gray-600 whitespace-nowrap">
              To:
            </label>
            <input
              id="reservation-date-to"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {filters.status !== undefined && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Status: {ReservationStatusLabels[filters.status] || 'Unknown'}
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                From: {filters.dateFrom}
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                To: {filters.dateTo}
              </span>
            )}
            {filters.search && filters.search.trim().length > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Search: "{filters.search}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
