import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/users';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { UserEditModal } from '../components/modals/UserEditModal';
import { UserCreateModal } from '../components/modals/UserCreateModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import type { User } from '../types';
import {
  MagnifyingGlassIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const queryClient = useQueryClient();
  const toast = useToast();
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, search, activeFilter],
    queryFn: () => userService.getUsers({ page, size: 20, search, is_active: activeFilter }),
  });

  // Debug logging
  console.log('Users data:', data);
  console.log('Users error:', error);
  if (data?.items && data.items.length > 0) {
    console.log('First user created_at:', data.items[0].created_at);
  }

  // User action mutations
  const activateUserMutation = useMutation({
    mutationFn: userService.activateUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User activated', `${user.email} has been activated successfully`);
    },
    onError: () => {
      toast.error('Failed to activate user', 'Please try again later');
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: userService.deactivateUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated', `${user.email} has been deactivated`);
    },
    onError: () => {
      toast.error('Failed to deactivate user', 'Please try again later');
    },
  });

  const toggleSuperuserMutation = useMutation({
    mutationFn: ({ id, is_superuser }: { id: string; is_superuser: boolean }) =>
      userService.toggleSuperuser(id, is_superuser),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      const action = user.is_superuser ? 'promoted to admin' : 'removed from admin';
      toast.success('User role updated', `${user.email} has been ${action}`);
    },
    onError: () => {
      toast.error('Failed to update user role', 'Please try again later');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted', 'User has been permanently removed');
      setShowDeleteDialog(false);
      setUserToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete user', 'Please try again later');
    },
  });

  // Helper functions
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid date';
    }
  };

  const handleUserAction = async (action: 'activate' | 'deactivate' | 'toggleAdmin', userId: string) => {
    const user = data?.items?.find(u => u.id === userId);
    if (!user) return;

    try {
      switch (action) {
        case 'activate':
          await activateUserMutation.mutateAsync(userId);
          break;
        case 'deactivate':
          await deactivateUserMutation.mutateAsync(userId);
          break;
        case 'toggleAdmin':
          await toggleSuperuserMutation.mutateAsync({
            id: userId,
            is_superuser: !user.is_superuser
          });
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };


  const getStatusBadge = (user: User) => {
    if (user.is_superuser) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200/50">
          <ShieldCheckIcon className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }
    
    return user.is_active ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200/50">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200/50">
        <XCircleIcon className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-indigo-100/50 rounded-2xl"></div>
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-xl shadow-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  User Management
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Manage user accounts, permissions, and activity status
              </p>
            </div>
            <div className="hidden sm:block">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-lg"
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-100/50 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant={activeFilter === undefined ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setActiveFilter(undefined)}
              className={activeFilter === undefined 
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            >
              All Users
            </Button>
            <Button
              variant={activeFilter === true ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setActiveFilter(true)}
              className={activeFilter === true 
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Active
            </Button>
            <Button
              variant={activeFilter === false ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setActiveFilter(false)}
              className={activeFilter === false 
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Inactive
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load users. Please try again.
        </div>
      )}

      {/* Enhanced User Cards */}
      <div className="grid gap-6">
        {data?.items?.map((user: User) => (
          <div key={user.id} className="group relative bg-white rounded-2xl border border-gray-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* User Avatar */}
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-lg font-bold text-white">
                        {user.first_name?.[0] || user.email[0]?.toUpperCase()}
                      </span>
                    </div>
                    {user.is_active && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.username || user.email
                        }
                      </h3>
                      {getStatusBadge(user)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="font-medium">{user.email}</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>Joined {formatDate(user.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditUser(user)}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                    title="Edit user"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>

                  {!user.is_active ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUserAction('activate', user.id)}
                      disabled={activateUserMutation.isPending}
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                      title="Activate user"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </Button>
                  ) : !user.is_superuser ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUserAction('deactivate', user.id)}
                      disabled={deactivateUserMutation.isPending}
                      className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                      title="Deactivate user"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </Button>
                  ) : null}

                  {!user.is_superuser ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUserAction('toggleAdmin', user.id)}
                      disabled={toggleSuperuserMutation.isPending}
                      className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200"
                      title="Promote to admin"
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUserAction('toggleAdmin', user.id)}
                      disabled={toggleSuperuserMutation.isPending}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                      title="Remove admin privileges"
                    >
                      <UserIcon className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {!user.is_superuser && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDeleteUser(user)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                      title="Delete user"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}

        {data?.items?.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100/50 shadow-sm">
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {search || activeFilter !== undefined 
                  ? "Try adjusting your search or filter criteria to find users."
                  : "There are no users in the system yet."}
              </p>
              {(!search && activeFilter === undefined) && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700"
                >
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Add First User
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {data && data.pages > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100/50 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Showing</span>
                <span className="font-semibold text-gray-900">
                  {((page - 1) * 20) + 1} - {Math.min(page * 20, data.total)}
                </span>
                <span>of</span>
                <span className="font-semibold text-gray-900">{data.total}</span>
                <span>users</span>
              </div>
              
              <nav className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  ← Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                    const pageNum = i + Math.max(1, page - 2);
                    if (pageNum > data.pages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={pageNum === page 
                          ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.pages}
                  onClick={() => setPage(page + 1)}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Next →
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <UserEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.email}? This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
      />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};