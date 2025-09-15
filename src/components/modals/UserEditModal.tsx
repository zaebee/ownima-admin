import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { userService, type UpdateUserData } from '../../services/users';
import type { User } from '../../types';
import {
  UserIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateUserData>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    is_active: true,
    is_superuser: false,
  });
  const [errors, setErrors] = useState<Partial<UpdateUserData>>({});

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (error: unknown) => {
      console.error('Failed to update user:', error);
      // Handle validation errors if needed
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        email: user.email,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active,
        is_superuser: user.is_superuser,
      });
      setErrors({});
    }
  }, [user, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof UpdateUserData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateUserData> = {};
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    const updateData = { ...formData };
    // Remove empty strings for optional fields
    if (!updateData.username?.trim()) updateData.username = undefined;
    if (!updateData.first_name?.trim()) updateData.first_name = undefined;
    if (!updateData.last_name?.trim()) updateData.last_name = undefined;

    updateUserMutation.mutate({ id: user.id, data: updateData });
  };

  const handleClose = () => {
    if (!updateUserMutation.isPending) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit User"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <IdentificationIcon className="w-4 h-4 mr-2 text-gray-400" />
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors ${
              errors.email 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-primary-500'
            }`}
            placeholder="Enter email address"
            required
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Status toggles */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Active Status
                </label>
                <p className="text-xs text-gray-500">
                  User can log in and access the platform
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="sr-only"
              />
              <label
                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  formData.is_active ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-1 ${
                    formData.is_active ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Administrator
                </label>
                <p className="text-xs text-gray-500">
                  User has full access to admin functions
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                name="is_superuser"
                checked={formData.is_superuser}
                onChange={handleInputChange}
                className="sr-only"
              />
              <label
                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  formData.is_superuser ? 'bg-purple-600' : 'bg-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, is_superuser: !prev.is_superuser }))}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-1 ${
                    formData.is_superuser ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={updateUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateUserMutation.isPending}
            className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};