import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';

const { FiPlus, FiGitBranch, FiEdit3, FiX, FiBuilding, FiTrash2 } = FiIcons;

const RelationshipsPage = () => {
  const { 
    organizations, 
    orgRelationships, 
    addOrgRelationship, 
    updateOrgRelationship, 
    removeOrgRelationship,
    RELATIONSHIP_TYPES 
  } = useData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmitRelationship = (data) => {
    if (editingRelationship) {
      updateOrgRelationship(editingRelationship.id, data);
      setEditingRelationship(null);
    } else {
      addOrgRelationship(data);
    }
    reset();
    setShowForm(false);
  };

  const startEditRelationship = (relationship) => {
    setEditingRelationship(relationship);
    reset(relationship);
    setShowForm(true);
  };

  const handleDeleteRelationship = (relationshipId) => {
    if (confirm('Are you sure you want to delete this relationship?')) {
      removeOrgRelationship(relationshipId);
    }
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'Unknown Organization';
  };

  const getOrgLogo = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.logoUrl;
  };

  const getRelationshipType = (typeId) => {
    return RELATIONSHIP_TYPES.find(rt => rt.id === typeId);
  };

  return (
    <Layout title="Organization Relationships">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-midnight-300">
              Manage relationships between organizations
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Relationship</span>
          </motion.button>
        </div>

        {/* Relationships List */}
        <div className="space-y-4">
          {orgRelationships.map((relationship) => {
            const relType = getRelationshipType(relationship.relationshipType);
            return (
              <motion.div
                key={relationship.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Organization A */}
                    <div className="flex items-center space-x-3">
                      {getOrgLogo(relationship.organizationId) ? (
                        <img
                          src={getOrgLogo(relationship.organizationId)}
                          alt={getOrgName(relationship.organizationId)}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="bg-blue-600 rounded-lg p-2">
                          <SafeIcon icon={FiBuilding} className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {getOrgName(relationship.organizationId)}
                        </h4>
                      </div>
                    </div>

                    {/* Relationship Type */}
                    <div className="flex flex-col items-center space-y-2">
                      <SafeIcon icon={FiGitBranch} className="w-6 h-6 text-midnight-400" />
                      <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${relType?.color || 'bg-gray-600'}`}>
                        {relType?.name || relationship.relationshipType}
                      </div>
                    </div>

                    {/* Organization B */}
                    <div className="flex items-center space-x-3">
                      {getOrgLogo(relationship.relatedOrganizationId) ? (
                        <img
                          src={getOrgLogo(relationship.relatedOrganizationId)}
                          alt={getOrgName(relationship.relatedOrganizationId)}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="bg-red-600 rounded-lg p-2">
                          <SafeIcon icon={FiBuilding} className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {getOrgName(relationship.relatedOrganizationId)}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditRelationship(relationship)}
                      className="text-midnight-400 hover:text-white transition-colors p-2"
                    >
                      <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRelationship(relationship.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {relationship.description && (
                  <div className="mt-4 pt-4 border-t border-midnight-700">
                    <p className="text-midnight-300 text-sm">{relationship.description}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-midnight-400">
                  <span>
                    Established: {relationship.establishedDate 
                      ? new Date(relationship.establishedDate).toLocaleDateString() 
                      : 'Unknown'}
                  </span>
                  <span>
                    Last verified: {relationship.lastVerified 
                      ? new Date(relationship.lastVerified).toLocaleDateString() 
                      : 'Never'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {orgRelationships.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiGitBranch} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No relationships recorded</h3>
            <p className="text-midnight-500">Start by adding relationships between organizations</p>
          </div>
        )}

        {/* Relationship Form Modal */}
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
                className="bg-midnight-900 rounded-xl p-6 w-full max-w-2xl border border-midnight-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {editingRelationship ? 'Edit Relationship' : 'Add Relationship'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingRelationship(null);
                      reset();
                    }}
                    className="text-midnight-400 hover:text-white transition-colors"
                  >
                    <SafeIcon icon={FiX} className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmitRelationship)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-midnight-300 mb-1">
                        Organization A *
                      </label>
                      <select
                        {...register('organizationId', { required: 'Organization is required' })}
                        className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select organization</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                      {errors.organizationId && (
                        <p className="mt-1 text-sm text-red-400">{errors.organizationId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-midnight-300 mb-1">
                        Organization B *
                      </label>
                      <select
                        {...register('relatedOrganizationId', { required: 'Related organization is required' })}
                        className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select organization</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                      {errors.relatedOrganizationId && (
                        <p className="mt-1 text-sm text-red-400">{errors.relatedOrganizationId.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Relationship Type *
                    </label>
                    <select
                      {...register('relationshipType', { required: 'Relationship type is required' })}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select relationship type</option>
                      {RELATIONSHIP_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    {errors.relationshipType && (
                      <p className="mt-1 text-sm text-red-400">{errors.relationshipType.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-midnight-300 mb-1">
                        Established Date
                      </label>
                      <input
                        {...register('establishedDate')}
                        type="date"
                        className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-midnight-300 mb-1">
                        Last Verified
                      </label>
                      <input
                        {...register('lastVerified')}
                        type="date"
                        className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                      placeholder="Enter relationship description"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingRelationship(null);
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
                      {editingRelationship ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default RelationshipsPage;