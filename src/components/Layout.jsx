import React,{useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useAuth} from '../contexts/AuthContext';

const {FiHome,FiBuilding,FiUsers,FiSearch,FiLogOut,FiShield,FiAlertTriangle,FiGitBranch,FiTool,FiAnchor,FiSettings,FiUserCheck,FiX,FiEye,FiList,FiTrash2,FiMessageSquare,FiGavel}=FiIcons;

const Layout=({children,title})=> {
  const location=useLocation();
  const {logout,hasPermission,getUserRole,user,originalUser,stopImpersonation}=useAuth();
  
  const userRole=getUserRole();
  const isSentinel=user?.role==='sentinel';

  const clearLocalStorage=()=> {
    if (confirm('⚠️ Are you sure you want to clear ALL local storage data? This will remove all cached data and settings.')) {
      try {
        localStorage.removeItem('midnight-user');
        localStorage.removeItem('midnight-original-user');
        localStorage.removeItem('midnight-users');
        alert('✅ Local storage cleared successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing local storage:',error);
        alert('❌ Error clearing local storage: ' + error.message);
      }
    }
  };

  const handleStopImpersonation=()=> {
    stopImpersonation();
  };

  const navigation=[ 
    {name: 'Dashboard',href: '/',icon: FiHome,requiredPermission: null},
    {name: 'Assessments',href: '/assessments',icon: FiShield,requiredPermission: 'canAssessDangerLevel'},
    {name: 'Organizations',href: '/organizations',icon: FiBuilding,requiredPermission: 'canCreateOrganizations'},
    {name: 'Persons',href: '/persons',icon: FiUsers,requiredPermission: 'canSearchPersons'},
    {name: 'Search',href: '/search',icon: FiSearch,requiredPermission: 'canSearchPersons'},
    {name: user?.role==='citizen' ? 'Report Incident' : 'Report Incident',href: '/incident',icon: FiAlertTriangle,requiredPermission: null},
    {name: 'Incidents List',href: '/incidents',icon: FiList,requiredPermission: null},
    {name: 'Hearings',href: '/hearings',icon: FiGavel,requiredPermission: null},
    {name: 'Relationships',href: '/relationships',icon: FiGitBranch,requiredPermission: 'canCreateOrganizations'},
    {name: 'Ships',href: '/ships',icon: FiAnchor,requiredPermission: 'canManageShips'},
    {name: 'Admin Panel',href: '/admin',icon: FiSettings,requiredPermission: 'canManageUsers'}
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

          {/* Impersonation Status */}
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
                  <p className="text-sm font-medium text-white">{user?.real_name}</p>
                  <p className="text-xs text-midnight-400">{userRole.name}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <button
                  onClick={logout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <SafeIcon icon={FiLogOut} className="w-3 h-3" />
                  <span>Logout</span>
                </button>
                {isSentinel && (
                  <button
                    onClick={clearLocalStorage}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                    title="Clear all local storage data"
                  >
                    <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                    <span>Clear Local Data</span>
                  </button>
                )}
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
    </div>
  );
};

export default Layout;