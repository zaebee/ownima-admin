import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface StatusPieChartProps {
  data: StatusData[];
  title: string;
  loading?: boolean;
  showLegend?: boolean;
  innerRadius?: number; // For donut charts
  height?: number;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: {
    fill: string;
    percentage: string;
  };
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{data.name}</p>
        <p className="text-lg font-bold" style={{ color: data.payload.fill }}>
          {data.value.toLocaleString()}
        </p>
        {data.payload.percentage && (
          <p className="text-xs text-gray-600">{data.payload.percentage}</p>
        )}
      </div>
    );
  }
  return null;
};

export const StatusPieChart: React.FC<StatusPieChartProps> = ({
  data,
  title,
  loading = false,
  showLegend = true,
  innerRadius = 0,
  height = 300,
}) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Enrich data with percentages
  const enrichedData = data.map(item => ({
    ...item,
    percentage: total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%',
  }));

  // Filter out zero values for cleaner visualization
  const nonZeroData = enrichedData.filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="w-48 h-48 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (nonZeroData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={nonZeroData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}`}
            outerRadius={innerRadius > 0 ? 100 : 90}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
          >
            {nonZeroData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={
                ((value: string, entry: unknown) => {
                  const payload = (entry as { payload?: { percentage?: string } })?.payload;
                  const percentage = payload?.percentage || '0%';
                  return (
                    <span className="text-sm text-gray-700">
                      {value} ({percentage})
                    </span>
                  );
                }) as never
              }
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Total count display */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
