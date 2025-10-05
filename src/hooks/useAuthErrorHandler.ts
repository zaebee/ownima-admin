import { useEffect } from 'react';
import { useToast } from './useToast';

/**
 * Hook to handle authentication errors from API interceptor
 * Listens for custom 'auth:unauthorized' events and shows toast notifications
 */
export const useAuthErrorHandler = (): void => {
  const { showToast } = useToast();

  useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      showToast('error', customEvent.detail.message);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [showToast]);
};
