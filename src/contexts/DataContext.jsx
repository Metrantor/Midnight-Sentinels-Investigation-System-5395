import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

export const DataProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [persons, setPersons] = useState([]);
  const [journals, setJournals] = useState([]);
  const [personEntries, setPersonEntries] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [orgRelationships, setOrgRelationships] = useState([]);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const storedOrganizations = localStorage.getItem('midnight-organizations');
    const storedPersons = localStorage.getItem('midnight-persons');
    const storedJournals = localStorage.getItem('midnight-journals');
    const storedEntries = localStorage.getItem('midnight-person-entries');
    const storedMemberships = localStorage.getItem('midnight-memberships');
    const storedOrgRelationships = localStorage.getItem('midnight-org-relationships');
    const storedIncidents = localStorage.getItem('midnight-incidents');

    if (storedOrganizations) setOrganizations(JSON.parse(storedOrganizations));
    if (storedPersons) setPersons(JSON.parse(storedPersons));
    if (storedJournals) setJournals(JSON.parse(storedJournals));
    if (storedEntries) setPersonEntries(JSON.parse(storedEntries));
    if (storedMemberships) setMemberships(JSON.parse(storedMemberships));
    if (storedOrgRelationships) setOrgRelationships(JSON.parse(storedOrgRelationships));
    if (storedIncidents) setIncidents(JSON.parse(storedIncidents));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('midnight-organizations', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('midnight-persons', JSON.stringify(persons));
  }, [persons]);

  useEffect(() => {
    localStorage.setItem('midnight-journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('midnight-person-entries', JSON.stringify(personEntries));
  }, [personEntries]);

  useEffect(() => {
    localStorage.setItem('midnight-memberships', JSON.stringify(memberships));
  }, [memberships]);

  useEffect(() => {
    localStorage.setItem('midnight-org-relationships', JSON.stringify(orgRelationships));
  }, [orgRelationships]);

  useEffect(() => {
    localStorage.setItem('midnight-incidents', JSON.stringify(incidents));
  }, [incidents]);

  // Organization functions
  const addOrganization = (organization) => {
    const newOrg = {
      ...organization,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setOrganizations(prev => [...prev, newOrg]);
    return newOrg;
  };

  const updateOrganization = (id, updates) => {
    setOrganizations(prev =>
      prev.map(org =>
        org.id === id
          ? { ...org, ...updates, updatedAt: new Date().toISOString() }
          : org
      )
    );
  };

  // Person functions
  const addPerson = (person) => {
    const newPerson = {
      ...person,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setPersons(prev => [...prev, newPerson]);
    return newPerson;
  };

  const updatePerson = (id, updates) => {
    setPersons(prev =>
      prev.map(person =>
        person.id === id
          ? { ...person, ...updates, updatedAt: new Date().toISOString() }
          : person
      )
    );
  };

  // Journal functions
  const addJournal = (journal) => {
    const newJournal = {
      ...journal,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setJournals(prev => [...prev, newJournal]);
    return newJournal;
  };

  const updateJournal = (id, updates) => {
    setJournals(prev =>
      prev.map(journal =>
        journal.id === id
          ? { ...journal, ...updates, updatedAt: new Date().toISOString() }
          : journal
      )
    );
  };

  // Person entry functions
  const addPersonEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setPersonEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const updatePersonEntry = (id, updates) => {
    setPersonEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  };

  // Membership functions
  const addMembership = (membership) => {
    const newMembership = {
      ...membership,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setMemberships(prev => [...prev, newMembership]);
    return newMembership;
  };

  const updateMembership = (id, updates) => {
    setMemberships(prev =>
      prev.map(membership =>
        membership.id === id
          ? { ...membership, ...updates, updatedAt: new Date().toISOString() }
          : membership
      )
    );
  };

  const removeMembership = (id) => {
    setMemberships(prev => prev.filter(membership => membership.id !== id));
  };

  // Organization relationship functions
  const addOrgRelationship = (relationship) => {
    const newRelationship = {
      ...relationship,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setOrgRelationships(prev => [...prev, newRelationship]);
    return newRelationship;
  };

  const updateOrgRelationship = (id, updates) => {
    setOrgRelationships(prev =>
      prev.map(rel =>
        rel.id === id
          ? { ...rel, ...updates, updatedAt: new Date().toISOString() }
          : rel
      )
    );
  };

  const removeOrgRelationship = (id) => {
    setOrgRelationships(prev => prev.filter(rel => rel.id !== id));
  };

  // Incident functions
  const addIncident = (incident) => {
    const newIncident = {
      ...incident,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setIncidents(prev => [...prev, newIncident]);
    return newIncident;
  };

  const searchPlayers = (query) => {
    const lowerQuery = query.toLowerCase();
    return persons.filter(person =>
      person.name.toLowerCase().includes(lowerQuery) ||
      person.handle.toLowerCase().includes(lowerQuery) ||
      person.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery))
    );
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

  const value = {
    organizations,
    persons,
    journals,
    personEntries,
    memberships,
    orgRelationships,
    incidents,
    CRIME_TYPES,
    RELATIONSHIP_TYPES,
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
    removeMembership,
    addOrgRelationship,
    updateOrgRelationship,
    removeOrgRelationship,
    addIncident,
    searchPlayers,
    findPersonByHandle,
    getPersonMemberships,
    getPersonCrimeStats,
    getOrgCrimeStats,
    hasPersonCommittedCrimes,
    getOrgRelationships
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};