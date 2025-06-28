import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';

const { FiSearch, FiUser, FiLink, FiFileText, FiCalendar, FiUsers } = FiIcons;

const SearchPage = () => {
  const { searchPlayers, personEntries } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchPlayers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
      setSelectedPerson(null);
    }
  };

  const selectPerson = (person) => {
    setSelectedPerson(person);
  };

  const getPersonEntries = (personId) => {
    return personEntries.filter(e => e.personId === personId);
  };

  return (
    <Layout title="Search Players">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-midnight-300 mb-6">
            Search for players by name or handle to view their records
          </h3>

          {/* Search Input */}
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-midnight-900 border border-midnight-700 rounded-xl text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Enter player name or handle..."
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Results List */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <SafeIcon icon={FiUsers} className="w-5 h-5 mr-2" />
                Search Results ({searchResults.length})
              </h4>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((person) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => selectPerson(person)}
                      className={`bg-midnight-900 rounded-lg p-4 border cursor-pointer transition-all ${
                        selectedPerson?.id === person.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-midnight-700 hover:border-midnight-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {person.avatarUrl ? (
                          <img
                            src={person.avatarUrl}
                            alt={person.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-red-600 rounded-lg p-2">
                            <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="font-semibold text-white">{person.name}</h5>
                          <p className="text-midnight-400 text-sm">@{person.handle}</p>
                          {person.aliases && person.aliases.length > 0 && (
                            <p className="text-midnight-500 text-xs mt-1">
                              Aliases: {person.aliases.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-midnight-400 text-xs">
                            {getPersonEntries(person.id).length} entries
                          </p>
                          {person.location && (
                            <p className="text-midnight-500 text-xs">
                              {person.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-midnight-900 rounded-lg border border-midnight-700">
                  <SafeIcon icon={FiSearch} className="w-12 h-12 text-midnight-600 mx-auto mb-4" />
                  <p className="text-midnight-400">No players found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Selected Person Details */}
            <div className="space-y-4">
              {selectedPerson ? (
                <>
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2" />
                    Person Details
                  </h4>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
                  >
                    {/* Person Info */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-3 mb-4">
                        {selectedPerson.avatarUrl ? (
                          <img
                            src={selectedPerson.avatarUrl}
                            alt={selectedPerson.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="bg-red-600 rounded-lg p-3">
                            <SafeIcon icon={FiUser} className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <div>
                          <h5 className="text-xl font-semibold text-white">{selectedPerson.name}</h5>
                          <p className="text-midnight-400">@{selectedPerson.handle}</p>
                          {selectedPerson.pledgeRank && (
                            <p className="text-midnight-500 text-sm">{selectedPerson.pledgeRank}</p>
                          )}
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {selectedPerson.location && (
                          <div>
                            <p className="text-midnight-400 text-xs">Location:</p>
                            <p className="text-midnight-300 text-sm">{selectedPerson.location}</p>
                          </div>
                        )}
                        {selectedPerson.language && (
                          <div>
                            <p className="text-midnight-400 text-xs">Language:</p>
                            <p className="text-midnight-300 text-sm">{selectedPerson.language}</p>
                          </div>
                        )}
                        {selectedPerson.enlistDate && (
                          <div>
                            <p className="text-midnight-400 text-xs">Enlist Date:</p>
                            <p className="text-midnight-300 text-sm">{new Date(selectedPerson.enlistDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedPerson.citizenRecordNumber && (
                          <div>
                            <p className="text-midnight-400 text-xs">Citizen Record:</p>
                            <p className="text-midnight-300 text-sm">{selectedPerson.citizenRecordNumber}</p>
                          </div>
                        )}
                      </div>

                      {/* Aliases */}
                      {selectedPerson.aliases && selectedPerson.aliases.length > 0 && (
                        <div className="mb-4">
                          <p className="text-midnight-400 text-sm mb-2">Aliases:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPerson.aliases.map((alias, index) => (
                              <span key={index} className="bg-midnight-800 text-midnight-300 px-2 py-1 rounded text-sm">
                                {alias}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      {selectedPerson.bio && (
                        <div className="mb-4">
                          <p className="text-midnight-400 text-sm mb-1">Bio:</p>
                          <p className="text-midnight-300 text-sm">{selectedPerson.bio}</p>
                        </div>
                      )}

                      {/* Note */}
                      {selectedPerson.note && (
                        <div className="mb-4">
                          <p className="text-midnight-400 text-sm mb-1">Notes:</p>
                          <p className="text-midnight-300 text-sm">{selectedPerson.note}</p>
                        </div>
                      )}
                    </div>

                    {/* Person Entries */}
                    <div className="border-t border-midnight-700 pt-6">
                      <h6 className="text-lg font-semibold text-white mb-4">
                        Person Entries ({getPersonEntries(selectedPerson.id).length})
                      </h6>

                      {getPersonEntries(selectedPerson.id).length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getPersonEntries(selectedPerson.id)
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((entry) => (
                            <div key={entry.id} className="bg-midnight-800 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <SafeIcon icon={FiCalendar} className="w-4 h-4 text-midnight-400" />
                                  <span className="text-sm text-midnight-400">
                                    {new Date(entry.date).toLocaleDateString()}
                                  </span>
                                </div>
                                {entry.crimeTypes && entry.crimeTypes.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {entry.crimeTypes.map(crimeType => (
                                      <span
                                        key={crimeType}
                                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                                      >
                                        {crimeType}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-midnight-300 text-sm">{entry.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <SafeIcon icon={FiFileText} className="w-8 h-8 text-midnight-600 mx-auto mb-2" />
                          <p className="text-midnight-400 text-sm">No entries recorded</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="bg-midnight-900 rounded-xl p-8 border border-midnight-700 text-center">
                  <SafeIcon icon={FiUser} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                  <p className="text-midnight-400">Select a player to view their details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="text-center py-16">
            <SafeIcon icon={FiSearch} className="w-20 h-20 text-midnight-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-midnight-400 mb-2">Start Your Investigation</h3>
            <p className="text-midnight-500 max-w-md mx-auto">
              Enter a player name or handle in the search box above to begin your investigation and view their records.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;