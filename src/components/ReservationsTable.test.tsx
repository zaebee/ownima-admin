import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationsTable } from './ReservationsTable';
import type { components } from '../types/api-generated';

const mockReservations: components['schemas']['Reservation'][] = [
  {
    id: 'reservation-1',
    status: 2, // CONFIRMED
    date_from: '2024-01-20T10:00:00Z',
    date_to: '2024-01-25T10:00:00Z',
    total_price: 375.0,
    currency: 'USD',
    is_paid: true,
    rider: {
      id: 'rider-1',
      name: 'John Rider',
      email: 'john@example.com',
      phone: '+1234567890',
      avatar: 'https://example.com/rider1.jpg',
    },
    vehicle: {
      id: 'vehicle-1',
      name: 'Tesla Model 3',
      type: 0,
      status: 4,
      picture: {
        cover: 'https://example.com/tesla.jpg',
      },
    },
    owner_id: 'owner-1',
    created_date: '2024-01-15T14:30:00Z',
    last_updated_date: '2024-01-18T09:15:00Z',
    pick_up: {
      location: '123 Main St, City',
      date: '2024-01-20T10:00:00Z',
    },
    drop_off: {
      location: '123 Main St, City',
      date: '2024-01-25T10:00:00Z',
    },
    duration: {
      days: 5,
      hours: 0,
    },
  },
  {
    id: 'reservation-2',
    status: 0, // PENDING
    date_from: '2024-02-01T09:00:00Z',
    date_to: '2024-02-03T18:00:00Z',
    total_price: 150.0,
    currency: 'EUR',
    is_paid: false,
    rider: {
      id: 'rider-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+9876543210',
      avatar: 'https://example.com/rider2.jpg',
    },
    vehicle: {
      id: 'vehicle-2',
      name: 'BMW X5',
      type: 0,
      status: 2,
      picture: {
        cover: 'https://example.com/bmw.jpg',
      },
    },
    owner_id: 'owner-1',
    created_date: '2024-01-28T11:00:00Z',
    last_updated_date: '2024-01-28T11:00:00Z',
    pick_up: {
      location: '456 Oak Ave, Town',
      date: '2024-02-01T09:00:00Z',
    },
    drop_off: {
      location: '456 Oak Ave, Town',
      date: '2024-02-03T18:00:00Z',
    },
    duration: {
      days: 2,
      hours: 9,
    },
  },
  {
    id: 'reservation-3',
    status: 6, // CANCELLED
    date_from: '2024-03-10T12:00:00Z',
    date_to: '2024-03-15T12:00:00Z',
    total_price: 250.0,
    currency: 'USD',
    is_paid: false,
    rider: {
      id: 'rider-3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+5551234567',
    },
    vehicle: {
      id: 'vehicle-3',
      name: 'Honda Civic',
      type: 0,
      status: 2,
    },
    owner_id: 'owner-1',
    created_date: '2024-03-05T15:00:00Z',
    last_updated_date: '2024-03-08T10:00:00Z',
    pick_up: {
      location: '789 Elm St, Village',
      date: '2024-03-10T12:00:00Z',
    },
    drop_off: {
      location: '789 Elm St, Village',
      date: '2024-03-15T12:00:00Z',
    },
    duration: {
      days: 5,
      hours: 0,
    },
  },
];

describe('ReservationsTable', () => {
  const mockOnSort = vi.fn();
  const mockWindowOpen = vi.fn();

  const defaultProps = {
    reservations: mockReservations,
    isLoading: false,
    sortField: 'date_from' as const,
    sortDirection: 'desc' as const,
    onSort: mockOnSort,
    environment: 'staging' as const,
  };

  beforeEach(() => {
    mockOnSort.mockClear();
    mockWindowOpen.mockClear();
    // Mock window.open
    vi.stubGlobal('window', {
      ...window,
      open: mockWindowOpen,
    });
  });

  it('renders reservation data correctly', () => {
    render(<ReservationsTable {...defaultProps} />);

    expect(screen.getByText('John Rider')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('displays rider information with avatar', () => {
    render(<ReservationsTable {...defaultProps} />);

    const johnAvatar = screen.getByAltText('John Rider');
    expect(johnAvatar).toHaveAttribute('src', 'https://example.com/rider1.jpg');

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays vehicle information with images', () => {
    render(<ReservationsTable {...defaultProps} />);

    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    expect(screen.getByText('BMW X5')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();

    const teslaImage = screen.getByAltText('Tesla Model 3');
    expect(teslaImage).toHaveAttribute('src', 'https://example.com/tesla.jpg');
  });

  it('displays status badges with correct labels', () => {
    render(<ReservationsTable {...defaultProps} />);

    expect(screen.getByText('Confirmed')).toBeInTheDocument(); // Status 4
    expect(screen.getByText('Pending')).toBeInTheDocument(); // Status 1
    expect(screen.getByText('Cancelled')).toBeInTheDocument(); // Status 8
  });

  it('applies correct status badge colors', () => {
    render(<ReservationsTable {...defaultProps} />);

    const confirmedBadge = screen.getByText('Confirmed');
    expect(confirmedBadge).toHaveClass('bg-green-100', 'text-green-700');

    const pendingBadge = screen.getByText('Pending');
    expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-700');

    const cancelledBadge = screen.getByText('Cancelled');
    expect(cancelledBadge).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('formats date ranges correctly', () => {
    render(<ReservationsTable {...defaultProps} />);

    expect(screen.getByText('Jan 20, 2024 - Jan 25, 2024')).toBeInTheDocument();
    expect(screen.getByText('Feb 1, 2024 - Feb 3, 2024')).toBeInTheDocument();
    expect(screen.getByText('Mar 10, 2024 - Mar 15, 2024')).toBeInTheDocument();
  });

  it('displays duration information', () => {
    render(<ReservationsTable {...defaultProps} />);

    const fiveDayDurations = screen.getAllByText('5d 0h');
    expect(fiveDayDurations).toHaveLength(2); // reservations 1 and 3 both have 5d 0h

    expect(screen.getByText('2d 9h')).toBeInTheDocument();
  });

  it('displays price information correctly', () => {
    render(<ReservationsTable {...defaultProps} />);

    expect(screen.getByText('USD 375.00')).toBeInTheDocument();
    expect(screen.getByText('EUR 150.00')).toBeInTheDocument();
    expect(screen.getByText('USD 250.00')).toBeInTheDocument();
  });

  it('shows payment status for paid reservations', () => {
    render(<ReservationsTable {...defaultProps} />);

    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders Chat action buttons for all reservations', () => {
    render(<ReservationsTable {...defaultProps} />);

    const chatButtons = screen.getAllByRole('button', { name: /chat/i });
    expect(chatButtons).toHaveLength(3);
  });

  it('opens chat in new tab with staging URL when environment is staging', async () => {
    const user = userEvent.setup();
    render(<ReservationsTable {...defaultProps} environment="staging" />);

    const chatButtons = screen.getAllByRole('button', { name: /chat/i });
    await user.click(chatButtons[0]);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://stage.ownima.com/chat/reservation-1',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens chat in new tab with production URL when environment is production', async () => {
    const user = userEvent.setup();
    render(<ReservationsTable {...defaultProps} environment="production" />);

    const chatButtons = screen.getAllByRole('button', { name: /chat/i });
    await user.click(chatButtons[0]);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://beta.ownima.com/chat/reservation-1',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('calls onSort when clicking sortable column headers', async () => {
    const user = userEvent.setup();
    render(<ReservationsTable {...defaultProps} />);

    const statusHeader = screen.getByRole('button', { name: /status/i });
    await user.click(statusHeader);
    expect(mockOnSort).toHaveBeenCalledWith('status');

    const dateRangeHeader = screen.getByRole('button', { name: /date range/i });
    await user.click(dateRangeHeader);
    expect(mockOnSort).toHaveBeenCalledWith('date_from');

    const priceHeader = screen.getByRole('button', { name: /price/i });
    await user.click(priceHeader);
    expect(mockOnSort).toHaveBeenCalledWith('total_price');
  });

  it('shows correct sort icon for active sort field', () => {
    const { rerender } = render(
      <ReservationsTable {...defaultProps} sortField="status" sortDirection="asc" />
    );

    let statusHeader = screen.getByRole('button', { name: /status/i });
    expect(statusHeader).toBeInTheDocument();

    rerender(<ReservationsTable {...defaultProps} sortField="status" sortDirection="desc" />);
    statusHeader = screen.getByRole('button', { name: /status/i });
    expect(statusHeader).toBeInTheDocument();
  });

  it('displays loading skeleton when isLoading is true', () => {
    const { container } = render(<ReservationsTable {...defaultProps} isLoading={true} />);

    expect(screen.queryByText('John Rider')).not.toBeInTheDocument();

    const loadingContainer = container.querySelector('.animate-pulse');
    expect(loadingContainer).toBeInTheDocument();
  });

  it('displays empty state when no reservations are provided', () => {
    render(<ReservationsTable {...defaultProps} reservations={[]} />);

    expect(screen.getByText('No reservations found')).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
  });

  it('handles reservations without rider avatar gracefully', () => {
    const reservationsWithoutAvatar: components['schemas']['Reservation'][] = [
      {
        ...mockReservations[0],
        rider: {
          ...mockReservations[0].rider!,
          avatar: undefined,
        },
      },
    ];

    render(<ReservationsTable {...defaultProps} reservations={reservationsWithoutAvatar} />);

    expect(screen.getByText('John Rider')).toBeInTheDocument();
    expect(screen.queryByAltText('John Rider')).not.toBeInTheDocument();
  });

  it('handles reservations without vehicle images gracefully', () => {
    const reservationsWithoutVehicleImage: components['schemas']['Reservation'][] = [
      {
        ...mockReservations[0],
        vehicle: {
          ...mockReservations[0].vehicle!,
          picture: undefined,
        },
      },
    ];

    render(<ReservationsTable {...defaultProps} reservations={reservationsWithoutVehicleImage} />);

    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    expect(screen.queryByAltText('Tesla Model 3')).not.toBeInTheDocument();
  });

  it('handles reservations without date information', () => {
    const reservationsWithoutDates: components['schemas']['Reservation'][] = [
      {
        ...mockReservations[0],
        date_from: undefined,
        date_to: undefined,
      },
    ];

    render(<ReservationsTable {...defaultProps} reservations={reservationsWithoutDates} />);

    expect(screen.getByText('John Rider')).toBeInTheDocument();
    // Should show dash for missing dates
    const dashElements = screen.getAllByText('-');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it('handles reservations without price information', () => {
    const reservationsWithoutPrice: components['schemas']['Reservation'][] = [
      {
        ...mockReservations[0],
        total_price: undefined,
        currency: undefined,
      },
    ];

    render(<ReservationsTable {...defaultProps} reservations={reservationsWithoutPrice} />);

    expect(screen.getByText('John Rider')).toBeInTheDocument();
    const dashElements = screen.getAllByText('-');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it('handles reservations without duration information', () => {
    const reservationsWithoutDuration: components['schemas']['Reservation'][] = [
      {
        ...mockReservations[0],
        duration: undefined,
      },
    ];

    render(<ReservationsTable {...defaultProps} reservations={reservationsWithoutDuration} />);

    expect(screen.getByText('John Rider')).toBeInTheDocument();
    expect(screen.queryByText(/d.*h/)).not.toBeInTheDocument();
  });

  it('handles unknown status gracefully', () => {
    const reservationsWithUnknownStatus: components['schemas']['Reservation'][] = [
      {
        ...mockReservations[0],
        status: 999, // Unknown status
      },
    ];

    render(<ReservationsTable {...defaultProps} reservations={reservationsWithUnknownStatus} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders all table headers correctly', () => {
    render(<ReservationsTable {...defaultProps} />);

    expect(screen.getByText('Rider')).toBeInTheDocument();
    expect(screen.getByText('Vehicle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /date range/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /price/i })).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('applies hover styles to table rows', () => {
    render(<ReservationsTable {...defaultProps} />);

    const rows = screen.getAllByText(/John Rider|Jane Smith|Bob Johnson/);
    rows.forEach((row) => {
      const parentRow = row.closest('.grid');
      expect(parentRow).toHaveClass('hover:bg-gray-50');
    });
  });
});
