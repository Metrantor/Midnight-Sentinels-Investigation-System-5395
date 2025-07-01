import React from 'react';
import {Link,useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useAuth} from '../contexts/AuthContext';

const {FiHome,FiBuilding,FiUsers,FiSearch,FiLogOut,FiShield,FiAlertTriangle,FiGitBranch,FiTool,FiAnchor,FiSettings}=FiIcons;

const Layout=({children,title})=> {
  const location=useLocation();
  const {logout,hasPermission,getUserRole}=useAuth();
  const userRole=getUserRole();

  const navigation=[
    {name: 'Dashboard',href: '/',icon: FiHome,requiredPermission: null},
    {name: 'Assessments',href: '/assessments',icon: FiShield,requiredPermission: 'canAssessDangerLevel'},
    {name: 'Organizations',href: '/organizations',icon: FiBuilding,requiredPermission: 'canCreateOrganizations'},
    {name: 'Persons',href: '/persons',icon: FiUsers,requiredPermission: 'canSearchPersons'},
    {name: 'Search',href: '/search',icon: FiSearch,requiredPermission: 'canSearchPersons'},
    {name: 'Quick Incident',href: '/incident',icon: FiAlertTriangle,requiredPermission: 'canManageJournals'},
    {name: 'Relationships',href: '/relationships',icon: FiGitBranch,requiredPermission: 'canCreateOrganizations'},
    {name: 'Manufacturers',href: '/manufacturers',icon: FiTool,requiredPermission: 'canManageManufacturers'},
    {name: 'Ships',href: '/ships',icon: FiAnchor,requiredPermission: 'canManageShips'},
    {name: 'User Management',href: '/users',icon: FiSettings,requiredPermission: 'canManageUsers'}
  ];

  const filteredNavigation=navigation.filter(item=>
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

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

          {/* User Role */}
          {userRole && (
            <div className="px-6 py-4 border-b border-midnight-700">
              <div className="flex items-center space-x-3">
                {userRole.image ? (
                  <img
                    src={userRole.image}
                    alt={userRole.name}
                    className="w-8 h-8 rounded object-cover"
                    onError={(e)=> {
                      e.target.style.display='none';
                      e.target.nextSibling.style.display='flex';
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
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item)=> {
              const isActive=location.pathname===item.href;
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
              </div>
            )}
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;