import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../services/admin';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { UserEditModal } from '../components/modals/UserEditModal';
import { UserCreateModal } from '../components/modals/UserCreateModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { AdminUser } from '../types';
import {
  MagnifyingGlassIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  FunnelIcon,
  ChevronDownIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO, isValid } from 'date-fns';
import clsx from 'clsx';

export const UsersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [userTypeFilter, setUserTypeFilter] = useState<'OWNER' | 'RIDER' | undefined>(
    (searchParams.get('type') as 'OWNER' | 'RIDER') || undefined
  );
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    searchParams.get('active') === 'true' ? true : searchParams.get('active') === 'false' ? false : undefined
  );
  const [dateFromFilter, setDateFromFilter] = useState(searchParams.get('date_from') || '');
  const [dateToFilter, setDateToFilter] = useState(searchParams.get('date_to') || '');
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState<number | undefined>(
    searchParams.get('inactive_days') ? parseInt(searchParams.get('inactive_days')!) : undefined
  );


  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (page > 1) params.set('page', page.toString());
    if (userTypeFilter) params.set('type', userTypeFilter);
    if (activeFilter !== undefined) params.set('active', activeFilter.toString());
    if (dateFromFilter) params.set('date_from', dateFromFilter);
    if (dateToFilter) params.set('date_to', dateToFilter);
    if (inactiveDaysFilter) params.set('inactive_days', inactiveDaysFilter.toString());

    setSearchParams(params, { replace: true });
  }, [search, page, userTypeFilter, activeFilter, dateFromFilter, dateToFilter, inactiveDaysFilter, setSearchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', page, search, userTypeFilter, activeFilter, dateFromFilter, dateToFilter, inactiveDaysFilter],
    queryFn: () => adminService.getAdminUsers({
      page,
      size: 20,
      search: search || undefined,
      user_type: userTypeFilter,
      is_active: activeFilter,
      registration_date_from: dateFromFilter || undefined,
      registration_date_to: dateToFilter || undefined,
      inactive_days: inactiveDaysFilter,
    }),
  });

  // Helper functions
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy HH:mm') : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  };

  const getUserTypeBadge = (userType: 'OWNER' | 'RIDER') => {
    return userType === 'OWNER' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <UserIcon className="w-3 h-3 mr-1" />
        Owner
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <UserIcon className="w-3 h-3 mr-1" />
        Rider
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const clearFilters = () => {
    setSearch('');
    setUserTypeFilter(undefined);
    setActiveFilter(undefined);
    setDateFromFilter('');
    setDateToFilter('');
    setInactiveDaysFilter(undefined);
    setPage(1);
  };

  const hasActiveFilters = search || userTypeFilter || activeFilter !== undefined || dateFromFilter || dateToFilter || inactiveDaysFilter;

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-green-100/50 rounded-2xl"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-tr from-blue-500 to-green-600 rounded-2xl shadow-lg">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-green-800 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="mt-2 text-xl text-gray-600">
                  Manage platform users with advanced filtering and analytics
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <UserPlusIcon className="w-5 h-5" />
              <span>Add User</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDownIcon className={clsx('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-gray-50 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-6">
            {/* User Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={userTypeFilter || ''}
                onChange={(e) => setUserTypeFilter(e.target.value as 'OWNER' | 'RIDER' || undefined)}
              >
                <option value="">All Types</option>
                <option value="OWNER">Owners</option>
                <option value="RIDER">Riders</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={activeFilter === undefined ? '' : activeFilter.toString()}
                onChange={(e) => setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Registration Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration From</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>

            {/* Registration Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration To</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>

            {/* Inactive Days Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inactive For (days)</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={inactiveDaysFilter || ''}
                onChange={(e) => setInactiveDaysFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Any Activity</option>
                <option value="7">Inactive &gt; 7 days</option>
                <option value="30">Inactive &gt; 30 days</option>
                <option value="90">Inactive &gt; 90 days</option>
                <option value="365">Inactive &gt; 1 year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results summary */}
      {data && (
        <div className="bg-gray-50 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {data.items.length} of {data.total} users
              {hasActiveFilters && <span className="ml-1 text-primary-600">(filtered)</span>}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Owners: {data.items.filter(u => u.user_type === 'OWNER').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Riders: {data.items.filter(u => u.user_type === 'RIDER').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load users. Please try again.
        </div>
      )}

      {/* Users table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.items.map((user: AdminUser) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username || user.email.split('@')[0]
                          }
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUserTypeBadge(user.user_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{user.email}</div>
                      {user.phone && <div className="text-gray-500">{user.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDate(user.registration_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="font-semibold">{user.booking_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDateTime(user.last_login)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(user.is_active)}
                      {user.is_superuser && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <ShieldCheckIcon className="w-3 h-3 mr-1" />
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {data?.items.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new user.'
              }
            </p>
            {!hasActiveFilters && (
              <div className="mt-6">
                <Button onClick={() => setShowCreateModal(true)}>
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Add User
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= data.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{data.pages}</span> ({data.total} total users)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= data.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <UserCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedUser && (
        <UserEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {showDeleteDialog && userToDelete && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setUserToDelete(null);
          }}
          onConfirm={() => {
            // Delete user logic would go here
            setShowDeleteDialog(false);
            setUserToDelete(null);
          }}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete.email}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
};