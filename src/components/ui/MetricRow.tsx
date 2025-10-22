import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { MetricRowData } from '../../types';

interface MetricRowProps extends MetricRowData {
  loading?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  blue: 'text-blue-600 bg-blue-50',
  green: 'text-green-600 bg-green-50',
  purple: 'text-purple-600 bg-purple-50',
  yellow: 'text-yellow-600 bg-yellow-50',
  red: 'text-red-600 bg-red-50',
  gray: 'text-gray-600 bg-gray-50',
};

const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up':
      return '↗';
    case 'down':
      return '↘';
    default:
      return '→';
  }
};

const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up':
      return 'text-green-600 bg-green-100';
    case 'down':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const formatValue = (value: string | number): string => {
  return value.toLocaleString();
};

export const MetricRow: React.FC<MetricRowProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  href,
  color = 'gray',
  loading = false,
  onClick,
}) => {
  const RowContent = () => (
    <div
      className={clsx(
        'flex items-center justify-between py-3 px-4 rounded-lg transition-all duration-200',
        'hover:bg-gray-50',
        href || onClick ? 'cursor-pointer hover:shadow-sm' : '',
        loading && 'animate-pulse'
      )}
    >
      {/* Left side: Icon + Label */}
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className={clsx('p-2 rounded-lg', colorClasses[color])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>

      {/* Right side: Value + Trend */}
      <div className="flex items-center space-x-3">
        {/* Trend indicator */}
        {trend && !loading && (
          <div
            className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              getTrendColor(trend.direction)
            )}
          >
            {getTrendIcon(trend.direction)} {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </div>
        )}

        {/* Value */}
        {loading ? (
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        ) : (
          <span className="text-lg font-bold text-gray-900">{formatValue(value)}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        <RowContent />
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        <RowContent />
      </button>
    );
  }

  return <RowContent />;
};
