import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Generate simple UUID without external library
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
  'Command', 'Capital Ship', 'Corvette', 'Frigate', 'Carrier'
];

export const DataProvider = ({ children }) => {
  // State variables
  const [organizations, setOrganizations] = useState([]);
  const [persons, setPersons] = useState([]);
  const [journals, setJournals] = useState([]);
  const [personEntries, setPersonEntries] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [orgRelationships, setOrgRelationships] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [shipModels, setShipModels] = useState([]);
  const [ships, setShips] = useState([]);
  const [shipJournals, setShipJournals] = useState([]);
  const [shipAssignments, setShipAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    loadDataFromLocalStorage();
  }, []);

  const loadDataFromLocalStorage = () => {
    const loadData = (key, setter) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setter(JSON.parse(stored));
        } catch (error) {
          console.error(`Error loading ${key}:`, error);
          setter([]);
        }
      }
    };

    loadData('midnight-organizations', setOrganizations);
    loadData('midnight-persons', setPersons);
    loadData('midnight-journals', setJournals);
    loadData('midnight-person-entries', setPersonEntries);
    loadData('midnight-memberships', setMemberships);
    loadData('midnight-org-relationships', setOrgRelationships);
    loadData('midnight-incidents', setIncidents);
    loadData('midnight-manufacturers', setManufacturers);
    loadData('midnight-ship-models', setShipModels);
    loadData('midnight-ships', setShips);
    loadData('midnight-ship-journals', setShipJournals);
    loadData('midnight-ship-assignments', setShipAssignments);
  };

  // Generic CRUD operations
  const createRecord = (table, data) => {
    const record = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    const currentData = getStateByTable(table);
    const newData = [...currentData, record];
    localStorage.setItem(`midnight-${table}`, JSON.stringify(newData));
    updateStateByTable(table, newData);
    return record;
  };

  const updateRecord = (table, id, updates) => {
    const updatedRecord = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    const currentData = getStateByTable(table);
    const updatedData = currentData.map(item =>
      item.id === id ? { ...item, ...updatedRecord } : item
    );
    localStorage.setItem(`midnight-${table}`, JSON.stringify(updatedData));
    updateStateByTable(table, updatedData);
    return { id, ...updatedRecord };
  };

  const deleteRecord = (table, id) => {
    const currentData = getStateByTable(table);
    const filteredData = currentData.filter(item => item.id !== id);
    localStorage.setItem(`midnight-${table}`, JSON.stringify(filteredData));
    updateStateByTable(table, filteredData);
  };

  const getStateByTable = (table) => {
    const tableMap = {
      'organizations': organizations,
      'persons': persons,
      'journals': journals,
      'person-entries': personEntries,
      'memberships': memberships,
      'org-relationships': orgRelationships,
      'incidents': incidents,
      'manufacturers': manufacturers,
      'ship-models': shipModels,
      'ships': ships,
      'ship-journals': shipJournals,
      'ship-assignments': shipAssignments
    };
    return tableMap[table] || [];
  };

  const updateStateByTable = (table, data) => {
    const setterMap = {
      'organizations': setOrganizations,
      'persons': setPersons,
      'journals': setJournals,
      'person-entries': setPersonEntries,
      'memberships': setMemberships,
      'org-relationships': setOrgRelationships,
      'incidents': setIncidents,
      'manufacturers': setManufacturers,
      'ship-models': setShipModels,
      'ships': setShips,
      'ship-journals': setShipJournals,
      'ship-assignments': setShipAssignments
    };
    const setter = setterMap[table];
    if (setter) {
      setter(data);
    }
  };

  // Organization functions
  const addOrganization = (organization) => {
    const newOrg = createRecord('organizations', organization);
    return newOrg;
  };

  const updateOrganization = (id, updates) => {
    const updated = updateRecord('organizations', id, updates);
    setOrganizations(prev => prev.map(org => org.id === id ? { ...org, ...updated } : org));
    return updated;
  };

  const deleteOrganization = (id) => {
    deleteRecord('organizations', id);
    setOrganizations(prev => prev.filter(org => org.id !== id));
    setJournals(prev => prev.filter(j => j.organizationId !== id));
    setMemberships(prev => prev.filter(m => m.organizationId !== id));
    setOrgRelationships(prev => prev.filter(r => r.organizationId !== id && r.relatedOrganizationId !== id));
  };

  // Person functions
  const addPerson = (person) => {
    const newPerson = createRecord('persons', person);
    return newPerson;
  };

  const updatePerson = (id, updates) => {
    const updated = updateRecord('persons', id, updates);
    setPersons(prev => prev.map(person => person.id === id ? { ...person, ...updated } : person));
    return updated;
  };

  const deletePerson = (id) => {
    deleteRecord('persons', id);
    setPersons(prev => prev.filter(person => person.id !== id));
    setPersonEntries(prev => prev.filter(e => e.personId !== id));
    setMemberships(prev => prev.filter(m => m.personId !== id));
    setShipAssignments(prev => prev.filter(sa => sa.personId !== id));
  };

  // Journal functions
  const addJournal = (journal) => {
    const newJournal = createRecord('journals', journal);
    return newJournal;
  };

  const updateJournal = (id, updates) => {
    const updated = updateRecord('journals', id, updates);
    setJournals(prev => prev.map(journal => journal.id === id ? { ...journal, ...updated } : journal));
    return updated;
  };

  // Person entry functions
  const addPersonEntry = (entry) => {
    const newEntry = createRecord('person-entries', entry);
    return newEntry;
  };

  const updatePersonEntry = (id, updates) => {
    const updated = updateRecord('person-entries', id, updates);
    setPersonEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updated } : entry));
    return updated;
  };

  // Membership functions
  const addMembership = (membership) => {
    const newMembership = createRecord('memberships', membership);
    return newMembership;
  };

  const updateMembership = (id, updates) => {
    const updated = updateRecord('memberships', id, updates);
    setMemberships(prev => prev.map(membership => membership.id === id ? { ...membership, ...updated } : membership));
    return updated;
  };

  const removeMembership = (id) => {
    deleteRecord('memberships', id);
    setMemberships(prev => prev.filter(membership => membership.id !== id));
  };

  // Organization relationship functions
  const addOrgRelationship = (relationship) => {
    const newRelationship = createRecord('org-relationships', relationship);
    return newRelationship;
  };

  const updateOrgRelationship = (id, updates) => {
    const updated = updateRecord('org-relationships', id, updates);
    setOrgRelationships(prev => prev.map(rel => rel.id === id ? { ...rel, ...updated } : rel));
    return updated;
  };

  const removeOrgRelationship = (id) => {
    deleteRecord('org-relationships', id);
    setOrgRelationships(prev => prev.filter(rel => rel.id !== id));
  };

  // Incident functions
  const addIncident = (incident) => {
    const newIncident = createRecord('incidents', incident);
    return newIncident;
  };

  // Manufacturer functions
  const addManufacturer = (manufacturer) => {
    const newManufacturer = createRecord('manufacturers', manufacturer);
    return newManufacturer;
  };

  const updateManufacturer = (id, updates) => {
    const updated = updateRecord('manufacturers', id, updates);
    setManufacturers(prev => prev.map(manufacturer => manufacturer.id === id ? { ...manufacturer, ...updated } : manufacturer));
    return updated;
  };

  const deleteManufacturer = (id) => {
    deleteRecord('manufacturers', id);
    setManufacturers(prev => prev.filter(manufacturer => manufacturer.id !== id));
    setShipModels(prev => prev.filter(model => model.manufacturerId !== id));
  };

  // Ship model functions
  const addShipModel = (model) => {
    const newModel = createRecord('ship-models', model);
    return newModel;
  };

  const updateShipModel = (id, updates) => {
    const updated = updateRecord('ship-models', id, updates);
    setShipModels(prev => prev.map(model => model.id === id ? { ...model, ...updated } : model));
    return updated;
  };

  const deleteShipModel = (id) => {
    deleteRecord('ship-models', id);
    setShipModels(prev => prev.filter(model => model.id !== id));
  };

  // Ship functions
  const addShip = (ship) => {
    const newShip = createRecord('ships', ship);
    return newShip;
  };

  const updateShip = (id, updates) => {
    const updated = updateRecord('ships', id, updates);
    setShips(prev => prev.map(ship => ship.id === id ? { ...ship, ...updated } : ship));
    return updated;
  };

  const deleteShip = (id) => {
    deleteRecord('ships', id);
    setShips(prev => prev.filter(ship => ship.id !== id));
    setShipJournals(prev => prev.filter(j => j.shipId !== id));
    setShipAssignments(prev => prev.filter(sa => sa.shipId !== id));
  };

  // Ship journal functions
  const addShipJournal = (journal) => {
    const newJournal = createRecord('ship-journals', journal);
    return newJournal;
  };

  // Ship assignment functions
  const addShipAssignment = (assignment) => {
    const newAssignment = createRecord('ship-assignments', assignment);
    return newAssignment;
  };

  const removeShipAssignment = (id) => {
    deleteRecord('ship-assignments', id);
    setShipAssignments(prev => prev.filter(assignment => assignment.id !== id));
  };

  // Search functions
  const searchPlayers = (query) => {
    const lowerQuery = query.toLowerCase();
    return persons.filter(person =>
      person.name.toLowerCase().includes(lowerQuery) ||
      person.handle.toLowerCase().includes(lowerQuery) ||
      person.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery))
    );
  };

  const searchOrganizations = (query) => {
    const lowerQuery = query.toLowerCase();
    return organizations.filter(org =>
      org.name.toLowerCase().includes(lowerQuery) ||
      org.handle?.toLowerCase().includes(lowerQuery) ||
      org.description?.toLowerCase().includes(lowerQuery)
    );
  };

  const searchShips = (query) => {
    const lowerQuery = query.toLowerCase();
    return ships.filter(ship =>
      ship.name.toLowerCase().includes(lowerQuery) ||
      ship.serialNumber?.toLowerCase().includes(lowerQuery)
    );
  };

  const globalSearch = (query) => {
    return {
      persons: searchPlayers(query),
      organizations: searchOrganizations(query),
      ships: searchShips(query)
    };
  };

  const findPersonByHandle = (handle) => {
    return persons.find(person => person.handle.toLowerCase() === handle.toLowerCase());
  };

  const getPersonMemberships = (personId) => {
    return memberships.filter(m => m.personId === personId);
  };

  const getPersonCrimeStats = (personId) => {
    const entries = personEntries.filter(e => e.personId === personId);
    const crimeStats = {};
    entries.forEach(entry => {
      if (entry.crimeTypes) {
        entry.crimeTypes.forEach(crimeType => {
          crimeStats[crimeType] = (crimeStats[crimeType] || 0) + 1;
        });
      }
    });
    return crimeStats;
  };

  const getOrgCrimeStats = (orgId) => {
    const orgMembers = memberships
      .filter(m => m.organizationId === orgId && m.isActive)
      .map(m => m.personId);

    const crimeStats = {};
    orgMembers.forEach(personId => {
      const personStats = getPersonCrimeStats(personId);
      Object.keys(personStats).forEach(crimeType => {
        crimeStats[crimeType] = (crimeStats[crimeType] || 0) + personStats[crimeType];
      });
    });
    return crimeStats;
  };

  const hasPersonCommittedCrimes = (personId) => {
    return personEntries.some(entry =>
      entry.personId === personId &&
      entry.crimeTypes &&
      entry.crimeTypes.some(crimeType =>
        CRIME_TYPES.some(ct => ct.id === crimeType)
      )
    );
  };

  const getOrgRelationships = (orgId) => {
    return orgRelationships.filter(rel =>
      rel.organizationId === orgId || rel.relatedOrganizationId === orgId
    );
  };

  const getPersonShips = (personId) => {
    const assignments = shipAssignments.filter(sa => sa.personId === personId);
    return assignments.map(assignment => {
      const ship = ships.find(s => s.id === assignment.shipId);
      return { ...ship, assignment };
    }).filter(ship => ship.id);
  };

  const getShipPersons = (shipId) => {
    const assignments = shipAssignments.filter(sa => sa.shipId === shipId);
    return assignments.map(assignment => {
      const person = persons.find(p => p.id === assignment.personId);
      return { ...person, assignment };
    }).filter(person => person.id);
  };

  const getShipModel = (modelId) => {
    return shipModels.find(model => model.id === modelId);
  };

  const getManufacturer = (manufacturerId) => {
    return manufacturers.find(manufacturer => manufacturer.id === manufacturerId);
  };

  const value = {
    // Data
    organizations,
    persons,
    journals,
    personEntries,
    memberships,
    orgRelationships,
    incidents,
    manufacturers,
    shipModels,
    ships,
    shipJournals,
    shipAssignments,
    CRIME_TYPES,
    RELATIONSHIP_TYPES,
    SHIP_TYPES,
    loading,
    supabaseConnected: false,

    // Organization functions
    addOrganization,
    updateOrganization,
    deleteOrganization,

    // Person functions
    addPerson,
    updatePerson,
    deletePerson,

    // Journal functions
    addJournal,
    updateJournal,

    // Person entry functions
    addPersonEntry,
    updatePersonEntry,

    // Membership functions
    addMembership,
    updateMembership,
    removeMembership,

    // Organization relationship functions
    addOrgRelationship,
    updateOrgRelationship,
    removeOrgRelationship,

    // Incident functions
    addIncident,

    // Manufacturer functions
    addManufacturer,
    updateManufacturer,
    deleteManufacturer,

    // Ship model functions
    addShipModel,
    updateShipModel,
    deleteShipModel,

    // Ship functions
    addShip,
    updateShip,
    deleteShip,

    // Ship journal functions
    addShipJournal,

    // Ship assignment functions
    addShipAssignment,
    removeShipAssignment,

    // Search functions
    searchPlayers,
    searchOrganizations,
    searchShips,
    globalSearch,
    findPersonByHandle,

    // Helper functions
    getPersonMemberships,
    getPersonCrimeStats,
    getOrgCrimeStats,
    hasPersonCommittedCrimes,
    getOrgRelationships,
    getPersonShips,
    getShipPersons,
    getShipModel,
    getManufacturer
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};