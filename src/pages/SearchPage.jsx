import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const { FiSearch, FiUser, FiBuilding, FiAnchor, FiCalendar, FiUsers } = FiIcons;

const SearchPage = () => {
  const { globalSearch, personEntries, getShipModel, getManufacturer } = useData();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ persons: [], organizations: [], ships: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = globalSearch(query);
      setSearchResults(results);
    } else {
      setSearchResults({ persons: [], organizations: [], ships: [] });
      setSelectedItem(null);
      setSelectedType(null);
    }
  };

  const selectItem = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
  };

  const getPersonEntries = (personId) => {
    return personEntries.filter(e => e.personId === personId);
  };

  const renderPersonDetails = (person) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
    >
      <div className="flex items-center space-x-3 mb-4">
        {person.avatarUrl ? (
          <img
            src={person.avatarUrl}
            alt={person.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="bg-red-600 rounded-lg p-3">
            <SafeIcon icon={FiUser} className="w-8 h-8 text-white" />
          </div>
        )}
        <div>
          <h5 className="text-xl font-semibold text-white">{person.name}</h5>
          <p className="text-midnight-400">@{person.handle}</p>
          {person.pledgeRank && (
            <p className="text-midnight-500 text-sm">{person.pledgeRank}</p>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {person.location && (
          <div>
            <p className="text-midnight-400 text-xs">Location:</p>
            <p className="text-midnight-300 text-sm">{person.location}</p>
          </div>
        )}
        {person.language && (
          <div>
            <p className="text-midnight-400 text-xs">Language:</p>
            <p className="text-midnight-300 text-sm">{person.language}</p>
          </div>
        )}
      </div>

      {/* Entries */}
      <div className="border-t border-midnight-700 pt-4">
        <h6 className="text-lg font-semibold text-white mb-3">
          Person Entries ({getPersonEntries(person.id).length})
        </h6>
        {getPersonEntries(person.id).length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {getPersonEntries(person.id)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 3)
              .map((entry) => (
                <div key={entry.id} className="bg-midnight-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-midnight-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-midnight-300 text-sm">{entry.description}</p>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-midnight-400 text-sm">No entries recorded</p>
        )}
      </div>
    </motion.div>
  );

  const renderOrganizationDetails = (organization) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
    >
      <div className="flex items-center space-x-3 mb-4">
        {organization.logoUrl ? (
          <img
            src={organization.logoUrl}
            alt={organization.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="bg-blue-600 rounded-lg p-3">
            <SafeIcon icon={FiBuilding} className="w-8 h-8 text-white" />
          </div>
        )}
        <div>
          <h5 className="text-xl font-semibold text-white">{organization.name}</h5>
          {organization.handle && (
            <p className="text-midnight-400">@{organization.handle}</p>
          )}
          <p className="text-midnight-500 text-sm">{organization.type}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-midnight-400 text-xs mb-1">Description:</p>
        <p className="text-midnight-300 text-sm">{organization.description}</p>
      </div>

      {organization.language && (
        <div className="mb-4">
          <p className="text-midnight-400 text-xs">Language:</p>
          <p className="text-midnight-300 text-sm">{organization.language}</p>
        </div>
      )}

      {organization.lastScanned && (
        <div>
          <p className="text-midnight-400 text-xs">Last Scanned:</p>
          <p className="text-midnight-300 text-sm">
            {new Date(organization.lastScanned).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );

  const renderShipDetails = (ship) => {
    const model = getShipModel(ship.modelId);
    const manufacturer = model ? getManufacturer(model.manufacturerId) : null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-600 rounded-lg p-3">
            <SafeIcon icon={FiAnchor} className="w-8 h-8 text-white" />
          </div>
          <div>
            <h5 className="text-xl font-semibold text-white">{ship.name}</h5>
            <p className="text-midnight-400">{ship.serialNumber}</p>
            {model && (
              <p className="text-midnight-500 text-sm">{model.name} - {model.type}</p>
            )}
          </div>
        </div>

        {manufacturer && (
          <div className="mb-4">
            <p className="text-midnight-400 text-xs">Manufacturer:</p>
            <p className="text-midnight-300 text-sm">{manufacturer.name}</p>
          </div>
        )}

        {ship.description && (
          <div className="mb-4">
            <p className="text-midnight-400 text-xs">Description:</p>
            <p className="text-midnight-300 text-sm">{ship.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {ship.location && (
            <div>
              <p className="text-midnight-400 text-xs">Location:</p>
              <p className="text-midnight-300 text-sm">{ship.location}</p>
            </div>
          )}
          {ship.status && (
            <div>
              <p className="text-midnight-400 text-xs">Status:</p>
              <p className="text-midnight-300 text-sm">{ship.status}</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (!hasPermission('canSearchPersons')) {
    return (
      <Layout title="Search">
        <div className="text-center py-12">
          <SafeIcon icon={FiSearch} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-midnight-400 mb-2">Access Denied</h3>
          <p className="text-midnight-500">You don't have permission to use the search function</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Global Search">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-midnight-300 mb-6">
            Search for persons, organizations, and ships
          </h3>
          {/* Search Input */}
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-midnight-900 border border-midnight-700 rounded-xl text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Enter search term..."
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Results List */}
            <div className="space-y-6">
              {/* Persons */}
              {searchResults.persons.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white flex items-center mb-4">
                    <SafeIcon icon={FiUsers} className="w-5 h-5 mr-2" />
                    Persons ({searchResults.persons.length})
                  </h4>
                  <div className="space-y-3">
                    {searchResults.persons.map((person) => (
                      <motion.div
                        key={person.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => selectItem(person, 'person')}
                        className={`bg-midnight-900 rounded-lg p-4 border cursor-pointer transition-all ${
                          selectedItem?.id === person.id && selectedType === 'person'
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
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizations */}
              {searchResults.organizations.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white flex items-center mb-4">
                    <SafeIcon icon={FiBuilding} className="w-5 h-5 mr-2" />
                    Organizations ({searchResults.organizations.length})
                  </h4>
                  <div className="space-y-3">
                    {searchResults.organizations.map((org) => (
                      <motion.div
                        key={org.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => selectItem(org, 'organization')}
                        className={`bg-midnight-900 rounded-lg p-4 border cursor-pointer transition-all ${
                          selectedItem?.id === org.id && selectedType === 'organization'
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-midnight-700 hover:border-midnight-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="bg-blue-600 rounded-lg p-2">
                              <SafeIcon icon={FiBuilding} className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h5 className="font-semibold text-white">{org.name}</h5>
                            <p className="text-midnight-400 text-sm">{org.type}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ships */}
              {searchResults.ships.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white flex items-center mb-4">
                    <SafeIcon icon={FiAnchor} className="w-5 h-5 mr-2" />
                    Ships ({searchResults.ships.length})
                  </h4>
                  <div className="space-y-3">
                    {searchResults.ships.map((ship) => (
                      <motion.div
                        key={ship.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => selectItem(ship, 'ship')}
                        className={`bg-midnight-900 rounded-lg p-4 border cursor-pointer transition-all ${
                          selectedItem?.id === ship.id && selectedType === 'ship'
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-midnight-700 hover:border-midnight-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-600 rounded-lg p-2">
                            <SafeIcon icon={FiAnchor} className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-white">{ship.name}</h5>
                            <p className="text-midnight-400 text-sm">{ship.serialNumber}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.persons.length === 0 && 
               searchResults.organizations.length === 0 && 
               searchResults.ships.length === 0 && (
                <div className="text-center py-8 bg-midnight-900 rounded-lg border border-midnight-700">
                  <SafeIcon icon={FiSearch} className="w-12 h-12 text-midnight-600 mx-auto mb-4" />
                  <p className="text-midnight-400">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Selected Item Details */}
            <div className="space-y-4">
              {selectedItem ? (
                <>
                  <h4 className="text-lg font-semibold text-white">
                    {selectedType === 'person' && 'Person Details'}
                    {selectedType === 'organization' && 'Organization Details'}
                    {selectedType === 'ship' && 'Ship Details'}
                  </h4>
                  {selectedType === 'person' && renderPersonDetails(selectedItem)}
                  {selectedType === 'organization' && renderOrganizationDetails(selectedItem)}
                  {selectedType === 'ship' && renderShipDetails(selectedItem)}
                </>
              ) : (
                <div className="bg-midnight-900 rounded-xl p-8 border border-midnight-700 text-center">
                  <SafeIcon icon={FiSearch} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                  <p className="text-midnight-400">Select an item to view details</p>
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
              Enter a search term above to find persons, organizations, and ships in the database.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;