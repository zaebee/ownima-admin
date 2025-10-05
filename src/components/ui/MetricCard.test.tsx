import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { MetricCard } from './MetricCard'

// Mock icon component
const MockIcon = () => <svg data-testid="mock-icon" />

describe('MetricCard', () => {
  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
        />
      )

      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('1,234')).toBeInTheDocument()
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('renders with string value', () => {
      render(
        <MetricCard
          title="Status"
          value="Active"
          icon={MockIcon}
        />
      )

      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          description="Total registered users in the system"
        />
      )

      expect(screen.getByText('Total registered users in the system')).toBeInTheDocument()
    })

    it('formats numeric values with locale string', () => {
      render(
        <MetricCard
          title="Revenue"
          value={1234567}
          icon={MockIcon}
        />
      )

      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          loading={true}
        />
      )

      // Value should not be visible
      expect(screen.queryByText('1,234')).not.toBeInTheDocument()
      
      // Loading skeleton should be present
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('shows value when loading is false', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          loading={false}
        />
      )

      expect(screen.getByText('1,234')).toBeInTheDocument()
    })
  })

  describe('Trend Display', () => {
    it('renders upward trend', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          trend={{
            value: 12,
            label: 'vs last month',
            direction: 'up'
          }}
        />
      )

      expect(screen.getByText(/\+12%/)).toBeInTheDocument()
      expect(screen.getByText('vs last month')).toBeInTheDocument()
      expect(screen.getByText(/↗/)).toBeInTheDocument()
    })

    it('renders downward trend', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          trend={{
            value: -5,
            label: 'vs last month',
            direction: 'down'
          }}
        />
      )

      expect(screen.getByText(/-5%/)).toBeInTheDocument()
      expect(screen.getByText(/↘/)).toBeInTheDocument()
    })

    it('renders neutral trend', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          trend={{
            value: 0,
            label: 'vs last month',
            direction: 'neutral'
          }}
        />
      )

      expect(screen.getByText(/0%/)).toBeInTheDocument()
      expect(screen.getByText(/→/)).toBeInTheDocument()
    })

    it('renders trend without label', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          trend={{
            value: 12,
            label: '',
            direction: 'up'
          }}
        />
      )

      expect(screen.getByText(/\+12%/)).toBeInTheDocument()
    })
  })

  describe('Color Variants', () => {
    it('renders with blue color (default)', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
        />
      )

      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument()
    })

    it('renders with green color', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          color="green"
        />
      )

      expect(container.querySelector('.bg-green-50')).toBeInTheDocument()
    })

    it('renders with red color', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          color="red"
        />
      )

      expect(container.querySelector('.bg-red-50')).toBeInTheDocument()
    })

    it('renders with yellow color', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          color="yellow"
        />
      )

      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument()
    })

    it('renders with purple color', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          color="purple"
        />
      )

      expect(container.querySelector('.bg-purple-50')).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('renders with medium size (default)', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
        />
      )

      expect(container.querySelector('.p-6')).toBeInTheDocument()
    })

    it('renders with small size', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          size="small"
        />
      )

      expect(container.querySelector('.p-4')).toBeInTheDocument()
    })

    it('renders with large size', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          size="large"
        />
      )

      expect(container.querySelector('.p-8')).toBeInTheDocument()
    })
  })

  describe('Clickable Behavior', () => {
    it('renders as link when href is provided', () => {
      render(
        <BrowserRouter>
          <MetricCard
            title="Total Users"
            value={1234}
            icon={MockIcon}
            href="/users"
            clickable={true}
          />
        </BrowserRouter>
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/users')
    })

    it('renders as button when onClick is provided', () => {
      const handleClick = vi.fn()
      
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          onClick={handleClick}
          clickable={true}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          onClick={handleClick}
          clickable={true}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders as static div when neither href nor onClick is provided', () => {
      render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
        />
      )

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('applies hover styles when clickable', () => {
      const { container } = render(
        <MetricCard
          title="Total Users"
          value={1234}
          icon={MockIcon}
          clickable={true}
          onClick={vi.fn()}
        />
      )

      expect(container.querySelector('.cursor-pointer')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero value', () => {
      render(
        <MetricCard
          title="Total Users"
          value={0}
          icon={MockIcon}
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles negative value', () => {
      render(
        <MetricCard
          title="Balance"
          value={-100}
          icon={MockIcon}
        />
      )

      expect(screen.getByText('-100')).toBeInTheDocument()
    })

    it('handles very large numbers', () => {
      render(
        <MetricCard
          title="Total Users"
          value={999999999}
          icon={MockIcon}
        />
      )

      expect(screen.getByText('999,999,999')).toBeInTheDocument()
    })

    it('handles empty string value', () => {
      render(
        <MetricCard
          title="Status"
          value=""
          icon={MockIcon}
        />
      )

      // Empty string should still render (even if not visible)
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })
})
