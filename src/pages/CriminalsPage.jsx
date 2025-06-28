import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';

const { FiPlus, FiUsers, FiEdit3, FiFileText, FiCalendar, FiX, FiLink, FiUser } = FiIcons;

const CriminalsPage = () => {
  const { criminals, organizations, criminalEntries, addCriminal, updateCriminal, addCriminalEntry, updateCriminalEntry } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingCriminal, setEditingCriminal] = useState(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedCriminal, setSelectedCriminal] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const { register: registerEntry, handleSubmit: handleEntrySubmit, reset: resetEntry, formState: { errors: entryErrors } } = useForm();

  const watchedAffiliations = watch(['affiliation1', 'affiliation2', 'affiliation3', 'affiliation4', 'affiliation5', 'affiliation6']);

  const onSubmitCriminal = (data) => {
    const affiliations = [
      data.affiliation1,
      data.affiliation2,
      data.affiliation3,
      data.affiliation4,
      data.affiliation5,
      data.affiliation6
    ].filter(Boolean);

    const aliases = data.aliases ? data.aliases.split(',').map(alias => alias.trim()).filter(Boolean) : [];

    const criminalData = {
      name: data.name,
      handle: data.handle,
      affiliations,
      aliases,
      knownLocations: data.knownLocations,
      currentActivities: data.currentActivities
    };

    if (editingCriminal) {
      updateCriminal(editingCriminal.id, criminalData);
      setEditingCriminal(null);
    } else {
      addCriminal(criminalData);
    }
    reset();
    setShowForm(false);
  };

  const onSubmitEntry = (data) => {
    const entryData = {
      ...data,
      criminalId: selectedCriminal.id,
      criminalName: selectedCriminal.name
    };

    if (editingEntry) {
      updateCriminalEntry(editingEntry.id, entryData);
      setEditingEntry(null);
    } else {
      addCriminalEntry(entryData);
    }
    resetEntry();
    setShowEntryForm(false);
  };

  const startEditCriminal = (criminal) => {
    setEditingCriminal(criminal);
    const formData = {
      ...criminal,
      aliases: criminal.aliases ? criminal.aliases.join(', ') : '',
      affiliation1: criminal.affiliations?.[0] || '',
      affiliation2: criminal.affiliations?.[1] || '',
      affiliation3: criminal.affiliations?.[2] || '',
      affiliation4: criminal.affiliations?.[3] || '',
      affiliation5: criminal.affiliations?.[4] || '',
      affiliation6: criminal.affiliations?.[5] || ''
    };
    reset(formData);
    setShowForm(true);
  };

  const startEditEntry = (entry) => {
    setEditingEntry(entry);
    resetEntry(entry);
    setShowEntryForm(true);
  };

  const getCriminalEntries = (criminalId) => {
    return criminalEntries.filter(e => e.criminalId === criminalId);
  };

  return (
    <Layout title="Criminal Records">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-midnight-300">
              Manage criminal records and their activities
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Criminal</span>
          </motion.button>
        </div>

        {/* Criminals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {criminals.map((criminal) => (
            <motion.div
              key={criminal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-600 rounded-lg p-2">
                    <SafeIcon icon={FiUser} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{criminal.name}</h4>
                    <p className="text-midnight-400 text-sm">@{criminal.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => startEditCriminal(criminal)}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                </button>
              </div>

              {/* Aliases */}
              {criminal.aliases && criminal.aliases.length > 0 && (
                <div className="mb-3">
                  <p className="text-midnight-400 text-xs mb-1">Aliases:</p>
                  <div className="flex flex-wrap gap-1">
                    {criminal.aliases.map((alias, index) => (
                      <span key={index} className="bg-midnight-800 text-midnight-300 px-2 py-1 rounded text-xs">
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Affiliations */}
              {criminal.affiliations && criminal.affiliations.length > 0 && (
                <div className="mb-3">
                  <p className="text-midnight-400 text-xs mb-1">Affiliations:</p>
                  <div className="flex flex-wrap gap-1">
                    {criminal.affiliations.map((affiliation, index) => (
                      <span key={index} className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <SafeIcon icon={FiLink} className="w-3 h-3" />
                        <span>{affiliation}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Known Locations */}
              {criminal.knownLocations && (
                <div className="mb-3">
                  <p className="text-midnight-400 text-xs mb-1">Known Locations:</p>
                  <p className="text-midnight-300 text-sm">{criminal.knownLocations}</p>
                </div>
              )}

              {/* Current Activities */}
              {criminal.currentActivities && (
                <div className="mb-4">
                  <p className="text-midnight-400 text-xs mb-1">Current Activities:</p>
                  <p className="text-midnight-300 text-sm">{criminal.currentActivities}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                <div className="flex items-center space-x-4">
                  <span className="text-midnight-400 text-xs">
                    {getCriminalEntries(criminal.id).length} entries
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCriminal(criminal);
                    setShowEntryForm(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                >
                  <SafeIcon icon={FiFileText} className="w-3 h-3" />
                  <span>Add Entry</span>
                </button>
              </div>

              {/* Criminal Entries */}
              {getCriminalEntries(criminal.id).length > 0 && (
                <div className="mt-4 pt-4 border-t border-midnight-700">
                  <h5 className="text-sm font-medium text-midnight-300 mb-2">Recent Entries</h5>
                  <div className="space-y-2">
                    {getCriminalEntries(criminal.id).slice(-2).map((entry) => (
                      <div key={entry.id} className="bg-midnight-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiCalendar} className="w-3 h-3 text-midnight-400" />
                            <span className="text-xs text-midnight-400">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => startEditEntry(entry)}
                            className="text-midnight-400 hover:text-white transition-colors"
                          >
                            <SafeIcon icon={FiEdit3} className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-midnight-300 text-xs">
                          {entry.description.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {criminals.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiUsers} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No criminals recorded</h3>
            <p className="text-midnight-500">Start by adding your first criminal record</p>
          </div>
        )}
      </div>

      {/* Criminal Form Modal */}
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
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-2xl border border-midnight-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingCriminal ? 'Edit Criminal' : 'Add Criminal'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingCriminal(null);
                    reset();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitCriminal)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Name
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
                      Handle
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Aliases (comma-separated)
                  </label>
                  <input
                    {...register('aliases')}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter aliases separated by commas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Affiliations (up to 6 organizations)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num}>
                        <select
                          {...register(`affiliation${num}`)}
                          className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select organization {num}</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.name}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Known Locations
                  </label>
                  <textarea
                    {...register('knownLocations')}
                    rows={2}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter known locations"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Current Activities
                  </label>
                  <textarea
                    {...register('currentActivities')}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current activities and observations"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCriminal(null);
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
                    {editingCriminal ? 'Update' : 'Add'}
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
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-md border border-midnight-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingEntry ? 'Edit Criminal Entry' : 'Add Criminal Entry'}
                </h3>
                <button
                  onClick={() => {
                    setShowEntryForm(false);
                    setEditingEntry(null);
                    setSelectedCriminal(null);
                    resetEntry();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {selectedCriminal && (
                <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                  <p className="text-sm text-midnight-300">
                    Criminal: <span className="text-white font-medium">{selectedCriminal.name}</span>
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
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Description
                  </label>
                  <textarea
                    {...registerEntry('description', { required: 'Description is required' })}
                    rows={4}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed description of the crime or activity"
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
                      setSelectedCriminal(null);
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
    </Layout>
  );
};

export default CriminalsPage;