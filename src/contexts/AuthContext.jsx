import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// User roles with permissions
export const USER_ROLES = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    image: '/roles/admin.png',
    permissions: {
      canDelete: true,
      canCreateOrganizations: true,
      canSearchPersons: true,
      canViewPersonDetails: true,
      canManageJournals: true,
      canManageShips: true,
      canManageUsers: true,
      canManageManufacturers: true
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('midnight-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('midnight-user');
      }
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ALWAYS SUCCESS - accept any input
    const userData = {
      id: 'admin-123',
      email: email || 'admin@midnight.com',
      role: 'admin'
    };
    
    setUser(userData);
    localStorage.setItem('midnight-user', JSON.stringify(userData));
    setLoading(false);
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('midnight-user');
  };

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    const roleData = USER_ROLES[user.role.toUpperCase()];
    return roleData?.permissions[permission] || false;
  };

  const getUserRole = () => {
    if (!user || !user.role) return null;
    return USER_ROLES[user.role.toUpperCase()];
  };

  const updateUserRole = () => {
    // Mock function
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPermission,
    getUserRole,
    updateUserRole,
    USER_ROLES,
    supabaseConnected: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};