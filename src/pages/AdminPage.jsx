import React,{useState} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import UserManagementPage from './UserManagementPage';
import ManufacturersPage from './ManufacturersPage';
import RoleImageManagement from '../components/RoleImageManagement';
import {useAuth} from '../contexts/AuthContext';

const {FiSettings,FiUsers,FiTool,FiImage,FiShield} = FiIcons;

const AdminPage = () => {
  const {hasPermission} = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  if (!hasPermission('canManageUsers')) {
    return (
      <Layout title="Admin Panel">
        <div className="text-center py-12">
          <SafeIcon icon={FiShield} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-midnight-400 mb-2">Access Denied</h3>
          <p className="text-midnight-500">You don't have permission to access the admin panel</p>
        </div>
      </Layout>
    );
  }

  const adminSections = [
    {
      id: 'overview',
      name: 'Overview',
      icon: FiSettings,
      description: 'Admin panel overview and system status'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: FiUsers,
      description: 'Manage user accounts, roles, and permissions'
    },
    {
      id: 'manufacturers',
      name: 'Manufacturers',
      icon: FiTool,
      description: 'Manage ship manufacturers and models'
    },
    {
      id: 'role-images',
      name: 'Role Images',
      icon: FiImage,
      description: 'Upload and manage role images'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagementPage />;
      case 'manufacturers':
        return <ManufacturersPage />;
      case 'role-images':
        return <RoleImageManagement />;
      default:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <SafeIcon icon={FiSettings} className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Admin Panel</h3>
              <p className="text-midnight-400">
                Manage system settings, users, and administrative functions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.slice(1).map((section) => (
                <motion.div
                  key={section.id}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  whileHover={{scale: 1.02}}
                  onClick={() => setActiveSection(section.id)}
                  className="bg-midnight-900 rounded-xl p-6 border border-midnight-700 cursor-pointer hover:border-midnight-600 transition-all"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-600 rounded-lg p-3">
                      <SafeIcon icon={section.icon} className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white">{section.name}</h4>
                  </div>
                  <p className="text-midnight-300 text-sm">{section.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-midnight-900 rounded-xl p-6 border border-midnight-700">
              <h4 className="text-lg font-semibold text-white mb-4">System Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-midnight-800 rounded-lg p-4">
                  <h5 className="text-midnight-300 text-sm mb-1">Database</h5>
                  <p className="text-white font-medium">Connected</p>
                </div>
                <div className="bg-midnight-800 rounded-lg p-4">
                  <h5 className="text-midnight-300 text-sm mb-1">Environment</h5>
                  <p className="text-white font-medium">Production</p>
                </div>
                <div className="bg-midnight-800 rounded-lg p-4">
                  <h5 className="text-midnight-300 text-sm mb-1">Version</h5>
                  <p className="text-white font-medium">1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout title="Admin Panel">
      <div className="space-y-6">
        {/* Section Navigation */}
        <div className="bg-midnight-900 rounded-xl border border-midnight-700 p-4">
          <div className="flex flex-wrap gap-2">
            {adminSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-midnight-800 text-midnight-300 hover:text-white hover:bg-midnight-700'
                }`}
              >
                <SafeIcon icon={section.icon} className="w-4 h-4" />
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </Layout>
  );
};

export default AdminPage;