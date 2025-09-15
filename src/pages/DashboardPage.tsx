import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/users';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  UsersIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const ManagementCard: React.FC<{
  title: string;
  description: string;
  count: number;
  icon: React.ElementType;
  gradient: string;
  lightBg: string;
  to: string;
}> = ({ title, description, count, icon: Icon, gradient, lightBg, to }) => (
  <Link
    to={to}
    className="group relative bg-white overflow-hidden rounded-2xl border border-gray-100/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
  >
    <div className={`absolute inset-0 ${lightBg} opacity-50`}></div>
    <div className="relative p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-tr ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900">
          {count.toLocaleString()} {count === 1 ? 'user' : 'users'}
        </div>
        <div className="h-1 w-12 bg-gradient-to-r from-primary-400 to-indigo-500 rounded-full"></div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
  </Link>
);

export const DashboardPage: React.FC = () => {
  // Query users data
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({ size: 1 }), // Just get count
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const managementCards = [
    {
      title: 'User Management',
      description: 'Manage platform users, view profiles, activate or deactivate accounts',
      count: users?.total || 0,
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-700',
      lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      to: '/dashboard/users',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-indigo-100/50 rounded-2xl"></div>
        <div className="relative p-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            User Management Dashboard
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your platform users with confidence and control.
          </p>
        </div>
      </div>

      {/* Management cards */}
      <div className="grid grid-cols-1 gap-8">
        {managementCards.map((card) => (
          <ManagementCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
};