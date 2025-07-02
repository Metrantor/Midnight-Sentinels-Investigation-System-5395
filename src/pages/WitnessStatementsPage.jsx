import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const { FiMessageSquare, FiUser, FiCalendar, FiCheck, FiClock, FiX, FiSend, FiEye, FiAlertTriangle } = FiIcons;

const WitnessStatementsPage = () => {
  const {
    personEntries,
    witnessStatements,
    getWitnessStatementsForUser,
    submitWitnessStatement,
    addJudgeComment
  } = useData();
  const { user, hasPermission } = useAuth();
  
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [statementText, setStatementText] = useState('');
  const [judgeComment, setJudgeComment] = useState('');
  const [judgeRequest, setJudgeRequest] = useState('');

  // Get witness statements for current user
  const userWitnessStatements = useMemo(() => {
    if (!user) return [];
    return getWitnessStatementsForUser(user.id);
  }, [user, witnessStatements]);

  // Get all witness statements for judges
  const allWitnessStatements = useMemo(() => {
    return witnessStatements;
  }, [witnessStatements]);

  const canJudge = hasPermission('canAssessDangerLevel');

  const handleSubmitStatement = async () => {
    if (!selectedStatement || !statementText.trim()) return;

    try {
      await submitWitnessStatement(selectedStatement.id, statementText);
      setShowStatementModal(false);
      setStatementText('');
      setSelectedStatement(null);
      alert('Statement submitted successfully!');
    } catch (error) {
      alert('Error submitting statement: ' + error.message);
    }
  };

  const handleJudgeComment = async () => {
    if (!selectedStatement || !judgeComment.trim()) return;

    try {
      await addJudgeComment(selectedStatement.id, judgeComment, judgeRequest.trim() || null);
      setShowJudgeModal(false);
      setJudgeComment('');
      setJudgeRequest('');
      setSelectedStatement(null);
      alert('Comment added successfully!');
    } catch (error) {
      alert('Error adding comment: ' + error.message);
    }
  };

  const getIncidentDetails = (incidentId) => {
    return personEntries.find(entry => entry.id === incidentId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-600 text-green-100';
      case 'pending': return 'bg-yellow-600 text-yellow-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const openStatementModal = (statement) => {
    setSelectedStatement(statement);
    setStatementText(statement.statement || '');
    setShowStatementModal(true);
  };

  const openJudgeModal = (statement) => {
    setSelectedStatement(statement);
    setJudgeComment(statement.judge_comment || '');
    setJudgeRequest(statement.judge_request || '');
    setShowJudgeModal(true);
  };

  return (
    <Layout title="Witness Statements">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <SafeIcon icon={FiMessageSquare} className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-midnight-300 mb-2">
            {canJudge ? 'All Witness Statements' : 'Your Witness Statements'}
          </h3>
          <p className="text-midnight-400">
            {canJudge 
              ? 'Review and comment on witness statements for incidents'
              : 'Provide statements for incidents where you were listed as a witness'
            }
          </p>
        </div>

        {/* User's Witness Statements */}
        {!canJudge && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Incidents You Witnessed ({userWitnessStatements.length})
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userWitnessStatements.map((statement) => {
                const incident = getIncidentDetails(statement.incident_id);
                
                return (
                  <motion.div
                    key={statement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-600 rounded-lg p-2">
                          <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="text-white font-semibold">
                            Incident involving {incident?.person_name}
                          </h5>
                          <div className="flex items-center space-x-2 text-xs text-midnight-400">
                            <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                            <span>{incident ? new Date(incident.date).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(statement.statement_status)}`}>
                        {statement.statement_status}
                      </span>
                    </div>

                    {incident && (
                      <p className="text-midnight-300 text-sm mb-4 line-clamp-2">
                        {incident.description}
                      </p>
                    )}

                    {statement.statement && (
                      <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                        <h6 className="text-midnight-300 text-xs mb-1">Your Statement:</h6>
                        <p className="text-white text-sm">{statement.statement}</p>
                        {statement.submitted_at && (
                          <p className="text-midnight-400 text-xs mt-2">
                            Submitted: {new Date(statement.submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {statement.judge_comment && (
                      <div className="mb-4 p-3 bg-purple-900/30 border border-purple-500 rounded-lg">
                        <h6 className="text-purple-300 text-xs mb-1">Judge Comment:</h6>
                        <p className="text-purple-200 text-sm">{statement.judge_comment}</p>
                        {statement.judge_request && (
                          <div className="mt-2 p-2 bg-purple-800/50 rounded">
                            <p className="text-purple-100 text-xs">
                              <strong>Request:</strong> {statement.judge_request}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                      <div className="text-xs text-midnight-400">
                        Created: {new Date(statement.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => openStatementModal(statement)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <SafeIcon icon={statement.statement ? FiEye : FiSend} className="w-3 h-3" />
                        <span>{statement.statement ? 'View/Edit' : 'Submit'} Statement</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {userWitnessStatements.length === 0 && (
              <div className="text-center py-12">
                <SafeIcon icon={FiMessageSquare} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-midnight-400 mb-2">No witness requests</h3>
                <p className="text-midnight-500">You haven't been requested as a witness for any incidents</p>
              </div>
            )}
          </div>
        )}

        {/* Judge View - All Statements */}
        {canJudge && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              All Witness Statements ({allWitnessStatements.length})
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {allWitnessStatements.map((statement) => {
                const incident = getIncidentDetails(statement.incident_id);
                
                return (
                  <motion.div
                    key={statement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 rounded-lg p-2">
                          <SafeIcon icon={FiUser} className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="text-white font-semibold">{statement.witness_name}</h5>
                          <p className="text-midnight-400 text-sm">
                            Incident: {incident?.person_name}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(statement.statement_status)}`}>
                        {statement.statement_status}
                      </span>
                    </div>

                    {statement.statement ? (
                      <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                        <h6 className="text-midnight-300 text-xs mb-1">Statement:</h6>
                        <p className="text-white text-sm line-clamp-3">{statement.statement}</p>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500 rounded-lg">
                        <p className="text-yellow-200 text-sm">Awaiting witness statement</p>
                      </div>
                    )}

                    {statement.judge_comment && (
                      <div className="mb-4 p-3 bg-purple-900/30 border border-purple-500 rounded-lg">
                        <h6 className="text-purple-300 text-xs mb-1">Your Comment:</h6>
                        <p className="text-purple-200 text-sm">{statement.judge_comment}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                      <div className="text-xs text-midnight-400">
                        {incident ? new Date(incident.date).toLocaleDateString() : 'Unknown date'}
                      </div>
                      <button
                        onClick={() => openJudgeModal(statement)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <SafeIcon icon={FiMessageSquare} className="w-3 h-3" />
                        <span>Comment</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {allWitnessStatements.length === 0 && (
              <div className="text-center py-12">
                <SafeIcon icon={FiMessageSquare} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-midnight-400 mb-2">No witness statements</h3>
                <p className="text-midnight-500">No witness statements have been created yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statement Submission Modal */}
      <AnimatePresence>
        {showStatementModal && selectedStatement && (
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
                <h3 className="text-lg font-semibold text-white">Submit Witness Statement</h3>
                <button
                  onClick={() => {
                    setShowStatementModal(false);
                    setSelectedStatement(null);
                    setStatementText('');
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {getIncidentDetails(selectedStatement.incident_id) && (
                <div className="mb-4 p-4 bg-midnight-800 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Incident Details</h4>
                  <p className="text-midnight-300">
                    <strong>Person:</strong> {getIncidentDetails(selectedStatement.incident_id).person_name}
                  </p>
                  <p className="text-midnight-300">
                    <strong>Date:</strong> {new Date(getIncidentDetails(selectedStatement.incident_id).date).toLocaleDateString()}
                  </p>
                  <p className="text-midnight-300 mt-2">
                    <strong>Description:</strong> {getIncidentDetails(selectedStatement.incident_id).description}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-midnight-300 mb-2">
                  Your Witness Statement *
                </label>
                <textarea
                  value={statementText}
                  onChange={(e) => setStatementText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide your detailed account of what you witnessed..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowStatementModal(false);
                    setSelectedStatement(null);
                    setStatementText('');
                  }}
                  className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitStatement}
                  disabled={!statementText.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Submit Statement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Judge Comment Modal */}
      <AnimatePresence>
        {showJudgeModal && selectedStatement && (
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
                <h3 className="text-lg font-semibold text-white">Judge Comment</h3>
                <button
                  onClick={() => {
                    setShowJudgeModal(false);
                    setSelectedStatement(null);
                    setJudgeComment('');
                    setJudgeRequest('');
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-midnight-800 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Witness: {selectedStatement.witness_name}</h4>
                {selectedStatement.statement ? (
                  <div>
                    <h5 className="text-midnight-300 text-sm mb-1">Statement:</h5>
                    <p className="text-midnight-300">{selectedStatement.statement}</p>
                  </div>
                ) : (
                  <p className="text-yellow-300">No statement submitted yet</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Judge Comment *
                  </label>
                  <textarea
                    value={judgeComment}
                    onChange={(e) => setJudgeComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your comment on this witness statement..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight-300 mb-2">
                    Request (Optional)
                  </label>
                  <textarea
                    value={judgeRequest}
                    onChange={(e) => setJudgeRequest(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Any specific request or clarification needed from the witness..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowJudgeModal(false);
                    setSelectedStatement(null);
                    setJudgeComment('');
                    setJudgeRequest('');
                  }}
                  className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJudgeComment}
                  disabled={!judgeComment.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default WitnessStatementsPage;