import React from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import RoleImageUpload from './RoleImageUpload';
import {useAuth} from '../contexts/AuthContext';

const {FiImage,FiShield} = FiIcons;

const RoleImageManagement = () => {
  const {USER_ROLES, hasPermission} = useAuth();

  if (!hasPermission('canUploadRoleImages')) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiImage} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-midnight-400 mb-2">Access Denied</h3>
        <p className="text-midnight-500">You don't have permission to manage role images</p>
      </div>
    );
  }

  const handleImageUploaded = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
          <SafeIcon icon={FiImage} className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Role Image Management</h3>
        <p className="text-midnight-400">
          Upload and manage images for user roles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(USER_ROLES).map((role) => (
          <motion.div
            key={role.id}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              {role.image ? (
                <img
                  src={role.image}
                  alt={role.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`bg-blue-600 rounded-lg p-2 ${role.image ? 'hidden' : 'flex'}`}>
                <SafeIcon icon={FiShield} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">{role.name}</h4>
                <p className="text-midnight-400 text-sm">Role ID: {role.id}</p>
              </div>
            </div>

            <RoleImageUpload
              roleId={role.id}
              currentImageUrl={role.image}
              onImageUploaded={handleImageUploaded}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoleImageManagement;