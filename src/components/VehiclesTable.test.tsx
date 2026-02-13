import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehiclesTable } from './VehiclesTable';
import type { components } from '../types/api-generated';

const mockVehicles: components['schemas']['Vehicle-Output'][] = [
  {
    id: 'vehicle-1',
    owner_id: 'owner-1',
    name: 'Tesla Model 3',
    status: 2, // FREE
    type: 0,
    sub_type: 1,
    picture: {
      cover: 'https://example.com/tesla.jpg',
    },
    price: 75.0,
    currency: 'USD',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-03-20T14:45:00Z',
    general_info: {},
    specification_info: {},
  },
  {
    id: 'vehicle-2',
    owner_id: 'owner-1',
    name: 'BMW X5',
    status: 4, // COLLECTED
    type: 0,
    sub_type: 2,
    picture: {
      cover: 'https://example.com/bmw.jpg',
    },
    price: 120.0,
    currency: 'EUR',
    created_at: '2024-02-10T08:00:00Z',
    updated_at: '2024-03-15T16:20:00Z',
    general_info: {},
    specification_info: {},
  },
  {
    id: 'vehicle-3',
    owner_id: 'owner-1',
    name: 'Honda Civic',
    status: 1, // DRAFT
    type: 0,
    sub_type: 1,
    price: 45.0,
    currency: 'USD',
    created_at: '2024-03-01T12:00:00Z',
    updated_at: '2024-03-01T12:00:00Z',
    general_info: {},
    specification_info: {},
  },
];

describe('VehiclesTable', () => {
  const mockOnSort = vi.fn();

  const defaultProps = {
    vehicles: mockVehicles,
    isLoading: false,
    sortField: 'created_at' as const,
    sortDirection: 'desc' as const,
    onSort: mockOnSort,
  };

  beforeEach(() => {
    mockOnSort.mockClear();
  });

  it('renders vehicle data correctly', () => {
    render(<VehiclesTable {...defaultProps} />);

    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    expect(screen.getByText('BMW X5')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
  });

  it('displays vehicle images when available', () => {
    render(<VehiclesTable {...defaultProps} />);

    const teslaImage = screen.getByAltText('Tesla Model 3');
    expect(teslaImage).toHaveAttribute('src', 'https://example.com/tesla.jpg');

    const bmwImage = screen.getByAltText('BMW X5');
    expect(bmwImage).toHaveAttribute('src', 'https://example.com/bmw.jpg');
  });

  it('displays price information correctly', () => {
    render(<VehiclesTable {...defaultProps} />);

    expect(screen.getByText('USD 75.00/day')).toBeInTheDocument();
    expect(screen.getByText('EUR 120.00/day')).toBeInTheDocument();
    expect(screen.getByText('USD 45.00/day')).toBeInTheDocument();
  });

  it('displays status badges with correct labels', () => {
    render(<VehiclesTable {...defaultProps} />);

    expect(screen.getByText('Free')).toBeInTheDocument(); // Status 2
    expect(screen.getByText('Collected')).toBeInTheDocument(); // Status 4
    expect(screen.getByText('Draft')).toBeInTheDocument(); // Status 1
  });

  it('applies correct status badge colors', () => {
    render(<VehiclesTable {...defaultProps} />);

    const freeBadge = screen.getByText('Free');
    expect(freeBadge).toHaveClass('bg-green-100', 'text-green-700');

    const collectedBadge = screen.getByText('Collected');
    expect(collectedBadge).toHaveClass('bg-purple-100', 'text-purple-700');

    const draftBadge = screen.getByText('Draft');
    expect(draftBadge).toHaveClass('bg-yellow-100', 'text-yellow-700');
  });

  it('formats dates correctly', () => {
    render(<VehiclesTable {...defaultProps} />);

    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Feb 10, 2024')).toBeInTheDocument();
    expect(screen.getByText('Mar 1, 2024')).toBeInTheDocument();
  });

  it('displays vehicle types correctly', () => {
    render(<VehiclesTable {...defaultProps} />);

    // All test vehicles are type 0 (CAR)
    const carLabels = screen.getAllByText('Car');
    expect(carLabels).toHaveLength(3);
  });

  it('renders View action buttons for all vehicles', () => {
    render(<VehiclesTable {...defaultProps} />);

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    expect(viewButtons).toHaveLength(3);
  });

  it('calls onSort when clicking sortable column headers', async () => {
    const user = userEvent.setup();
    render(<VehiclesTable {...defaultProps} />);

    const nameHeader = screen.getByRole('button', { name: /name/i });
    await user.click(nameHeader);
    expect(mockOnSort).toHaveBeenCalledWith('name');

    const statusHeader = screen.getByRole('button', { name: /status/i });
    await user.click(statusHeader);
    expect(mockOnSort).toHaveBeenCalledWith('status');

    const createdHeader = screen.getByRole('button', { name: /created/i });
    await user.click(createdHeader);
    expect(mockOnSort).toHaveBeenCalledWith('created_at');
  });

  it('shows correct sort icon for active sort field', () => {
    const { rerender } = render(
      <VehiclesTable {...defaultProps} sortField="name" sortDirection="asc" />
    );

    // Verify name header is rendered
    let nameHeader = screen.getByRole('button', { name: /name/i });
    expect(nameHeader).toBeInTheDocument();

    // Rerender with descending sort and verify sort direction changes
    rerender(<VehiclesTable {...defaultProps} sortField="name" sortDirection="desc" />);
    nameHeader = screen.getByRole('button', { name: /name/i });
    expect(nameHeader).toBeInTheDocument();
  });

  it('displays loading skeleton when isLoading is true', () => {
    const { container } = render(<VehiclesTable {...defaultProps} isLoading={true} />);

    expect(screen.queryByText('Tesla Model 3')).not.toBeInTheDocument();

    // Check for loading animation
    const loadingContainer = container.querySelector('.animate-pulse');
    expect(loadingContainer).toBeInTheDocument();
  });

  it('displays empty state when no vehicles are provided', () => {
    render(<VehiclesTable {...defaultProps} vehicles={[]} />);

    expect(screen.getByText('No vehicles found')).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
  });

  it('handles vehicles without thumbnails gracefully', () => {
    const vehiclesWithoutImages: components['schemas']['Vehicle-Output'][] = [
      {
        ...mockVehicles[0],
        picture: undefined,
      },
    ];

    render(<VehiclesTable {...defaultProps} vehicles={vehiclesWithoutImages} />);

    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    expect(screen.queryByAltText('Tesla Model 3')).not.toBeInTheDocument();
  });

  it('handles vehicles without price gracefully', () => {
    const vehiclesWithoutPrice: components['schemas']['Vehicle-Output'][] = [
      {
        ...mockVehicles[0],
        price: undefined,
        currency: undefined,
      },
    ];

    render(<VehiclesTable {...defaultProps} vehicles={vehiclesWithoutPrice} />);

    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    expect(screen.queryByText(/\/day/)).not.toBeInTheDocument();
  });

  it('handles vehicles without created_at date', () => {
    const vehiclesWithoutDate: components['schemas']['Vehicle-Output'][] = [
      {
        ...mockVehicles[0],
        created_at: undefined,
      },
    ];

    render(<VehiclesTable {...defaultProps} vehicles={vehiclesWithoutDate} />);

    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('handles unknown status gracefully', () => {
    const vehiclesWithUnknownStatus: components['schemas']['Vehicle-Output'][] = [
      {
        ...mockVehicles[0],
        status: 999, // Unknown status
      },
    ];

    render(<VehiclesTable {...defaultProps} vehicles={vehiclesWithUnknownStatus} />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('handles unknown vehicle type gracefully', () => {
    const vehiclesWithUnknownType: components['schemas']['Vehicle-Output'][] = [
      {
        ...mockVehicles[0],
        type: 999, // Unknown type
      },
    ];

    render(<VehiclesTable {...defaultProps} vehicles={vehiclesWithUnknownType} />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders all table headers correctly', () => {
    render(<VehiclesTable {...defaultProps} />);

    expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /created/i })).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('applies hover styles to table rows', () => {
    render(<VehiclesTable {...defaultProps} />);

    const rows = screen.getAllByText(/Tesla Model 3|BMW X5|Honda Civic/);
    rows.forEach((row) => {
      const parentRow = row.closest('.grid');
      expect(parentRow).toHaveClass('hover:bg-gray-50');
    });
  });
});
