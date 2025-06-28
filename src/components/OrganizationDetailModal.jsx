import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useData } from '../contexts/DataContext';

const { FiX, FiEdit3, FiBuilding, FiCalendar, FiGlobe, FiBook, FiUsers, FiBarChart3 } = FiIcons;

const OrganizationDetailModal = ({ organization, isOpen, onClose, onEdit }) => {
  const { 
    journals, 
    getOrgCrimeStats,
    memberships,
    persons,
    CRIME_TYPES 
  } = useData();

  if (!organization || !isOpen) return null;

  const orgJournals = journals.filter(j => j.organizationId === organization.id);
  const crimeStats = getOrgCrimeStats(organization.id);
  const orgMemberships = memberships.filter(m => m.organizationId === organization.id);
  const totalMembers = orgMemberships.length;
  const activeMembers = orgMemberships.filter(m => m.isActive).length;

  return (
    <AnimatePresence>
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
          className="bg-midnight-900 rounded-xl w-full max-w-5xl border border-midnight-700 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-midnight-700">
            <div className="flex items-center space-x-4">
              {organization.logoUrl ? (
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`bg-red-600 rounded-lg p-3 ${organization.logoUrl ? 'hidden' : 'flex'}`}>
                <SafeIcon icon={FiBuilding} className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{organization.name}</h2>
                {organization.handle && (
                  <p className="text-midnight-400">@{organization.handle}</p>
                )}
                <p className="text-midnight-500 text-sm">{organization.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(organization)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={onClose}
                className="text-midnight-400 hover:text-white transition-colors"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organization.language && (
                <div className="bg-midnight-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiGlobe} className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-midnight-300">Language</span>
                  </div>
                  <p className="text-white">{organization.language}</p>
                </div>
              )}

              {organization.lastScanned && (
                <div className="bg-midnight-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-midnight-300">Last Scanned</span>
                  </div>
                  <p className="text-white">{new Date(organization.lastScanned).toLocaleString()}</p>
                </div>
              )}

              <div className="bg-midnight-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={FiUsers} className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-midnight-300">Members</span>
                </div>
                <p className="text-white">
                  {activeMembers} active / {totalMembers} total
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-midnight-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-midnight-300 leading-relaxed">{organization.description}</p>
            </div>

            {/* Crime Statistics */}
            {Object.keys(crimeStats).length > 0 && (
              <div className="bg-midnight-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <SafeIcon icon={FiBarChart3} className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Member Crime Statistics</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(crimeStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([crimeType, count]) => {
                    const crimeTypeInfo = CRIME_TYPES.find(ct => ct.id === crimeType);
                    return (
                      <div key={crimeType} className="bg-midnight-700 rounded-lg p-4 text-center">
                        <div className={`w-12 h-12 ${crimeTypeInfo?.color || 'bg-gray-600'} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">{count}</span>
                        </div>
                        <p className="text-white font-semibold text-sm">{crimeTypeInfo?.name || crimeType}</p>
                        <p className="text-midnight-400 text-xs">incidents</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-midnight-700 rounded-lg">
                  <p className="text-midnight-300 text-sm">
                    Total incidents involving organization members: <span className="text-white font-semibold">
                      {Object.values(crimeStats).reduce((sum, count) => sum + count, 0)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Recent Members */}
            {orgMemberships.length > 0 && (
              <div className="bg-midnight-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {orgMemberships
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 6)
                    .map((membership) => {
                    const person = persons.find(p => p.id === membership.personId);
                    if (!person) return null;
                    
                    return (
                      <div
                        key={membership.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          membership.isActive 
                            ? 'bg-midnight-700 border border-midnight-600' 
                            : 'bg-midnight-800/50 border border-midnight-700 opacity-60'
                        }`}
                      >
                        {person.avatarUrl ? (
                          <img
                            src={person.avatarUrl}
                            alt={person.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="bg-red-600 rounded p-1">
                            <SafeIcon icon={FiUsers} className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{person.name}</p>
                          <p className="text-midnight-400 text-xs">@{person.handle}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${membership.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      </div>
                    );
                  })}
                </div>
                {orgMemberships.length > 6 && (
                  <p className="text-midnight-400 text-sm mt-3 text-center">
                    And {orgMemberships.length - 6} more members...
                  </p>
                )}
              </div>
            )}

            {/* Recent Journal Entries */}
            <div className="bg-midnight-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Recent Journal Entries ({orgJournals.length})</h3>
              {orgJournals.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {orgJournals
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((journal) => (
                    <div key={journal.id} className="bg-midnight-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 text-midnight-400" />
                        <span className="text-sm text-midnight-400">
                          {new Date(journal.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-midnight-300 text-sm">{journal.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <SafeIcon icon={FiBook} className="w-8 h-8 text-midnight-600 mx-auto mb-2" />
                  <p className="text-midnight-400 text-sm">No journal entries recorded</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrganizationDetailModal;