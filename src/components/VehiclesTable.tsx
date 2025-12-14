import React from 'react';
import type { components } from '../types/api-generated';
import {
  VehicleStatusLabels,
  VehicleStatusColors,
  VehicleTypeLabels,
  type VehicleSort,
  type SortDirection,
} from '../types';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  TruckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { getVehicleImageUrl } from '../config/environment';

interface VehiclesTableProps {
  vehicles: components['schemas']['Vehicle-Output'][];
  isLoading: boolean;
  sortField: VehicleSort['field'];
  sortDirection: SortDirection;
  onSort: (field: VehicleSort['field']) => void;
}

export const VehiclesTable: React.FC<VehiclesTableProps> = ({
  vehicles,
  isLoading,
  sortField,
  sortDirection,
  onSort,
}) => {
  const getStatusBadgeColor = (status: number) => {
    const color = VehicleStatusColors[status] || 'gray';
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

  const SortIcon: React.FC<{ field: VehicleSort['field'] }> = ({ field }) => {
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
    field: VehicleSort['field'];
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

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <TruckIcon className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No vehicles found</h3>
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
        <div className="col-span-4">
          <SortableHeader field="name" label="Name" />
        </div>
        <div className="col-span-2">
          <SortableHeader field="status" label="Status" />
        </div>
        <div className="col-span-2">
          <span className="font-semibold text-gray-700">Type</span>
        </div>
        <div className="col-span-2">
          <SortableHeader field="created_at" label="Created" />
        </div>
        <div className="col-span-2">
          <span className="font-semibold text-gray-700">Actions</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
          >
            {/* Name */}
            <div className="col-span-4">
              <div className="flex items-center space-x-3">
                {vehicle.picture?.cover && (
                  <img
                    src={getVehicleImageUrl(vehicle.picture.cover)}
                    alt={vehicle.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{vehicle.name}</p>
                  {vehicle.price && (
                    <p className="text-sm text-gray-600">
                      {vehicle.currency} {vehicle.price.toFixed(2)}/day
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                  vehicle.status ?? 0
                )}`}
              >
                {VehicleStatusLabels[vehicle.status ?? 0] || 'Unknown'}
              </span>
            </div>

            {/* Type */}
            <div className="col-span-2">
              <span className="text-sm text-gray-700">
                {VehicleTypeLabels[vehicle.type ?? 0] || 'Unknown'}
              </span>
            </div>

            {/* Created Date */}
            <div className="col-span-2">
              <span className="text-sm text-gray-600">
                {vehicle.created_at ? formatDate(vehicle.created_at) : '-'}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-2">
              <button
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                onClick={() => {
                  // Placeholder for future vehicle detail view
                }}
              >
                <EyeIcon className="w-4 h-4 mr-1.5" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
