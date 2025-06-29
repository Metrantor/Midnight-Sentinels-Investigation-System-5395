import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { FiPlus, FiSettings, FiEdit3, FiX, FiTrash2, FiUser, FiShield } = FiIcons;

const UserManagementPage = () => {
  const { hasPermission, USER_ROLES, updateUserRole, user: currentUser, supabaseConnected } = useAuth();
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadUsers();
  }, [supabaseConnected]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (supabaseConnected) {
        const { data, error } = await supabase
          .from('users_ms2024')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setUsers(data || []);
        
        // If no users exist, create demo users
        if (!data || data.length === 0) {
          await initializeDemoUsers();
        }
      } else {
        loadUsersFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading users:', error);
      loadUsersFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadUsersFromLocalStorage = () => {
    const storedUsers = localStorage.getItem('midnight-users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error('Error loading users:', error);
        initializeDemoUsersLocal();
      }
    } else {
      initializeDemoUsersLocal();
    }
  };

  const initializeDemoUsers = async () => {
    const demoUsers = [
      { 
        id: currentUser?.id || crypto.randomUUID(), 
        email: currentUser?.email || 'admin@midnight.com', 
        role: 'admin', 
        created_at: new Date().toISOString() 
      },
      { 
        id: crypto.randomUUID(), 
        email: 'judge@midnight.com', 
        role: 'judge', 
        created_at: new Date().toISOString() 
      },
      { 
        id: crypto.randomUUID(), 
        email: 'bounty@midnight.com', 
        role: 'bounty_hunter', 
        created_at: new Date().toISOString() 
      },
      { 
        id: crypto.randomUUID(), 
        email: 'legal@midnight.com', 
        role: 'legal_authority', 
        created_at: new Date().toISOString() 
      },
      { 
        id: crypto.randomUUID(), 
        email: 'citizen@midnight.com', 
        role: 'citizen', 
        created_at: new Date().toISOString() 
      }
    ];

    if (supabaseConnected) {
      try {
        const { error } = await supabase
          .from('users_ms2024')
          .insert(demoUsers);
        
        if (error) throw error;
        setUsers(demoUsers);
      } catch (error) {
        console.error('Error creating demo users:', error);
        initializeDemoUsersLocal();
      }
    } else {
      initializeDemoUsersLocal();
    }
  };

  const initializeDemoUsersLocal = () => {
    const demoUsers = [
      { 
        id: currentUser?.id || 1, 
        email: currentUser?.email || 'admin@midnight.com', 
        role: 'admin', 
        created_at: new Date().toISOString() 
      },
      { 
        id: 2, 
        email: 'judge@midnight.com', 
        role: 'judge', 
        created_at: new Date().toISOString() 
      },
      { 
        id: 3, 
        email: 'bounty@midnight.com', 
        role: 'bounty_hunter', 
        created_at: new Date().toISOString() 
      },
      { 
        id: 4, 
        email: 'legal@midnight.com', 
        role: 'legal_authority', 
        created_at: new Date().toISOString() 
      },
      { 
        id: 5, 
        email: 'citizen@midnight.com', 
        role: 'citizen', 
        created_at: new Date().toISOString() 
      }
    ];
    setUsers(demoUsers);
    localStorage.setItem('midnight-users', JSON.stringify(demoUsers));
  };

  const onSubmitUser = async (data) => {
    try {
      if (editingUser) {
        const updatedUser = {
          ...data,
          updated_at: new Date().toISOString()
        };

        if (supabaseConnected) {
          const { error } = await supabase
            .from('users_ms2024')
            .update(updatedUser)
            .eq('id', editingUser.id);
          
          if (error) throw error;
        }

        const updatedUsers = users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...updatedUser }
            : user
        );
        setUsers(updatedUsers);
        
        if (!supabaseConnected) {
          localStorage.setItem('midnight-users', JSON.stringify(updatedUsers));
        }
        
        // Update current user role if editing self
        if (currentUser && currentUser.id === editingUser.id) {
          updateUserRole(editingUser.id, data.role);
        }
        setEditingUser(null);
      } else {
        const newUser = {
          ...data,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        };

        if (supabaseConnected) {
          const { error } = await supabase
            .from('users_ms2024')
            .insert([newUser]);
          
          if (error) throw error;
        }

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        
        if (!supabaseConnected) {
          localStorage.setItem('midnight-users', JSON.stringify(updatedUsers));
        }
      }
      reset();
      setShowUserForm(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user: ' + error.message);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    reset(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = async (id) => {
    if (currentUser && currentUser.id === id) {
      alert('You cannot delete your own account!');
      return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        if (supabaseConnected) {
          const { error } = await supabase
            .from('users_ms2024')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
        }

        const updatedUsers = users.filter(user => user.id !== id);
        setUsers(updatedUsers);
        
        if (!supabaseConnected) {
          localStorage.setItem('midnight-users', JSON.stringify(updatedUsers));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  const getUserRole = (roleId) => {
    return USER_ROLES[roleId.toUpperCase()];
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add User</span>
          </motion.button>
        </div>

        {/* Users Table */}
        <div className="bg-midnight-900 rounded-xl border border-midnight-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-midnight-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-midnight-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-midnight-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-midnight-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-midnight-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-700">
                {users.map((user) => {
                  const role = getUserRole(user.role);
                  const isCurrentUser = currentUser && currentUser.id === user.id;
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-midnight-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-600 rounded-lg p-2">
                            <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.email}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-midnight-400 text-sm">ID: {String(user.id).substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <SafeIcon icon={FiShield} className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-white font-medium">
                            {role?.name || user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-midnight-300 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEditUser(user)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit User"
                          >
                            <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete User"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiSettings} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No users found</h3>
            <p className="text-midnight-500">Start by adding your first user</p>
          </div>
        )}

        {/* Role Permissions Overview */}
        <div className="bg-midnight-900 rounded-xl border border-midnight-700 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <SafeIcon icon={FiShield} className="w-5 h-5 mr-2" />
            Role Permissions Overview
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(USER_ROLES).map((role) => (
              <div key={role.id} className="bg-midnight-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <SafeIcon icon={FiShield} className="w-3 h-3 text-white" />
                  </div>
                  <h5 className="font-semibold text-white">{role.name}</h5>
                </div>
                <div className="space-y-1">
                  {Object.entries(role.permissions).map(([permission, allowed]) => (
                    <div key={permission} className="flex items-center justify-between text-sm">
                      <span className="text-midnight-300">
                        {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className={allowed ? 'text-green-400' : 'text-red-400'}>
                        {allowed ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-md border border-midnight-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingUser ? 'Edit User' : 'Add User'}
                </h3>
                <button
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                    reset();
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
                    {...register('email', {
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
                    Role *
                  </label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    {Object.values(USER_ROLES).map(role => (
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
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                      reset();
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
    </Layout>
  );
};

export default UserManagementPage;