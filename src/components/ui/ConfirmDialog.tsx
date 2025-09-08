import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  ExclamationTriangleIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: TrashIcon,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'info':
        return {
          icon: CheckCircleIcon,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
      default: // warning
        return {
          icon: ExclamationTriangleIcon,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
          <div className={`${config.iconBg} rounded-full p-3`}>
            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex space-x-3 justify-center">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isLoading}
            className={`min-w-[80px] text-white ${config.confirmButtonClass}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};