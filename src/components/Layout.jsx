import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiHome, FiBuilding, FiUsers, FiSearch, FiLogOut, FiShield, FiAlertTriangle, FiGitBranch } = FiIcons;

const Layout = ({ children, title }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Organizations', href: '/organizations', icon: FiBuilding },
    { name: 'Persons', href: '/persons', icon: FiUsers },
    { name: 'Search', href: '/search', icon: FiSearch },
    { name: 'Quick Incident', href: '/incident', icon: FiAlertTriangle },
    { name: 'Relationships', href: '/relationships', icon: FiGitBranch },
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-midnight-900 border-r border-midnight-700">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-midnight-700">
            <SafeIcon icon={FiShield} className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-xl font-bold text-white">Midnight Sentinels</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-midnight-300 hover:bg-midnight-800 hover:text-white'
                  }`}
                >
                  <SafeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-6 border-t border-midnight-700">
            <button
              onClick={logout}
              className="flex items-center px-4 py-3 text-sm font-medium text-midnight-300 rounded-lg hover:bg-midnight-800 hover:text-white transition-colors w-full"
            >
              <SafeIcon icon={FiLogOut} className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <header className="bg-midnight-900 border-b border-midnight-700 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;