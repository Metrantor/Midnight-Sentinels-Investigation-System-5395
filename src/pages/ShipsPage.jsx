import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import SpeedSearch from '../components/SpeedSearch';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const { FiPlus, FiAnchor, FiEdit3, FiX, FiTrash2, FiUser, FiBook, FiCalendar } = FiIcons;

const ShipsPage = () => {
  const { 
    ships, 
    shipModels, 
    manufacturers, 
    persons, 
    shipAssignments,
    shipJournals,
    addShip, 
    updateShip, 
    deleteShip,
    addShipAssignment,
    removeShipAssignment,
    addShipJournal,
    getShipModel,
    getManufacturer,
    getShipPersons
  } = useData();
  const { hasPermission } = useAuth();
  
  const [showShipForm, setShowShipForm] = useState(false);
  const [editingShip, setEditingShip] = useState(null);
  const [selectedShip, setSelectedShip] = useState(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const { register: registerJournal, handleSubmit: handleJournalSubmit, reset: resetJournal, formState: { errors: journalErrors } } = useForm();

  const watchedModelId = watch('modelId');

  const onSubmitShip = (data) => {
    const model = shipModels.find(m => m.id === data.modelId);
    const shipData = {
      ...data,
      modelName: model?.name || '',
      manufacturerName: model ? getManufacturer(model.manufacturerId)?.name || '' : ''
    };

    if (editingShip) {
      updateShip(editingShip.id, shipData);
      setEditingShip(null);
    } else {
      addShip(shipData);
    }
    reset();
    setShowShipForm(false);
  };

  const onSubmitJournal = (data) => {
    const journalData = {
      ...data,
      shipId: selectedShip.id,
      shipName: selectedShip.name
    };
    addShipJournal(journalData);
    resetJournal();
    setShowJournalForm(false);
  };

  const startEditShip = (ship) => {
    setEditingShip(ship);
    reset(ship);
    setShowShipForm(true);
  };

  const handleDeleteShip = (id) => {
    if (confirm('Are you sure you want to delete this ship? This will also delete all related assignments and journals.')) {
      deleteShip(id);
    }
  };

  const handleAddAssignment = () => {
    if (selectedShip && selectedPerson) {
      addShipAssignment({
        shipId: selectedShip.id,
        personId: selectedPerson.id,
        shipName: selectedShip.name,
        personName: selectedPerson.name,
        assignedDate: new Date().toISOString().split('T')[0],
        role: 'Crew Member'
      });
      setSelectedPerson(null);
      setShowAssignmentForm(false);
    }
  };

  const handleRemoveAssignment = (assignmentId) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      removeShipAssignment(assignmentId);
    }
  };

  const getShipJournals = (shipId) => {
    return shipJournals.filter(j => j.shipId === shipId);
  };

  if (!hasPermission('canManageShips')) {
    return (
      <Layout title="Ships">
        <div className="text-center py-12">
          <SafeIcon icon={FiAnchor} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-midnight-400 mb-2">Access Denied</h3>
          <p className="text-midnight-500">You don't have permission to manage ships</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ship Registry">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-midnight-300">
              Manage ship registry and assignments
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShipForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Ship</span>
          </motion.button>
        </div>

        {/* Ships Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {ships.map((ship) => {
            const model = getShipModel(ship.modelId);
            const manufacturer = model ? getManufacturer(model.manufacturerId) : null;
            const assignedPersons = getShipPersons(ship.id);
            const journals = getShipJournals(ship.id);

            return (
              <motion.div
                key={ship.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-600 rounded-lg p-2">
                      <SafeIcon icon={FiAnchor} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{ship.name}</h4>
                      <p className="text-midnight-400 text-sm">{ship.serialNumber}</p>
                      {model && (
                        <p className="text-midnight-500 text-xs">{model.name} - {model.type}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => startEditShip(ship)}
                      className="text-midnight-400 hover:text-white transition-colors"
                    >
                      <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteShip(ship.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ship Info */}
                <div className="space-y-2 mb-4">
                  {manufacturer && (
                    <div>
                      <p className="text-midnight-400 text-xs">Manufacturer:</p>
                      <p className="text-midnight-300 text-sm">{manufacturer.name}</p>
                    </div>
                  )}
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

                {/* Assigned Persons */}
                {assignedPersons.length > 0 && (
                  <div className="mb-4">
                    <p className="text-midnight-400 text-xs mb-2">Assigned Persons:</p>
                    <div className="space-y-1">
                      {assignedPersons.slice(0, 3).map((personData) => (
                        <div key={personData.assignment.id} className="flex items-center justify-between text-xs">
                          <span className="text-midnight-300">{personData.name}</span>
                          <button
                            onClick={() => handleRemoveAssignment(personData.assignment.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <SafeIcon icon={FiX} className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {assignedPersons.length > 3 && (
                        <p className="text-midnight-500 text-xs">+{assignedPersons.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                  <div className="flex items-center space-x-4">
                    <span className="text-midnight-400 text-xs">
                      {assignedPersons.length} crew, {journals.length} logs
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedShip(ship);
                        setShowAssignmentForm(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                    >
                      <SafeIcon icon={FiUser} className="w-3 h-3" />
                      <span>Assign</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedShip(ship);
                        setShowJournalForm(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                    >
                      <SafeIcon icon={FiBook} className="w-3 h-3" />
                      <span>Log</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {ships.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiAnchor} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No ships registered</h3>
            <p className="text-midnight-500">Start by adding your first ship to the registry</p>
          </div>
        )}
      </div>

      {/* Ship Form Modal */}
      <AnimatePresence>
        {showShipForm && (
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
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-2xl border border-midnight-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingShip ? 'Edit Ship' : 'Add Ship'}
                </h3>
                <button
                  onClick={() => {
                    setShowShipForm(false);
                    setEditingShip(null);
                    reset();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitShip)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Ship Name *
                    </label>
                    <input
                      {...register('name', { required: 'Ship name is required' })}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter ship name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Serial Number
                    </label>
                    <input
                      {...register('serialNumber')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter serial number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Ship Model *
                    </label>
                    <select
                      {...register('modelId', { required: 'Ship model is required' })}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select ship model</option>
                      {shipModels.map(model => {
                        const manufacturer = getManufacturer(model.manufacturerId);
                        return (
                          <option key={model.id} value={model.id}>
                            {manufacturer?.name} - {model.name} ({model.type})
                          </option>
                        );
                      })}
                    </select>
                    {errors.modelId && (
                      <p className="mt-1 text-sm text-red-400">{errors.modelId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Location
                    </label>
                    <input
                      {...register('location')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter current location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Destroyed">Destroyed</option>
                      <option value="Missing">Missing</option>
                      <option value="Impounded">Impounded</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter ship description"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShipForm(false);
                      setEditingShip(null);
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
                    {editingShip ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment Form Modal */}
      <AnimatePresence>
        {showAssignmentForm && (
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
                <h3 className="text-lg font-semibold text-white">Assign Person to Ship</h3>
                <button
                  onClick={() => {
                    setShowAssignmentForm(false);
                    setSelectedShip(null);
                    setSelectedPerson(null);
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {selectedShip && (
                <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                  <p className="text-sm text-midnight-300">
                    Ship: <span className="text-white font-medium">{selectedShip.name}</span>
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Select Person
                  </label>
                  <SpeedSearch
                    items={persons}
                    onSelect={setSelectedPerson}
                    placeholder="Search for person..."
                    displayKey="name"
                    searchKeys={['name', 'handle']}
                    value={selectedPerson}
                    renderItem={(person) => (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{person.name}</span>
                        <span className="text-midnight-400 text-sm">@{person.handle}</span>
                      </div>
                    )}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAssignmentForm(false);
                      setSelectedShip(null);
                      setSelectedPerson(null);
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAssignment}
                    disabled={!selectedPerson}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Form Modal */}
      <AnimatePresence>
        {showJournalForm && (
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
                <h3 className="text-lg font-semibold text-white">Add Ship Log Entry</h3>
                <button
                  onClick={() => {
                    setShowJournalForm(false);
                    setSelectedShip(null);
                    resetJournal();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {selectedShip && (
                <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                  <p className="text-sm text-midnight-300">
                    Ship: <span className="text-white font-medium">{selectedShip.name}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleJournalSubmit(onSubmitJournal)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Date
                  </label>
                  <input
                    {...registerJournal('date', { required: 'Date is required' })}
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {journalErrors.date && (
                    <p className="mt-1 text-sm text-red-400">{journalErrors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Log Entry
                  </label>
                  <textarea
                    {...registerJournal('description', { required: 'Description is required' })}
                    rows={4}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter log entry details"
                  />
                  {journalErrors.description && (
                    <p className="mt-1 text-sm text-red-400">{journalErrors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJournalForm(false);
                      setSelectedShip(null);
                      resetJournal();
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Log
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

export default ShipsPage;