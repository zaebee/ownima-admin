import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VehicleFilters } from './VehicleFilters'
import { VehicleStatusLabels, type VehicleFilters as VehicleFiltersType } from '../types'

const emptyFilters: VehicleFiltersType = {}

const renderFilters = (
  filters: VehicleFiltersType = emptyFilters,
  onFiltersChange = vi.fn(),
  onClearFilters = vi.fn()
) =>
  render(
    <VehicleFilters
      filters={filters}
      onFiltersChange={onFiltersChange}
      onClearFilters={onClearFilters}
    />
  )

describe('VehicleFilters', () => {
  let onFiltersChange: ReturnType<typeof vi.fn>
  let onClearFilters: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onFiltersChange = vi.fn()
    onClearFilters = vi.fn()
  })

  describe('Rendering', () => {
    it('renders the Filters heading', () => {
      renderFilters()
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('renders a status select dropdown', () => {
      renderFilters()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders a search input', () => {
      renderFilters()
      expect(screen.getByPlaceholderText(/search by vehicle name/i)).toBeInTheDocument()
    })

    it('does not show Active badge when filters are empty', () => {
      renderFilters()
      expect(screen.queryByText('Active')).not.toBeInTheDocument()
    })

    it('does not show clear button when filters are empty', () => {
      renderFilters()
      expect(screen.queryByText('Clear')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has a label linked to the status select', () => {
      renderFilters()
      const label = screen.getByText('Status:')
      expect(label).toHaveAttribute('for', 'vehicle-status-filter')
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'vehicle-status-filter')
    })
  })

  describe('Status filter', () => {
    it('shows "All Statuses" as default option', () => {
      renderFilters()
      expect(screen.getByRole('combobox')).toHaveValue('all')
    })

    it('renders all status options from VehicleStatusLabels', () => {
      renderFilters()
      for (const label of Object.values(VehicleStatusLabels)) {
        expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
      }
    })

    it('calls onFiltersChange with numeric status when option selected', async () => {
      renderFilters(emptyFilters, onFiltersChange, onClearFilters)
      await userEvent.selectOptions(screen.getByRole('combobox'), '1')
      expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ status: 1 }))
    })

    it('calls onFiltersChange with status: undefined when "all" selected', async () => {
      const filters: VehicleFiltersType = { status: 1 }
      renderFilters(filters, onFiltersChange, onClearFilters)
      await userEvent.selectOptions(screen.getByRole('combobox'), 'all')
      expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }))
    })
  })

  describe('Search filter', () => {
    it('calls onFiltersChange with search text when typed', () => {
      renderFilters(emptyFilters, onFiltersChange, onClearFilters)
      const input = screen.getByPlaceholderText(/search by vehicle name/i)
      fireEvent.change(input, { target: { value: 'tesla' } })
      expect(onFiltersChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'tesla' }))
    })

    it('calls onFiltersChange with search: undefined when input cleared', async () => {
      const filters: VehicleFiltersType = { search: 'bmw' }
      renderFilters(filters, onFiltersChange, onClearFilters)
      const input = screen.getByPlaceholderText(/search by vehicle name/i)
      await userEvent.clear(input)
      expect(onFiltersChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: undefined }))
    })
  })

  describe('hasActiveFilters badge and clear button', () => {
    it('shows Active badge when status is set', () => {
      renderFilters({ status: 2 })
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('shows Active badge when search is set', () => {
      renderFilters({ search: 'honda' })
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('hides Active badge when both are unset', () => {
      renderFilters(emptyFilters)
      expect(screen.queryByText('Active')).not.toBeInTheDocument()
    })

    it('shows Clear button when filters are active', () => {
      renderFilters({ status: 3 })
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('clicking Clear button calls onClearFilters', async () => {
      renderFilters({ status: 3 }, vi.fn(), onClearFilters)
      await userEvent.click(screen.getByText('Clear'))
      expect(onClearFilters).toHaveBeenCalledOnce()
    })
  })

  describe('Active filters summary', () => {
    it('shows status chip with label when status is set', () => {
      renderFilters({ status: 1 })
      expect(screen.getByText(`Status: ${VehicleStatusLabels[1]}`)).toBeInTheDocument()
    })

    it('shows search chip when search is set', () => {
      renderFilters({ search: 'toyota' })
      expect(screen.getByText('Search: "toyota"')).toBeInTheDocument()
    })

    it('hides summary section when no filters active', () => {
      renderFilters(emptyFilters)
      // "/^Status: \w/" matches the chip "Status: Draft" but not the always-visible label "Status:"
      expect(screen.queryByText(/^Status: \w/)).not.toBeInTheDocument()
      expect(screen.queryByText(/^Search:/)).not.toBeInTheDocument()
    })
  })
})
