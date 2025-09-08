import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { betaTesterService } from '../services/betaTesters';
import { userService } from '../services/users';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  UsersIcon,
  UserGroupIcon,
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
  // Query both users and beta testers data
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({ size: 1 }), // Just get count
  });

  const { data: betaStats, isLoading: betaLoading } = useQuery({
    queryKey: ['beta-tester-stats'],
    queryFn: betaTesterService.getBetaTesterStats,
  });

  const isLoading = usersLoading || betaLoading;

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
    {
      title: 'Beta Testers',
      description: 'Review applications, approve or reject beta tester requests',
      count: betaStats?.total_applications || 0,
      icon: UserGroupIcon,
      gradient: 'from-emerald-500 to-green-700',
      lightBg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      to: '/dashboard/beta-testers',
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
            Manage your platform users and beta tester applications with confidence.
          </p>
        </div>
      </div>

      {/* Management cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {managementCards.map((card) => (
          <ManagementCard key={card.title} {...card} />
        ))}
      </div>

      {/* Quick overview */}
      {betaStats && (
        <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500"></div>
          
          <div className="px-8 py-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Beta Tester Applications</h2>
                <p className="mt-2 text-gray-600">Quick overview of pending applications</p>
              </div>
              <div className="p-3 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-2xl">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative p-6 rounded-2xl border border-amber-100/50">
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    {betaStats.pending_applications || 0}
                  </div>
                  <p className="text-gray-600 font-medium">Pending Review</p>
                  {betaStats.pending_applications > 0 && (
                    <Link
                      to="/dashboard/beta-testers?status=pending"
                      className="mt-3 inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800"
                    >
                      Review Now <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative p-6 rounded-2xl border border-emerald-100/50">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                    {betaStats.approved_applications || 0}
                  </div>
                  <p className="text-gray-600 font-medium">Approved</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative p-6 rounded-2xl border border-red-100/50">
                  <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                    {betaStats.rejected_applications || 0}
                  </div>
                  <p className="text-gray-600 font-medium">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};