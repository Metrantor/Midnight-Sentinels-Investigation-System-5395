import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiHome, FiBuilding, FiUsers, FiSearch, FiLogOut, FiShield, FiAlertTriangle, FiGitBranch, FiTool, FiAnchor, FiSettings, FiUserCheck, FiX, FiEye } = FiIcons;

const Layout = ({ children, title }) => {
  const location = useLocation();
  const { logout, hasPermission, getUserRole, user, originalUser, getAllUsers, impersonateUser, stopImpersonation } = useAuth();
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  
  const userRole = getUserRole();
  const allUsers = getAllUsers();
  const canImpersonate = user?.is_master_user && hasPermission('canImpersonateUsers');

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome, requiredPermission: null },
    { name: 'Assessments', href: '/assessments', icon: FiShield, requiredPermission: 'canAssessDangerLevel' },
    { name: 'Organizations', href: '/organizations', icon: FiBuilding, requiredPermission: 'canCreateOrganizations' },
    { name: 'Persons', href: '/persons', icon: FiUsers, requiredPermission: 'canSearchPersons' },
    { name: 'Search', href: '/search', icon: FiSearch, requiredPermission: 'canSearchPersons' },
    { name: 'Quick Incident', href: '/incident', icon: FiAlertTriangle, requiredPermission: 'canManageJournals' },
    { name: 'Relationships', href: '/relationships', icon: FiGitBranch, requiredPermission: 'canCreateOrganizations' },
    { name: 'Manufacturers', href: '/manufacturers', icon: FiTool, requiredPermission: 'canManageManufacturers' },
    { name: 'Ships', href: '/ships', icon: FiAnchor, requiredPermission: 'canManageShips' },
    { name: 'User Management', href: '/users', icon: FiSettings, requiredPermission: 'canManageUsers' }
  ];

  const filteredNavigation = navigation.filter(item =>
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  const handleImpersonate = (targetUser) => {
    try {
      impersonateUser(targetUser);
      setShowImpersonationModal(false);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleStopImpersonation = () => {
    stopImpersonation();
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-midnight-900 border-r border-midnight-700">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-midnight-700">
            <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-600 rounded">
              <SafeIcon icon={FiShield} className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Midnight Sentinels</h1>
          </div>

          {/* 🔥 NEW: Impersonation Status */}
          {originalUser && (
            <div className="px-6 py-4 border-b border-midnight-700 bg-orange-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiEye} className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 text-sm font-medium">Impersonating</span>
                </div>
                <button
                  onClick={handleStopImpersonation}
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                  title="Stop Impersonation"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </div>
              <p className="text-orange-200 text-xs mt-1">
                Viewing as: {user?.real_name}
              </p>
            </div>
          )}

          {/* User Role */}
          {userRole && (
            <div className="px-6 py-4 border-b border-midnight-700">
              <div className="flex items-center space-x-3">
                {userRole.image ? (
                  <img
                    src={userRole.image}
                    alt={userRole.name}
                    className="w-8 h-8 rounded object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ${userRole.image ? 'hidden' : 'flex'}`}>
                  <SafeIcon icon={FiShield} className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{userRole.name}</p>
                  <p className="text-xs text-midnight-400">
                    {Object.values(userRole.permissions).filter(Boolean).length} permissions
                  </p>
                </div>
              </div>

              {/* 🔥 NEW: Impersonation Button for Master Users */}
              {canImpersonate && !originalUser && (
                <button
                  onClick={() => setShowImpersonationModal(true)}
                  className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <SafeIcon icon={FiUserCheck} className="w-3 h-3" />
                  <span>Impersonate User</span>
                </button>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {userRole && (
              <div className="flex items-center space-x-2 text-midnight-400">
                <SafeIcon icon={FiShield} className="w-4 h-4" />
                <span className="text-sm">{userRole.name}</span>
                {originalUser && (
                  <span className="text-orange-400 text-xs">(Impersonating)</span>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>

      {/* 🔥 NEW: Impersonation Modal */}
      <AnimatePresence>
        {showImpersonationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-2xl border border-midnight-700 max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Impersonate User</h3>
                <button
                  onClick={() => setShowImpersonationModal(false)}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-orange-900/30 border border-orange-500 rounded-lg">
                <p className="text-orange-200 text-sm">
                  ⚠️ You will experience the application as the selected user with their permissions and restrictions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allUsers
                  .filter(u => u.id !== user?.id && u.is_active)
                  .map((targetUser) => {
                    const targetRole = getUserRole({ role: targetUser.role });
                    return (
                      <div
                        key={targetUser.id}
                        onClick={() => handleImpersonate(targetUser)}
                        className="p-4 border border-midnight-600 rounded-lg hover:border-midnight-500 hover:bg-midnight-800 transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          {targetRole?.image ? (
                            <img
                              src={targetRole.image}
                              alt={targetRole.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <SafeIcon icon={FiShield} className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{targetUser.real_name}</p>
                            <p className="text-midnight-400 text-sm">{targetRole?.name}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;