import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast', () => {
  describe('Initial State', () => {
    it('starts with empty toasts array', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it('provides all required methods', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.showToast).toBeDefined();
      expect(result.current.removeToast).toBeDefined();
      expect(result.current.success).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.warning).toBeDefined();
      expect(result.current.info).toBeDefined();
    });
  });

  describe('showToast', () => {
    it('adds a toast to the array', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('success', 'Test Title');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].title).toBe('Test Title');
    });

    it('adds toast with message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('info', 'Title', 'Message');
      });

      expect(result.current.toasts[0].message).toBe('Message');
    });

    it('adds toast with custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('warning', 'Title', 'Message', 10000);
      });

      expect(result.current.toasts[0].duration).toBe(10000);
    });

    it('generates unique IDs for each toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('success', 'Toast 1');
        result.current.showToast('success', 'Toast 2');
        result.current.showToast('success', 'Toast 3');
      });

      const ids = result.current.toasts.map(t => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
    });

    it('returns the toast ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string = '';
      act(() => {
        toastId = result.current.showToast('success', 'Test');
      });

      expect(toastId).toBeTruthy();
      expect(result.current.toasts[0].id).toBe(toastId);
    });

    it('adds multiple toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('success', 'Toast 1');
        result.current.showToast('error', 'Toast 2');
        result.current.showToast('warning', 'Toast 3');
      });

      expect(result.current.toasts).toHaveLength(3);
    });
  });

  describe('removeToast', () => {
    it('removes a toast by ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string = '';
      act(() => {
        toastId = result.current.showToast('success', 'Test');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('removes only the specified toast', () => {
      const { result } = renderHook(() => useToast());

      let id1: string = '';
      let id2: string = '';
      let id3: string = '';

      act(() => {
        id1 = result.current.showToast('success', 'Toast 1');
        id2 = result.current.showToast('error', 'Toast 2');
        id3 = result.current.showToast('warning', 'Toast 3');
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.removeToast(id2);
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts.find(t => t.id === id1)).toBeDefined();
      expect(result.current.toasts.find(t => t.id === id2)).toBeUndefined();
      expect(result.current.toasts.find(t => t.id === id3)).toBeDefined();
    });

    it('handles removing non-existent toast gracefully', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('success', 'Test');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast('non-existent-id');
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('Convenience Methods', () => {
    describe('success', () => {
      it('creates a success toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.success('Success Title');
        });

        expect(result.current.toasts[0].type).toBe('success');
        expect(result.current.toasts[0].title).toBe('Success Title');
      });

      it('creates success toast with message', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.success('Success', 'Operation completed');
        });

        expect(result.current.toasts[0].message).toBe('Operation completed');
      });
    });

    describe('error', () => {
      it('creates an error toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.error('Error Title');
        });

        expect(result.current.toasts[0].type).toBe('error');
        expect(result.current.toasts[0].title).toBe('Error Title');
      });

      it('creates error toast with message', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.error('Error', 'Something went wrong');
        });

        expect(result.current.toasts[0].message).toBe('Something went wrong');
      });
    });

    describe('warning', () => {
      it('creates a warning toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.warning('Warning Title');
        });

        expect(result.current.toasts[0].type).toBe('warning');
        expect(result.current.toasts[0].title).toBe('Warning Title');
      });

      it('creates warning toast with message', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.warning('Warning', 'Please be careful');
        });

        expect(result.current.toasts[0].message).toBe('Please be careful');
      });
    });

    describe('info', () => {
      it('creates an info toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.info('Info Title');
        });

        expect(result.current.toasts[0].type).toBe('info');
        expect(result.current.toasts[0].title).toBe('Info Title');
      });

      it('creates info toast with message', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.info('Info', 'Here is some information');
        });

        expect(result.current.toasts[0].message).toBe('Here is some information');
      });
    });
  });

  describe('Multiple Toast Types', () => {
    it('handles mixed toast types', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success');
        result.current.error('Error');
        result.current.warning('Warning');
        result.current.info('Info');
      });

      expect(result.current.toasts).toHaveLength(4);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[1].type).toBe('error');
      expect(result.current.toasts[2].type).toBe('warning');
      expect(result.current.toasts[3].type).toBe('info');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('success', '');
      });

      expect(result.current.toasts[0].title).toBe('');
    });

    it('handles undefined message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('success', 'Title', undefined);
      });

      expect(result.current.toasts[0].message).toBeUndefined();
    });

    it('handles undefined duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('success', 'Title', 'Message', undefined);
      });

      expect(result.current.toasts[0].duration).toBeUndefined();
    });

    it('handles very long titles', () => {
      const { result } = renderHook(() => useToast());
      const longTitle = 'A'.repeat(1000);

      act(() => {
        result.current.showToast('success', longTitle);
      });

      expect(result.current.toasts[0].title).toBe(longTitle);
    });

    it('handles very long messages', () => {
      const { result } = renderHook(() => useToast());
      const longMessage = 'B'.repeat(1000);

      act(() => {
        result.current.showToast('success', 'Title', longMessage);
      });

      expect(result.current.toasts[0].message).toBe(longMessage);
    });

    it('handles rapid toast additions', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.showToast('success', `Toast ${i}`);
        }
      });

      expect(result.current.toasts).toHaveLength(100);
    });

    it('handles rapid toast removals', () => {
      const { result } = renderHook(() => useToast());

      const ids: string[] = [];
      act(() => {
        for (let i = 0; i < 10; i++) {
          ids.push(result.current.showToast('success', `Toast ${i}`));
        }
      });

      expect(result.current.toasts).toHaveLength(10);

      act(() => {
        ids.forEach(id => result.current.removeToast(id));
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('Callback Stability', () => {
    it('maintains stable function references', () => {
      const { result, rerender } = renderHook(() => useToast());

      const initialShowToast = result.current.showToast;
      const initialRemoveToast = result.current.removeToast;
      const initialSuccess = result.current.success;
      const initialError = result.current.error;
      const initialWarning = result.current.warning;
      const initialInfo = result.current.info;

      rerender();

      expect(result.current.showToast).toBe(initialShowToast);
      expect(result.current.removeToast).toBe(initialRemoveToast);
      expect(result.current.success).toBe(initialSuccess);
      expect(result.current.error).toBe(initialError);
      expect(result.current.warning).toBe(initialWarning);
      expect(result.current.info).toBe(initialInfo);
    });
  });
});
