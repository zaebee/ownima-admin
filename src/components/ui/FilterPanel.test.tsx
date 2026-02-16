import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterPanel } from './FilterPanel'
import type { FilterParams } from '../../types'

const defaultFilters: FilterParams = {}

const renderFilterPanel = (
  filters: FilterParams = defaultFilters,
  onFiltersChange = vi.fn(),
  onReset = vi.fn()
) => {
  return render(
    <FilterPanel
      filters={filters}
      onFiltersChange={onFiltersChange}
      onReset={onReset}
    />
  )
}

describe('FilterPanel', () => {
  describe('Rendering', () => {
    it('renders the filter panel', () => {
      renderFilterPanel()
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('renders date range presets', () => {
      renderFilterPanel()
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Last 7 days')).toBeInTheDocument()
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    })

    it('renders role filter dropdown', () => {
      renderFilterPanel()
      expect(screen.getByDisplayValue('All Users')).toBeInTheDocument()
    })

    it('renders the exclude beta testers checkbox', () => {
      renderFilterPanel()
      expect(screen.getByLabelText('Exclude beta testers')).toBeInTheDocument()
    })

    it('excludeBetaTesters checkbox is unchecked by default', () => {
      renderFilterPanel()
      const checkbox = screen.getByLabelText('Exclude beta testers') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })
  })

  describe('Exclude Beta Testers', () => {
    it('calls onFiltersChange with excludeBetaTesters=true when checked', () => {
      const onFiltersChange = vi.fn()
      renderFilterPanel(defaultFilters, onFiltersChange)

      const checkbox = screen.getByLabelText('Exclude beta testers')
      fireEvent.click(checkbox)

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ excludeBetaTesters: true })
      )
    })

    it('calls onFiltersChange with excludeBetaTesters=undefined when unchecked', () => {
      const onFiltersChange = vi.fn()
      renderFilterPanel({ excludeBetaTesters: true }, onFiltersChange)

      const checkbox = screen.getByLabelText('Exclude beta testers')
      fireEvent.click(checkbox)

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ excludeBetaTesters: undefined })
      )
    })

    it('shows active filter chip when excludeBetaTesters is true', () => {
      renderFilterPanel({ excludeBetaTesters: true })
      expect(screen.getByText('No beta testers')).toBeInTheDocument()
    })

    it('does not show beta testers chip when filter is off', () => {
      renderFilterPanel(defaultFilters)
      expect(screen.queryByText('No beta testers')).not.toBeInTheDocument()
    })

    it('shows Active badge when excludeBetaTesters is set', () => {
      renderFilterPanel({ excludeBetaTesters: true })
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  describe('Active Filters', () => {
    it('does not show Active badge with no filters', () => {
      renderFilterPanel(defaultFilters)
      expect(screen.queryByText('Active')).not.toBeInTheDocument()
    })

    it('shows Clear all button when filters are active', () => {
      renderFilterPanel({ excludeBetaTesters: true })
      expect(screen.getByText('Clear all')).toBeInTheDocument()
    })

    it('calls onReset when Clear all is clicked', () => {
      const onReset = vi.fn()
      renderFilterPanel({ excludeBetaTesters: true }, vi.fn(), onReset)

      fireEvent.click(screen.getByText('Clear all'))
      expect(onReset).toHaveBeenCalled()
    })
  })
})
