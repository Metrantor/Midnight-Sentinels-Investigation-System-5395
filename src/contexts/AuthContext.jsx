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
      canUploadRoleImages: true
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
      canUploadRoleImages: false
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
      canUploadRoleImages: false
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
      canUploadRoleImages: false
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
      canUploadRoleImages: false
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
      canUploadRoleImages: false
    }
  }
};

// Danger Levels
export const DANGER_LEVELS=[
  {id: 'unknown',name: 'Unknown',color: 'bg-gray-600',textColor: 'text-gray-100'},
  {id: 'low',name: 'Low Risk',color: 'bg-green-600',textColor: 'text-green-100'},
  {id: 'medium',name: 'Medium Risk',color: 'bg-yellow-600',textColor: 'text-yellow-100'},
  {id: 'high',name: 'High Risk',color: 'bg-orange-600',textColor: 'text-orange-100'},
  {id: 'extreme',name: 'Extreme Risk',color: 'bg-red-600',textColor: 'text-red-100'},
  {id: 'critical',name: 'Critical Threat',color: 'bg-purple-600',textColor: 'text-purple-100'}
];

export const AuthProvider=({children})=> {
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(false);
  const [users,setUsers]=useState([]);
  const [supabaseConnected,setSupabaseConnected]=useState(false);
  const [roleImages,setRoleImages]=useState({});

  useEffect(()=> {
    checkSupabaseConnection();
    loadRoleImages(); // 🔥 LOAD ROLE IMAGES ON STARTUP
    // Check if user is already logged in
    const storedUser=localStorage.getItem('midnight-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:',error);
        localStorage.removeItem('midnight-user');
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
      console.log('Supabase not connected, using local storage');
      setSupabaseConnected(false);
      loadUsersFromLocalStorage();
    }
  };

  // 🔥 NEW: LOAD ROLE IMAGES FROM DATABASE
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
        console.log('🖼️ Role images loaded:',imageMap);
      }
    } catch (error) {
      console.log('Could not load role images:',error);
    }
  };

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
        real_name: 'Commander Steel',
        role: 'sentinel',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'high-judge-456',
        email: 'highjudge@midnight.com',
        real_name: 'Marcus Aurelius',
        role: 'high_judge',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'judge-789',
        email: 'judge@midnight.com',
        real_name: 'Judith Balance',
        role: 'judge',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'bounty-101',
        email: 'bounty@midnight.com',
        real_name: 'Rex Hunter',
        role: 'bounty_hunter',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'legal-202',
        email: 'legal@midnight.com',
        real_name: 'Legal Authority',
        role: 'legal_authority',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'citizen-303',
        email: 'citizen@midnight.com',
        real_name: 'John Citizen',
        role: 'citizen',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
    setUsers(demoUsers);
    localStorage.setItem('midnight-users',JSON.stringify(demoUsers));
  };

  const login=async (email,password)=> {
    setLoading(true);
    try {
      // Simulate loading
      await new Promise(resolve=> setTimeout(resolve,500));

      // Find user by email
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
            // Update last login
            await supabase
              .from('users_ms2024')
              .update({last_login: new Date().toISOString()})
              .eq('id',data.id);
          }
        } catch (dbError) {
          console.log('Database query failed, using fallback');
        }
      } else {
        foundUser=users.find(u=> u.email===email && u.is_active);
      }

      // For demo: accept any email/password, but give sentinel role to admin emails
      if (!foundUser) {
        const role=email.includes('admin') || email.includes('sentinel') ? 'sentinel' : 'citizen';
        foundUser={
          id: crypto.randomUUID(),
          email: email,
          real_name: 'Demo User',
          role: role
        };
      }

      const userData={
        id: foundUser.id,
        email: foundUser.email,
        real_name: foundUser.real_name,
        role: foundUser.role
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

  const logout=()=> {
    setUser(null);
    localStorage.removeItem('midnight-user');
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

    // 🔥 ADD ROLE IMAGE FROM DATABASE
    if (roleImages[role.id]) {
      return {...role,image: roleImages[role.id]};
    }
    return role;
  };

  const getDisplayName=(userData)=> {
    if (!userData) return 'Unknown';
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

  const addUser=async (userData)=> {
    try {
      const newUser={
        ...userData,
        id: crypto.randomUUID(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (supabaseConnected) {
        const {error}=await supabase
          .from('users_ms2024')
          .insert([newUser]);

        if (error) throw error;
        await loadUsers();
      } else {
        const updatedUsers=[...users,newUser];
        setUsers(updatedUsers);
        localStorage.setItem('midnight-users',JSON.stringify(updatedUsers));
      }

      return {success: true};
    } catch (error) {
      console.error('Error adding user:',error);
      return {success: false,error: error.message};
    }
  };

  const updateUser=async (userId,updates)=> {
    try {
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

      // 🔥 UPDATE LOCAL STATE IMMEDIATELY
      setRoleImages(prev=> ({
        ...prev,
        [roleId]: urlData.publicUrl
      }));

      // 🔥 RELOAD ROLE IMAGES TO MAKE SURE
      await loadRoleImages();

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading role image:',error);
      throw error;
    }
  };

  const value={
    user,
    login,
    logout,
    loading,
    hasPermission,
    getUserRole,
    getDisplayName,
    getDisplayEmail,
    canAssess,
    updateUserRole,
    addUser,
    updateUser,
    deleteUser,
    getAllUsers,
    uploadRoleImage,
    loadRoleImages, // 🔥 EXPOSE RELOAD FUNCTION
    USER_ROLES,
    DANGER_LEVELS,
    supabaseConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};