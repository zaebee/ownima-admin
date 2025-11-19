import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { adminService } from '../services/admin';
import { getAvatarUrl } from '../config/environment';
import { useToastContext } from '../contexts/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusPieChart } from '../components/ui/StatusPieChart';
import { RatingStars } from '../components/ui/RatingStars';
import { UserProfileHeader } from '../components/ui/UserProfileHeader';
import { RiderEditModal } from '../components/modals/RiderEditModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { UserActivityTimeline } from '../components/UserActivityTimeline';
import {
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  CakeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatDateTime, calculateAge } from '../utils/dateFormatting';

export const RiderDetailPage: React.FC = () => {
  const { riderId } = useParams<{ riderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastContext();
  const [selectedTab, setSelectedTab] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch rider details using dedicated rider endpoint
  const {
    data: rider,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rider', riderId],
    queryFn: () => adminService.getAdminRider(riderId!),
    enabled: !!riderId,
  });

  // Fetch rider metrics (using user metrics endpoint for now)
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['rider-metrics', riderId],
    queryFn: () => adminService.getUserMetrics(riderId!),
    enabled: !!riderId,
  });

  // Delete rider mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteAdminRider(id),
    onSuccess: () => {
      toast.success('Rider deleted', `${rider?.email || 'Rider'} has been successfully deleted.`);
      navigate('/dashboard/users?type=RIDER');
    },
    onError: (error: Error) => {
      toast.error('Delete failed', error.message || 'Failed to delete rider. Please try again.');
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
    if (riderId) {
      deleteMutation.mutate(riderId);
    }
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    // Invalidate queries to refresh rider data after edit
    queryClient.invalidateQueries({ queryKey: ['rider', riderId] });
    queryClient.invalidateQueries({ queryKey: ['rider-metrics', riderId] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !rider) {
    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 rounded-2xl"></div>
          <div className="relative p-8 text-center">
            <h1 className="text-4xl font-bold text-red-800">Rider Not Found</h1>
            <p className="mt-4 text-xl text-red-600">
              Unable to load rider details. The rider may not exist.
            </p>
            <Button onClick={() => navigate('/dashboard/users?type=RIDER')} className="mt-4">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Riders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = ['Overview', 'Bookings', 'Activity'];
  const avatarUrl = getAvatarUrl(rider.avatar);
  const age = calculateAge(rider.date_of_birth);

  // Calculate booking statistics from metrics
  const completionRate = metrics?.total_reservations
    ? ((metrics.completed_reservations || 0) / metrics.total_reservations) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="secondary"
        onClick={() => navigate('/dashboard/users?type=RIDER')}
        className="flex items-center"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Riders
      </Button>

      {/* Rider Profile Header */}
      <UserProfileHeader
        name={rider.full_name || rider.email.split('@')[0]}
        email={rider.email}
        avatarUrl={avatarUrl}
        role="RIDER"
        isActive={rider.is_active}
        isSuperuser={rider.is_superuser}
        isBetaTester={rider.is_beta_tester}
        colorScheme="green"
        additionalInfo={
          <div className="flex items-center space-x-2">
            <RatingStars rating={rider.average_rating ?? undefined} />
            {rider.rating_count > 0 && (
              <span className="text-sm text-gray-500">({rider.rating_count} reviews)</span>
            )}
          </div>
        }
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

      {/* Rider Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="px-8 py-6">
          {/* Rider info grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              <span>Joined {formatDate(rider.created_at)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Last login: {formatDateTime(rider.last_login_at)}</span>
            </div>
            {rider.phone_number && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4" />
                <span>{rider.phone_number}</span>
              </div>
            )}
            {rider.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                <span>{rider.location}</span>
              </div>
            )}
            {rider.date_of_birth && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CakeIcon className="w-4 h-4" />
                <span>
                  {formatDate(rider.date_of_birth)}
                  {age !== null && ` (${age} years old)`}
                </span>
              </div>
            )}
            {rider.currency && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>{rider.currency}</span>
              </div>
            )}
            {rider.language && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <GlobeAltIcon className="w-4 h-4" />
                <span>{rider.language}</span>
              </div>
            )}
          </div>

          {/* Bio section */}
          {rider.bio && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <DocumentTextIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Bio</div>
                  <p className="text-sm text-gray-700">{rider.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Statistics Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Bookings"
          value={metricsLoading ? '-' : metrics?.total_reservations.toString() || '0'}
          icon={ClipboardDocumentListIcon}
          description="All time bookings"
          color="blue"
          size="medium"
        />
        <MetricCard
          title="Completed"
          value={metricsLoading ? '-' : metrics?.completed_reservations?.toString() || '0'}
          icon={CheckCircleIcon}
          description="Successfully completed"
          color="green"
          size="medium"
        />
        <MetricCard
          title="Completion Rate"
          value={metricsLoading ? '-' : `${completionRate.toFixed(0)}%`}
          icon={StarIcon}
          description="Success rate"
          color="purple"
          size="medium"
        />
        <MetricCard
          title="Total Spent"
          value={
            metricsLoading
              ? '-'
              : `${metrics?.total_spent.toFixed(0) || '0'} ${metrics?.wallet_currency || 'EUR'}`
          }
          icon={CurrencyDollarIcon}
          description="Lifetime spending"
          color="yellow"
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
                      <div className="text-sm font-medium text-gray-500">Rider ID</div>
                      <div className="mt-1 text-sm text-gray-900 font-mono">{rider.id}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Email</div>
                      <div className="mt-1 text-sm text-gray-900">{rider.email}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Full Name</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {rider.full_name || 'Not set'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Registration Date</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {formatDate(rider.created_at)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Phone Number</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {rider.phone_number || 'Not set'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {rider.date_of_birth ? (
                          <>
                            {formatDate(rider.date_of_birth)}
                            {age !== null && ` (${age} years)`}
                          </>
                        ) : (
                          'Not set'
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
                          <div className="text-sm font-medium text-purple-700">
                            Average Booking Value
                          </div>
                          <div className="mt-1 text-2xl font-bold text-purple-900">
                            {metrics.total_reservations > 0
                              ? (metrics.total_spent / metrics.total_reservations).toFixed(2)
                              : '0.00'}{' '}
                            {metrics.wallet_currency}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Completion Rate</div>
                          <div className="mt-1 text-sm text-gray-900">
                            {completionRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Tab.Panel>

            {/* Bookings Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                {metrics && metrics.total_reservations > 0 ? (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Booking Status Overview
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <StatusPieChart
                            title="Reservation Status Distribution"
                            data={[
                              {
                                name: 'Pending',
                                value: metrics.pending_reservations || 0,
                                color: '#FCD34D',
                              },
                              {
                                name: 'Confirmed',
                                value: metrics.confirmed_reservations || 0,
                                color: '#60A5FA',
                              },
                              {
                                name: 'Completed',
                                value: metrics.completed_reservations || 0,
                                color: '#34D399',
                              },
                              {
                                name: 'Cancelled',
                                value: metrics.cancelled_reservations || 0,
                                color: '#F87171',
                              },
                            ]}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-yellow-700">
                              Pending Bookings
                            </div>
                            <div className="mt-1 text-3xl font-bold text-yellow-900">
                              {metrics.pending_reservations || 0}
                            </div>
                            <div className="mt-1 text-xs text-yellow-600">
                              Awaiting confirmation
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-blue-700">
                              Confirmed Bookings
                            </div>
                            <div className="mt-1 text-3xl font-bold text-blue-900">
                              {metrics.confirmed_reservations || 0}
                            </div>
                            <div className="mt-1 text-xs text-blue-600">Ready to go</div>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-green-700">
                              Completed Bookings
                            </div>
                            <div className="mt-1 text-3xl font-bold text-green-900">
                              {metrics.completed_reservations || 0}
                            </div>
                            <div className="mt-1 text-xs text-green-600">Successfully finished</div>
                          </div>

                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-red-700">
                              Cancelled Bookings
                            </div>
                            <div className="mt-1 text-3xl font-bold text-red-900">
                              {metrics.cancelled_reservations || 0}
                            </div>
                            <div className="mt-1 text-xs text-red-600">Not completed</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Booking Statistics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                          <div className="text-sm font-medium text-blue-700">Total Bookings</div>
                          <div className="mt-1 text-2xl font-bold text-blue-900">
                            {metrics.total_reservations}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                          <div className="text-sm font-medium text-green-700">Success Rate</div>
                          <div className="mt-1 text-2xl font-bold text-green-900">
                            {completionRate.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                          <div className="text-sm font-medium text-purple-700">
                            Average Booking Value
                          </div>
                          <div className="mt-1 text-2xl font-bold text-purple-900">
                            {(metrics.total_spent / metrics.total_reservations).toFixed(2)}{' '}
                            {metrics.wallet_currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This rider hasn't made any bookings yet.
                    </p>
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* Activity Tab */}
            <Tab.Panel>
              {riderId && <UserActivityTimeline userId={riderId} userType="RIDER" />}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Edit Modal */}
      <RiderEditModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        rider={rider || null}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Rider"
        message={`Are you sure you want to delete ${rider?.email || 'this rider'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
