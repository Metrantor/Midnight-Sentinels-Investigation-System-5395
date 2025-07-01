import React,{useState} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useAuth} from '../contexts/AuthContext';
import {useData} from '../contexts/DataContext';

const {FiShield,FiEdit3,FiClock,FiUser,FiX,FiCheck,FiAlertTriangle}=FiIcons;

const AssessmentPanel=({targetType,targetId,currentAssessment,onAssessmentUpdate,className=""})=> {
  const {user,hasPermission,canAssess,DANGER_LEVELS,getDisplayName}=useAuth();
  const {updateAssessment,getAssessmentHistory}=useData();
  const [showAssessmentForm,setShowAssessmentForm]=useState(false);
  const [selectedLevel,setSelectedLevel]=useState(currentAssessment?.danger_level || 'unknown');
  const [notes,setNotes]=useState(currentAssessment?.assessment_notes || '');
  const [loading,setLoading]=useState(false);
  const [showHistory,setShowHistory]=useState(false);

  const history=getAssessmentHistory(targetType,targetId);
  const canUserAssess=canAssess(
    currentAssessment?.assessed_by_role,
    currentAssessment?.assessed_by_id
  );

  const getDangerLevelInfo=(level)=> {
    return DANGER_LEVELS.find(dl=> dl.id===level) || DANGER_LEVELS[0];
  };

  const handleSubmitAssessment=async ()=> {
    if (!canUserAssess) return;
    
    setLoading(true);
    try {
      await updateAssessment(targetType,targetId,selectedLevel,notes);
      setShowAssessmentForm(false);
      if (onAssessmentUpdate) {
        onAssessmentUpdate();
      }
    } catch (error) {
      console.error('Error updating assessment:',error);
      alert('Error updating assessment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentLevelInfo=getDangerLevelInfo(currentAssessment?.danger_level || 'unknown');

  return (
    <div className={`bg-midnight-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiShield} className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-medium text-white">Assessment</h4>
        </div>
        <div className="flex items-center space-x-2">
          {history.length > 0 && (
            <button
              onClick={()=> setShowHistory(!showHistory)}
              className="text-midnight-400 hover:text-white transition-colors"
              title="View Assessment History"
            >
              <SafeIcon icon={FiClock} className="w-3 h-3" />
            </button>
          )}
          {canUserAssess && (
            <button
              onClick={()=> setShowAssessmentForm(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Update Assessment"
            >
              <SafeIcon icon={FiEdit3} className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Current Assessment */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-midnight-400 text-xs">Danger Level:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${currentLevelInfo.color} ${currentLevelInfo.textColor}`}>
            {currentLevelInfo.name}
          </span>
        </div>

        {currentAssessment?.assessed_by_name && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-midnight-400 text-xs">Assessed by:</span>
              <span className="text-midnight-300 text-xs">
                {getDisplayName(currentAssessment)}
              </span>
            </div>
            {currentAssessment.assessed_at && (
              <div className="flex items-center justify-between">
                <span className="text-midnight-400 text-xs">Date:</span>
                <span className="text-midnight-300 text-xs">
                  {new Date(currentAssessment.assessed_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </>
        )}

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
            initial={{opacity: 0,height: 0}}
            animate={{opacity: 1,height: 'auto'}}
            exit={{opacity: 0,height: 0}}
            className="mt-3 pt-3 border-t border-midnight-700"
          >
            <h5 className="text-xs font-medium text-midnight-300 mb-2">Assessment History</h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {history.slice(0,5).map((item)=> {
                const levelInfo=getDangerLevelInfo(item.new_danger_level);
                return (
                  <div key={item.id} className="bg-midnight-700 rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${levelInfo.color} ${levelInfo.textColor}`}>
                        {levelInfo.name}
                      </span>
                      <span className="text-midnight-400 text-xs">
                        {new Date(item.changed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-midnight-300 text-xs mt-1">
                      by {getDisplayName(item)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assessment Form Modal */}
      <AnimatePresence>
        {showAssessmentForm && (
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
                  Update Assessment
                </h3>
                <button
                  onClick={()=> setShowAssessmentForm(false)}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Danger Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DANGER_LEVELS.map((level)=> (
                      <button
                        key={level.id}
                        onClick={()=> setSelectedLevel(level.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedLevel===level.id
                            ? `${level.color} ${level.textColor} border-white`
                            : 'bg-midnight-800 text-midnight-300 border-midnight-600 hover:border-midnight-500'
                        }`}
                      >
                        <div className="text-sm font-medium">{level.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-1">
                    Assessment Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e)=> setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assessment notes..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={()=> setShowAssessmentForm(false)}
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
    </div>
  );
};

export default AssessmentPanel;