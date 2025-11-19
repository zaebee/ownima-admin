import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { userService } from '../services/users';
import { adminService } from '../services/admin';
import { getAvatarUrl } from '../config/environment';
import { useToastContext } from '../contexts/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { UserProfileHeader } from '../components/ui/UserProfileHeader';
// ActivityTimeline removed - now available on dedicated Activity page
import { UserActivityTimeline } from '../components/UserActivityTimeline';
import { UserEditModal } from '../components/modals/UserEditModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatDateTime } from '../utils/dateFormatting';

export const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastContext();
  const [selectedTab, setSelectedTab] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch user details
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
  });

  // Fetch user metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['user-metrics', userId],
    queryFn: () => adminService.getUserMetrics(userId!),
    enabled: !!userId,
  });

  // Activity feed moved to dedicated ActivityPage
  // Per-user activity filtering will be added in a future update

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted', `${user?.email || 'User'} has been successfully deleted.`);
      navigate('/dashboard/users');
    },
    onError: (error: Error) => {
      toast.error('Delete failed', error.message || 'Failed to delete user. Please try again.');
      setShowDeleteDialog(false);
    },
  });

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (userId) {
      deleteMutation.mutate(userId);
    }
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    // Invalidate queries to refresh user data after edit
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 rounded-2xl"></div>
          <div className="relative p-8 text-center">
            <h1 className="text-4xl font-bold text-red-800">User Not Found</h1>
            <p className="mt-4 text-xl text-red-600">
              Unable to load user details. The user may not exist.
            </p>
            <Button onClick={() => navigate('/dashboard/users')} className="mt-4">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = ['Overview', 'Vehicles', 'Reservations'];
  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="secondary"
        onClick={() => navigate('/dashboard/users')}
        className="flex items-center"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      {/* User Profile Header */}
      <UserProfileHeader
        name={user.full_name || user.email.split('@')[0]}
        email={user.email}
        avatarUrl={avatarUrl}
        role={user.role}
        isActive={user.is_active}
        isSuperuser={user.is_superuser}
        isBetaTester={user.is_beta_tester}
        colorScheme="blue"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleEditClick}>
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={handleDeleteClick}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        }
      />

      {/* User Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="px-8 py-6">
          {/* User info grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Last login: {formatDateTime(user.last_login_at)}</span>
                </div>
                {user.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.currency && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>{user.currency}</span>
                  </div>
                )}
                {user.language && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>{user.language}</span>
                  </div>
                )}
                {user.phone_number && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Vehicles"
          value={metricsLoading ? '-' : metrics?.total_vehicles.toString() || '0'}
          icon={TruckIcon}
          description="Total vehicles owned"
          color="blue"
          size="medium"
        />
        <MetricCard
          title="Reservations"
          value={metricsLoading ? '-' : metrics?.total_reservations.toString() || '0'}
          icon={ClipboardDocumentListIcon}
          description="Total bookings"
          color="green"
          size="medium"
        />
        <MetricCard
          title="Login Count"
          value={
            metricsLoading
              ? '-'
              : metrics?.login_count.toString() || user.login_count?.toString() || '0'
          }
          icon={ArrowRightOnRectangleIcon}
          description="Total logins"
          color="purple"
          size="medium"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 border-b border-gray-200 px-6">
            {tabs.map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  clsx(
                    'px-4 py-3 text-sm font-medium leading-5 transition-colors',
                    'focus:outline-none',
                    selected
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="p-6">
            {/* Overview Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">User ID</div>
                      <div className="mt-1 text-sm text-gray-900 font-mono">{user.id}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Email</div>
                      <div className="mt-1 text-sm text-gray-900">{user.email}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Full Name</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {user.full_name || 'Not set'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Registration Date</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Last Updated</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {formatDateTime(user.updated_at)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Account Status</div>
                      <div className="mt-1">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial & Activity Metrics */}
                {metrics && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Financial Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                          <div className="text-sm font-medium text-blue-700">Wallet Balance</div>
                          <div className="mt-1 text-2xl font-bold text-blue-900">
                            {metrics.wallet_balance.toFixed(2)} {metrics.wallet_currency}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                          <div className="text-sm font-medium text-green-700">Total Spent</div>
                          <div className="mt-1 text-2xl font-bold text-green-900">
                            {metrics.total_spent.toFixed(2)} {metrics.wallet_currency}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                          <div className="text-sm font-medium text-purple-700">Total Earned</div>
                          <div className="mt-1 text-2xl font-bold text-purple-900">
                            {metrics.total_earned.toFixed(2)} {metrics.wallet_currency}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Account Age</div>
                          <div className="mt-1 text-sm text-gray-900">
                            {metrics.account_age_days} days
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Last Login</div>
                          <div className="mt-1 text-sm text-gray-900">
                            {metrics.days_since_last_login !== null
                              ? `${metrics.days_since_last_login} days ago`
                              : 'Never'}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Total Logins</div>
                          <div className="mt-1 text-sm text-gray-900">{metrics.login_count}</div>
                        </div>
                      </div>
                    </div>

                    {user.role === 'OWNER' && metrics.total_vehicles > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Vehicle Status Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-gray-500">Draft</div>
                            <div className="mt-1 text-2xl font-bold text-gray-900">
                              {metrics.draft_vehicles}
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-green-700">Published</div>
                            <div className="mt-1 text-2xl font-bold text-green-900">
                              {metrics.published_vehicles}
                            </div>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-yellow-700">Archived</div>
                            <div className="mt-1 text-2xl font-bold text-yellow-900">
                              {metrics.archived_vehicles}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-blue-700">Total</div>
                            <div className="mt-1 text-2xl font-bold text-blue-900">
                              {metrics.total_vehicles}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {metrics.total_reservations > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Reservation Status Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-yellow-700">Pending</div>
                            <div className="mt-1 text-2xl font-bold text-yellow-900">
                              {metrics.pending_reservations}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-blue-700">Confirmed</div>
                            <div className="mt-1 text-2xl font-bold text-blue-900">
                              {metrics.confirmed_reservations}
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-green-700">Completed</div>
                            <div className="mt-1 text-2xl font-bold text-green-900">
                              {metrics.completed_reservations}
                            </div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-red-700">Cancelled</div>
                            <div className="mt-1 text-2xl font-bold text-red-900">
                              {metrics.cancelled_reservations}
                            </div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-purple-700">Total</div>
                            <div className="mt-1 text-2xl font-bold text-purple-900">
                              {metrics.total_reservations}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    {userId && <UserActivityTimeline userId={userId} userType="OWNER" />}
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Vehicles Tab */}
            <Tab.Panel>
              <div className="text-center py-12">
                <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user.role === 'OWNER'
                    ? 'This owner has not created any vehicles yet.'
                    : 'Only owners can have vehicles.'}
                </p>
              </div>
            </Tab.Panel>

            {/* Reservations Tab */}
            <Tab.Panel>
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This user has not made any reservations yet.
                </p>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Edit Modal */}
      <UserEditModal isOpen={showEditModal} onClose={handleEditModalClose} user={user || null} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${user?.email || 'this user'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
