import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink' | 'gray';
  size?: 'small' | 'medium' | 'large';
  clickable?: boolean;
  href?: string;
  onClick?: () => void;
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
    accent: 'from-blue-400 to-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'bg-green-500',
    text: 'text-green-600',
    accent: 'from-green-400 to-green-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'bg-yellow-500',
    text: 'text-yellow-600',
    accent: 'from-yellow-400 to-yellow-600'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'bg-red-500',
    text: 'text-red-600',
    accent: 'from-red-400 to-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'bg-purple-500',
    text: 'text-purple-600',
    accent: 'from-purple-400 to-purple-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'bg-indigo-500',
    text: 'text-indigo-600',
    accent: 'from-indigo-400 to-indigo-600'
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    icon: 'bg-pink-500',
    text: 'text-pink-600',
    accent: 'from-pink-400 to-pink-600'
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'bg-gray-500',
    text: 'text-gray-600',
    accent: 'from-gray-400 to-gray-600'
  }
};

const sizeClasses = {
  small: {
    container: 'p-4',
    icon: 'w-8 h-8 p-2',
    iconWrapper: 'w-10 h-10',
    value: 'text-xl',
    title: 'text-sm'
  },
  medium: {
    container: 'p-6',
    icon: 'w-10 h-10 p-2.5',
    iconWrapper: 'w-12 h-12',
    value: 'text-2xl',
    title: 'text-base'
  },
  large: {
    container: 'p-8',
    icon: 'w-12 h-12 p-3',
    iconWrapper: 'w-16 h-16',
    value: 'text-3xl',
    title: 'text-lg'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  size = 'medium',
  clickable = false,
  href,
  onClick,
  loading = false
}) => {
  const colorClass = colorClasses[color];
  const sizeClass = sizeClasses[size];

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
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

  const CardContent = () => (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border transition-all duration-200',
        colorClass.bg,
        colorClass.border,
        clickable && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        sizeClass.container
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${colorClass.accent} rounded-full transform translate-x-8 -translate-y-8`} />
      </div>

      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={clsx('rounded-xl shadow-sm', colorClass.icon, sizeClass.iconWrapper)}>
            <Icon className={clsx('text-white', sizeClass.icon)} />
          </div>
          {trend && (
            <div className={clsx('px-2 py-1 rounded-full text-xs font-medium', getTrendColor(trend.direction))}>
              {getTrendIcon(trend.direction)} {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          {loading ? (
            <div className={clsx('bg-gray-200 rounded animate-pulse', sizeClass.value === 'text-3xl' ? 'h-8' : sizeClass.value === 'text-2xl' ? 'h-7' : 'h-6', 'w-20')} />
          ) : (
            <div className={clsx('font-bold text-gray-900', sizeClass.value)}>
              {formatValue(value)}
            </div>
          )}
        </div>

        {/* Title */}
        <div className={clsx('font-semibold text-gray-700 mb-1', sizeClass.title)}>
          {title}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
        )}

        {/* Trend label */}
        {trend && trend.label && (
          <p className="text-xs text-gray-500 mt-2">
            {trend.label}
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass.accent}`} />
    </div>
  );

  if (href) {
    return (
      <Link to={href}>
        <CardContent />
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        <CardContent />
      </button>
    );
  }

  return <CardContent />;
};