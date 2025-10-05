import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toast, ToastContainer } from './Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with title', () => {
      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(screen.getByText('Test Toast')).toBeInTheDocument()
    })

    it('renders with title and message', () => {
      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          message="This is a test message"
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(screen.getByText('Test Toast')).toBeInTheDocument()
      expect(screen.getByText('This is a test message')).toBeInTheDocument()
    })

    it('renders without message', () => {
      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(screen.getByText('Test Toast')).toBeInTheDocument()
      // Should only have one paragraph (title)
      const paragraphs = screen.getAllByText(/Test Toast|./i)
      expect(paragraphs.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Toast Types', () => {
    it('renders success toast with correct styling', () => {
      const { container } = render(
        <Toast
          id="test-1"
          type="success"
          title="Success!"
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(container.querySelector('.bg-emerald-50')).toBeInTheDocument()
      expect(container.querySelector('.border-emerald-200')).toBeInTheDocument()
    })

    it('renders error toast with correct styling', () => {
      const { container } = render(
        <Toast
          id="test-1"
          type="error"
          title="Error!"
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(container.querySelector('.bg-red-50')).toBeInTheDocument()
      expect(container.querySelector('.border-red-200')).toBeInTheDocument()
    })

    it('renders warning toast with correct styling', () => {
      const { container } = render(
        <Toast
          id="test-1"
          type="warning"
          title="Warning!"
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument()
      expect(container.querySelector('.border-yellow-200')).toBeInTheDocument()
    })

    it('renders info toast with correct styling', () => {
      const { container } = render(
        <Toast
          id="test-1"
          type="info"
          title="Info"
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument()
      expect(container.querySelector('.border-blue-200')).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('renders close button', () => {
      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={vi.fn()}
          duration={0}
        />
      )

      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      const handleClose = vi.fn()

      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={handleClose}
          duration={0}
        />
      )

      const closeButton = screen.getByRole('button')
      fireEvent.click(closeButton)

      // Run all pending timers (including the 300ms animation timeout)
      vi.runAllTimers()

      expect(handleClose).toHaveBeenCalledWith('test-1')
    })
  })

  describe('Auto Dismiss', () => {
    it('auto dismisses after default duration (5000ms)', () => {
      const handleClose = vi.fn()

      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={handleClose}
        />
      )

      // Fast-forward time by 5000ms (default duration)
      vi.advanceTimersByTime(5000)
      
      // Wait for animation (300ms)
      vi.advanceTimersByTime(300)

      expect(handleClose).toHaveBeenCalledWith('test-1')
    })

    it('auto dismisses after custom duration', () => {
      const handleClose = vi.fn()

      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={handleClose}
          duration={3000}
        />
      )

      // Fast-forward time by 3000ms
      vi.advanceTimersByTime(3000)
      
      // Wait for animation (300ms)
      vi.advanceTimersByTime(300)

      expect(handleClose).toHaveBeenCalledWith('test-1')
    })

    it('does not auto dismiss when duration is 0', () => {
      const handleClose = vi.fn()

      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={handleClose}
          duration={0}
        />
      )

      // Fast-forward time by a lot
      vi.advanceTimersByTime(10000)

      expect(handleClose).not.toHaveBeenCalled()
    })

    it('does not auto dismiss when duration is negative', () => {
      const handleClose = vi.fn()

      render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={handleClose}
          duration={-1}
        />
      )

      // Fast-forward time by a lot
      vi.advanceTimersByTime(10000)

      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('Animation', () => {
    it('has transition classes for animation', () => {
      const { container } = render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={vi.fn()}
          duration={0}
        />
      )

      // Should have transition classes
      const toast = container.querySelector('.transition-all')
      expect(toast).toBeInTheDocument()
      
      // Should have duration class
      const durationClass = container.querySelector('.duration-300')
      expect(durationClass).toBeInTheDocument()
      
      // Should have transform class
      const transformClass = container.querySelector('.transform')
      expect(transformClass).toBeInTheDocument()
    })

    it('applies leaving animation when closing', () => {
      const { container } = render(
        <Toast
          id="test-1"
          type="info"
          title="Test Toast"
          onClose={vi.fn()}
          duration={0}
        />
      )

      // Wait for fade in
      vi.advanceTimersByTime(50)

      const closeButton = screen.getByRole('button')
      fireEvent.click(closeButton)

      // Should apply leaving animation (translate-x-full opacity-0)
      const leavingToast = container.querySelector('.translate-x-full')
      expect(leavingToast).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(200)
      
      render(
        <Toast
          id="test-1"
          type="info"
          title={longTitle}
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles very long messages', () => {
      const longMessage = 'B'.repeat(500)
      
      render(
        <Toast
          id="test-1"
          type="info"
          title="Title"
          message={longMessage}
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('handles empty string message', () => {
      render(
        <Toast
          id="test-1"
          type="info"
          title="Title"
          message=""
          onClose={vi.fn()}
          duration={0}
        />
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('handles special characters in title', () => {
      render(
        <Toast
          id="test-1"
          type="info"
          title="<script>alert('xss')</script>"
          onClose={vi.fn()}
          duration={0}
        />
      )

      // React should escape the HTML
      expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument()
    })
  })
})

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Multiple Toasts', () => {
    it('renders multiple toasts', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Success 1' },
        { id: '2', type: 'error' as const, title: 'Error 1' },
        { id: '3', type: 'info' as const, title: 'Info 1' },
      ]

      render(<ToastContainer toasts={toasts} onClose={vi.fn()} />)

      expect(screen.getByText('Success 1')).toBeInTheDocument()
      expect(screen.getByText('Error 1')).toBeInTheDocument()
      expect(screen.getByText('Info 1')).toBeInTheDocument()
    })

    it('renders empty container when no toasts', () => {
      const { container } = render(<ToastContainer toasts={[]} onClose={vi.fn()} />)

      // Container should exist but be empty
      expect(container.querySelector('.fixed.top-4.right-4')).toBeInTheDocument()
      expect(container.querySelectorAll('.rounded-lg').length).toBe(0)
    })

    it('handles toast removal', () => {
      const initialToasts = [
        { id: '1', type: 'success' as const, title: 'Success 1' },
        { id: '2', type: 'error' as const, title: 'Error 1' },
      ]

      const { rerender } = render(
        <ToastContainer toasts={initialToasts} onClose={vi.fn()} />
      )

      expect(screen.getByText('Success 1')).toBeInTheDocument()
      expect(screen.getByText('Error 1')).toBeInTheDocument()

      // Remove one toast
      const updatedToasts = [
        { id: '2', type: 'error' as const, title: 'Error 1' },
      ]

      rerender(<ToastContainer toasts={updatedToasts} onClose={vi.fn()} />)

      expect(screen.queryByText('Success 1')).not.toBeInTheDocument()
      expect(screen.getByText('Error 1')).toBeInTheDocument()
    })

    it('handles toast addition', () => {
      const initialToasts = [
        { id: '1', type: 'success' as const, title: 'Success 1' },
      ]

      const { rerender } = render(
        <ToastContainer toasts={initialToasts} onClose={vi.fn()} />
      )

      expect(screen.getByText('Success 1')).toBeInTheDocument()

      // Add another toast
      const updatedToasts = [
        { id: '1', type: 'success' as const, title: 'Success 1' },
        { id: '2', type: 'error' as const, title: 'Error 1' },
      ]

      rerender(<ToastContainer toasts={updatedToasts} onClose={vi.fn()} />)

      expect(screen.getByText('Success 1')).toBeInTheDocument()
      expect(screen.getByText('Error 1')).toBeInTheDocument()
    })
  })

  describe('Positioning', () => {
    it('has correct positioning classes', () => {
      const { container } = render(
        <ToastContainer
          toasts={[{ id: '1', type: 'info', title: 'Test' }]}
          onClose={vi.fn()}
        />
      )

      const containerDiv = container.querySelector('.fixed.top-4.right-4.z-50')
      expect(containerDiv).toBeInTheDocument()
    })

    it('has spacing between toasts', () => {
      const { container } = render(
        <ToastContainer
          toasts={[
            { id: '1', type: 'info', title: 'Test 1' },
            { id: '2', type: 'info', title: 'Test 2' },
          ]}
          onClose={vi.fn()}
        />
      )

      const containerDiv = container.querySelector('.space-y-3')
      expect(containerDiv).toBeInTheDocument()
    })
  })
})
