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
  'Mining', 'Light Fighter', 'Heavy Fighter', 'Medium Fighter', 'Bomber', 'Interceptor',
  'Exploration', 'Starter', 'Cargo', 'Salvage', 'Medical', 'Refueling', 'Repair',
  'Racing', 'Touring', 'Science', 'Dropship', 'Gunship', 'Stealth', 'Electronic Warfare',
  'Industrial', 'Construction', 'Plant', 'Multi-Role', 'Transport', 'Luxury', 'Patrol',
  'Support', 'Command', 'Capital Ship', 'Corvette', 'Frigate', 'Carrier', 'Data Runner'
];

export const DataProvider = ({ children }) => {
  const { user, hasPermission, getDisplayName, getAllUsers, addUser } = useAuth();

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
  const [witnessStatements, setWitnessStatements] = useState([]);
  const [hearings, setHearings] = useState([]); // 🔥 NEW: Hearings state

  // Connection state
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [enablePolling, setEnablePolling] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  // Admin polling
  useEffect(() => {
    if (!dbConnected || !user) return;

    const isAdmin = user.role === 'sentinel';
    setEnablePolling(isAdmin);

    if (!isAdmin) return;

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
      
      const { data, error } = await supabase
        .from('organizations_ms2024')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Database connection error:', error);
        setConnectionError(`Database setup required. Missing basic tables.`);
        setDbConnected(false);
        loadLocalData();
        return;
      }

      console.log('🔧 Checking and creating missing database structures...');
      const createResult = await createAllTables(supabase);
      
      if (!createResult.success) {
        console.log('⚠️ Automatic table creation failed, manual SQL needed');
        setConnectionError(`Missing database structures. ${createResult.error || 'Please run the SQL manually.'}`);
        setDbConnected(false);
        loadLocalData();
        return;
      }

      console.log('🔍 Validating database fields...');
      const fieldsValid = await validateAllFields(supabase);
      
      if (!fieldsValid) {
        console.log('🛠️ DATABASE FIELDS MISSING!');
        console.log('📋 Please run this SQL in your Supabase SQL Editor:');
        console.log(getCreateTableSQL());
        setConnectionError(`Database fields missing. Please run the SQL statements shown in the console.`);
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
    setWitnessStatements([]);
    setHearings([]); // 🔥 NEW
  };

  const loadAllData = async () => {
    try {
      console.log('📥 Loading all data from Supabase...');

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
        historyResult,
        witnessResult,
        hearingsResult // 🔥 NEW
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
        supabase.from('assessment_history_ms2024').select('*').order('changed_at', { ascending: false }),
        supabase.from('witness_statements_ms2024').select('*').order('created_at', { ascending: false }),
        supabase.from('hearings_ms2024').select('*').order('created_at', { ascending: false }) // 🔥 NEW
      ]);

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
      setWitnessStatements(witnessResult.status === 'fulfilled' && witnessResult.value.data ? witnessResult.value.data : []);
      setHearings(hearingsResult.status === 'fulfilled' && hearingsResult.value.data ? hearingsResult.value.data : []); // 🔥 NEW

      console.log('✅ Data loading completed!');
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  };

  // 🔥 HELPER FUNCTION: Process and create witness users
  const processWitnesses = async (witnessNames) => {
    if (!witnessNames || !witnessNames.trim()) return [];

    const names = witnessNames.split(',').map(name => name.trim()).filter(Boolean);
    const allUsers = getAllUsers();
    const createdWitnesses = [];

    for (const name of names) {
      let existingUser = allUsers.find(u => 
        u.real_name?.toLowerCase() === name.toLowerCase() || 
        u.email?.toLowerCase() === `${name.toLowerCase()}@witness.local`
      );

      if (!existingUser) {
        console.log(`🔥 Creating witness user: ${name}`);
        try {
          const result = await addUser({
            email: `${name.toLowerCase().replace(/\s+/g, '')}@witness.local`,
            real_name: name,
            role: 'citizen',
            password: 'temp123'
          });

          if (result.success) {
            const updatedUsers = getAllUsers();
            existingUser = updatedUsers.find(u => u.real_name === name);
            console.log(`✅ Witness user created: ${name}`);
          }
        } catch (error) {
          console.error(`❌ Error creating witness user ${name}:`, error);
        }
      }

      if (existingUser) {
        createdWitnesses.push(existingUser);
      }
    }

    return createdWitnesses;
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

  // Retry connection function
  const retryConnection = () => {
    setConnectionError(null);
    initializeDatabase();
  };

  // 🔥 FIXED: Find person by handle function
  const findPersonByHandle = (handle) => {
    if (!handle) return null;
    return persons.find(person => 
      person.handle?.toLowerCase() === handle.toLowerCase()
    );
  };

  // 🔥 FIXED: Add person entry with witnesses
  const addPersonEntry = async (entry) => {
    checkConnection();

    const witnesses = await processWitnesses(entry.witnessNames);

    const record = {
      id: crypto.randomUUID(),
      person_id: entry.personId,
      person_name: entry.personName,
      date: entry.date,
      description: entry.description,
      crime_types: entry.crimeTypes || [],
      reported_by_id: user.id,
      reported_by_name: getDisplayName(user),
      reported_by_role: user.role,
      witness_names: entry.witnessNames || null,
      classification: 'harmless',
      danger_level: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      console.log('🔥 Creating person entry:', record);
      const { data, error } = await supabase
        .from('person_entries_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) {
        console.error('❌ Person entry creation failed:', error);
        throw error;
      }

      console.log('✅ Person entry created:', data);

      if (witnesses.length > 0) {
        const witnessStatements = witnesses.map(witness => ({
          id: crypto.randomUUID(),
          incident_id: data.id,
          witness_user_id: witness.id,
          witness_name: witness.real_name,
          statement_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        console.log('🔥 Creating witness statements:', witnessStatements);
        const { error: witnessError } = await supabase
          .from('witness_statements_ms2024')
          .insert(witnessStatements);

        if (witnessError) {
          console.error('❌ Witness statements creation failed:', witnessError);
        } else {
          console.log('✅ Witness statements created');
        }
      }

      setPersonEntries(prev => [data, ...prev]);
      return data;
    } catch (error) {
      handleDbError('Add Person Entry', error);
    }
  };

  // 🔥 FIXED: Add person function
  const addPerson = async (personData) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      name: personData.name,
      handle: personData.handle,
      aliases: personData.aliases || [],
      enlist_date: personData.enlistDate || null,
      location: personData.location || null,
      language: personData.language || null,
      avatar_url: personData.avatarUrl || null,
      pledge_rank: personData.pledgeRank || null,
      citizen_record_number: personData.citizenRecordNumber || null,
      note: personData.note || null,
      bio: personData.bio || null,
      last_scanned: personData.lastScanned || null,
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

  // 🔥 FIXED: Witness statement functions
  const getWitnessStatementsForIncident = (incidentId) => {
    return witnessStatements.filter(ws => ws.incident_id === incidentId);
  };

  const getWitnessStatementsForUser = (userId) => {
    return witnessStatements.filter(ws => ws.witness_user_id === userId);
  };

  const submitWitnessStatement = async (statementId, statement) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('witness_statements_ms2024')
        .update({
          statement: statement,
          statement_status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', statementId)
        .select()
        .single();

      if (error) throw error;

      setWitnessStatements(prev => 
        prev.map(ws => ws.id === statementId ? data : ws)
      );
      return data;
    } catch (error) {
      handleDbError('Submit Witness Statement', error);
    }
  };

  const addJudgeComment = async (statementId, comment, request = null) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('witness_statements_ms2024')
        .update({
          judge_comment: comment,
          judge_request: request,
          judge_id: user.id,
          judge_name: getDisplayName(user),
          judge_commented_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', statementId)
        .select()
        .single();

      if (error) throw error;

      setWitnessStatements(prev => 
        prev.map(ws => ws.id === statementId ? data : ws)
      );
      return data;
    } catch (error) {
      handleDbError('Add Judge Comment', error);
    }
  };

  // 🔥 NEW: Hearing functions
  const createHearing = async (hearingData) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      entry_id: hearingData.entryId,
      title: hearingData.title,
      question: hearingData.question,
      witness_ids: hearingData.witnessIds,
      crime_types: hearingData.crimeTypes,
      entry_description: hearingData.entryDescription,
      status: 'active',
      created_by_id: user.id,
      created_by_name: getDisplayName(user),
      created_by_role: user.role,
      responses: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('hearings_ms2024')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      setHearings(prev => [data, ...prev]);
      return data;
    } catch (error) {
      handleDbError('Create Hearing', error);
    }
  };

  const getHearingsForEntry = (entryId) => {
    return hearings.filter(h => h.entry_id === entryId);
  };

  const getHearingsForUser = (userId) => {
    return hearings.filter(hearing => 
      hearing.witness_ids && hearing.witness_ids.includes(userId)
    );
  };

  const respondToHearing = async (hearingId, responseData) => {
    checkConnection();

    try {
      // Get current hearing
      const currentHearing = hearings.find(h => h.id === hearingId);
      if (!currentHearing) {
        throw new Error('Hearing not found');
      }

      // Create new response
      const newResponse = {
        witness_user_id: user.id,
        witness_name: getDisplayName(user),
        agreement: responseData.agreement,
        comment: responseData.comment,
        created_at: new Date().toISOString()
      };

      // Update responses array (remove existing response from this user if any)
      const existingResponses = currentHearing.responses || [];
      const filteredResponses = existingResponses.filter(r => r.witness_user_id !== user.id);
      const updatedResponses = [...filteredResponses, newResponse];

      const { data, error } = await supabase
        .from('hearings_ms2024')
        .update({
          responses: updatedResponses,
          updated_at: new Date().toISOString()
        })
        .eq('id', hearingId)
        .select()
        .single();

      if (error) throw error;

      setHearings(prev => 
        prev.map(h => h.id === hearingId ? data : h)
      );
      return data;
    } catch (error) {
      handleDbError('Respond to Hearing', error);
    }
  };

  const updateHearingStatus = async (hearingId, status) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('hearings_ms2024')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', hearingId)
        .select()
        .single();

      if (error) throw error;

      setHearings(prev => 
        prev.map(h => h.id === hearingId ? data : h)
      );
      return data;
    } catch (error) {
      handleDbError('Update Hearing Status', error);
    }
  };

  // 🔥 FIXED: Additional helper functions that might be missing
  const addOrganization = async (organization) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      name: organization.name,
      handle: organization.handle || null,
      type: organization.type,
      description: organization.description,
      language: organization.language || null,
      logo_url: organization.logoUrl || null,
      last_scanned: organization.lastScanned || null,
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
      const { data, error } = await supabase
        .from('organizations_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOrganizations(prev => 
        prev.map(org => org.id === id ? data : org)
      );
      return data;
    } catch (error) {
      handleDbError('Update Organization', error);
    }
  };

  const updatePerson = async (id, updates) => {
    checkConnection();

    try {
      const { data, error } = await supabase
        .from('persons_ms2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPersons(prev => 
        prev.map(person => person.id === id ? data : person)
      );
      return data;
    } catch (error) {
      handleDbError('Update Person', error);
    }
  };

  const addJournal = async (journalData) => {
    checkConnection();

    const record = {
      id: crypto.randomUUID(),
      organization_id: journalData.organizationId,
      organization_name: journalData.organizationName,
      date: journalData.date,
      description: journalData.description,
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

      setJournals(prev => 
        prev.map(journal => journal.id === id ? data : journal)
      );
      return data;
    } catch (error) {
      handleDbError('Update Journal', error);
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

      setPersonEntries(prev => 
        prev.map(entry => entry.id === id ? data : entry)
      );
      return data;
    } catch (error) {
      handleDbError('Update Person Entry', error);
    }
  };

  // 🔥 ASSESSMENT FUNCTIONS
  const updateAssessment = async (targetType, targetId, assessmentData) => {
    checkConnection();

    const tableName = targetType === 'person' ? 'persons_ms2024' : 
                     targetType === 'organization' ? 'organizations_ms2024' : 
                     'person_entries_ms2024';

    const updateData = {
      classification: assessmentData.classification,
      danger_level: assessmentData.dangerLevel,
      assessment_notes: assessmentData.notes,
      assessed_by_id: user.id,
      assessed_by_name: getDisplayName(user),
      assessed_by_role: user.role,
      assessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', targetId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      if (targetType === 'person') {
        setPersons(prev => prev.map(p => p.id === targetId ? data : p));
      } else if (targetType === 'organization') {
        setOrganizations(prev => prev.map(o => o.id === targetId ? data : o));
      } else {
        setPersonEntries(prev => prev.map(e => e.id === targetId ? data : e));
      }

      return data;
    } catch (error) {
      handleDbError('Update Assessment', error);
    }
  };

  const updateStatus = async (targetType, targetId, status) => {
    checkConnection();

    const tableName = targetType === 'person' ? 'persons_ms2024' : 
                     targetType === 'organization' ? 'organizations_ms2024' : 
                     'person_entries_ms2024';

    try {
      const { data, error } = await supabase
        .from(tableName)
        .update({
          status: status,
          status_updated_by_id: user.id,
          status_updated_by_name: getDisplayName(user),
          status_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      if (targetType === 'person') {
        setPersons(prev => prev.map(p => p.id === targetId ? data : p));
      } else if (targetType === 'organization') {
        setOrganizations(prev => prev.map(o => o.id === targetId ? data : o));
      } else {
        setPersonEntries(prev => prev.map(e => e.id === targetId ? data : e));
      }

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

  // 🔥 HELPER FUNCTIONS
  const getCleanFormData = (type) => {
    const baseData = {
      name: '',
      description: '',
      created_at: new Date().toISOString().split('T')[0]
    };

    switch (type) {
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
      case 'organization':
        return {
          ...baseData,
          handle: '',
          type: '',
          language: '',
          logoUrl: '',
          lastScanned: ''
        };
      case 'user':
        return {
          email: '',
          real_name: '',
          role: '',
          password: ''
        };
      default:
        return baseData;
    }
  };

  const hasPersonCommittedCrimes = (personId) => {
    return personEntries.some(entry => 
      entry.person_id === personId && 
      entry.crime_types && 
      entry.crime_types.length > 0
    );
  };

  const globalSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    
    return {
      persons: persons.filter(p => 
        p.name?.toLowerCase().includes(lowerQuery) ||
        p.handle?.toLowerCase().includes(lowerQuery) ||
        p.location?.toLowerCase().includes(lowerQuery)
      ),
      organizations: organizations.filter(o => 
        o.name?.toLowerCase().includes(lowerQuery) ||
        o.handle?.toLowerCase().includes(lowerQuery) ||
        o.description?.toLowerCase().includes(lowerQuery)
      ),
      ships: ships.filter(s => 
        s.name?.toLowerCase().includes(lowerQuery) ||
        s.serialNumber?.toLowerCase().includes(lowerQuery)
      )
    };
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
    witnessStatements,
    hearings, // 🔥 NEW

    // Constants
    CRIME_TYPES,
    RELATIONSHIP_TYPES,
    SHIP_TYPES,

    // Core CRUD operations
    findPersonByHandle,
    addPerson,
    updatePerson,
    addPersonEntry,
    updatePersonEntry,
    addOrganization,
    updateOrganization,
    addJournal,
    updateJournal,

    // Assessment functions
    updateAssessment,
    updateStatus,
    getAssessmentHistory,

    // Witness functions
    getWitnessStatementsForIncident,
    getWitnessStatementsForUser,
    submitWitnessStatement,
    addJudgeComment,

    // 🔥 NEW: Hearing functions
    createHearing,
    getHearingsForEntry,
    getHearingsForUser,
    respondToHearing,
    updateHearingStatus,

    // Helper functions
    getCleanFormData,
    hasPersonCommittedCrimes,
    globalSearch
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};