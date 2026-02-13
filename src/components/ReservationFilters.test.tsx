import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReservationFilters } from './ReservationFilters'
import { ReservationStatusLabels, type ReservationFilters as ReservationFiltersType } from '../types'

const emptyFilters: ReservationFiltersType = {}

const renderFilters = (
  filters: ReservationFiltersType = emptyFilters,
  onFiltersChange = vi.fn(),
  onClearFilters = vi.fn()
) =>
  render(
    <ReservationFilters
      filters={filters}
      onFiltersChange={onFiltersChange}
      onClearFilters={onClearFilters}
    />
  )

describe('ReservationFilters', () => {
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
      expect(screen.getByPlaceholderText(/search by rider name/i)).toBeInTheDocument()
    })

    it('renders From date input', () => {
      renderFilters()
      expect(screen.getByLabelText('From:')).toBeInTheDocument()
    })

    it('renders To date input', () => {
      renderFilters()
      expect(screen.getByLabelText('To:')).toBeInTheDocument()
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
      expect(label).toHaveAttribute('for', 'reservation-status-filter')
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'reservation-status-filter')
    })

    it('has a label linked to the From date input', () => {
      renderFilters()
      expect(screen.getByLabelText('From:')).toHaveAttribute('id', 'reservation-date-from')
    })

    it('has a label linked to the To date input', () => {
      renderFilters()
      expect(screen.getByLabelText('To:')).toHaveAttribute('id', 'reservation-date-to')
    })
  })

  describe('Status filter', () => {
    it('shows "All Statuses" as default option', () => {
      renderFilters()
      expect(screen.getByRole('combobox')).toHaveValue('all')
    })

    it('renders all status options from ReservationStatusLabels', () => {
      renderFilters()
      for (const label of Object.values(ReservationStatusLabels)) {
        expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
      }
    })

    it('calls onFiltersChange with numeric status when option selected', async () => {
      renderFilters(emptyFilters, onFiltersChange, onClearFilters)
      await userEvent.selectOptions(screen.getByRole('combobox'), '2')
      expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ status: 2 }))
    })

    it('calls onFiltersChange with status: undefined when "all" selected', async () => {
      const filters: ReservationFiltersType = { status: 2 }
      renderFilters(filters, onFiltersChange, onClearFilters)
      await userEvent.selectOptions(screen.getByRole('combobox'), 'all')
      expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }))
    })
  })

  describe('Search filter', () => {
    it('calls onFiltersChange with search text when typed', () => {
      renderFilters(emptyFilters, onFiltersChange, onClearFilters)
      const input = screen.getByPlaceholderText(/search by rider name/i)
      fireEvent.change(input, { target: { value: 'john' } })
      expect(onFiltersChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'john' }))
    })

    it('calls onFiltersChange with search: undefined when input cleared', async () => {
      const filters: ReservationFiltersType = { search: 'alice' }
      renderFilters(filters, onFiltersChange, onClearFilters)
      const input = screen.getByPlaceholderText(/search by rider name/i)
      await userEvent.clear(input)
      expect(onFiltersChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: undefined }))
    })
  })

  describe('Date filters', () => {
    it('calls onFiltersChange with dateFrom when From input changes', async () => {
      renderFilters(emptyFilters, onFiltersChange, onClearFilters)
      const fromInput = screen.getByLabelText('From:')
      await userEvent.type(fromInput, '2024-01-01')
      expect(onFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ dateFrom: expect.any(String) })
      )
    })

    it('calls onFiltersChange with dateTo when To input changes', async () => {
      renderFilters(emptyFilters, onFiltersChange, onClearFilters)
      const toInput = screen.getByLabelText('To:')
      await userEvent.type(toInput, '2024-01-31')
      expect(onFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ dateTo: expect.any(String) })
      )
    })
  })

  describe('hasActiveFilters badge and clear button', () => {
    it('shows Active badge when status is set', () => {
      renderFilters({ status: 0 })
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('shows Active badge when search is set', () => {
      renderFilters({ search: 'john' })
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('shows Active badge when dateFrom is set', () => {
      renderFilters({ dateFrom: '2024-01-01' })
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('shows Active badge when dateTo is set', () => {
      renderFilters({ dateTo: '2024-01-31' })
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('hides Active badge when all filters are empty', () => {
      renderFilters(emptyFilters)
      expect(screen.queryByText('Active')).not.toBeInTheDocument()
    })

    it('shows Clear button when any filter is active', () => {
      renderFilters({ dateFrom: '2024-01-01' })
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('clicking Clear button calls onClearFilters', async () => {
      renderFilters({ status: 2 }, vi.fn(), onClearFilters)
      await userEvent.click(screen.getByText('Clear'))
      expect(onClearFilters).toHaveBeenCalledOnce()
    })
  })

  describe('Active filters summary', () => {
    it('shows status chip with label when status is set', () => {
      renderFilters({ status: 0 })
      expect(screen.getByText(`Status: ${ReservationStatusLabels[0]}`)).toBeInTheDocument()
    })

    it('shows search chip when search is set', () => {
      renderFilters({ search: 'bob' })
      expect(screen.getByText('Search: "bob"')).toBeInTheDocument()
    })

    it('shows dateFrom chip when dateFrom is set', () => {
      renderFilters({ dateFrom: '2024-03-15' })
      expect(screen.getByText('From: 2024-03-15')).toBeInTheDocument()
    })

    it('shows dateTo chip when dateTo is set', () => {
      renderFilters({ dateTo: '2024-03-31' })
      expect(screen.getByText('To: 2024-03-31')).toBeInTheDocument()
    })

    it('hides summary section when no filters active', () => {
      renderFilters(emptyFilters)
      // "/^Status: \w/" matches chips like "Status: Pending" but not the always-visible label "Status:"
      expect(screen.queryByText(/^Status: \w/)).not.toBeInTheDocument()
      // "From: " and "To: " only appear in chips, not in any always-visible labels
      expect(screen.queryByText(/^From: \d/)).not.toBeInTheDocument()
      expect(screen.queryByText(/^To: \d/)).not.toBeInTheDocument()
    })
  })
})
