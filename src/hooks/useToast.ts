import { useState, useCallback } from 'react';
import type { ToastType } from '../components/ui/Toast';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastItem = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts(current => [...current, toast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => 
    showToast('success', title, message), [showToast]);

  const error = useCallback((title: string, message?: string) => 
    showToast('error', title, message), [showToast]);

  const warning = useCallback((title: string, message?: string) => 
    showToast('warning', title, message), [showToast]);

  const info = useCallback((title: string, message?: string) => 
    showToast('info', title, message), [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};