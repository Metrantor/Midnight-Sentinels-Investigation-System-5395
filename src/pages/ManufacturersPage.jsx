import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const { FiPlus, FiTool, FiEdit3, FiX, FiTrash2, FiAnchor, FiEye } = FiIcons;

const ManufacturersPage = () => {
  const { manufacturers, shipModels, addManufacturer, updateManufacturer, deleteManufacturer, addShipModel, updateShipModel, deleteShipModel, SHIP_TYPES } = useData();
  const { hasPermission } = useAuth();
  const [showManufacturerForm, setShowManufacturerForm] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [showModelForm, setShowModelForm] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showModels, setShowModels] = useState({});

  const { register: registerManufacturer, handleSubmit: handleManufacturerSubmit, reset: resetManufacturer, formState: { errors: manufacturerErrors } } = useForm();
  const { register: registerModel, handleSubmit: handleModelSubmit, reset: resetModel, formState: { errors: modelErrors } } = useForm();

  const onSubmitManufacturer = (data) => {
    if (editingManufacturer) {
      updateManufacturer(editingManufacturer.id, data);
      setEditingManufacturer(null);
    } else {
      addManufacturer(data);
    }
    resetManufacturer();
    setShowManufacturerForm(false);
  };

  const onSubmitModel = (data) => {
    const modelData = {
      ...data,
      manufacturerId: selectedManufacturer.id,
      manufacturerName: selectedManufacturer.name
    };

    if (editingModel) {
      updateShipModel(editingModel.id, modelData);
      setEditingModel(null);
    } else {
      addShipModel(modelData);
    }
    resetModel();
    setShowModelForm(false);
  };

  const startEditManufacturer = (manufacturer) => {
    setEditingManufacturer(manufacturer);
    resetManufacturer(manufacturer);
    setShowManufacturerForm(true);
  };

  const startEditModel = (model) => {
    setEditingModel(model);
    resetModel(model);
    setShowModelForm(true);
  };

  const handleDeleteManufacturer = (id) => {
    if (confirm('Are you sure you want to delete this manufacturer? This will also delete all associated ship models.')) {
      deleteManufacturer(id);
    }
  };

  const handleDeleteModel = (id) => {
    if (confirm('Are you sure you want to delete this ship model?')) {
      deleteShipModel(id);
    }
  };

  const getManufacturerModels = (manufacturerId) => {
    return shipModels.filter(model => model.manufacturerId === manufacturerId);
  };

  const toggleShowModels = (manufacturerId) => {
    setShowModels(prev => ({
      ...prev,
      [manufacturerId]: !prev[manufacturerId]
    }));
  };

  if (!hasPermission('canManageManufacturers')) {
    return (
      <Layout title="Manufacturers">
        <div className="text-center py-12">
          <SafeIcon icon={FiTool} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-midnight-400 mb-2">Access Denied</h3>
          <p className="text-midnight-500">You don't have permission to manage manufacturers</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ship Manufacturers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-midnight-300">
              Manage ship manufacturers and their models
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowManufacturerForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Manufacturer</span>
          </motion.button>
        </div>

        {/* Manufacturers List */}
        <div className="space-y-4">
          {manufacturers.map((manufacturer) => {
            const models = getManufacturerModels(manufacturer.id);
            const showingModels = showModels[manufacturer.id];

            return (
              <motion.div
                key={manufacturer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-midnight-900 rounded-xl border border-midnight-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {manufacturer.logoUrl ? (
                        <img
                          src={manufacturer.logoUrl}
                          alt={manufacturer.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="bg-blue-600 rounded-lg p-3">
                          <SafeIcon icon={FiTool} className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-semibold text-white">{manufacturer.name}</h4>
                        <p className="text-midnight-300 mt-1">{manufacturer.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-midnight-400 text-sm">
                            {models.length} ship models
                          </span>
                          <button
                            onClick={() => toggleShowModels(manufacturer.id)}
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                          >
                            <SafeIcon icon={FiEye} className="w-3 h-3" />
                            <span>{showingModels ? 'Hide' : 'Show'} Models</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedManufacturer(manufacturer);
                          setShowModelForm(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <SafeIcon icon={FiPlus} className="w-3 h-3" />
                        <span>Add Model</span>
                      </button>
                      <button
                        onClick={() => startEditManufacturer(manufacturer)}
                        className="text-midnight-400 hover:text-white transition-colors"
                      >
                        <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteManufacturer(manufacturer.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Ship Models */}
                  <AnimatePresence>
                    {showingModels && models.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-midnight-700"
                      >
                        <h5 className="text-lg font-semibold text-white mb-4">Ship Models</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {models.map((model) => (
                            <div
                              key={model.id}
                              className="bg-midnight-800 rounded-lg p-4 border border-midnight-600"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h6 className="font-semibold text-white">{model.name}</h6>
                                  <p className="text-midnight-400 text-sm">{model.type}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => startEditModel(model)}
                                    className="text-midnight-400 hover:text-white transition-colors"
                                  >
                                    <SafeIcon icon={FiEdit3} className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteModel(model.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {model.description && (
                                <p className="text-midnight-300 text-xs">{model.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {manufacturers.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiTool} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No manufacturers recorded</h3>
            <p className="text-midnight-500">Start by adding your first ship manufacturer</p>
          </div>
        )}
      </div>

      {/* Manufacturer Form Modal */}
      <AnimatePresence>
        {showManufacturerForm && (
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
                  {editingManufacturer ? 'Edit Manufacturer' : 'Add Manufacturer'}
                </h3>
                <button
                  onClick={() => {
                    setShowManufacturerForm(false);
                    setEditingManufacturer(null);
                    resetManufacturer();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleManufacturerSubmit(onSubmitManufacturer)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Name *
                  </label>
                  <input
                    {...registerManufacturer('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter manufacturer name"
                  />
                  {manufacturerErrors.name && (
                    <p className="mt-1 text-sm text-red-400">{manufacturerErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Logo URL
                  </label>
                  <input
                    {...registerManufacturer('logoUrl')}
                    type="url"
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter logo URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Description
                  </label>
                  <textarea
                    {...registerManufacturer('description')}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter manufacturer description"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManufacturerForm(false);
                      setEditingManufacturer(null);
                      resetManufacturer();
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingManufacturer ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ship Model Form Modal */}
      <AnimatePresence>
        {showModelForm && (
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
                  {editingModel ? 'Edit Ship Model' : 'Add Ship Model'}
                </h3>
                <button
                  onClick={() => {
                    setShowModelForm(false);
                    setEditingModel(null);
                    setSelectedManufacturer(null);
                    resetModel();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {selectedManufacturer && (
                <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                  <p className="text-sm text-midnight-300">
                    Manufacturer: <span className="text-white font-medium">{selectedManufacturer.name}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleModelSubmit(onSubmitModel)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Model Name *
                  </label>
                  <input
                    {...registerModel('name', { required: 'Model name is required' })}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter model name"
                  />
                  {modelErrors.name && (
                    <p className="mt-1 text-sm text-red-400">{modelErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Ship Type *
                  </label>
                  <select
                    {...registerModel('type', { required: 'Ship type is required' })}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select ship type</option>
                    {SHIP_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {modelErrors.type && (
                    <p className="mt-1 text-sm text-red-400">{modelErrors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Description
                  </label>
                  <textarea
                    {...registerModel('description')}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter model description"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModelForm(false);
                      setEditingModel(null);
                      setSelectedManufacturer(null);
                      resetModel();
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingModel ? 'Update' : 'Add'}
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

export default ManufacturersPage;