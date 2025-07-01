import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const { FiGavel, FiClock, FiUser, FiX, FiCheck, FiUserCheck } = FiIcons;

const AssessmentPanel = ({ targetType, targetId, currentAssessment, onAssessmentUpdate, className = "" }) => {
  const { user, hasPermission, canAssess, canManageStatus, ASSESSMENT_CLASSIFICATIONS, STATUS_TYPES, DANGER_LEVELS, getDisplayName, getUserRole, USER_ROLES } = useAuth();
  const { updateAssessment, updateStatus, getAssessmentHistory } = useData();

  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState(currentAssessment?.classification || 'harmless');
  const [selectedDangerLevel, setSelectedDangerLevel] = useState(currentAssessment?.danger_level || 1);
  const [selectedStatus, setSelectedStatus] = useState(currentAssessment?.status || 'pending');
  const [notes, setNotes] = useState(currentAssessment?.assessment_notes || '');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const history = getAssessmentHistory(targetType, targetId);

  const canUserAssess = canAssess(
    currentAssessment?.assessed_by_role,
    currentAssessment?.assessed_by_id
  );

  const canUserManageStatus = canManageStatus(
    currentAssessment?.status,
    currentAssessment?.assessed_by_role
  );

  const getClassificationInfo = (classificationId) => {
    return ASSESSMENT_CLASSIFICATIONS.find(c => c.id === classificationId) || ASSESSMENT_CLASSIFICATIONS[0];
  };

  const getStatusInfo = (statusId) => {
    return STATUS_TYPES.find(s => s.id === statusId) || STATUS_TYPES[0];
  };

  const getDangerLevelInfo = (level) => {
    return DANGER_LEVELS.find(d => d.level === level) || DANGER_LEVELS[0];
  };

  // 🎯 FIXED: Separate handlers with proper event stopping
  const handleOpenAssessmentForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAssessmentForm(true);
    setShowStatusForm(false);
  };

  const handleOpenStatusForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStatusForm(true);
    setShowAssessmentForm(false);
  };

  const handleOpenHistory = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowHistory(!showHistory);
  };

  const handleSubmitAssessment = async () => {
    if (!canUserAssess) return;

    setLoading(true);
    try {
      await updateAssessment(targetType, targetId, {
        classification: selectedClassification,
        dangerLevel: selectedDangerLevel,
        notes
      });

      setShowAssessmentForm(false);
      if (onAssessmentUpdate) {
        onAssessmentUpdate();
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert('Error updating assessment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStatus = async () => {
    if (!canUserManageStatus) return;

    setLoading(true);
    try {
      await updateStatus(targetType, targetId, selectedStatus);
      setShowStatusForm(false);
      if (onAssessmentUpdate) {
        onAssessmentUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIXED: Correct Danger Level Circle Display
  const renderDangerLevelCircles = (level) => {
    const circles = [];
    for (let i = 1; i <= 6; i++) {
      let circleColor = 'bg-gray-600'; // Default: empty gray
      
      if (i <= level) {
        // Determine color based on position and level
        if (i <= 2) {
          circleColor = 'bg-green-500'; // Positions 1-2: Green
        } else if (i <= 4) {
          circleColor = 'bg-yellow-500'; // Positions 3-4: Yellow
        } else if (i === 5) {
          circleColor = 'bg-orange-500'; // Position 5: Orange
        } else if (i === 6) {
          circleColor = 'bg-red-500'; // Position 6: Red
        }
      }

      circles.push(
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${circleColor} border border-gray-400`}
          title={`Position ${i} ${i <= level ? '(Active)' : '(Inactive)'}`}
        />
      );
    }
    return circles;
  };

  // 🔥 FIXED: Enhanced Assessor Info with Role Image and Real Name
  const renderAssessorInfo = (assessment) => {
    const assessorRole = assessment?.assessed_by_role;
    const assessorName = assessment?.assessed_by_name;
    
    // Get role info and image
    const roleInfo = assessorRole ? USER_ROLES[assessorRole.toUpperCase()] : null;
    const roleImage = roleInfo?.image;

    return (
      <div className="flex items-center space-x-2">
        {/* Role Image */}
        {roleImage ? (
          <img
            src={roleImage}
            alt={roleInfo.name}
            className="w-6 h-6 rounded object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`bg-blue-600 rounded p-1 ${roleImage ? 'hidden' : 'flex'}`}>
          <SafeIcon icon={FiUserCheck} className="w-4 h-4 text-white" />
        </div>
        
        <div className="text-xs">
          <div className="text-midnight-300 font-medium">{assessorName || 'Unknown'}</div>
          <div className="text-midnight-500">{roleInfo?.name || assessorRole || 'Unknown Role'}</div>
        </div>
      </div>
    );
  };

  const currentClassificationInfo = getClassificationInfo(currentAssessment?.classification || 'harmless');
  const currentStatusInfo = getStatusInfo(currentAssessment?.status || 'pending');
  const currentDangerLevel = currentAssessment?.danger_level || 1;

  return (
    <div className={`bg-midnight-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiGavel} className="w-4 h-4 text-purple-400" />
          <h4 className="text-sm font-medium text-white">Judgment</h4>
        </div>
        
        {/* 🎯 FIXED: Better Button Layout */}
        <div className="flex flex-col space-y-1">
          {history.length > 0 && (
            <button
              onClick={handleOpenHistory}
              className="bg-midnight-700 hover:bg-midnight-600 text-white px-2 py-1 rounded text-xs transition-colors"
              title="View Assessment History"
            >
              History
            </button>
          )}
          <div className="flex space-x-1">
            {canUserAssess && (
              <button
                onClick={handleOpenAssessmentForm}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                title="Update Assessment"
              >
                Assessment
              </button>
            )}
            {canUserManageStatus && (
              <button
                onClick={handleOpenStatusForm}
                className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                title="Update Status"
              >
                Status
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 GROUPED: Status & Danger Level */}
      <div className="space-y-3">
        {/* Classification */}
        <div className="flex items-center justify-between">
          <span className="text-midnight-400 text-xs">Classification:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${currentClassificationInfo.color} ${currentClassificationInfo.textColor}`}>
            {currentClassificationInfo.name}
          </span>
        </div>

        {/* 🎯 GROUPED SECTION: Status & Danger Level */}
        <div className="bg-midnight-700 rounded-lg p-3 space-y-2">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-midnight-400 text-xs">Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${currentStatusInfo.color} ${currentStatusInfo.textColor}`}>
              {currentStatusInfo.name}
            </span>
          </div>

          {/* Danger Level */}
          <div className="flex items-center justify-between">
            <span className="text-midnight-400 text-xs">Danger Level:</span>
            <div className="flex items-center space-x-1">
              {renderDangerLevelCircles(currentDangerLevel)}
              <span className="text-midnight-300 text-xs ml-2">Level {currentDangerLevel}</span>
            </div>
          </div>
        </div>

        {/* 🔥 ENHANCED: Better Assessor Display */}
        {currentAssessment?.assessed_by_name && (
          <>
            <div className="mt-3 pt-3 border-t border-midnight-700">
              <span className="text-midnight-400 text-xs block mb-2">Assessed by:</span>
              {renderAssessorInfo(currentAssessment)}
            </div>
            {currentAssessment.assessed_at && (
              <div className="flex items-center justify-between">
                <span className="text-midnight-400 text-xs">Assessment Date:</span>
                <span className="text-midnight-300 text-xs">
                  {new Date(currentAssessment.assessed_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </>
        )}

        {/* Notes */}
        {currentAssessment?.assessment_notes && (
          <div className="mt-2 p-2 bg-midnight-700 rounded text-xs">
            <span className="text-midnight-400">Notes: </span>
            <span className="text-midnight-300">{currentAssessment.assessment_notes}</span>
          </div>
        )}
      </div>

      {/* Assessment History */}
      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-midnight-700"
          >
            <h5 className="text-xs font-medium text-midnight-300 mb-2">Assessment History</h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="bg-midnight-700 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-midnight-300 text-xs">
                      {item.new_classification} - Level {item.new_danger_level}
                    </span>
                    <span className="text-midnight-400 text-xs">
                      {new Date(item.changed_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-midnight-300 text-xs mt-1">
                    by {getDisplayName(item)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assessment Form Modal */}
      <AnimatePresence>
        {showAssessmentForm && (
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
                  Update Assessment
                </h3>
                <button
                  onClick={() => setShowAssessmentForm(false)}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Classification */}
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Classification
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {ASSESSMENT_CLASSIFICATIONS.map((classification) => (
                      <button
                        key={classification.id}
                        onClick={() => setSelectedClassification(classification.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedClassification === classification.id
                            ? `${classification.color} ${classification.textColor} border-white`
                            : 'bg-midnight-800 text-midnight-300 border-midnight-600 hover:border-midnight-500'
                        }`}
                      >
                        <div className="text-sm font-medium">{classification.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Danger Level */}
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Danger Level (1-6)
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {DANGER_LEVELS.map((level) => (
                      <button
                        key={level.level}
                        onClick={() => setSelectedDangerLevel(level.level)}
                        className={`p-2 rounded border transition-all ${
                          selectedDangerLevel === level.level
                            ? 'bg-blue-600 text-white border-white'
                            : 'bg-midnight-800 text-midnight-300 border-midnight-600 hover:border-midnight-500'
                        }`}
                      >
                        <div className="text-xs font-medium">{level.level}</div>
                      </button>
                    ))}
                  </div>
                  {/* Visual Representation */}
                  <div className="mt-2 flex items-center space-x-1">
                    {renderDangerLevelCircles(selectedDangerLevel)}
                    <span className="text-midnight-300 text-xs ml-2">Level {selectedDangerLevel}</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Assessment Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assessment notes (max 500 characters)..."
                  />
                  <div className="text-right text-xs text-midnight-400 mt-1">
                    {notes.length}/500
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAssessmentForm(false)}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAssessment}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiCheck} className="w-4 h-4" />
                        <span>Update</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Form Modal */}
      <AnimatePresence>
        {showStatusForm && (
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
                  Update Status
                </h3>
                <button
                  onClick={() => setShowStatusForm(false)}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {STATUS_TYPES.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setSelectedStatus(status.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedStatus === status.id
                            ? `${status.color} ${status.textColor} border-white`
                            : 'bg-midnight-800 text-midnight-300 border-midnight-600 hover:border-midnight-500'
                        }`}
                      >
                        <div className="text-sm font-medium">{status.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowStatusForm(false)}
                    className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitStatus}
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiCheck} className="w-4 h-4" />
                        <span>Update</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentPanel;