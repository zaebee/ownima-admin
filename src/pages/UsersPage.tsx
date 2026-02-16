import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Simple debounce function with cancel method
const debounce = <T extends (...args: unknown[]) => void>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const debouncedFunc = (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  debouncedFunc.cancel = () => {
    clearTimeout(timeoutId);
  };
  return debouncedFunc;
};
import { adminService } from '../services/admin';
import { getAvatarUrl } from '../config/environment';
import { useToastContext } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { UserEditModal } from '../components/modals/UserEditModal';
import { RiderEditModal } from '../components/modals/RiderEditModal';
import { UserCreateModal } from '../components/modals/UserCreateModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { SkeletonTable, SkeletonHeader } from '../components/ui/SkeletonLoader';
import { ErrorState, EmptySearchResults } from '../components/ui/EmptyState';
import type { AdminUser, PaginatedResponse } from '../types';
import type { components } from '../types/api-generated';
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
  PhoneIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatDateTime } from '../utils/dateFormatting';
import { DEFAULT_PAGE_SIZE } from '../constants/validation';
import {
  convertToCSV,
  downloadCSV,
  formatDateForCSV,
  formatDateTimeForCSV,
} from '../utils/csvExport';
import clsx from 'clsx';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper function to navigate to user/rider detail page
  const navigateToUserDetail = (userId: string, userType?: 'OWNER' | 'RIDER') => {
    if (userType === 'RIDER') {
      navigate(`/dashboard/riders/${userId}`);
    } else {
      navigate(`/dashboard/users/${userId}`);
    }
  };
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [userTypeFilter, setUserTypeFilter] = useState<'OWNER' | 'RIDER' | undefined>(
    (searchParams.get('type')?.toUpperCase() as 'OWNER' | 'RIDER') || undefined
  );
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    searchParams.get('active') === 'true'
      ? true
      : searchParams.get('active') === 'false'
        ? false
        : undefined
  );
  const [dateFromFilter, setDateFromFilter] = useState(searchParams.get('date_from') || '');
  const [dateToFilter, setDateToFilter] = useState(searchParams.get('date_to') || '');
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState<number | undefined>(
    searchParams.get('inactive_days') ? parseInt(searchParams.get('inactive_days')!) : undefined
  );

  // Sort state
  type SortField =
    | 'name'
    | 'email'
    | 'created_at'
    | 'login_count'
    | 'last_login'
    | 'total_reservations';
  type SortDirection = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField>(
    (searchParams.get('sort') as SortField) || 'created_at'
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (searchParams.get('direction') as SortDirection) || 'desc'
  );

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Debounced search to prevent API calls on every keystroke
  const debouncedSearchUpdate = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const searchValue = args[0] as string;
        setDebouncedSearch(searchValue);
        setPage(1); // Reset to first page when search changes
      }, 500),
    []
  );

  useEffect(() => {
    debouncedSearchUpdate(search);
    return () => {
      debouncedSearchUpdate.cancel();
    };
  }, [search, debouncedSearchUpdate]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (page > 1) params.set('page', page.toString());
    if (userTypeFilter) params.set('type', userTypeFilter);
    if (activeFilter !== undefined) params.set('active', activeFilter.toString());
    if (dateFromFilter) params.set('date_from', dateFromFilter);
    if (dateToFilter) params.set('date_to', dateToFilter);
    if (inactiveDaysFilter) params.set('inactive_days', inactiveDaysFilter.toString());
    if (sortField !== 'created_at') params.set('sort', sortField);
    if (sortDirection !== 'desc') params.set('direction', sortDirection);

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    page,
    userTypeFilter,
    activeFilter,
    dateFromFilter,
    dateToFilter,
    inactiveDaysFilter,
    sortField,
    sortDirection,
    setSearchParams,
  ]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'admin-users',
      page,
      debouncedSearch,
      userTypeFilter,
      activeFilter,
      dateFromFilter,
      dateToFilter,
      inactiveDaysFilter,
    ],
    queryFn: async () => {
      const params = {
        skip: (page - 1) * DEFAULT_PAGE_SIZE,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
        registration_from: dateFromFilter || undefined,
        registration_to: dateToFilter || undefined,
        inactive_days: inactiveDaysFilter,
      };

      if (userTypeFilter === 'RIDER') {
        return await adminService.getAdminRiders(params);
      }

      return await adminService.getAdminUsers({
        ...params,
        user_type: userTypeFilter,
      });
    },
  });

  // Delete user/rider mutation
  const deleteMutation = useMutation({
    mutationFn: ({ userId, userType }: { userId: string; userType?: 'OWNER' | 'RIDER' }) => {
      if (userType === 'RIDER') {
        return adminService.deleteAdminRider(userId);
      }
      return adminService.deleteUser(userId);
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
      setShowDeleteDialog(false);
      const deletedUserEmail = userToDelete?.email || 'User';
      const entityType = userToDelete?.user_type === 'RIDER' ? 'Rider' : 'User';
      setUserToDelete(null);
      toast.success(`${entityType} deleted`, `${deletedUserEmail} has been successfully deleted.`);
    },
    onError: (error: Error) => {
      toast.error('Delete failed', error.message || 'Failed to delete. Please try again.');
    },
  });

  // Bulk activate mutation
  const bulkActivateMutation = useMutation({
    mutationFn: (userIds: string[]) => adminService.bulkActivateUsers(userIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
      setSelectedUserIds(new Set());

      if (result.errors.length > 0) {
        toast.warning(
          `Activated ${result.updated} users`,
          `${result.errors.length} failed: ${result.errors[0]}`
        );
      } else {
        toast.success('Users activated', `Successfully activated ${result.updated} users.`);
      }
    },
    onError: (error: Error) => {
      toast.error('Bulk activate failed', error.message || 'Failed to activate users.');
    },
  });

  // Bulk deactivate mutation
  const bulkDeactivateMutation = useMutation({
    mutationFn: (userIds: string[]) => adminService.bulkDeactivateUsers(userIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
      setSelectedUserIds(new Set());

      if (result.errors.length > 0) {
        toast.warning(
          `Deactivated ${result.updated} users`,
          `${result.errors.length} failed: ${result.errors[0]}`
        );
      } else {
        toast.success('Users deactivated', `Successfully deactivated ${result.updated} users.`);
      }
    },
    onError: (error: Error) => {
      toast.error('Bulk deactivate failed', error.message || 'Failed to deactivate users.');
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (userIds: string[]) => adminService.bulkDeleteUsers(userIds, userTypeFilter),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
      setSelectedUserIds(new Set());
      setShowBulkDeleteDialog(false);

      if (result.errors.length > 0) {
        toast.warning(
          `Deleted ${result.deleted} users`,
          `${result.errors.length} failed: ${result.errors[0]}`
        );
      } else {
        toast.success('Users deleted', `Successfully deleted ${result.deleted} users.`);
      }
    },
    onError: (error: Error) => {
      toast.error('Bulk delete failed', error.message || 'Failed to delete users.');
    },
  });

  // Normalize data format - handle the actual API response structure
  const normalizedData = React.useMemo(() => {
    if (!data) return null;

    // API returns {data: Array, count: number} structure
    if ('data' in data && Array.isArray(data.data)) {
      // Map API fields to UI-compatible fields
      const mappedUsers = (data.data as unknown[]).map((user: unknown) => {
        const apiUser = user as Record<string, unknown>;
        return {
          ...apiUser,
          // Riders from /admin/riders don't have a role field — always tag as RIDER
          user_type: userTypeFilter === 'RIDER' ? 'RIDER' : apiUser.role || 'OWNER',
          phone: apiUser.phone_number, // Map phone_number to phone
          login_count: apiUser.login_count || 0, // Use login_count as booking_count for now
          last_login: apiUser.last_login_at, // Map last_login_at to last_login
          registration_date: apiUser.created_at, // Map created_at to registration_date
        };
      });

      // Apply sorting
      const sortedUsers = [...mappedUsers].sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) => {
          let aValue: string | number;
          let bValue: string | number;

          switch (sortField) {
            case 'name':
              aValue = ((a.full_name as string) || (a.email as string)).toLowerCase();
              bValue = ((b.full_name as string) || (b.email as string)).toLowerCase();
              break;
            case 'email':
              aValue = (a.email as string).toLowerCase();
              bValue = (b.email as string).toLowerCase();
              break;
            case 'created_at':
              aValue = new Date(a.created_at as string).getTime();
              bValue = new Date(b.created_at as string).getTime();
              break;
            case 'login_count':
              aValue = (a.login_count as number) || 0;
              bValue = (b.login_count as number) || 0;
              break;
            case 'last_login':
              aValue = a.last_login_at ? new Date(a.last_login_at as string).getTime() : 0;
              bValue = b.last_login_at ? new Date(b.last_login_at as string).getTime() : 0;
              break;
            case 'total_reservations':
              aValue = (a.total_reservations as number) || 0;
              bValue = (b.total_reservations as number) || 0;
              break;
            default:
              return 0;
          }

          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        }
      );

      return {
        items: sortedUsers as AdminUser[],
        total: data.count || data.data.length,
        page: page,
        size: DEFAULT_PAGE_SIZE,
        pages: Math.ceil((data.count || data.data.length) / DEFAULT_PAGE_SIZE),
      };
    }

    // If data is an array, create a mock paginated structure
    if (Array.isArray(data)) {
      return {
        items: data as AdminUser[],
        total: data.length,
        page: page,
        size: DEFAULT_PAGE_SIZE,
        pages: Math.ceil(data.length / DEFAULT_PAGE_SIZE),
      };
    }

    // If data has items property, use as-is
    return data as PaginatedResponse<AdminUser>;
  }, [data, page, userTypeFilter, sortField, sortDirection]);

  // Selection handlers
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleAllUsers = () => {
    if (!normalizedData?.items) return;

    if (selectedUserIds.size === normalizedData.items.length) {
      // Deselect all
      setSelectedUserIds(new Set());
    } else {
      // Select all visible users
      const allIds = new Set(normalizedData.items.map((u) => u.id));
      setSelectedUserIds(allIds);
    }
  };

  const clearSelection = () => {
    setSelectedUserIds(new Set());
  };

  // Bulk action handlers
  const handleBulkActivate = () => {
    if (selectedUserIds.size === 0) return;
    bulkActivateMutation.mutate(Array.from(selectedUserIds));
  };

  const handleBulkDeactivate = () => {
    if (selectedUserIds.size === 0) return;
    bulkDeactivateMutation.mutate(Array.from(selectedUserIds));
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.size === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedUserIds));
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (!normalizedData?.items || normalizedData.items.length === 0) {
      toast.warning('No data to export', 'There are no users to export.');
      return;
    }

    // Map users to CSV-friendly format
    const csvData = normalizedData.items.map((user) => ({
      Name: user.full_name || user.email.split('@')[0],
      Email: user.email,
      Phone: user.phone || '',
      Role: user.user_type || '',
      Status: user.is_active ? 'Active' : 'Inactive',
      'Is Admin': user.is_superuser ? 'Yes' : 'No',
      'Is Beta Tester': user.is_beta_tester ? 'Yes' : 'No',
      'Join Date': formatDateForCSV(user.registration_date),
      'Last Login': formatDateTimeForCSV(user.last_login),
      'Login Count': user.login_count || 0,
    }));

    // Generate CSV
    const csv = convertToCSV(csvData);

    // Generate filename with current date
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filterSuffix = userTypeFilter ? `-${userTypeFilter.toLowerCase()}` : '';
    const filename = `users-export${filterSuffix}-${timestamp}`;

    // Trigger download
    downloadCSV(csv, filename);

    toast.success('Export successful', `Exported ${normalizedData.items.length} users to CSV.`);
  };

  // Helper functions
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
    setDebouncedSearch('');
    setUserTypeFilter(undefined);
    setActiveFilter(undefined);
    setDateFromFilter('');
    setDateToFilter('');
    setInactiveDaysFilter(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch ||
    userTypeFilter ||
    activeFilter !== undefined ||
    dateFromFilter ||
    dateToFilter ||
    inactiveDaysFilter;

  if (isLoading && page === 1) {
    return (
      <div className="space-y-8">
        <SkeletonHeader />
        <SkeletonTable rows={10} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <SkeletonHeader />
        <ErrorState
          onRetry={() => window.location.reload()}
          message="Failed to load users. Please try again."
        />
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
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={handleExportCSV}
                className="flex items-center space-x-2"
                disabled={!normalizedData?.items || normalizedData.items.length === 0}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Export CSV</span>
              </Button>
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
      </div>

      {/* Tabs for filtering */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => {
              setUserTypeFilter(undefined);
              setPage(1);
            }}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              !userTypeFilter
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            All Users
            {normalizedData && !userTypeFilter && (
              <span className="bg-gray-200 text-gray-600 ml-2 py-0.5 px-2 rounded-full text-xs">
                {normalizedData.total}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setUserTypeFilter('OWNER');
              setPage(1);
            }}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              userTypeFilter === 'OWNER'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Owners
            {normalizedData && userTypeFilter === 'OWNER' && (
              <span className="bg-blue-100 text-blue-600 ml-2 py-0.5 px-2 rounded-full text-xs">
                {normalizedData.total}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setUserTypeFilter('RIDER');
              setPage(1);
            }}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              userTypeFilter === 'RIDER'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Riders
            {normalizedData && userTypeFilter === 'RIDER' && (
              <span className="bg-green-100 text-green-600 ml-2 py-0.5 px-2 rounded-full text-xs">
                {normalizedData.total}
              </span>
            )}
          </button>
        </nav>
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
              <ChevronDownIcon
                className={clsx('w-4 h-4 transition-transform', showFilters && 'rotate-180')}
              />
            </Button>
          </div>
        </div>

        {/* Search bar and Sort */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
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

          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-gray-50 focus:bg-white"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <option value="created_at">Join Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="login_count">Login Count</option>
              <option value="last_login">Last Login</option>
              <option value="total_reservations">Reservations</option>
            </select>

            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-all text-sm bg-gray-50 hover:bg-white flex items-center gap-2"
              title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortDirection === 'asc' ? (
                <ChevronDownIcon className="w-5 h-5 rotate-180" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={activeFilter === undefined ? '' : activeFilter.toString()}
                onChange={(e) =>
                  setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')
                }
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Registration Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration From
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>

            {/* Registration Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration To
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>

            {/* Inactive Days Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inactive For (days)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={inactiveDaysFilter || ''}
                onChange={(e) =>
                  setInactiveDaysFilter(e.target.value ? parseInt(e.target.value) : undefined)
                }
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
              Showing {normalizedData?.items?.length || 0} of {normalizedData?.total || 0} users
              {hasActiveFilters && <span className="ml-1 text-primary-600">(filtered)</span>}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>
                  Owners:{' '}
                  {normalizedData?.items?.filter((u) => u.user_type === 'OWNER').length || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>
                  Riders:{' '}
                  {normalizedData?.items?.filter((u) => u.user_type === 'RIDER').length || 0}
                </span>
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

      {/* Users table - Redesigned for better space usage */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={
                      normalizedData?.items &&
                      selectedUserIds.size === normalizedData.items.length &&
                      normalizedData.items.length > 0
                    }
                    onChange={toggleAllUsers}
                    disabled={!normalizedData?.items || normalizedData.items.length === 0}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {normalizedData?.items?.map((user: AdminUser) => {
                const avatarUrl = getAvatarUrl(user.avatar);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    {/* Checkbox Column */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    {/* User Column - Avatar, Name, Email */}
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {avatarUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                              src={avatarUrl}
                              alt={user.full_name || user.email}
                              onClick={() => navigateToUserDetail(user.id, user.user_type)}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all ${avatarUrl ? 'hidden' : 'flex'}`}
                            style={{ display: avatarUrl ? 'none' : 'flex' }}
                            onClick={() => navigateToUserDetail(user.id, user.user_type)}
                          >
                            <span className="text-white font-semibold text-sm">
                              {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600 transition-colors truncate"
                            onClick={() => navigateToUserDetail(user.id, user.user_type)}
                          >
                            {user.full_name || user.email.split('@')[0]}
                          </div>
                          <div
                            className="text-xs text-gray-500 cursor-pointer hover:text-primary-500 transition-colors truncate"
                            onClick={() => navigateToUserDetail(user.id, user.user_type)}
                          >
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-xs text-gray-400 flex items-center mt-0.5">
                              <PhoneIcon className="w-3 h-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role & Status Column - Type, Active Status, Admin Badge */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col space-y-1.5">
                        {user.user_type && getUserTypeBadge(user.user_type)}
                        {getStatusBadge(user.is_active)}
                        {user.is_superuser && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                            <ShieldCheckIcon className="w-3 h-3 mr-1" />
                            Admin
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Activity Column - Registration, Last Login, Bookings */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <CalendarIcon className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                          <span className="text-gray-500">Joined:</span>
                          <span className="ml-1 font-medium">
                            {user.registration_date ? formatDate(user.registration_date) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <ArrowRightOnRectangleIcon className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                          <span className="text-gray-500">Last:</span>
                          <span className="ml-1 font-medium">
                            {formatDateTime(user.last_login)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <ClipboardDocumentListIcon className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                          <span className="text-gray-500">Logins:</span>
                          <span className="ml-1 font-semibold text-primary-600">
                            {user.login_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <BookOpenIcon className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                          <span className="text-gray-500">Reserv.:</span>
                          <span className="ml-1 font-semibold text-primary-600">
                            {user.total_reservations ?? 0}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Actions Column - View, Edit, Delete */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigateToUserDetail(user.id, user.user_type)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <UserIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteDialog(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {(!normalizedData?.items || normalizedData.items.length === 0) &&
          !isLoading &&
          (hasActiveFilters ? (
            <EmptySearchResults
              onReset={() => {
                setSearch('');
                setUserTypeFilter(undefined);
                setActiveFilter(undefined);
                setDateFromFilter('');
                setDateToFilter('');
                setInactiveDaysFilter(undefined);
                setSearchParams({});
              }}
            />
          ) : (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateModal(true)}>
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          ))}

        {/* Pagination */}
        {normalizedData && normalizedData.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= normalizedData.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{normalizedData.pages}</span> (
                  {normalizedData.total} total users)
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
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
                    disabled={page >= normalizedData.pages}
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
        <UserCreateModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}

      {showEditModal && selectedUser && (
        <>
          {selectedUser.user_type === 'RIDER' ? (
            <RiderEditModal
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setSelectedUser(null);
                queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
              }}
              rider={selectedUser as unknown as components['schemas']['RiderUserAdmin']}
            />
          ) : (
            <UserEditModal
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setSelectedUser(null);
                queryClient.invalidateQueries({ queryKey: ['admin-users'] });
              }}
              user={selectedUser}
            />
          )}
        </>
      )}

      {showDeleteDialog && userToDelete && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setUserToDelete(null);
          }}
          onConfirm={() => {
            deleteMutation.mutate({
              userId: userToDelete.id,
              userType: userToDelete.user_type,
            });
          }}
          title={`Delete ${userToDelete.user_type === 'RIDER' ? 'Rider' : 'User'}`}
          message={`Are you sure you want to delete ${userToDelete.email}? This action cannot be undone.`}
          confirmText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          variant="danger"
        />
      )}

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Users"
        message={`Are you sure you want to delete ${selectedUserIds.size} selected user${selectedUserIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText={
          bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedUserIds.size}`
        }
        cancelText="Cancel"
        variant="danger"
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedUserIds.size}
        totalCount={normalizedData?.items?.length}
        onSelectAll={toggleAllUsers}
        onClearSelection={clearSelection}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        isLoading={
          bulkActivateMutation.isPending ||
          bulkDeactivateMutation.isPending ||
          bulkDeleteMutation.isPending
        }
      />
    </div>
  );
};
