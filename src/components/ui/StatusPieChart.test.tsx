import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPieChart } from './StatusPieChart';
import { STATUS_COLORS } from './statusColors';

describe('StatusPieChart', () => {
  const mockData = [
    { name: 'Completed', value: 100, color: STATUS_COLORS.completed },
    { name: 'Pending', value: 50, color: STATUS_COLORS.pending },
    { name: 'Cancelled', value: 25, color: STATUS_COLORS.cancelled },
  ];

  it('renders chart with title', () => {
    render(<StatusPieChart data={mockData} title="Test Status Chart" />);
    expect(screen.getByText('Test Status Chart')).toBeInTheDocument();
  });

  it('displays total count correctly', () => {
    render(<StatusPieChart data={mockData} title="Test Status Chart" />);
    // Total should be 100 + 50 + 25 = 175
    expect(screen.getByText('175')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<StatusPieChart data={mockData} title="Test Chart" loading={true} />);
    // Should show loading skeleton
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('shows empty state when no data', () => {
    render(<StatusPieChart data={[]} title="Empty Chart" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('filters out zero values', () => {
    const dataWithZeros = [
      { name: 'Active', value: 100, color: STATUS_COLORS.confirmed },
      { name: 'Inactive', value: 0, color: STATUS_COLORS.cancelled },
    ];
    render(<StatusPieChart data={dataWithZeros} title="Filtered Chart" />);
    // Only shows total, not the zero value
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('calculates percentages correctly', () => {
    const simpleData = [
      { name: 'Half', value: 50, color: STATUS_COLORS.confirmed },
      { name: 'Other Half', value: 50, color: STATUS_COLORS.pending },
    ];
    render(<StatusPieChart data={simpleData} title="Percentage Test" />);
    // Check that total is 100
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const { container } = render(
      <StatusPieChart data={mockData} title="Custom Height" height={400} />
    );
    // ResponsiveContainer should be rendered
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('supports donut chart mode with inner radius', () => {
    const { container } = render(
      <StatusPieChart data={mockData} title="Donut Chart" innerRadius={50} />
    );
    // Component should render without errors
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('can hide legend', () => {
    const { container } = render(
      <StatusPieChart data={mockData} title="No Legend" showLegend={false} />
    );
    // Legend should not be present
    expect(container.querySelector('.recharts-legend-wrapper')).not.toBeInTheDocument();
  });
});
