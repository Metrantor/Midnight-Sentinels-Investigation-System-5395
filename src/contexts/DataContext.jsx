import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { createAllTables, validateAllFields, getCreateTableSQL } from '../lib/createDatabaseTables';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Crime Types 
const CRIME_TYPES = [
  { id: 'murder', name: 'Murder', color: 'bg-red-600' },
  { id: 'piracy', name: 'Piracy', color: 'bg-orange-600' },
  { id: 'griefing', name: 'Griefing', color: 'bg-yellow-600' },
  { id: 'theft', name: 'Theft', color: 'bg-purple-600' },
  { id: 'betrayal', name: 'Betrayal', color: 'bg-pink-600' },
  { id: 'pad_ramming', name: 'Pad Ramming', color: 'bg-indigo-600' },
  { id: 'espionage', name: 'Espionage', color: 'bg-gray-600' },
  { id: 'smuggling', name: 'Smuggling', color: 'bg-green-600' },
  { id: 'fraud', name: 'Fraud', color: 'bg-blue-600' }
];

// Relationship Types
const RELATIONSHIP_TYPES = [
  { id: 'allied', name: 'Allied', color: 'bg-green-600' },
  { id: 'shadow', name: 'Shadow Organization', color: 'bg-purple-600' },
  { id: 'hostile', name: 'Hostile', color: 'bg-red-600' },
  { id: 'neutral', name: 'Neutral', color: 'bg-gray-600' },
  { id: 'suspicious', name: 'Suspicious', color: 'bg-yellow-600' }
];

// Ship Types
const SHIP_TYPES = [
  'Mining', 'Light Fighter', 'Heavy Fighter', 'Medium Fighter', 'Bomber',
  'Interceptor', 'Exploration', 'Starter', 'Cargo', 'Salvage', 'Medical',
  'Refueling', 'Repair', 'Racing', 'Touring', 'Science', 'Dropship',
  'Gunship', 'Stealth', 'Electronic Warfare', 'Industrial', 'Construction',
  'Plant', 'Multi-Role', 'Transport', 'Luxury', 'Patrol', 'Support',
  'Command', 'Capital Ship', 'Corvette', 'Frigate', 'Carrier', 'Data Runner'
];

export const DataProvider = ({ children }) => {
  const { user, hasPermission, getDisplayName } = useAuth();

  // State variables
  const [organizations, setOrganizations] = useState([]);
  const [persons, setPersons] = useState([]);
  const [journals, setJournals] = useState([]);
  const [personEntries, setPersonEntries] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [orgRelationships, setOrgRelationships] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [shipModels, setShipModels] = useState([]);
  const [ships, setShips] = useState([]);
  const [shipJournals, setShipJournals] = useState([]);
  const [shipAssignments, setShipAssignments] = useState([]);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  // Connection state
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // 🔥 ADMIN POLLING CONTROL
  const [enablePolling, setEnablePolling] = useState(false);

  // Initialize database and load data
  useEffect(() => {
    initializeDatabase();
  }, []);

  // 🔥 ADMIN POLLING ONLY
  useEffect(() => {
    if (!dbConnected || !user) return;
    
    // Only enable polling for sentinels/admins
    const isAdmin = user.role === 'sentinel';
    setEnablePolling(isAdmin);
    
    if (!isAdmin) return;
    
    // Poll every 30 seconds for admins only
    const interval = setInterval(() => {
      if (enablePolling) {
        loadAllData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dbConnected, user, enablePolling]);

  const initializeDatabase = async () => {
    setLoading(true);
    setConnectionError(null);

    try {
      console.log('🔌 Testing Supabase connection...');

      // 🔥 STEP 1: Test basic connection with simple query
      const { data, error } = await supabase
        .from('organizations_ms2024')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Database connection error:', error);
        setConnectionError(`Database setup required. Please run the SQL statements shown in the console in your Supabase SQL Editor.`);
        setDbConnected(false);
        loadLocalData();
        return;
      }

      // 🔥 STEP 2: Validate assessment fields exist
      console.log('🔍 Validating assessment fields...');
      const fieldsValid = await validateAllFields(supabase);
      
      if (!fieldsValid) {
        console.log('🛠️ ASSESSMENT FIELDS MISSING!');
        console.log('📋 Please run this SQL in your Supabase SQL Editor:');
        console.log(getCreateTableSQL());
        setConnectionError(`Assessment fields missing. Please run the SQL statements shown in the console in your Supabase SQL Editor.`);
        setDbConnected(false);
        loadLocalData();
        return;
      }

      console.log('✅ Database connection and schema validated!');
      setDbConnected(true);
      await loadAllData();

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setConnectionError(`Connection failed: ${error.message}`);
      setDbConnected(false);
      loadLocalData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = () => {
    // Load demo data for offline mode
    setOrganizations([]);
    setPersons([]);
    setJournals([]);
    setPersonEntries([]);
    setMemberships([]);
    setOrgRelationships([]);
    setManufacturers([]);
    setShipModels([]);
    setShips([]);
    setShipJournals([]);
    setShipAssignments([]);
    setAssessmentHistory([]);
  };

  const loadAllData = async () => {
    try {
      console.log('📥 Loading all data from Supabase...');

      // Load data with basic fields first, then assessment fields
      const [
        orgsResult,
        personsResult,
        journalsResult,
        entriesResult,
        membershipsResult,
        relationshipsResult,
        manufacturersResult,
        modelsResult,
        shipsResult,
        shipJournalsResult,
        assignmentsResult,
        historyResult
      ] = await Promise.allSettled([
        supabase.from('organizations_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('persons_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('journals_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('person_entries_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('memberships_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('org_relationships_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('manufacturers_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('ship_models_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('ships_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('ship_journals_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('ship_assignments_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('assessment_history_ms2024').select('*').order('changed_at', { ascending: false })
      ]);

      // Set data with error handling
      setOrganizations(orgsResult.status === 'fulfilled' && orgsResult.value.data ? orgsResult.value.data : []);
      setPersons(personsResult.status === 'fulfilled' && personsResult.value.data ? personsResult.value.data : []);
      setJournals(journalsResult.status === 'fulfilled' && journalsResult.value.data ? journalsResult.value.data : []);
      setPersonEntries(entriesResult.status === 'fulfilled' && entriesResult.value.data ? entriesResult.value.data : []);
      setMemberships(membershipsResult.status === 'fulfilled' && membershipsResult.value.data ? membershipsResult.value.data : []);
      setOrgRelationships(relationshipsResult.status === 'fulfilled' && relationshipsResult.value.data ? relationshipsResult.value.data : []);
      setManufacturers(manufacturersResult.status === 'fulfilled' && manufacturersResult.value.data ? manufacturersResult.value.data : []);
      setShipModels(modelsResult.status === 'fulfilled' && modelsResult.value.data ? modelsResult.value.data : []);
      setShips(shipsResult.status === 'fulfilled' && shipsResult.value.data ? shipsResult.value.data : []);
      setShipJournals(shipJournalsResult.status === 'fulfilled' && shipJournalsResult.value.data ? shipJournalsResult.value.data : []);
      setShipAssignments(assignmentsResult.status === 'fulfilled' && assignmentsResult.value.data ? assignmentsResult.value.data : []);
      setAssessmentHistory(historyResult.status === 'fulfilled' && historyResult.value.data ? historyResult.value.data : []);

      console.log('✅ Data loading completed!');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  };

  // 🎯 ENHANCED: Assessment function with complete field mapping
  const updateAssessment = async (targetType, targetId, assessmentData) => {
    checkConnection();

    try {
      // 🔥 COMPLETE UPDATE DATA WITH ALL REQUIRED FIELDS
      const updateData = {
        classification: assessmentData.classification,
        danger_level: assessmentData.dangerLevel,
        assessed_by_id: user.id,
        assessed_by_name: getDisplayName(user),
        assessed_by_role: user.role,
        assessed_at: new Date().toISOString(),
        assessment_notes: assessmentData.notes ? assessmentData.notes.substring(0, 500) : null,
        updated_at: new Date().toISOString()
      };

      // 🔥 CORRECT TABLE NAME MAPPING
      let tableName;
      switch (targetType) {
        case 'organization':
          tableName = 'organizations_ms2024';
          break;
        case 'person':
          tableName = 'persons_ms2024';
          break;
        case 'entry':
          tableName = 'person_entries_ms2024';
          break;
        default:
          throw new Error(`Invalid target type: ${targetType}`);
      }

      console.log(`🔄 Updating assessment in ${tableName} for ${targetId}:`, updateData);

      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', targetId)
        .select()
        .single();

      if (error) {
        console.error(`❌ Assessment update failed:`, error);
        throw error;
      }

      // Record in assessment history (if table exists)
      try {
        await supabase
          .from('assessment_history_ms2024')
          .insert([{
            target_type: targetType,
            target_id: targetId,
            new_classification: assessmentData.classification,
            new_danger_level: assessmentData.dangerLevel,
            new_notes: assessmentData.notes,
            changed_by_id: user.id,
            changed_by_name: getDisplayName(user),
            changed_by_role: user.role,
            reason: 'Assessment update'
          }]);
      } catch (historyError) {
        console.log('Warning: Could not save to history:', historyError.message);
      }

      // Update local state
      await loadAllData();

      console.log('✅ Assessment update successful!');
      return data;

    } catch (error) {
      handleDbError('Update Assessment', error);
    }
  };

  // 🎯 ENHANCED: Status update function with complete field mapping
  const updateStatus = async (targetType, targetId, status) => {
    checkConnection();

    try {
      // 🔥 COMPLETE STATUS UPDATE DATA
      const updateData = {
        status: status,
        status_updated_by_id: user.id,
        status_updated_by_name: getDisplayName(user),
        status_updated_by_role: user.role,
        status_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 🔥 CORRECT TABLE NAME MAPPING
      let tableName;
      switch (targetType) {
        case 'organization':
          tableName = 'organizations_ms2024';
          break;
        case 'person':
          tableName = 'persons_ms2024';
          break;
        case 'entry':
          tableName = 'person_entries_ms2024';
          break;
        default:
          throw new Error(`Invalid target type: ${targetType}`);
      }

      console.log(`🔄 Updating status in ${tableName} for ${targetId}:`, updateData);

      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', targetId)
        .select()
        .single();

      if (error) {
        console.error(`❌ Status update failed:`, error);
        throw error;
      }

      // Update local state
      await loadAllData();

      console.log('✅ Status update successful!');
      return data;

    } catch (error) {
      handleDbError('Update Status', error);
    }
  };

  const getAssessmentHistory = (targetType, targetId) => {
    return assessmentHistory.filter(h => 
      h.target_type === targetType && h.target_id === targetId
    );
  };

  // Error handler for database operations
  const handleDbError = (operation, error) => {
    console.error(`❌ ${operation} failed:`, error);
    const errorMessage = `${operation} failed: ${error.message}`;
    setConnectionError(errorMessage);
    throw new Error(errorMessage);
  };

  // Check if database is connected before operations
  const checkConnection = () => {
    if (!dbConnected) {
      const errorMessage = 'Database not connected. Please check your connection.';
      setConnectionError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 🔥 ORGANIZATION CRUD WITH FIXED FIELD MAPPING
  const addOrganization = async (organization) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      name: organization.name,
      handle: organization.handle || null,
      type: organization.type,
      description: organization.description,
      language: organization.language || null,
      logo_url: organization.logoUrl || null,  // 🔥 FIXED: logoUrl -> logo_url
      last_scanned: organization.lastScanned || null,  // 🔥 FIXED: lastScanned -> last_scanned
      // Default assessment values
      classification: 'harmless',
      danger_level: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('organizations_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setOrganizations(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Organization', error);
    }
  };

  const updateOrganization = async (id, updates) => {
    checkConnection();

    try {
      // 🔥 FIXED FIELD MAPPING
      const mappedUpdates = {
        name: updates.name,
        handle: updates.handle,
        type: updates.type,
        description: updates.description,
        language: updates.language,
        logo_url: updates.logoUrl || updates.logo_url,  // 🔥 FIXED
        last_scanned: updates.lastScanned || updates.last_scanned,  // 🔥 FIXED
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('organizations_ms2024')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOrganizations(prev => prev.map(org => org.id === id ? data : org));
      return data;

    } catch (error) {
      handleDbError('Update Organization', error);
    }
  };

  // 🔥 PERSON CRUD WITH FIXED FIELD MAPPING
  const addPerson = async (person) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      name: person.name,
      handle: person.handle,
      aliases: person.aliases || [],
      enlist_date: person.enlistDate || null,  // 🔥 FIXED: enlistDate -> enlist_date
      location: person.location || null,
      language: person.language || null,
      avatar_url: person.avatarUrl || null,  // 🔥 FIXED: avatarUrl -> avatar_url
      pledge_rank: person.pledgeRank || null,  // 🔥 FIXED: pledgeRank -> pledge_rank
      citizen_record_number: person.citizenRecordNumber || null,  // 🔥 FIXED: citizenRecordNumber -> citizen_record_number
      note: person.note || null,
      bio: person.bio || null,
      last_scanned: person.lastScanned || null,  // 🔥 FIXED: lastScanned -> last_scanned
      // Default assessment values
      classification: 'harmless',
      danger_level: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('persons_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setPersons(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Person', error);
    }
  };

  const updatePerson = async (id, updates) => {
    checkConnection();

    try {
      // 🔥 FIXED FIELD MAPPING FOR UPDATES
      const mappedUpdates = {
        name: updates.name,
        handle: updates.handle,
        aliases: updates.aliases,
        enlist_date: updates.enlistDate || updates.enlist_date,  // 🔥 FIXED
        location: updates.location,
        language: updates.language,
        avatar_url: updates.avatarUrl || updates.avatar_url,  // 🔥 FIXED
        pledge_rank: updates.pledgeRank || updates.pledge_rank,  // 🔥 FIXED
        citizen_record_number: updates.citizenRecordNumber || updates.citizen_record_number,  // 🔥 FIXED
        note: updates.note,
        bio: updates.bio,
        last_scanned: updates.lastScanned || updates.last_scanned,  // 🔥 FIXED
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('persons_ms2024')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPersons(prev => prev.map(person => person.id === id ? data : person));
      return data;

    } catch (error) {
      handleDbError('Update Person', error);
    }
  };

  // JOURNAL CRUD OPERATIONS
  const addJournal = async (journal) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      organization_id: journal.organizationId,
      organization_name: journal.organizationName,
      date: journal.date,
      description: journal.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('journals_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setJournals(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Journal', error);
    }
  };

  const updateJournal = async (id, updates) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('journals_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setJournals(prev => prev.map(journal => journal.id === id ? data : journal));
      return data;

    } catch (error) {
      handleDbError('Update Journal', error);
    }
  };

  // 🔥 PERSON ENTRY CRUD WITH COMPLETE FIELD MAPPING
  const addPersonEntry = async (entry) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      person_id: entry.personId,
      person_name: entry.personName,
      date: entry.date,
      description: entry.description,
      crime_types: entry.crimeTypes || [],
      // Default assessment values
      classification: 'harmless',
      danger_level: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('person_entries_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setPersonEntries(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Person Entry', error);
    }
  };

  const updatePersonEntry = async (id, updates) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('person_entries_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPersonEntries(prev => prev.map(entry => entry.id === id ? data : entry));
      return data;

    } catch (error) {
      handleDbError('Update Person Entry', error);
    }
  };

  // MEMBERSHIP CRUD OPERATIONS
  const addMembership = async (membership) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      person_id: membership.personId,
      organization_id: membership.organizationId,
      person_name: membership.personName,
      organization_name: membership.organizationName,
      start_date: membership.startDate || null,
      end_date: membership.endDate || null,
      is_active: membership.isActive !== undefined ? membership.isActive : true,
      last_verified: membership.lastVerified || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('memberships_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setMemberships(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Membership', error);
    }
  };

  const updateMembership = async (id, updates) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('memberships_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMemberships(prev => prev.map(membership => membership.id === id ? data : membership));
      return data;

    } catch (error) {
      handleDbError('Update Membership', error);
    }
  };

  // ORG RELATIONSHIPS CRUD OPERATIONS
  const addOrgRelationship = async (relationship) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      organization_id: relationship.organizationId,
      related_organization_id: relationship.relatedOrganizationId,
      relationship_type: relationship.relationshipType,
      description: relationship.description || null,
      established_date: relationship.establishedDate || null,
      last_verified: relationship.lastVerified || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('org_relationships_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setOrgRelationships(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Organization Relationship', error);
    }
  };

  const updateOrgRelationship = async (id, updates) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('org_relationships_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOrgRelationships(prev => prev.map(rel => rel.id === id ? data : rel));
      return data;

    } catch (error) {
      handleDbError('Update Organization Relationship', error);
    }
  };

  const removeOrgRelationship = async (id) => {
    checkConnection();

    try {
      const { error } = await supabase
        .from('org_relationships_ms2024')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrgRelationships(prev => prev.filter(rel => rel.id !== id));

    } catch (error) {
      handleDbError('Remove Organization Relationship', error);
    }
  };

  // MANUFACTURER CRUD OPERATIONS
  const addManufacturer = async (manufacturer) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      name: manufacturer.name,
      description: manufacturer.description || null,
      logo_url: manufacturer.logoUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('manufacturers_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setManufacturers(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Manufacturer', error);
    }
  };

  const updateManufacturer = async (id, updates) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('manufacturers_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setManufacturers(prev => prev.map(mfr => mfr.id === id ? data : mfr));
      return data;

    } catch (error) {
      handleDbError('Update Manufacturer', error);
    }
  };

  const deleteManufacturer = async (id) => {
    checkConnection();

    try {
      // Delete related ship models first
      await supabase.from('ship_models_ms2024').delete().eq('manufacturer_id', id);

      const { error } = await supabase
        .from('manufacturers_ms2024')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setManufacturers(prev => prev.filter(mfr => mfr.id !== id));
      setShipModels(prev => prev.filter(model => model.manufacturer_id !== id));

    } catch (error) {
      handleDbError('Delete Manufacturer', error);
    }
  };

  // SHIP MODEL CRUD OPERATIONS
  const addShipModel = async (model) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      name: model.name,
      type: model.type,
      manufacturer_id: model.manufacturerId,
      manufacturer_name: model.manufacturerName,
      description: model.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('ship_models_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setShipModels(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Ship Model', error);
    }
  };

  const updateShipModel = async (id, updates) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('ship_models_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setShipModels(prev => prev.map(model => model.id === id ? data : model));
      return data;

    } catch (error) {
      handleDbError('Update Ship Model', error);
    }
  };

  const deleteShipModel = async (id) => {
    checkConnection();

    try {
      const { error } = await supabase
        .from('ship_models_ms2024')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShipModels(prev => prev.filter(model => model.id !== id));

    } catch (error) {
      handleDbError('Delete Ship Model', error);
    }
  };

  // SHIP CRUD OPERATIONS
  const addShip = async (ship) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      name: ship.name,
      serial_number: ship.serialNumber || null,
      model_id: ship.modelId,
      model_name: ship.modelName,
      manufacturer_name: ship.manufacturerName,
      location: ship.location || null,
      status: ship.status || null,
      description: ship.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('ships_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setShips(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Ship', error);
    }
  };

  const updateShip = async (id, updates) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('ships_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setShips(prev => prev.map(ship => ship.id === id ? data : ship));
      return data;

    } catch (error) {
      handleDbError('Update Ship', error);
    }
  };

  const deleteShip = async (id) => {
    checkConnection();

    try {
      // Delete related assignments and journals first
      await supabase.from('ship_assignments_ms2024').delete().eq('ship_id', id);
      await supabase.from('ship_journals_ms2024').delete().eq('ship_id', id);

      const { error } = await supabase
        .from('ships_ms2024')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShips(prev => prev.filter(ship => ship.id !== id));
      setShipAssignments(prev => prev.filter(assignment => assignment.ship_id !== id));
      setShipJournals(prev => prev.filter(journal => journal.ship_id !== id));

    } catch (error) {
      handleDbError('Delete Ship', error);
    }
  };

  // SHIP ASSIGNMENT CRUD OPERATIONS
  const addShipAssignment = async (assignment) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      ship_id: assignment.shipId,
      person_id: assignment.personId,
      ship_name: assignment.shipName,
      person_name: assignment.personName,
      assigned_date: assignment.assignedDate || new Date().toISOString().split('T')[0],
      role: assignment.role || 'Crew Member',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('ship_assignments_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setShipAssignments(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Ship Assignment', error);
    }
  };

  const removeShipAssignment = async (id) => {
    checkConnection();

    try {
      const { error } = await supabase
        .from('ship_assignments_ms2024')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShipAssignments(prev => prev.filter(assignment => assignment.id !== id));

    } catch (error) {
      handleDbError('Remove Ship Assignment', error);
    }
  };

  // SHIP JOURNAL CRUD OPERATIONS
  const addShipJournal = async (journal) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      ship_id: journal.shipId,
      ship_name: journal.shipName,
      date: journal.date,
      description: journal.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('ship_journals_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setShipJournals(prev => [data, ...prev]);
      return data;

    } catch (error) {
      handleDbError('Add Ship Journal', error);
    }
  };

  // Helper functions
  const findPersonByHandle = (handle) => {
    return persons.find(p => p.handle?.toLowerCase() === handle.toLowerCase());
  };

  const hasPersonCommittedCrimes = (personId) => {
    return personEntries.some(entry => 
      entry.person_id === personId && 
      entry.crime_types && 
      entry.crime_types.length > 0
    );
  };

  const getPersonCrimeStats = (personId) => {
    const entries = personEntries.filter(e => e.person_id === personId);
    const stats = {};
    
    entries.forEach(entry => {
      if (entry.crime_types) {
        entry.crime_types.forEach(crimeType => {
          stats[crimeType] = (stats[crimeType] || 0) + 1;
        });
      }
    });
    
    return stats;
  };

  const getOrgCrimeStats = (orgId) => {
    const orgMemberships = memberships.filter(m => m.organization_id === orgId);
    const memberPersonIds = orgMemberships.map(m => m.person_id);
    const stats = {};
    
    personEntries
      .filter(entry => memberPersonIds.includes(entry.person_id))
      .forEach(entry => {
        if (entry.crime_types) {
          entry.crime_types.forEach(crimeType => {
            stats[crimeType] = (stats[crimeType] || 0) + 1;
          });
        }
      });
    
    return stats;
  };

  const getManufacturer = (manufacturerId) => {
    return manufacturers.find(m => m.id === manufacturerId);
  };

  const getShipModel = (modelId) => {
    return shipModels.find(m => m.id === modelId);
  };

  const getPersonMemberships = (personId) => {
    return memberships.filter(m => m.person_id === personId);
  };

  const getShipPersons = (shipId) => {
    const assignments = shipAssignments.filter(a => a.ship_id === shipId);
    return assignments.map(assignment => {
      const person = persons.find(p => p.id === assignment.person_id);
      return {
        assignment,
        ...person
      };
    }).filter(item => item.id); // Filter out assignments without valid persons
  };

  const globalSearch = (query) => {
    const searchTerm = query.toLowerCase();
    
    const searchPersons = persons.filter(person =>
      person.name?.toLowerCase().includes(searchTerm) ||
      person.handle?.toLowerCase().includes(searchTerm) ||
      person.aliases?.some(alias => alias.toLowerCase().includes(searchTerm))
    );
    
    const searchOrganizations = organizations.filter(org =>
      org.name?.toLowerCase().includes(searchTerm) ||
      org.handle?.toLowerCase().includes(searchTerm) ||
      org.description?.toLowerCase().includes(searchTerm)
    );
    
    const searchShips = ships.filter(ship =>
      ship.name?.toLowerCase().includes(searchTerm) ||
      ship.serial_number?.toLowerCase().includes(searchTerm) ||
      ship.description?.toLowerCase().includes(searchTerm)
    );
    
    return {
      persons: searchPersons,
      organizations: searchOrganizations,
      ships: searchShips
    };
  };

  // Form reset helper
  const getCleanFormData = (formType) => {
    const baseData = {
      name: '',
      description: ''
    };

    switch (formType) {
      case 'organization':
        return {
          ...baseData,
          handle: '',
          type: '',
          language: '',
          logoUrl: '',
          lastScanned: ''
        };
      case 'person':
        return {
          ...baseData,
          handle: '',
          aliases: '',
          enlistDate: '',
          location: '',
          language: '',
          avatarUrl: '',
          pledgeRank: '',
          citizenRecordNumber: '',
          note: '',
          bio: '',
          lastScanned: ''
        };
      case 'manufacturer':
        return {
          ...baseData,
          logoUrl: ''
        };
      case 'shipModel':
        return {
          ...baseData,
          type: '',
          manufacturerId: '',
          manufacturerName: ''
        };
      case 'user':
        return {
          email: '',
          real_name: '',
          role: ''
        };
      default:
        return baseData;
    }
  };

  // Retry connection function
  const retryConnection = () => {
    setConnectionError(null);
    initializeDatabase();
  };

  const value = {
    // Connection state
    loading,
    dbConnected,
    connectionError,
    retryConnection,
    enablePolling,
    setEnablePolling,

    // Data
    organizations,
    persons,
    journals,
    personEntries,
    memberships,
    orgRelationships,
    manufacturers,
    shipModels,
    ships,
    shipJournals,
    shipAssignments,
    assessmentHistory,
    CRIME_TYPES,
    RELATIONSHIP_TYPES,
    SHIP_TYPES,

    // Assessment functions
    updateAssessment,
    updateStatus,
    getAssessmentHistory,

    // CRUD operations
    addOrganization,
    updateOrganization,
    addPerson,
    updatePerson,
    addJournal,
    updateJournal,
    addPersonEntry,
    updatePersonEntry,
    addMembership,
    updateMembership,
    addOrgRelationship,
    updateOrgRelationship,
    removeOrgRelationship,
    addManufacturer,
    updateManufacturer,
    deleteManufacturer,
    addShipModel,
    updateShipModel,
    deleteShipModel,
    addShip,
    updateShip,
    deleteShip,
    addShipAssignment,
    removeShipAssignment,
    addShipJournal,

    // Helper functions
    getCleanFormData,
    findPersonByHandle,
    hasPersonCommittedCrimes,
    getPersonCrimeStats,
    getOrgCrimeStats,
    getManufacturer,
    getShipModel,
    getPersonMemberships,
    getShipPersons,
    globalSearch
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};