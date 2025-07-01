import React,{useState} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {useForm} from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import AssessmentPanel from '../components/AssessmentPanel';
import {useData} from '../contexts/DataContext';
import OrganizationDetailModal from '../components/OrganizationDetailModal';

const {FiPlus,FiBuilding,FiBook,FiCalendar,FiX}=FiIcons;

const OrganizationsPage=()=> {
  const {
    organizations,
    journals,
    addOrganization,
    updateOrganization,
    addJournal,
    updateJournal,
    getCleanFormData
  }=useData();
  
  const [showForm,setShowForm]=useState(false);
  const [editingOrg,setEditingOrg]=useState(null);
  const [showJournalForm,setShowJournalForm]=useState(false);
  const [editingJournal,setEditingJournal]=useState(null);
  const [selectedOrg,setSelectedOrg]=useState(null);
  const [showDetailModal,setShowDetailModal]=useState(false);

  const {register,handleSubmit,reset,formState: {errors}}=useForm();
  const {
    register: registerJournal,
    handleSubmit: handleJournalSubmit,
    reset: resetJournal,
    formState: {errors: journalErrors}
  }=useForm();

  const onSubmitOrganization=async (data)=> {
    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id,data);
        setEditingOrg(null);
      } else {
        await addOrganization(data);
      }
      
      reset(getCleanFormData('organization'));
      setShowForm(false);
    } catch (error) {
      console.error('Error saving organization:',error);
      alert('Error saving organization: ' + error.message);
    }
  };

  const onSubmitJournal=async (data)=> {
    try {
      const journalData={
        ...data,
        organizationId: selectedOrg.id,
        organizationName: selectedOrg.name
      };

      if (editingJournal) {
        await updateJournal(editingJournal.id,journalData);
        setEditingJournal(null);
      } else {
        await addJournal(journalData);
      }
      
      resetJournal();
      setShowJournalForm(false);
    } catch (error) {
      console.error('Error saving journal:',error);
      alert('Error saving journal: ' + error.message);
    }
  };

  // 🎯 FIXED: Separate handlers with proper event stopping
  const handleEditOrg=(e,org)=> {
    e.preventDefault();
    e.stopPropagation();
    setEditingOrg(org);
    reset(org);
    setShowForm(true);
  };

  const handleAddJournal=(e,org)=> {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOrg(org);
    setShowJournalForm(true);
  };

  const handleOpenDetail=(org)=> {
    setSelectedOrg(org);
    setShowDetailModal(true);
  };

  const startEditJournal=(journal)=> {
    setEditingJournal(journal);
    resetJournal(journal);
    setShowJournalForm(true);
  };

  const getOrgJournals=(orgId)=> {
    return journals.filter(j=> j.organization_id===orgId);
  };

  return (
    <Layout title="Suspicious Organizations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-midnight-300">
              Manage suspicious organizations and their activities
            </h3>
          </div>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            onClick={()=> setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Organization</span>
          </motion.button>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {organizations.map((org)=> (
            <motion.div
              key={org.id}
              initial={{opacity: 0,scale: 0.95}}
              animate={{opacity: 1,scale: 1}}
              className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
            >
              {/* 🎯 FIXED: Separate click areas */}
              <div 
                onClick={()=> handleOpenDetail(org)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {org.logo_url ? (
                      <img
                        src={org.logo_url}
                        alt={org.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e)=> {
                          e.target.style.display='none';
                          e.target.nextSibling.style.display='flex';
                        }}
                      />
                    ) : null}
                    <div className={`bg-red-600 rounded-lg p-2 ${org.logo_url ? 'hidden' : 'flex'}`}>
                      <SafeIcon icon={FiBuilding} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{org.name}</h4>
                      {org.handle && (
                        <p className="text-midnight-400 text-sm">@{org.handle}</p>
                      )}
                      <p className="text-midnight-500 text-sm">{org.type}</p>
                    </div>
                  </div>
                  
                  {/* 🎯 FIXED: Separate button area */}
                  <button
                    onClick={(e)=> handleEditOrg(e,org)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                  >
                    Edit Organization
                  </button>
                </div>

                <p className="text-midnight-300 text-sm mb-4 line-clamp-3">
                  {org.description?.substring(0,150)}...
                </p>

                {org.language && (
                  <div className="mb-3">
                    <span className="text-midnight-400 text-xs">Language: </span>
                    <span className="text-midnight-300 text-sm">{org.language}</span>
                  </div>
                )}
              </div>

              {/* Assessment Panel */}
              <AssessmentPanel
                targetType="organization"
                targetId={org.id}
                currentAssessment={org}
                className="mb-4"
              />

              <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                <div className="flex items-center space-x-4">
                  <span className="text-midnight-400 text-xs">
                    {getOrgJournals(org.id).length} journal entries
                  </span>
                  {org.last_scanned && (
                    <span className="text-midnight-500 text-xs">
                      Last scan: {new Date(org.last_scanned).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {/* 🎯 FIXED: Separate button */}
                <button
                  onClick={(e)=> handleAddJournal(e,org)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                >
                  <SafeIcon icon={FiBook} className="w-3 h-3" />
                  <span>Add Journal</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {organizations.length===0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiBuilding} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No organizations recorded</h3>
            <p className="text-midnight-500">Start by adding your first suspicious organization</p>
          </div>
        )}
      </div>

      {/* Organization Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{scale: 0.95,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.95,opacity: 0}}
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-2xl border border-midnight-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingOrg ? 'Edit Organization' : 'Add Organization'}
                </h3>
                <button
                  onClick={()=> {
                    setShowForm(false);
                    setEditingOrg(null);
                    reset(getCleanFormData('organization'));
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitOrganization)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Organization Name *
                    </label>
                    <input
                      {...register('name',{required: 'Name is required'})}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter organization name"
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
                      {...register('handle')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter organization handle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Type *
                    </label>
                    <select
                      {...register('type',{required: 'Type is required'})}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="Criminal Organization">Criminal Organization</option>
                      <option value="Terrorist Group">Terrorist Group</option>
                      <option value="Corrupt Corporation">Corrupt Corporation</option>
                      <option value="Underground Network">Underground Network</option>
                      <option value="Pirate Faction">Pirate Faction</option>
                      <option value="Mercenary Group">Mercenary Group</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-400">{errors.type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Language
                    </label>
                    <input
                      {...register('language')}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter primary language"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-1">
                      Logo URL
                    </label>
                    <input
                      {...register('logoUrl')}
                      type="url"
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter logo URL"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description',{required: 'Description is required'})}
                    rows={4}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed description of the organization"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={()=> {
                      setShowForm(false);
                      setEditingOrg(null);
                      reset(getCleanFormData('organization'));
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingOrg ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Form Modal */}
      <AnimatePresence>
        {showJournalForm && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{scale: 0.95,opacity: 0}}
              animate={{scale: 1,opacity: 1}}
              exit={{scale: 0.95,opacity: 0}}
              className="bg-midnight-900 rounded-xl p-6 w-full max-w-md border border-midnight-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingJournal ? 'Edit Journal Entry' : 'Add Journal Entry'}
                </h3>
                <button
                  onClick={()=> {
                    setShowJournalForm(false);
                    setEditingJournal(null);
                    setSelectedOrg(null);
                    resetJournal();
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {selectedOrg && (
                <div className="mb-4 p-3 bg-midnight-800 rounded-lg flex items-center space-x-3">
                  {selectedOrg.logo_url ? (
                    <img
                      src={selectedOrg.logo_url}
                      alt={selectedOrg.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="bg-red-600 rounded p-1">
                      <SafeIcon icon={FiBuilding} className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <p className="text-sm text-midnight-300">
                    Organization: <span className="text-white font-medium">{selectedOrg.name}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleJournalSubmit(onSubmitJournal)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Date
                  </label>
                  <input
                    {...registerJournal('date',{required: 'Date is required'})}
                    type="date"
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {journalErrors.date && (
                    <p className="mt-1 text-sm text-red-400">{journalErrors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Description
                  </label>
                  <textarea
                    {...registerJournal('description',{required: 'Description is required'})}
                    rows={4}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter journal entry details"
                  />
                  {journalErrors.description && (
                    <p className="mt-1 text-sm text-red-400">{journalErrors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={()=> {
                      setShowJournalForm(false);
                      setEditingJournal(null);
                      setSelectedOrg(null);
                      resetJournal();
                    }}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingJournal ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organization Detail Modal */}
      <OrganizationDetailModal
        organization={selectedOrg}
        isOpen={showDetailModal}
        onClose={()=> {
          setShowDetailModal(false);
          setSelectedOrg(null);
        }}
        onEdit={(org)=> {
          setShowDetailModal(false);
          handleEditOrg({preventDefault: ()=> {},stopPropagation: ()=> {}},org);
        }}
      />
    </Layout>
  );
};

export default OrganizationsPage;