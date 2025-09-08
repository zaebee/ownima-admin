import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { betaTesterService } from '../services/betaTesters';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import type { BetaTester } from '../types';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const BetaTestersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['beta-testers', page, search, statusFilter],
    queryFn: () => betaTesterService.getBetaTesters({ 
      page, 
      size: 20, 
      search, 
      status: statusFilter 
    }),
  });

  const approveMutation = useMutation({
    mutationFn: betaTesterService.approveBetaTester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-testers'] });
      queryClient.invalidateQueries({ queryKey: ['beta-tester-stats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: betaTesterService.rejectBetaTester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-testers'] });
      queryClient.invalidateQueries({ queryKey: ['beta-tester-stats'] });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: betaTesterService.bulkApproveBetaTesters,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-testers'] });
      queryClient.invalidateQueries({ queryKey: ['beta-tester-stats'] });
      setSelectedIds([]);
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: betaTesterService.bulkRejectBetaTesters,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-testers'] });
      queryClient.invalidateQueries({ queryKey: ['beta-tester-stats'] });
      setSelectedIds([]);
    },
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data?.items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.items.map(item => item.id) || []);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-2xl"></div>
        <div className="relative p-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-tr from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-pink-800 bg-clip-text text-transparent">
                Beta Testers
              </h1>
              <p className="mt-2 text-xl text-gray-600">
                Review and manage beta tester applications with powerful tools
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search beta testers by name, email, or location..."
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-gray-50 focus:bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter(undefined)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                statusFilter === undefined
                  ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                statusFilter === 'pending'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                statusFilter === 'approved'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                statusFilter === 'rejected'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-blue-900">
                  {selectedIds.length} application{selectedIds.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-blue-700">Choose a bulk action to apply</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => bulkApproveMutation.mutate(selectedIds)}
                disabled={bulkApproveMutation.isPending}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                {bulkApproveMutation.isPending ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
                <span>Approve Selected</span>
              </button>
              <button
                onClick={() => bulkRejectMutation.mutate(selectedIds)}
                disabled={bulkRejectMutation.isPending}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                {bulkRejectMutation.isPending ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <XCircleIcon className="w-4 h-4" />
                )}
                <span>Reject Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load beta testers. Please try again.
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {data && data.items.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={selectedIds.length === data.items.length}
                onChange={toggleSelectAll}
              />
              <span className="ml-2 text-sm text-gray-700">Select all</span>
            </label>
          </div>
        )}
        
        <ul role="list" className="divide-y divide-gray-200">
          {data?.items.map((betaTester: BetaTester) => (
            <li key={betaTester.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={selectedIds.includes(betaTester.id)}
                      onChange={() => toggleSelection(betaTester.id)}
                    />
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {betaTester.first_name && betaTester.last_name 
                            ? `${betaTester.first_name} ${betaTester.last_name}`
                            : betaTester.email
                          }
                        </p>
                        <div className="ml-2">{getStatusBadge(betaTester.status)}</div>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <p className="text-sm text-gray-500">{betaTester.email}</p>
                        {betaTester.location && (
                          <p className="text-sm text-gray-500">📍 {betaTester.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {betaTester.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(betaTester.id)}
                          isLoading={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => rejectMutation.mutate(betaTester.id)}
                          isLoading={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <div className="text-right text-sm text-gray-500">
                      Applied {formatDate(betaTester.applied_at)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {data?.items.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No beta testers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{data.pages}</span> ({data.total} total applications)
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};