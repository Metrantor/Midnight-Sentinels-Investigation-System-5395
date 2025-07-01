import React,{useState,useEffect} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {useForm} from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import RoleImageUpload from '../components/RoleImageUpload';
import {useAuth} from '../contexts/AuthContext';
import {useData} from '../contexts/DataContext';

const {FiPlus,FiSettings,FiEdit3,FiX,FiTrash2,FiUser,FiShield,FiEye,FiEyeOff,FiImage}=FiIcons;

const UserManagementPage=()=> {
  const {hasPermission,USER_ROLES,user: currentUser,supabaseConnected,getAllUsers,addUser,updateUser,deleteUser,updateUserRole,getDisplayName,getDisplayEmail}=useAuth();
  const {getCleanFormData}=useData();
  const [users,setUsers]=useState([]);
  const [showUserForm,setShowUserForm]=useState(false);
  const [editingUser,setEditingUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [selectedUser,setSelectedUser]=useState(null);
  const [showRoleModal,setShowRoleModal]=useState(false);
  const [showRoleImageModal,setShowRoleImageModal]=useState(false);
  const [selectedRoleForImage,setSelectedRoleForImage]=useState(null);

  const {register,handleSubmit,reset,formState: {errors}}=useForm();

  useEffect(()=> {
    loadUsers();
  },[]);

  const loadUsers=async ()=> {
    setLoading(true);
    try {
      const allUsers=getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:',error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitUser=async (data)=> {
    try {
      if (editingUser) {
        const result=await updateUser(editingUser.id,data);
        if (result.success) {
          await loadUsers();
          setEditingUser(null);
        } else {
          alert('Error updating user: ' + result.error);
        }
      } else {
        const result=await addUser(data);
        if (result.success) {
          await loadUsers();
        } else {
          alert('Error adding user: ' + result.error);
        }
      }
      reset(getCleanFormData('user'));
      setShowUserForm(false);
    } catch (error) {
      console.error('Error saving user:',error);
      alert('Error saving user: ' + error.message);
    }
  };

  const startEditUser=(user)=> {
    setEditingUser(user);
    reset(user);
    setShowUserForm(true);
  };

  const handleDeleteUser=async (id)=> {
    if (currentUser && currentUser.id===id) {
      alert('You cannot delete your own account!');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const result=await deleteUser(id);
        if (result.success) {
          await loadUsers();
        } else {
          alert('Error deleting user: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting user:',error);
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  const handleRoleChange=async (newRole)=> {
    if (selectedUser) {
      try {
        const result=await updateUserRole(selectedUser.id,newRole);
        if (result.success) {
          await loadUsers();
          setShowRoleModal(false);
          setSelectedUser(null);
        } else {
          alert('Error updating role: ' + result.error);
        }
      } catch (error) {
        console.error('Error updating role:',error);
        alert('Error updating role: ' + error.message);
      }
    }
  };

  const getUserRole=(roleId)=> {
    return USER_ROLES[roleId.toUpperCase()];
  };

  const openRoleModal=(user)=> {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const openRoleImageModal=(roleId)=> {
    setSelectedRoleForImage(roleId);
    setShowRoleImageModal(true);
  };

  const handleImageUploaded=()=> {
    // Reload to show new image
    window.location.reload();
  };

  if (!hasPermission('canManageUsers')) {
    return (
      <Layout title="User Management">
        <div className="text-center py-12">
          <SafeIcon icon={FiSettings} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-midnight-400 mb-2">Access Denied</h3>
          <p className="text-midnight-500">You don't have permission to manage users</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="User Management">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-midnight-400">Loading users...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-midnight-300">
              Manage user accounts and roles
            </h3>
            <p className="text-midnight-400 text-sm mt-1">
              {users.length} users registered • {supabaseConnected ? '🟢 Supabase' : '🟡 Local Storage'}
            </p>
          </div>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            onClick={()=> setShowUserForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add User</span>
          </motion.button>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user)=> {
            const role=getUserRole(user.role);
            const isCurrentUser=currentUser && currentUser.id===user.id;
            return (
              <motion.div
                key={user.id}
                initial={{opacity: 0,scale: 0.95}}
                animate={{opacity: 1,scale: 1}}
                className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {role?.image ? (
                      <img
                        src={role.image}
                        alt={role.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="bg-blue-600 rounded-lg p-2">
                        <SafeIcon icon={FiUser} className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {getDisplayEmail(user)}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </p>
                      {hasPermission('canViewSensitiveData') && (
                        <p className="text-midnight-300 text-sm">{user.real_name}</p>
                      )}
                      <p className="text-midnight-400 text-sm">ID: {String(user.id).substring(0,8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={()=> startEditUser(user)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                      title="Edit User"
                    >
                      <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                    </button>
                    {!isCurrentUser && (
                      <button
                        onClick={()=> handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Delete User"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Role Display */}
                <div
                  onClick={()=> openRoleModal(user)}
                  className="mb-4 p-3 bg-midnight-800 rounded-lg cursor-pointer hover:bg-midnight-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiShield} className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">
                        {role?.name || user.role}
                      </span>
                    </div>
                    <SafeIcon icon={FiEdit3} className="w-3 h-3 text-midnight-400" />
                  </div>
                </div>

                {/* Permissions Preview - FIXED HEIGHT NO SCROLLBARS */}
                <div className="space-y-2">
                  <p className="text-midnight-400 text-xs font-medium">Key Permissions:</p>
                  <div className="min-h-[120px]">
                    <div className="flex flex-wrap gap-1">
                      {role && Object.entries(role.permissions)
                        .filter(([,allowed])=> allowed)
                        .slice(0,6)
                        .map(([permission])=> (
                          <span
                            key={permission}
                            className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs"
                          >
                            {permission.replace(/([A-Z])/g,' $1').toLowerCase()}
                          </span>
                        ))}
                      {role && Object.values(role.permissions).filter(Boolean).length > 6 && (
                        <span className="text-midnight-400 text-xs">
                          +{Object.values(role.permissions).filter(Boolean).length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 pt-3 border-t border-midnight-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-midnight-400">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    <div className={`flex items-center space-x-1 ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {users.length===0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiSettings} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No users found</h3>
            <p className="text-midnight-500">Start by adding your first user</p>
          </div>
        )}

        {/* Role Permissions Overview - FIXED HEIGHT NO SCROLLBARS */}
        <div className="bg-midnight-900 rounded-xl border border-midnight-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <SafeIcon icon={FiShield} className="w-5 h-5 mr-2" />
              Role Permissions Overview
            </h4>
            {hasPermission('canUploadRoleImages') && (
              <button
                onClick={()=> setShowRoleImageModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <SafeIcon icon={FiImage} className="w-3 h-3" />
                <span>Manage Images</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(USER_ROLES).map((role)=> (
              <div key={role.id} className="bg-midnight-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <SafeIcon icon={FiShield} className="w-3 h-3 text-white" />
                  </div>
                  <h5 className="font-semibold text-white">{role.name}</h5>
                  {hasPermission('canUploadRoleImages') && (
                    <button
                      onClick={()=> openRoleImageModal(role.id)}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                      title="Update Role Image"
                    >
                      <SafeIcon icon={FiImage} className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {/* FIXED HEIGHT - NO SCROLLBARS */}
                <div className="min-h-[280px]">
                  <div className="space-y-1">
                    {Object.entries(role.permissions).map(([permission,allowed])=> (
                      <div key={permission} className="flex items-center justify-between text-sm">
                        <span className="text-midnight-300 text-xs">
                          {permission.replace(/([A-Z])/g,' $1').toLowerCase()}
                        </span>
                        <span className={allowed ? 'text-green-400' : 'text-red-400'}>
                          {allowed ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      <AnimatePresence>
        {showUserForm && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{scale: 0.95,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.95,opacity: 0}}
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-md border border-midnight-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingUser ? 'Edit User' : 'Add User'}
                </h3>
                <button
                  onClick={()=> {
                    setShowUserForm(false);
                    setEditingUser(null);
                    reset(getCleanFormData('user'));
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitUser)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Email *
                  </label>
                  <input
                    {...register('email',{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Real Name *
                  </label>
                  <input
                    {...register('real_name',{required: 'Real name is required'})}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter real name"
                  />
                  {errors.real_name && (
                    <p className="mt-1 text-sm text-red-400">{errors.real_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Role *
                  </label>
                  <select
                    {...register('role',{required: 'Role is required'})}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    {Object.values(USER_ROLES).map(role=> (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={()=> {
                      setShowUserForm(false);
                      setEditingUser(null);
                      reset(getCleanFormData('user'));
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingUser ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Change Modal */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{scale: 0.95,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.95,opacity: 0}}
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-2xl border border-midnight-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Change Role for {getDisplayEmail(selectedUser)}
                </h3>
                <button
                  onClick={()=> {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(USER_ROLES).map((role)=> (
                  <div
                    key={role.id}
                    onClick={()=> handleRoleChange(role.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedUser.role===role.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-midnight-600 hover:border-midnight-500 hover:bg-midnight-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {role.image ? (
                        <img
                          src={role.image}
                          alt={role.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <SafeIcon icon={FiShield} className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-white font-semibold">{role.name}</h4>
                        <p className="text-midnight-400 text-xs">
                          {Object.values(role.permissions).filter(Boolean).length} permissions
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-midnight-300">
                      Key permissions: {Object.entries(role.permissions)
                        .filter(([,allowed])=> allowed)
                        .slice(0,2)
                        .map(([permission])=> permission.replace(/([A-Z])/g,' $1').toLowerCase())
                        .join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Image Upload Modal */}
      <AnimatePresence>
        {showRoleImageModal && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{scale: 0.95,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.95,opacity: 0}}
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-4xl border border-midnight-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Manage Role Images
                </h3>
                <button
                  onClick={()=> {
                    setShowRoleImageModal(false);
                    setSelectedRoleForImage(null);
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(USER_ROLES).map((role)=> (
                  <div key={role.id} className="bg-midnight-800 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-4">{role.name}</h4>
                    <RoleImageUpload
                      roleId={role.id}
                      currentImageUrl={role.image}
                      onImageUploaded={handleImageUploaded}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default UserManagementPage;