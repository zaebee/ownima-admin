import React, { useState } from 'react';
import clsx from 'clsx';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { MetricRow } from './MetricRow';
import type { MetricRowData } from '../../types';

interface MetricBlockProps {
  title: string;
  icon: React.ElementType;
  metrics: MetricRowData[];
  color: 'blue' | 'green' | 'purple';
  loading?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  liveIndicator?: boolean;
}

const colorThemes = {
  blue: {
    gradient: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    header: 'bg-blue-500',
    icon: 'text-white',
    title: 'text-blue-900',
    accent: 'from-blue-400 to-blue-600'
  },
  green: {
    gradient: 'from-green-50 to-green-100',
    border: 'border-green-200',
    header: 'bg-green-500',
    icon: 'text-white',
    title: 'text-green-900',
    accent: 'from-green-400 to-green-600'
  },
  purple: {
    gradient: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    header: 'bg-purple-500',
    icon: 'text-white',
    title: 'text-purple-900',
    accent: 'from-purple-400 to-purple-600'
  }
};

export const MetricBlock: React.FC<MetricBlockProps> = ({
  title,
  icon: Icon,
  metrics,
  color,
  loading = false,
  collapsible = true,
  defaultExpanded = true,
  liveIndicator = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const theme = colorThemes[color];

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={clsx(
      'bg-white rounded-2xl shadow-lg border transition-all duration-300',
      theme.border,
      'hover:shadow-xl',
      !isExpanded && 'hover:shadow-lg'
    )}>
      {/* Header */}
      <div
        className={clsx(
          'flex items-center justify-between p-6 bg-gradient-to-r',
          theme.gradient,
          'rounded-t-2xl',
          collapsible && 'cursor-pointer hover:opacity-90'
        )}
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div className={clsx(
            'p-3 rounded-xl shadow-sm',
            theme.header
          )}>
            <Icon className={clsx('w-6 h-6', theme.icon)} />
          </div>

          {/* Title */}
          <div>
            <h3 className={clsx('text-xl font-bold', theme.title)}>
              {title}
            </h3>
            {liveIndicator && (
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-600">
                  Live data
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Collapse indicator */}
        {collapsible && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {metrics.length} metrics
            </span>
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-600" />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={clsx(
        'transition-all duration-300 overflow-hidden',
        isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="p-6 pt-0">
          {/* Metrics list */}
          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <MetricRow
                key={`${metric.label}-${index}`}
                {...metric}
                loading={loading}
              />
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && metrics.length === 0 && (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={clsx(
        'h-1 bg-gradient-to-r rounded-b-2xl',
        theme.accent
      )} />
    </div>
  );
};