import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('renders as disabled when disabled prop is true', () => {
      render(<Button disabled>Click me</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies custom className', () => {
      render(<Button className="custom-class">Click me</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick} disabled>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Variants', () => {
    it('renders primary variant', () => {
      render(<Button variant="primary">Primary</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders medium size', () => {
      render(<Button size="md">Medium</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('disables button when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
