import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import PersonDetailModal from '../components/PersonDetailModal';

const { FiPlus, FiUsers, FiEdit3, FiFileText, FiCalendar, FiX, FiLink, FiUser } = FiIcons;

const PersonsPage = () => {
  const { 
    persons, 
    organizations, 
    personEntries, 
    addPerson, 
    updatePerson, 
    addPersonEntry, 
    updatePersonEntry,
    hasPersonCommittedCrimes,
    CRIME_TYPES
  } = useData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerEntry, handleSubmit: handleEntrySubmit, reset: resetEntry, formState: { errors: entryErrors } } = useForm();

  const onSubmitPerson = (data) => {
    const aliases = data.aliases ? data.aliases.split(',').map(alias => alias.trim()).filter(Boolean) : [];

    const personData = {
      name: data.name,
      handle: data.handle,
      aliases,
      enlistDate: data.enlistDate,
      location: data.location,
      language: data.language,
      avatarUrl: data.avatarUrl,
      pledgeRank: data.pledgeRank,
      citizenRecordNumber: data.citizenRecordNumber,
      note: data.note,
      bio: data.bio,
      lastScanned: data.lastScanned
    };

    if (editingPerson) {
      updatePerson(editingPerson.id, personData);
      setEditingPerson(null);
    } else {
      addPerson(personData);
    }
    reset();
    setShowForm(false);
  };

  const onSubmitEntry = (data) => {
    const entryData = {
      ...data,
      personId: selectedPerson.id,
      personName: selectedPerson.name,
      crimeTypes: data.crimeTypes ? Object.keys(data.crimeTypes).filter(key => data.crimeTypes[key]) : []
    };

    if (editingEntry) {
      updatePersonEntry(editingEntry.id, entryData);
      setEditingEntry(null);
    } else {
      addPersonEntry(entryData);
    }
    resetEntry();
    setShowEntryForm(false);
  };

  const startEditPerson = (person) => {
    setEditingPerson(person);
    const formData = {
      ...person,
      aliases: person.aliases ? person.aliases.join(', ') : ''
    };
    reset(formData);
    setShowForm(true);
  };

  const startEditEntry = (entry) => {
    setEditingEntry(entry);
    const formData = { ...entry };
    if (entry.crimeTypes) {
      entry.crimeTypes.forEach(crimeType => {
        formData[`crimeTypes.${crimeType}`] = true;
      });
    }
    resetEntry(formData);
    setShowEntryForm(true);
  };

  const openPersonDetail = (person) => {
    setSelectedPerson(person);
    setShowDetailModal(true);
  };

  const getPersonEntries = (personId) => {
    return personEntries.filter(e => e.personId === personId);
  };

  return (
    <Layout title="Person Records">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-midnight-300">
              Manage person records and their activities
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Person</span>
          </motion.button>
        </div>

        {/* Persons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {persons.map((person) => {
            const hasCrimes = hasPersonCommittedCrimes(person.id);
            return (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-midnight-900 rounded-xl p-6 border transition-all cursor-pointer hover:scale-105 ${
                  hasCrimes ? 'border-red-500/50 bg-red-900/10' : 'border-midnight-700'
                }`}
                onClick={() => openPersonDetail(person)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {person.avatarUrl ? (
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`bg-red-600 rounded-lg p-2 ${person.avatarUrl ? 'hidden' : 'flex'}`}>
                      <SafeIcon icon={FiUser} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{person.name}</h4>
                      <p className="text-midnight-400 text-sm">@{person.handle}</p>
                      {person.pledgeRank && (
                        <p className="text-midnight-500 text-xs">{person.pledgeRank}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditPerson(person);
                    }}
                    className="text-midnight-400 hover:text-white transition-colors"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  </button>
                </div>

                {/* Aliases */}
                {person.aliases && person.aliases.length > 0 && (
                  <div className="mb-3">
                    <p className="text-midnight-400 text-xs mb-1">Aliases:</p>
                    <div className="flex flex-wrap gap-1">
                      {person.aliases.map((alias, index) => (
                        <span key={index} className="bg-midnight-800 text-midnight-300 px-2 py-1 rounded text-xs">
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {person.location && (
                  <div className="mb-3">
                    <p className="text-midnight-400 text-xs mb-1">Location:</p>
                    <p className="text-midnight-300 text-sm">{person.location}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                  <div className="flex items-center space-x-4">
                    <span className="text-midnight-400 text-xs">
                      {getPersonEntries(person.id).length} entries
                    </span>
                    {hasCrimes && (
                      <span className="text-red-400 text-xs font-medium">
                        Criminal Activity
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPerson(person);
                      setShowEntryForm(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                  >
                    <SafeIcon icon={FiFileText} className="w-3 h-3" />
                    <span>Add Entry</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {persons.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiUsers} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No persons recorded</h3>
            <p className="text-midnight-500">Start by adding your first person record</p>
          </div>
        )}
      </div>

      {/* Person Form Modal */}
      <AnimatePresence>
        {showForm && (
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
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-4xl border border-midnight-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingPerson ? 'Edit Person' : 'Add Person'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPerson(null);
                    reset();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitPerson)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Handle *
                    </label>
                    <input
                      {...register('handle', { required: 'Handle is required' })}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter handle/username"
                    />
                    {errors.handle && (
                      <p className="mt-1 text-sm text-red-400">{errors.handle.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Enlist Date
                    </label>
                    <input
                      {...register('enlistDate')}
                      type="date"
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Last Scanned
                    </label>
                    <input
                      {...register('lastScanned')}
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Location
                    </label>
                    <input
                      {...register('location')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Language
                    </label>
                    <input
                      {...register('language')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter language"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Avatar URL
                    </label>
                    <input
                      {...register('avatarUrl')}
                      type="url"
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter avatar URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Pledge Rank
                    </label>
                    <input
                      {...register('pledgeRank')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter pledge rank"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Citizen Record Number
                    </label>
                    <input
                      {...register('citizenRecordNumber')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter citizen record number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Aliases (comma-separated)
                    </label>
                    <input
                      {...register('aliases')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter aliases separated by commas"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Note
                  </label>
                  <textarea
                    {...register('note')}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter biographical information"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPerson(null);
                      reset();
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingPerson ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Form Modal */}
      <AnimatePresence>
        {showEntryForm && (
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
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-2xl border border-midnight-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingEntry ? 'Edit Person Entry' : 'Add Person Entry'}
                </h3>
                <button
                  onClick={() => {
                    setShowEntryForm(false);
                    setEditingEntry(null);
                    setSelectedPerson(null);
                    resetEntry();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {selectedPerson && (
                <div className="mb-4 p-3 bg-midnight-800 rounded-lg flex items-center space-x-3">
                  {selectedPerson.avatarUrl ? (
                    <img
                      src={selectedPerson.avatarUrl}
                      alt={selectedPerson.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="bg-red-600 rounded p-1">
                      <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <p className="text-sm text-midnight-300">
                    Person: <span className="text-white font-medium">{selectedPerson.name}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleEntrySubmit(onSubmitEntry)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Date
                  </label>
                  <input
                    {...registerEntry('date', { required: 'Date is required' })}
                    type="date"
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {entryErrors.date && (
                    <p className="mt-1 text-sm text-red-400">{entryErrors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Crime Types
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CRIME_TYPES.map((crimeType) => (
                      <label key={crimeType.id} className="flex items-center space-x-2">
                        <input
                          {...registerEntry(`crimeTypes.${crimeType.id}`)}
                          type="checkbox"
                          className="rounded bg-midnight-800 border-midnight-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-midnight-300">{crimeType.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Description
                  </label>
                  <textarea
                    {...registerEntry('description', { required: 'Description is required' })}
                    rows={4}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed description of the activity"
                  />
                  {entryErrors.description && (
                    <p className="mt-1 text-sm text-red-400">{entryErrors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEntryForm(false);
                      setEditingEntry(null);
                      setSelectedPerson(null);
                      resetEntry();
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingEntry ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPerson(null);
        }}
        onEdit={(person) => {
          setShowDetailModal(false);
          startEditPerson(person);
        }}
      />
    </Layout>
  );
};

export default PersonsPage;