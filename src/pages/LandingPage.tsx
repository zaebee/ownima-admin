import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background similar to login page */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 right-10 w-16 h-16 bg-white/10 rounded-full blur-xl animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* Logo and branding */}
          <div className="mb-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-primary-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ownima Admin Portal
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Internal administration and user management
            </p>
          </div>

          {/* Main content card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Administration Access
              </h2>
              <p className="text-gray-600 mb-8">
                Secure access to platform administration tools and user management system.
              </p>

              <Link
                to="/login"
                className="group w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <span>Sign In to Admin Panel</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Internal use only • Authorized personnel access required
              </p>
            </div>
          </div>

          {/* Simple footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-blue-200">
              &copy; 2024 Ownima. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};