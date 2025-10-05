import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthErrorHandler } from './useAuthErrorHandler';
import * as useToastModule from './useToast';

vi.mock('./useToast');

describe('useAuthErrorHandler', () => {
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToastModule.useToast).mockReturnValue({
      showToast: mockShowToast,
      toasts: [],
      removeToast: vi.fn(),
    });
  });

  it('sets up event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useAuthErrorHandler());

    expect(addEventListenerSpy).toHaveBeenCalledWith('auth:unauthorized', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useAuthErrorHandler());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('auth:unauthorized', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('shows toast when auth:unauthorized event is dispatched', () => {
    renderHook(() => useAuthErrorHandler());

    const event = new CustomEvent('auth:unauthorized', {
      detail: { message: 'Session expired' },
    });

    window.dispatchEvent(event);

    expect(mockShowToast).toHaveBeenCalledWith('error', 'Session expired');
  });

  it('handles multiple unauthorized events', () => {
    renderHook(() => useAuthErrorHandler());

    const event1 = new CustomEvent('auth:unauthorized', {
      detail: { message: 'First error' },
    });
    const event2 = new CustomEvent('auth:unauthorized', {
      detail: { message: 'Second error' },
    });

    window.dispatchEvent(event1);
    window.dispatchEvent(event2);

    expect(mockShowToast).toHaveBeenCalledTimes(2);
    expect(mockShowToast).toHaveBeenNthCalledWith(1, 'error', 'First error');
    expect(mockShowToast).toHaveBeenNthCalledWith(2, 'error', 'Second error');
  });

  it('does not show toast after unmount', () => {
    const { unmount } = renderHook(() => useAuthErrorHandler());

    unmount();

    const event = new CustomEvent('auth:unauthorized', {
      detail: { message: 'Should not show' },
    });

    window.dispatchEvent(event);

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('handles event with custom message', () => {
    renderHook(() => useAuthErrorHandler());

    const customMessage = 'Your session has expired. Please log in again.';
    const event = new CustomEvent('auth:unauthorized', {
      detail: { message: customMessage },
    });

    window.dispatchEvent(event);

    expect(mockShowToast).toHaveBeenCalledWith('error', customMessage);
  });

  it('re-registers listener when showToast changes', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { rerender } = renderHook(() => useAuthErrorHandler());

    const initialCallCount = addEventListenerSpy.mock.calls.length;

    // Change the mock to trigger re-render
    const newMockShowToast = vi.fn();
    vi.mocked(useToastModule.useToast).mockReturnValue({
      showToast: newMockShowToast,
      toasts: [],
      removeToast: vi.fn(),
    });

    rerender();

    // Should have removed old listener and added new one
    expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThan(0);
    expect(addEventListenerSpy.mock.calls.length).toBeGreaterThan(initialCallCount);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
