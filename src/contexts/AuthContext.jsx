import React,{createContext,useContext,useState,useEffect} from 'react';
import {supabase} from '../lib/supabase';

const AuthContext=createContext();

export const useAuth=()=> {
  const context=useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Complete User Roles with Permissions - FIXED ROLE IMAGES
export const USER_ROLES={
  SENTINEL: {
    id: 'sentinel',
    name: 'Sentinel',
    image: null,// Will be loaded from DB
    permissions: {
      canDelete: true,
      canCreateOrganizations: true,
      canSearchPersons: true,
      canViewPersonDetails: true,
      canManageJournals: true,
      canManageShips: true,
      canManageUsers: true,
      canManageManufacturers: true,
      canManageRoles: true,
      canViewAllData: true,
      canExportData: true,
      canManageDatabase: true,
      canViewSensitiveData: true,
      canAssessDangerLevel: true,
      canOverrideAssessments: true,
      canUploadRoleImages: true,
      canManageStatus: true,
      canFinalizeAssessments: true,
      canImpersonateUsers: true // 🔥 NEW: Master user can impersonate
    }
  },
  HIGH_JUDGE: {
    id: 'high_judge',
    name: 'High Judge',
    image: null,
    permissions: {
      canDelete: false,
      canCreateOrganizations: true,
      canSearchPersons: true,
      canViewPersonDetails: true,
      canManageJournals: true,
      canManageShips: false,
      canManageUsers: false,
      canManageManufacturers: false,
      canManageRoles: false,
      canViewAllData: true,
      canExportData: true,
      canManageDatabase: false,
      canViewSensitiveData: false,
      canAssessDangerLevel: true,
      canOverrideJudgeAssessments: true,
      canUploadRoleImages: false,
      canManageStatus: true,
      canConfirmAssessments: true,
      canImpersonateUsers: false
    }
  },
  JUDGE: {
    id: 'judge',
    name: 'Judge',
    image: null,
    permissions: {
      canDelete: false,
      canCreateOrganizations: true,
      canSearchPersons: true,
      canViewPersonDetails: true,
      canManageJournals: true,
      canManageShips: false,
      canManageUsers: false,
      canManageManufacturers: false,
      canManageRoles: false,
      canViewAllData: true,
      canExportData: true,
      canManageDatabase: false,
      canViewSensitiveData: false,
      canAssessDangerLevel: true,
      canOverrideAssessments: false,
      canUploadRoleImages: false,
      canManageStatus: true,
      canConfirmAssessments: true,
      canImpersonateUsers: false
    }
  },
  LEGAL_AUTHORITY: {
    id: 'legal_authority',
    name: 'Legal Authority',
    image: null,
    permissions: {
      canDelete: false,
      canCreateOrganizations: true,
      canSearchPersons: true,
      canViewPersonDetails: true,
      canManageJournals: true,
      canManageShips: false,
      canManageUsers: false,
      canManageManufacturers: false,
      canManageRoles: false,
      canViewAllData: true,
      canExportData: false,
      canManageDatabase: false,
      canViewSensitiveData: false,
      canAssessDangerLevel: false,
      canOverrideAssessments: false,
      canUploadRoleImages: false,
      canManageStatus: false,
      canConfirmAssessments: false,
      canImpersonateUsers: false
    }
  },
  BOUNTY_HUNTER: {
    id: 'bounty_hunter',
    name: 'Bounty Hunter',
    image: null,
    permissions: {
      canDelete: false,
      canCreateOrganizations: false,
      canSearchPersons: true,
      canViewPersonDetails: true,
      canManageJournals: false,
      canManageShips: false,
      canManageUsers: false,
      canManageManufacturers: false,
      canManageRoles: false,
      canViewAllData: false,
      canExportData: false,
      canManageDatabase: false,
      canViewSensitiveData: false,
      canAssessDangerLevel: false,
      canOverrideAssessments: false,
      canUploadRoleImages: false,
      canManageStatus: false,
      canConfirmAssessments: false,
      canImpersonateUsers: false
    }
  },
  CITIZEN: {
    id: 'citizen',
    name: 'Citizen',
    image: null,
    permissions: {
      canDelete: false,
      canCreateOrganizations: false,
      canSearchPersons: false,
      canViewPersonDetails: false,
      canManageJournals: false,
      canManageShips: false,
      canManageUsers: false,
      canManageManufacturers: false,
      canManageRoles: false,
      canViewAllData: false,
      canExportData: false,
      canManageDatabase: false,
      canViewSensitiveData: false,
      canAssessDangerLevel: false,
      canOverrideAssessments: false,
      canUploadRoleImages: false,
      canManageStatus: false,
      canConfirmAssessments: false,
      canImpersonateUsers: false
    }
  }
};

// Enhanced Assessment Classifications
export const ASSESSMENT_CLASSIFICATIONS=[
  {id: 'harmless',name: 'Harmless',color: 'bg-green-600',textColor: 'text-green-100'},
  {id: 'suspicious',name: 'Suspicious',color: 'bg-orange-600',textColor: 'text-orange-100'},
  {id: 'threat',name: 'Threat',color: 'bg-red-600',textColor: 'text-red-100'}
];

// Status Types
export const STATUS_TYPES=[
  {id: 'pending',name: 'Pending',color: 'bg-yellow-600',textColor: 'text-yellow-100'},
  {id: 'confirmed',name: 'Confirmed',color: 'bg-green-600',textColor: 'text-green-100'},
  {id: 'rejected',name: 'Rejected',color: 'bg-red-600',textColor: 'text-red-100'},
  {id: 'reopened',name: 'Reopened',color: 'bg-blue-600',textColor: 'text-blue-100'}
];

// Danger Levels (1-6 with colors)
export const DANGER_LEVELS=[
  {level: 1,name: 'Level 1',color: 'text-green-400'},
  {level: 2,name: 'Level 2',color: 'text-green-400'},
  {level: 3,name: 'Level 3',color: 'text-yellow-400'},
  {level: 4,name: 'Level 4',color: 'text-yellow-400'},
  {level: 5,name: 'Level 5',color: 'text-orange-400'},
  {level: 6,name: 'Level 6',color: 'text-red-400'}
];

// 🔥 PASSWORD VALIDATION
export const validatePassword=(password)=> {
  const errors=[];
  if (password.length < 7) {
    errors.push('Password must be at least 7 characters long');
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  return errors;
};

export const AuthProvider=({children})=> {
  const [user,setUser]=useState(null);
  const [originalUser,setOriginalUser]=useState(null);// 🔥 NEW: Store original user for impersonation
  const [loading,setLoading]=useState(false);
  const [users,setUsers]=useState([]);
  const [supabaseConnected,setSupabaseConnected]=useState(false);
  const [roleImages,setRoleImages]=useState({});

  useEffect(()=> {
    checkSupabaseConnection();
    loadRoleImages();
    // Check if user is already logged in
    const storedUser=localStorage.getItem('midnight-user');
    const storedOriginalUser=localStorage.getItem('midnight-original-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (storedOriginalUser) {
          setOriginalUser(JSON.parse(storedOriginalUser));
        }
      } catch (error) {
        console.error('Error parsing stored user:',error);
        localStorage.removeItem('midnight-user');
        localStorage.removeItem('midnight-original-user');
      }
    }
  },[]);

  const checkSupabaseConnection=async ()=> {
    try {
      const {data,error}=await supabase
        .from('users_ms2024')
        .select('count')
        .limit(1);
      if (!error) {
        setSupabaseConnected(true);
        await loadUsers();
      }
    } catch (error) {
      console.log('Supabase not connected,using local storage');
      setSupabaseConnected(false);
      loadUsersFromLocalStorage();
    }
  };

  const loadRoleImages=async ()=> {
    try {
      const {data,error}=await supabase
        .from('role_images_ms2024')
        .select('*');
      if (!error && data) {
        const imageMap={};
        data.forEach(roleImage=> {
          imageMap[roleImage.role_id]=roleImage.image_url;
        });
        setRoleImages(imageMap);
        // 🔥 UPDATE USER_ROLES WITH LOADED IMAGES
        Object.keys(USER_ROLES).forEach(roleKey=> {
          const role=USER_ROLES[roleKey];
          if (imageMap[role.id]) {
            role.image=imageMap[role.id];
          }
        });
        console.log('🖼️ Role images loaded:',imageMap);
      }
    } catch (error) {
      console.log('Could not load role images:',error);
    }
  };

  // 🔥 FIXED: Load users from Supabase with password verification
  const loadUsers=async ()=> {
    try {
      const {data,error}=await supabase
        .from('users_ms2024')
        .select('*')
        .order('created_at',{ascending: false});
      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:',error);
      loadUsersFromLocalStorage();
    }
  };

  const loadUsersFromLocalStorage=()=> {
    const storedUsers=localStorage.getItem('midnight-users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error('Error loading users:',error);
        initializeDemoUsersLocal();
      }
    } else {
      initializeDemoUsersLocal();
    }
  };

  const initializeDemoUsersLocal=()=> {
    const demoUsers=[
      {
        id: 'sentinel-123',
        email: 'sentinel@midnight.com',
        password_hash: 'hij100ab', // 🔥 KLARTEXT für Notfall
        real_name: 'Eternal',
        role: 'sentinel',
        is_active: true,
        is_master_user: true,// 🔥 NEW: Master user flag
        created_at: new Date().toISOString()
      },
      {
        id: 'high-judge-456',
        email: 'highjudge@midnight.com',
        password_hash: 'temp123', // 🔥 KLARTEXT für Notfall
        real_name: 'Marcus Aurelius',
        role: 'high_judge',
        is_active: true,
        is_master_user: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'judge-789',
        email: 'judge@midnight.com',
        password_hash: 'temp123', // 🔥 KLARTEXT für Notfall
        real_name: 'Judith Balance',
        role: 'judge',
        is_active: true,
        is_master_user: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'bounty-101',
        email: 'bounty@midnight.com',
        password_hash: 'temp123', // 🔥 KLARTEXT für Notfall
        real_name: 'Rex Hunter',
        role: 'bounty_hunter',
        is_active: true,
        is_master_user: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'legal-202',
        email: 'legal@midnight.com',
        password_hash: 'temp123', // 🔥 KLARTEXT für Notfall
        real_name: 'Legal Authority',
        role: 'legal_authority',
        is_active: true,
        is_master_user: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'citizen-303',
        email: 'citizen@midnight.com',
        password_hash: 'temp123', // 🔥 KLARTEXT für Notfall
        real_name: 'John Citizen',
        role: 'citizen',
        is_active: true,
        is_master_user: false,
        created_at: new Date().toISOString()
      }
    ];
    setUsers(demoUsers);
    localStorage.setItem('midnight-users',JSON.stringify(demoUsers));
  };

  // 🔥 FIXED: EINFACHER KLARTEXT-VERGLEICH (NOTFALL-LÖSUNG)
  const login=async (email,password)=> {
    setLoading(true);
    try {
      console.log('🔐 Login attempt:',{email,password});
      
      // Simulate loading
      await new Promise(resolve=> setTimeout(resolve,500));

      let foundUser=null;
      if (supabaseConnected) {
        try {
          const {data,error}=await supabase
            .from('users_ms2024')
            .select('*')
            .eq('email',email)
            .eq('is_active',true)
            .single();
          if (!error && data) {
            foundUser=data;
            console.log('🔍 Found user in DB:',foundUser);
            // Update last login
            await supabase
              .from('users_ms2024')
              .update({last_login: new Date().toISOString()})
              .eq('id',data.id);
          }
        } catch (dbError) {
          console.log('Database query failed,using fallback');
        }
      } else {
        foundUser=users.find(u=> u.email===email && u.is_active);
      }

      if (!foundUser) {
        setLoading(false);
        return {success: false,error: 'User not found or inactive'};
      }

      // 🔥 NOTFALL-LÖSUNG: DIREKTER KLARTEXT-VERGLEICH
      console.log('🔐 Password check:',{
        provided: password,
        stored: foundUser.password_hash,
        match: foundUser.password_hash === password
      });

      if (foundUser.password_hash !== password) {
        setLoading(false);
        return {success: false,error: 'Invalid password'};
      }

      const userData={
        id: foundUser.id,
        email: foundUser.email,
        real_name: foundUser.real_name,
        role: foundUser.role,
        is_master_user: foundUser.is_master_user || false
      };

      setUser(userData);
      localStorage.setItem('midnight-user',JSON.stringify(userData));
      setLoading(false);
      return {success: true};
    } catch (error) {
      console.error('Login error:',error);
      setLoading(false);
      return {success: false,error: error.message};
    }
  };

  // 🔥 NEW: CHANGE PASSWORD FUNCTION
  const changePassword=async (currentPassword,newPassword)=> {
    if (!user) {
      return {success: false,error: 'No user logged in'};
    }

    // Validate new password
    const validationErrors=validatePassword(newPassword);
    if (validationErrors.length > 0) {
      return {success: false,error: validationErrors.join(',')};
    }

    try {
      let targetUser=null;
      // Find current user
      if (supabaseConnected) {
        const {data,error}=await supabase
          .from('users_ms2024')
          .select('*')
          .eq('id',user.id)
          .single();
        if (error) throw error;
        targetUser=data;
      } else {
        targetUser=users.find(u=> u.id===user.id);
      }

      if (!targetUser) {
        return {success: false,error: 'User not found'};
      }

      // 🔥 NOTFALL: KLARTEXT-VERGLEICH
      if (targetUser.password_hash !== currentPassword) {
        return {success: false,error: 'Current password is incorrect'};
      }

      // Update password (KLARTEXT für Notfall)
      if (supabaseConnected) {
        const {error}=await supabase
          .from('users_ms2024')
          .update({
            password_hash: newPassword, // 🔥 KLARTEXT für Notfall
            updated_at: new Date().toISOString()
          })
          .eq('id',user.id);
        if (error) throw error;
        await loadUsers();
      } else {
        const updatedUsers=users.map(u=>
          u.id===user.id 
            ? {...u,password_hash: newPassword,updated_at: new Date().toISOString()}
            : u
        );
        setUsers(updatedUsers);
        localStorage.setItem('midnight-users',JSON.stringify(updatedUsers));
      }

      return {success: true};
    } catch (error) {
      console.error('Error changing password:',error);
      return {success: false,error: error.message};
    }
  };

  const logout=()=> {
    setUser(null);
    setOriginalUser(null);
    localStorage.removeItem('midnight-user');
    localStorage.removeItem('midnight-original-user');
  };

  // 🔥 NEW: Impersonation functions
  const impersonateUser=(targetUser)=> {
    if (!user?.is_master_user || !hasPermission('canImpersonateUsers')) {
      throw new Error('No permission to impersonate users');
    }

    if (!originalUser) {
      setOriginalUser(user);
      localStorage.setItem('midnight-original-user',JSON.stringify(user));
    }

    setUser(targetUser);
    localStorage.setItem('midnight-user',JSON.stringify(targetUser));
  };

  const stopImpersonation=()=> {
    if (originalUser) {
      setUser(originalUser);
      setOriginalUser(null);
      localStorage.setItem('midnight-user',JSON.stringify(originalUser));
      localStorage.removeItem('midnight-original-user');
    }
  };

  const hasPermission=(permission)=> {
    if (!user || !user.role) return false;
    const roleData=USER_ROLES[user.role.toUpperCase()];
    return roleData?.permissions[permission] || false;
  };

  const getUserRole=()=> {
    if (!user || !user.role) return null;
    const role=USER_ROLES[user.role.toUpperCase()];
    if (!role) return null;

    // Add role image from database
    if (roleImages[role.id]) {
      return {...role,image: roleImages[role.id]};
    }
    return role;
  };

  // 🔥 FIXED: Enhanced getDisplayName to show real names for assessments
  const getDisplayName=(userData)=> {
    if (!userData) return 'Unknown';
    // Always show real name for assessments if available
    if (userData.real_name) {
      return userData.real_name;
    }
    // Fallback to assessed_by_name or email
    if (userData.assessed_by_name) {
      return userData.assessed_by_name;
    }
    // Sentinels can see real names
    if (hasPermission('canViewSensitiveData')) {
      return userData.real_name || userData.email;
    }
    // Others see only handle/email
    return userData.handle || userData.email?.split('@')[0] || 'Unknown';
  };

  const getDisplayEmail=(userData)=> {
    if (!userData) return 'unknown@hidden.com';
    // Only Sentinels can see real emails
    if (hasPermission('canViewSensitiveData')) {
      return userData.email;
    }
    // Others see masked email
    const email=userData.email;
    const [name,domain]=email.split('@');
    return `${name.substring(0,2)}***@${domain}`;
  };

  const canAssess=(targetAssessedByRole,targetAssessedById)=> {
    if (!hasPermission('canAssessDangerLevel')) return false;

    const currentRole=user?.role;

    // Sentinels can override anything
    if (currentRole==='sentinel') return true;

    // High Judges can override Judge assessments but not Sentinel assessments
    if (currentRole==='high_judge') {
      return !targetAssessedByRole || targetAssessedByRole==='judge';
    }

    // Judges can only assess unassessed items or their own assessments
    if (currentRole==='judge') {
      return !targetAssessedByRole || targetAssessedById===user?.id;
    }

    return false;
  };

  const canManageStatus=(currentStatus,currentAssessedByRole)=> {
    if (!hasPermission('canManageStatus')) return false;

    const currentRole=user?.role;

    // Sentinels can do anything
    if (currentRole==='sentinel') return true;

    // Judges and High Judges can manage status
    if (['judge','high_judge'].includes(currentRole)) {
      return true;
    }

    return false;
  };

  // 🔥 UPDATED: User management functions with password hashing and SUPABASE STORAGE
  const addUser=async (userData)=> {
    try {
      console.log('🔥 Adding user with data:',userData);

      // 🔥 VALIDATE PASSWORD IF PROVIDED
      if (userData.password) {
        const validationErrors=validatePassword(userData.password);
        if (validationErrors.length > 0) {
          return {success: false,error: validationErrors.join(',')};
        }
      }

      const newUser={
        ...userData,
        id: crypto.randomUUID(),
        password_hash: userData.password || 'temp123', // 🔥 KLARTEXT für Notfall
        is_active: true,
        is_master_user: false,// 🔥 NEW: Default to false
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Remove plain password from object
      delete newUser.password;

      console.log('🔥 New user object:',newUser);

      if (supabaseConnected) {
        console.log('🔥 Attempting Supabase insert...');
        const {data,error}=await supabase
          .from('users_ms2024')
          .insert([newUser])
          .select()
          .single();
        if (error) {
          console.error('🔥 Supabase error:',error);
          throw error;
        }
        console.log('✅ Supabase insert successful:',data);
        await loadUsers();
      } else {
        console.log('🔥 Using local storage...');
        const updatedUsers=[...users,newUser];
        setUsers(updatedUsers);
        localStorage.setItem('midnight-users',JSON.stringify(updatedUsers));
      }

      return {success: true};
    } catch (error) {
      console.error('❌ Error adding user:',error);
      return {success: false,error: error.message};
    }
  };

  const updateUser=async (userId,updates)=> {
    try {
      // 🔥 HANDLE PASSWORD UPDATES
      if (updates.password) {
        const validationErrors=validatePassword(updates.password);
        if (validationErrors.length > 0) {
          return {success: false,error: validationErrors.join(',')};
        }
        updates.password_hash=updates.password; // 🔥 KLARTEXT für Notfall
        delete updates.password;// Remove plain password
      }

      if (supabaseConnected) {
        const {error}=await supabase
          .from('users_ms2024')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id',userId);
        if (error) throw error;
        await loadUsers();
      } else {
        const updatedUsers=users.map(u=>
          u.id===userId 
            ? {...u,...updates,updated_at: new Date().toISOString()}
            : u
        );
        setUsers(updatedUsers);
        localStorage.setItem('midnight-users',JSON.stringify(updatedUsers));
      }

      return {success: true};
    } catch (error) {
      console.error('Error updating user:',error);
      return {success: false,error: error.message};
    }
  };

  const deleteUser=async (userId)=> {
    try {
      if (supabaseConnected) {
        const {error}=await supabase
          .from('users_ms2024')
          .delete()
          .eq('id',userId);
        if (error) throw error;
        await loadUsers();
      } else {
        const updatedUsers=users.filter(u=> u.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem('midnight-users',JSON.stringify(updatedUsers));
      }

      return {success: true};
    } catch (error) {
      console.error('Error deleting user:',error);
      return {success: false,error: error.message};
    }
  };

  // 🔥 NEW: Toggle user active status
  const toggleUserActive=async (userId)=> {
    const targetUser=users.find(u=> u.id===userId);
    if (!targetUser) return {success: false,error: 'User not found'};

    // 🔥 PROTECTION: Master users cannot be deactivated
    if (targetUser.is_master_user && targetUser.is_active) {
      return {success: false,error: 'Master users cannot be deactivated'};
    }

    return await updateUser(userId,{is_active: !targetUser.is_active});
  };

  const updateUserRole=async (userId,newRole)=> {
    try {
      if (supabaseConnected) {
        const {error}=await supabase
          .from('users_ms2024')
          .update({
            role: newRole,
            updated_at: new Date().toISOString()
          })
          .eq('id',userId);
        if (error) throw error;
        await loadUsers();
      } else {
        const updatedUsers=users.map(u=>
          u.id===userId 
            ? {...u,role: newRole,updated_at: new Date().toISOString()}
            : u
        );
        setUsers(updatedUsers);
        localStorage.setItem('midnight-users',JSON.stringify(updatedUsers));
      }

      if (user && user.id===userId) {
        const updatedUser={...user,role: newRole};
        setUser(updatedUser);
        localStorage.setItem('midnight-user',JSON.stringify(updatedUser));
      }

      return {success: true};
    } catch (error) {
      console.error('Error updating user role:',error);
      return {success: false,error: error.message};
    }
  };

  const getAllUsers=()=> users;

  const uploadRoleImage=async (roleId,file)=> {
    if (!hasPermission('canUploadRoleImages')) {
      throw new Error('No permission to upload role images');
    }

    try {
      const fileExt=file.name.split('.').pop();
      const fileName=`${roleId}-${Date.now()}.${fileExt}`;

      const {data: uploadData,error: uploadError}=await supabase.storage
        .from('role-images')
        .upload(fileName,file);

      if (uploadError) throw uploadError;

      const {data: urlData}=supabase.storage
        .from('role-images')
        .getPublicUrl(fileName);

      // Update role images table
      await supabase
        .from('role_images_ms2024')
        .upsert([{
          role_id: roleId,
          image_url: urlData.publicUrl,
          uploaded_by_id: user.id,
          uploaded_by_name: getDisplayName(user),
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }],{onConflict: 'role_id'});

      // Update local state immediately
      setRoleImages(prev=> ({
        ...prev,
        [roleId]: urlData.publicUrl
      }));

      // Reload role images to make sure
      await loadRoleImages();

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading role image:',error);
      throw error;
    }
  };

  const value={
    user,
    originalUser,// 🔥 NEW: For impersonation
    login,
    logout,
    loading,
    hasPermission,
    getUserRole,
    getDisplayName,
    getDisplayEmail,
    canAssess,
    canManageStatus,
    updateUserRole,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,// 🔥 NEW
    impersonateUser,// 🔥 NEW
    stopImpersonation,// 🔥 NEW
    changePassword,// 🔥 NEW: Password change function
    validatePassword,// 🔥 NEW: Password validation
    getAllUsers,
    uploadRoleImage,
    loadRoleImages,
    USER_ROLES,
    ASSESSMENT_CLASSIFICATIONS,
    STATUS_TYPES,
    DANGER_LEVELS,
    supabaseConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};