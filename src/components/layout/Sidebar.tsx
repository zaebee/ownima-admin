import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ServerIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/overview', icon: HomeIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
  { name: 'Activity', href: '/dashboard/activity', icon: ClockIcon },
  { name: 'System', href: '/dashboard/system', icon: ServerIcon },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed: controlledCollapsed, onToggle }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    if (onToggle) {
      onToggle(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  return (
    <div className={clsx(
      "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
      isCollapsed ? "lg:w-16" : "lg:w-64"
    )}>
      <div className={clsx(
        "flex grow flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 pb-4 overflow-hidden",
        isCollapsed ? "px-2 gap-y-2" : "px-6 gap-y-6"
      )}>
        {/* Header section */}
        <div className={clsx(
          "flex shrink-0 items-center transition-all duration-300",
          isCollapsed ? "h-12 justify-center" : "h-16 justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Ownima</h1>
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={handleToggle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className={clsx(
                isCollapsed ? "space-y-1" : "space-y-2"
              )}>
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        clsx(
                          'group flex rounded-xl text-sm leading-6 font-semibold transition-all duration-200 relative overflow-hidden',
                          isCollapsed ? 'justify-center p-2.5' : 'gap-x-3 p-3',
                          isActive
                            ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/25'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        )
                      }
                      title={isCollapsed ? item.name : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-100"></div>
                          )}
                          <item.icon
                            className={clsx(
                              'shrink-0 transition-colors duration-200 relative z-10',
                              isCollapsed ? 'h-5 w-5' : 'h-6 w-6',
                              isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-400'
                            )}
                            aria-hidden="true"
                          />
                          {!isCollapsed && (
                            <span className="relative z-10">{item.name}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Bottom decoration */}
        {!isCollapsed && (
          <div className="mt-auto pt-4">
            <div className="bg-gradient-to-r from-primary-500/10 to-indigo-500/10 rounded-lg p-4 border border-primary-500/20">
              <p className="text-xs text-gray-400 text-center">
                Admin Dashboard v2.0
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mt-auto pt-2">
            <div className="w-8 h-1 bg-gradient-to-r from-primary-500/20 to-indigo-500/20 rounded-full mx-auto">
            </div>
          </div>
        )}
      </div>
    </div>
  );
};