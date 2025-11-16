import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastContext } from '../../contexts/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { adminService } from '../../services/admin';
import {
  MAX_BIO_LENGTH,
  // EMAIL_REGEX,
  // PHONE_REGEX,
  // MIN_VALID_YEAR,
  isValidEmail,
  isValidPhone,
  isNotFutureDate,
  isRealisticDate,
} from '../../constants/validation';
import type { components } from '../../types/api-generated';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CakeIcon,
} from '@heroicons/react/24/outline';

type RiderUserAdmin = components['schemas']['RiderUserAdmin'];
type UpdateRiderData = Partial<RiderUserAdmin>;

interface RiderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  rider: RiderUserAdmin | null;
}

export const RiderEditModal: React.FC<RiderEditModalProps> = ({ isOpen, onClose, rider }) => {
  const queryClient = useQueryClient();
  const toast = useToastContext();
  const [formData, setFormData] = useState<UpdateRiderData>({
    email: '',
    full_name: '',
    phone_number: '',
    bio: '',
    date_of_birth: '',
    is_active: true,
    is_superuser: false,
    is_beta_tester: false,
    currency: null,
    language: null,
    location: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateRiderData, string>>>({});

  const updateRiderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRiderData }) =>
      adminService.updateAdminRider(id, data),
    onSuccess: (updatedRider) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['rider', updatedRider.id] });
      onClose();
      toast.success('Rider updated', `${updatedRider.email} has been successfully updated.`);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update rider. Please try again.';
      toast.error('Update failed', errorMessage);
    },
  });

  useEffect(() => {
    if (rider && isOpen) {
      setFormData({
        email: rider.email,
        full_name: rider.full_name || '',
        phone_number: rider.phone_number || '',
        bio: rider.bio || '',
        date_of_birth: rider.date_of_birth || '',
        is_active: rider.is_active,
        is_superuser: rider.is_superuser,
        is_beta_tester: rider.is_beta_tester,
        currency: rider.currency,
        language: rider.language,
        location: rider.location || '',
      });
      setErrors({});
    }
  }, [rider, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value || null,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof UpdateRiderData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateRiderData, string>> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Validate phone number if provided
    if (formData.phone_number && !isValidPhone(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    // Validate date of birth if provided
    if (formData.date_of_birth) {
      const date = new Date(formData.date_of_birth);
      if (isNaN(date.getTime())) {
        newErrors.date_of_birth = 'Please enter a valid date';
      } else if (!isNotFutureDate(formData.date_of_birth)) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      } else if (!isRealisticDate(formData.date_of_birth)) {
        newErrors.date_of_birth = 'Please enter a realistic date of birth';
      }
    }

    // Validate bio length
    if (formData.bio && formData.bio.length > MAX_BIO_LENGTH) {
      newErrors.bio = `Bio cannot exceed ${MAX_BIO_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rider || !validateForm()) return;

    const updateData: UpdateRiderData = { ...formData };
    // Remove empty strings for optional fields
    if (!updateData.full_name?.trim()) updateData.full_name = null;
    if (!updateData.phone_number?.trim()) updateData.phone_number = null;
    if (!updateData.bio?.trim()) updateData.bio = null;
    if (!updateData.date_of_birth?.trim()) updateData.date_of_birth = null;
    if (!updateData.location?.trim()) updateData.location = null;

    updateRiderMutation.mutate({ id: rider.id, data: updateData });
  };

  const handleClose = () => {
    if (!updateRiderMutation.isPending) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Rider" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
            Personal Information
          </h3>

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
              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors ${
                errors.phone_number
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              placeholder="+1 234 567 8900"
            />
            {errors.phone_number && (
              <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <CakeIcon className="w-4 h-4 mr-2 text-gray-400" />
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ''}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors ${
                errors.date_of_birth
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-primary-500'
              }`}
            />
            {errors.date_of_birth && (
              <p className="text-red-600 text-sm mt-1">{errors.date_of_birth}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
              Bio
              <span className="ml-auto text-xs text-gray-500">
                {formData.bio?.length || 0}/{MAX_BIO_LENGTH}
              </span>
            </label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              rows={3}
              maxLength={MAX_BIO_LENGTH}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors resize-none ${
                errors.bio
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              placeholder="Tell us about yourself..."
            />
            {errors.bio && <p className="text-red-600 text-sm mt-1">{errors.bio}</p>}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Preferences</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Currency</label>
              <select
                name="currency"
                value={formData.currency || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Not set</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
              <select
                name="language"
                value={formData.language || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Not set</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* Status toggles */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Account Settings</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-3 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700">Active Status</label>
                <p className="text-xs text-gray-500">Rider can log in and make bookings</p>
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
                  formData.is_active ? 'bg-green-600' : 'bg-gray-300'
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
                <p className="text-xs text-gray-500">Rider has full access to admin functions</p>
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                <span className="text-yellow-500 text-sm font-bold">β</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Beta Tester</label>
                <p className="text-xs text-gray-500">Access to beta features and early releases</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                name="is_beta_tester"
                checked={formData.is_beta_tester}
                onChange={handleInputChange}
                className="sr-only"
              />
              <label
                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  formData.is_beta_tester ? 'bg-yellow-600' : 'bg-gray-300'
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, is_beta_tester: !prev.is_beta_tester }))
                }
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-1 ${
                    formData.is_beta_tester ? 'translate-x-7' : 'translate-x-1'
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
            disabled={updateRiderMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateRiderMutation.isPending}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
