import React from 'react';
import type { components } from '../types/api-generated';
import {
  ReservationStatusLabels,
  ReservationStatusColors,
  type ReservationSort,
  type SortDirection,
} from '../types';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface ReservationsTableProps {
  reservations: components['schemas']['Reservation'][];
  isLoading: boolean;
  sortField: ReservationSort['field'];
  sortDirection: SortDirection;
  onSort: (field: ReservationSort['field']) => void;
  environment?: 'development' | 'staging' | 'beta' | 'production';
}

export const ReservationsTable: React.FC<ReservationsTableProps> = ({
  reservations,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  environment = 'staging',
}) => {
  const getStatusBadgeColor = (status: number) => {
    const color = ReservationStatusColors[status] || 'gray';
    const colorMap = {
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      red: 'bg-red-100 text-red-700 border-red-200',
    };
    return colorMap[color];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateRange = (from?: string, to?: string) => {
    if (!from || !to) return '-';
    return `${formatDate(from)} - ${formatDate(to)}`;
  };

  const getChatUrl = (reservationId: string) => {
    const domain = environment === 'production'
      ? 'chat.ownima.com'
      : 'chat-stage.ownima.com';
    return `https://${domain}/chat/${reservationId}`;
  };

  const handleChatClick = (reservationId: string) => {
    const url = getChatUrl(reservationId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const SortIcon: React.FC<{ field: ReservationSort['field'] }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <div className="ml-1 flex flex-col opacity-30">
          <ChevronUpIcon className="w-3 h-3 -mb-1" />
          <ChevronDownIcon className="w-3 h-3" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 ml-1" />
    );
  };

  const SortableHeader: React.FC<{
    field: ReservationSort['field'];
    label: string;
    className?: string;
  }> = ({ field, label, className = '' }) => (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center font-semibold text-gray-700 hover:text-gray-900 transition-colors ${className}`}
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <CalendarIcon className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No reservations found</h3>
            <p className="text-sm text-gray-600 mt-1">
              Try adjusting your filters or search criteria
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm">
        <div className="col-span-2">
          <span className="font-semibold text-gray-700">Rider</span>
        </div>
        <div className="col-span-2">
          <span className="font-semibold text-gray-700">Vehicle</span>
        </div>
        <div className="col-span-2">
          <SortableHeader field="status" label="Status" />
        </div>
        <div className="col-span-2">
          <SortableHeader field="date_from" label="Date Range" />
        </div>
        <div className="col-span-2">
          <SortableHeader field="total_price" label="Price" />
        </div>
        <div className="col-span-2">
          <span className="font-semibold text-gray-700">Actions</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
          >
            {/* Rider */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                {reservation.rider?.avatar && (
                  <img
                    src={reservation.rider.avatar}
                    alt={reservation.rider.name || 'Rider'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {reservation.rider?.name || 'Unknown Rider'}
                  </p>
                  {reservation.rider?.email && (
                    <p className="text-xs text-gray-500">{reservation.rider.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                {reservation.vehicle?.picture?.cover && (
                  <img
                    src={reservation.vehicle.picture.cover}
                    alt={reservation.vehicle.name || 'Vehicle'}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <p className="font-medium text-gray-900 text-sm">
                  {reservation.vehicle?.name || 'Unknown Vehicle'}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                  reservation.status ?? 0
                )}`}
              >
                {ReservationStatusLabels[reservation.status ?? 0] || 'Unknown'}
              </span>
            </div>

            {/* Date Range */}
            <div className="col-span-2">
              {reservation.date_from && reservation.date_to ? (
                <div>
                  <p className="text-sm text-gray-700">
                    {formatDateRange(reservation.date_from, reservation.date_to)}
                  </p>
                  {reservation.duration && (
                    <p className="text-xs text-gray-500">
                      {reservation.duration.days}d {reservation.duration.hours}h
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-500">-</span>
              )}
            </div>

            {/* Price */}
            <div className="col-span-2">
              {reservation.total_price && reservation.currency ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {reservation.currency} {reservation.total_price.toFixed(2)}
                  </p>
                  {reservation.is_paid && (
                    <span className="text-xs text-green-600">Paid</span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-500">-</span>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-2">
              <button
                onClick={() => handleChatClick(reservation.id || '')}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1.5" />
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
