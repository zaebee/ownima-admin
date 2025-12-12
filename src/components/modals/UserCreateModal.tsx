import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { userService } from '../../services/users';
import type { components } from '../../types/api-generated';
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  KeyIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

type CreateUserData = components['schemas']['UserRegister'] & {
  is_active?: boolean;
  is_superuser?: boolean;
};

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    full_name: '',
    role: 'RIDER',
    language: null,
    currency: null,
    is_active: true,
    is_superuser: false,
  });
  const [errors, setErrors] = useState<Partial<CreateUserData>>({});
  const [showPassword, setShowPassword] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetForm();
      onClose();
    },
    onError: () => {
      // Error is handled by the form validation
      // Additional error handling can be added here if needed
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'RIDER',
      language: null,
      currency: null,
      is_active: true,
      is_superuser: false,
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof CreateUserData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserData> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const createData = { ...formData };
    // Remove empty strings for optional fields
    if (!createData.full_name?.trim()) createData.full_name = undefined;

    createUserMutation.mutate(createData);
  };

  const handleClose = () => {
    if (!createUserMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
          <div className="p-2 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-xl">
            <UserPlusIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Add New User</h4>
            <p className="text-sm text-gray-600">Create a new user account with the form below</p>
          </div>
        </div>

        {/* User Info */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter full name"
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
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <KeyIcon className="w-4 h-4 mr-2 text-gray-400" />
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors pr-10 ${
                errors.password
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
        </div>

        {/* Status toggles */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700">Active Status</label>
                <p className="text-xs text-gray-500">User can log in and access the platform</p>
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
                onClick={() => setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))}
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
                <label className="text-sm font-medium text-gray-700">Administrator</label>
                <p className="text-xs text-gray-500">User has full access to admin functions</p>
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
                onClick={() =>
                  setFormData((prev) => ({ ...prev, is_superuser: !prev.is_superuser }))
                }
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
            disabled={createUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createUserMutation.isPending}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
          >
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
};
