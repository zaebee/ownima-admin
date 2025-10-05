import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  describe('Visibility', () => {
    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </div>
        </Modal>
      )

      expect(screen.getByText('First paragraph')).toBeInTheDocument()
      expect(screen.getByText('Second paragraph')).toBeInTheDocument()
    })
  })

  describe('Title', () => {
    it('renders with title', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByText('Test Modal')).toBeInTheDocument()
    })

    it('renders without title', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      // Should not have any h3 element
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('shows close button by default', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      // Close button should be present (XMarkIcon button)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" showCloseButton={false}>
          <div>Modal Content</div>
        </Modal>
      )

      // Should not have any buttons
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      const closeButton = screen.getByRole('button')
      await user.click(closeButton)

      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Backdrop', () => {
    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      const { container } = render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      )

      // Find the backdrop (the div with bg-black bg-opacity-50)
      const backdrop = container.querySelector('.bg-black.bg-opacity-50')
      expect(backdrop).toBeInTheDocument()

      if (backdrop) {
        await user.click(backdrop)
        expect(handleClose).toHaveBeenCalledTimes(1)
      }
    })

    it('does not close when modal content is clicked', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      )

      const content = screen.getByText('Modal Content')
      await user.click(content)

      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('Size Variants', () => {
    it('renders with medium size by default', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(container.querySelector('.max-w-lg')).toBeInTheDocument()
    })

    it('renders with small size', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()} size="sm">
          <div>Modal Content</div>
        </Modal>
      )

      expect(container.querySelector('.max-w-md')).toBeInTheDocument()
    })

    it('renders with large size', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()} size="lg">
          <div>Modal Content</div>
        </Modal>
      )

      expect(container.querySelector('.max-w-2xl')).toBeInTheDocument()
    })

    it('renders with extra large size', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()} size="xl">
          <div>Modal Content</div>
        </Modal>
      )

      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper z-index for overlay', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      const overlay = container.querySelector('.z-50')
      expect(overlay).toBeInTheDocument()
    })

    it('renders with proper structure', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      // Should have backdrop
      expect(container.querySelector('.bg-black.bg-opacity-50')).toBeInTheDocument()
      
      // Should have modal container
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
      
      // Should have rounded corners
      expect(container.querySelector('.rounded-2xl')).toBeInTheDocument()
    })

    it('stops propagation on modal content click', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      const { container } = render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      )

      // Click on the modal content area (not backdrop)
      const modalContent = container.querySelector('.bg-white')
      if (modalContent) {
        await user.click(modalContent)
        expect(handleClose).not.toHaveBeenCalled()
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles multiple onClose calls', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()

      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      const closeButton = screen.getByRole('button')
      
      await user.click(closeButton)
      await user.click(closeButton)
      await user.click(closeButton)

      expect(handleClose).toHaveBeenCalledTimes(3)
    })

    it('renders with complex children', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Complex Modal">
          <div>
            <form>
              <input type="text" placeholder="Name" />
              <button type="submit">Submit</button>
            </form>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </Modal>
      )

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('handles empty title string', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="">
          <div>Modal Content</div>
        </Modal>
      )

      // Empty title should not render h3
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
    })

    it('renders without title but with close button', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} showCloseButton={true}>
          <div>Modal Content</div>
        </Modal>
      )

      // Should have close button
      expect(screen.getByRole('button')).toBeInTheDocument()
      
      // Should not have title
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('State Changes', () => {
    it('updates when isOpen changes from false to true', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()

      rerender(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('updates when isOpen changes from true to false', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByText('Modal Content')).toBeInTheDocument()

      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
    })
  })
})
