import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useData } from '../contexts/DataContext';

const { FiX, FiEdit3, FiUser, FiCalendar, FiMapPin, FiGlobe, FiAward, FiFileText, FiBook, FiPlus, FiCheck, FiXCircle, FiExternalLink } = FiIcons;

const PersonDetailModal = ({ person, isOpen, onClose, onEdit }) => {
  const navigate = useNavigate();
  const { 
    personEntries, 
    organizations, 
    memberships, 
    getPersonCrimeStats, 
    getPersonMemberships, 
    addMembership, 
    updateMembership, 
    CRIME_TYPES 
  } = useData();
  
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [newMembership, setNewMembership] = useState({
    organizationId: '',
    startDate: '',
    endDate: '',
    isActive: true,
    lastVerified: new Date().toISOString().split('T')[0]
  });

  if (!person || !isOpen) return null;

  const entries = personEntries.filter(e => e.personId === person.id);
  const crimeStats = getPersonCrimeStats(person.id);
  const personMemberships = getPersonMemberships(person.id);

  const handleAddMembership = () => {
    if (newMembership.organizationId) {
      const org = organizations.find(o => o.id === newMembership.organizationId);
      addMembership({
        ...newMembership,
        personId: person.id,
        organizationName: org.name
      });
      setNewMembership({
        organizationId: '',
        startDate: '',
        endDate: '',
        isActive: true,
        lastVerified: new Date().toISOString().split('T')[0]
      });
      setShowMembershipForm(false);
    }
  };

  const toggleMembershipStatus = (membership) => {
    updateMembership(membership.id, {
      ...membership,
      isActive: !membership.isActive,
      endDate: !membership.isActive ? '' : new Date().toISOString().split('T')[0],
      lastVerified: new Date().toISOString().split('T')[0]
    });
  };

  const navigateToOrganization = (orgId) => {
    onClose();
    navigate('/organizations');
    // You might want to add a way to highlight the specific organization
  };

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
          className="bg-midnight-900 rounded-xl w-full max-w-4xl border border-midnight-700 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-midnight-700">
            <div className="flex items-center space-x-4">
              {person.avatarUrl ? (
                <img
                  src={person.avatarUrl}
                  alt={person.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`bg-red-600 rounded-lg p-3 ${person.avatarUrl ? 'hidden' : 'flex'}`}>
                <SafeIcon icon={FiUser} className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{person.name}</h2>
                <p className="text-midnight-400">@{person.handle}</p>
                {person.pledgeRank && (
                  <p className="text-midnight-500 text-sm">{person.pledgeRank}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(person)}
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
              {person.enlistDate && (
                <div className="bg-midnight-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-midnight-300">Enlist Date</span>
                  </div>
                  <p className="text-white">{new Date(person.enlistDate).toLocaleDateString()}</p>
                </div>
              )}
              {person.location && (
                <div className="bg-midnight-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiMapPin} className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-midnight-300">Location</span>
                  </div>
                  <p className="text-white">{person.location}</p>
                </div>
              )}
              {person.language && (
                <div className="bg-midnight-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiGlobe} className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-midnight-300">Language</span>
                  </div>
                  <p className="text-white">{person.language}</p>
                </div>
              )}
              {person.citizenRecordNumber && (
                <div className="bg-midnight-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiFileText} className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-midnight-300">Citizen Record</span>
                  </div>
                  <p className="text-white">{person.citizenRecordNumber}</p>
                </div>
              )}
              {person.lastScanned && (
                <div className="bg-midnight-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-midnight-300">Last Scanned</span>
                  </div>
                  <p className="text-white">{new Date(person.lastScanned).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Aliases */}
            {person.aliases && person.aliases.length > 0 && (
              <div className="bg-midnight-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Aliases</h3>
                <div className="flex flex-wrap gap-2">
                  {person.aliases.map((alias, index) => (
                    <span
                      key={index}
                      className="bg-midnight-700 text-midnight-300 px-3 py-1 rounded-full text-sm"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Memberships */}
            <div className="bg-midnight-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Organization Memberships</h3>
                <button
                  onClick={() => setShowMembershipForm(!showMembershipForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <SafeIcon icon={FiPlus} className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>

              {showMembershipForm && (
                <div className="mb-4 p-4 bg-midnight-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={newMembership.organizationId}
                      onChange={(e) => setNewMembership({ ...newMembership, organizationId: e.target.value })}
                      className="px-3 py-2 bg-midnight-800 border border-midnight-600 rounded text-white"
                    >
                      <option value="">Select Organization</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={newMembership.startDate}
                      onChange={(e) => setNewMembership({ ...newMembership, startDate: e.target.value })}
                      className="px-3 py-2 bg-midnight-800 border border-midnight-600 rounded text-white"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={newMembership.lastVerified}
                      onChange={(e) => setNewMembership({ ...newMembership, lastVerified: e.target.value })}
                      className="px-3 py-2 bg-midnight-800 border border-midnight-600 rounded text-white"
                      placeholder="Last Verified"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newMembership.isActive}
                        onChange={(e) => setNewMembership({ ...newMembership, isActive: e.target.checked })}
                        className="rounded bg-midnight-800 border-midnight-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-midnight-300 text-sm">Active</span>
                    </label>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={handleAddMembership}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Add Membership
                    </button>
                    <button
                      onClick={() => setShowMembershipForm(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {personMemberships.map((membership) => {
                  const org = organizations.find(o => o.id === membership.organizationId);
                  return (
                    <div
                      key={membership.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        membership.isActive 
                          ? 'bg-midnight-700 border-midnight-600' 
                          : 'bg-midnight-800/30 border-midnight-700/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {org?.logoUrl ? (
                          <img
                            src={org.logoUrl}
                            alt={org.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="bg-blue-600 rounded p-1">
                            <SafeIcon icon={FiAward} className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className={`font-medium ${membership.isActive ? 'text-white' : 'text-midnight-400'}`}>
                              {membership.organizationName}
                            </p>
                            <button
                              onClick={() => navigateToOrganization(membership.organizationId)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Go to Organization"
                            >
                              <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-xs space-y-1">
                            <p className="text-midnight-400">
                              Start: {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : 'Unknown'}
                              {membership.endDate && ` - End: ${new Date(membership.endDate).toLocaleDateString()}`}
                            </p>
                            <p className="text-midnight-500">
                              Last verified: {membership.lastVerified ? new Date(membership.lastVerified).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${membership.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <button
                            onClick={() => toggleMembershipStatus(membership)}
                            className={`p-1 rounded transition-colors ${
                              membership.isActive 
                                ? 'text-green-400 hover:bg-green-900/20' 
                                : 'text-gray-400 hover:bg-gray-900/20'
                            }`}
                            title={membership.isActive ? 'Mark as Inactive' : 'Mark as Active'}
                          >
                            <SafeIcon icon={membership.isActive ? FiCheck : FiXCircle} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {personMemberships.length === 0 && (
                  <p className="text-midnight-400 text-center py-4">No organization memberships recorded</p>
                )}
              </div>
            </div>

            {/* Crime Statistics */}
            {Object.keys(crimeStats).length > 0 && (
              <div className="bg-midnight-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Crime Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(crimeStats).map(([crimeType, count]) => {
                    const crimeTypeInfo = CRIME_TYPES.find(ct => ct.id === crimeType);
                    return (
                      <div key={crimeType} className="bg-midnight-700 rounded-lg p-3 text-center">
                        <div className={`w-8 h-8 ${crimeTypeInfo?.color || 'bg-gray-600'} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">{count}</span>
                        </div>
                        <p className="text-white font-semibold text-sm">{crimeTypeInfo?.name || crimeType}</p>
                        <p className="text-midnight-400 text-xs">incidents</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bio */}
            {person.bio && (
              <div className="bg-midnight-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Biography</h3>
                <p className="text-midnight-300 leading-relaxed">{person.bio}</p>
              </div>
            )}

            {/* Notes */}
            {person.note && (
              <div className="bg-midnight-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                <p className="text-midnight-300 leading-relaxed">{person.note}</p>
              </div>
            )}

            {/* Recent Entries */}
            <div className="bg-midnight-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Recent Entries ({entries.length})</h3>
              {entries.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {entries
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((entry) => (
                      <div key={entry.id} className="bg-midnight-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiCalendar} className="w-4 h-4 text-midnight-400" />
                            <span className="text-sm text-midnight-400">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          {entry.crimeTypes && entry.crimeTypes.length > 0 && (
                            <div className="flex space-x-1">
                              {entry.crimeTypes.map(crimeType => {
                                const crimeTypeInfo = CRIME_TYPES.find(ct => ct.id === crimeType);
                                return (
                                  <span
                                    key={crimeType}
                                    className={`px-2 py-1 rounded text-xs text-white ${crimeTypeInfo?.color || 'bg-gray-600'}`}
                                  >
                                    {crimeTypeInfo?.name || crimeType}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <p className="text-midnight-300 text-sm">{entry.description}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <SafeIcon icon={FiBook} className="w-8 h-8 text-midnight-600 mx-auto mb-2" />
                  <p className="text-midnight-400 text-sm">No entries recorded</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PersonDetailModal;