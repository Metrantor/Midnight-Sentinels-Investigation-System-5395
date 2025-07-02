import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const { FiGavel, FiMessageSquare, FiCalendar, FiUser, FiCheck, FiX, FiClock, FiAlertTriangle, FiEye, FiSend, FiThumbsUp, FiThumbsDown } = FiIcons;

const HearingsPage = () => {
  const { hearings, personEntries, getHearingsForUser, respondToHearing, CRIME_TYPES } = useData();
  const { user, hasPermission } = useAuth();

  const [selectedHearing, setSelectedHearing] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseComment, setResponseComment] = useState('');
  const [responseAgreement, setResponseAgreement] = useState('');
  const [loading, setLoading] = useState(false);

  // Get hearings for current user
  const userHearings = useMemo(() => {
    if (!user) return [];
    return getHearingsForUser(user.id);
  }, [user, hearings]);

  // Get all hearings for judges
  const allHearings = useMemo(() => {
    return hearings;
  }, [hearings]);

  const canJudge = hasPermission('canAssessDangerLevel');

  const handleOpenResponse = (hearing) => {
    setSelectedHearing(hearing);
    setResponseComment('');
    setResponseAgreement('');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedHearing || !responseAgreement) {
      alert('Please select agree or disagree');
      return;
    }

    setLoading(true);
    try {
      await respondToHearing(selectedHearing.id, {
        agreement: responseAgreement,
        comment: responseComment.trim() || null
      });

      setShowResponseModal(false);
      setSelectedHearing(null);
      setResponseComment('');
      setResponseAgreement('');
      alert('Response submitted successfully!');
    } catch (error) {
      alert('Error submitting response: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getIncidentDetails = (entryId) => {
    return personEntries.find(entry => entry.id === entryId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-green-100';
      case 'closed': return 'bg-gray-600 text-gray-100';
      default: return 'bg-blue-600 text-blue-100';
    }
  };

  const getAgreementColor = (agreement) => {
    switch (agreement) {
      case 'agree': return 'bg-green-600 text-green-100';
      case 'disagree': return 'bg-red-600 text-red-100';
      default: return 'bg-yellow-600 text-yellow-100';
    }
  };

  const hasUserResponded = (hearing) => {
    if (!hearing.responses) return false;
    return hearing.responses.some(response => response.witness_user_id === user.id);
  };

  const getUserResponse = (hearing) => {
    if (!hearing.responses) return null;
    return hearing.responses.find(response => response.witness_user_id === user.id);
  };

  return (
    <Layout title="Hearings">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <SafeIcon icon={FiGavel} className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-midnight-300 mb-2">
            {canJudge ? 'All Hearings' : 'Your Hearings'}
          </h3>
          <p className="text-midnight-400">
            {canJudge 
              ? 'Review all hearings and witness responses for incidents'
              : 'Respond to hearings where you have been requested to provide testimony'
            }
          </p>
        </div>

        {/* User's Hearings */}
        {!canJudge && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Hearings Requesting Your Testimony ({userHearings.length})
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userHearings.map((hearing) => {
                const incident = getIncidentDetails(hearing.entry_id);
                const userResponse = getUserResponse(hearing);
                const hasResponded = hasUserResponded(hearing);

                return (
                  <motion.div
                    key={hearing.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-midnight-900 rounded-xl p-6 border transition-all ${
                      hasResponded ? 'border-green-500/30' : 'border-orange-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-600 rounded-lg p-2">
                          <SafeIcon icon={FiGavel} className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="text-white font-semibold">{hearing.title}</h5>
                          <div className="flex items-center space-x-2 text-xs text-midnight-400">
                            <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                            <span>{new Date(hearing.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-midnight-500 text-xs">
                            Requested by: {hearing.created_by_name}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(hearing.status)}`}>
                        {hearing.status}
                      </span>
                    </div>

                    {/* Incident Details */}
                    {incident && (
                      <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                        <h6 className="text-midnight-300 text-xs mb-2">Incident Details:</h6>
                        <p className="text-white text-sm mb-2">
                          <strong>Person:</strong> {incident.person_name}
                        </p>
                        <p className="text-white text-sm mb-2">
                          <strong>Date:</strong> {new Date(incident.date).toLocaleDateString()}
                        </p>
                        
                        {incident.crime_types && incident.crime_types.length > 0 && (
                          <div className="mb-2">
                            <p className="text-midnight-300 text-xs mb-1">Charges:</p>
                            <div className="flex flex-wrap gap-1">
                              {incident.crime_types.map(crimeType => {
                                const crimeInfo = CRIME_TYPES.find(ct => ct.id === crimeType);
                                return (
                                  <span
                                    key={crimeType}
                                    className={`px-2 py-1 rounded text-xs text-white ${crimeInfo?.color || 'bg-gray-600'}`}
                                  >
                                    {crimeInfo?.name || crimeType}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-midnight-300 text-xs mb-1">Description:</p>
                          <p className="text-midnight-300 text-sm">{incident.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Question */}
                    <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                      <h6 className="text-midnight-300 text-xs mb-1">Question:</h6>
                      <p className="text-white text-sm">{hearing.question}</p>
                    </div>

                    {/* User's Response */}
                    {userResponse ? (
                      <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg">
                        <h6 className="text-green-300 text-xs mb-2">Your Response:</h6>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getAgreementColor(userResponse.agreement)}`}>
                            {userResponse.agreement === 'agree' ? 'Agree' : 'Disagree'}
                          </span>
                          <span className="text-green-400 text-xs">
                            {new Date(userResponse.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {userResponse.comment && (
                          <p className="text-green-200 text-sm">{userResponse.comment}</p>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-orange-900/30 border border-orange-500 rounded-lg">
                        <p className="text-orange-200 text-sm">⏳ Awaiting your response</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                      <div className="text-xs text-midnight-400">
                        Created: {new Date(hearing.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleOpenResponse(hearing)}
                        disabled={hearing.status === 'closed'}
                        className={`px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors ${
                          hearing.status === 'closed' 
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : hasResponded
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        <SafeIcon icon={hasResponded ? FiEye : FiSend} className="w-3 h-3" />
                        <span>{hasResponded ? 'View/Edit' : 'Respond'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {userHearings.length === 0 && (
              <div className="text-center py-12">
                <SafeIcon icon={FiGavel} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-midnight-400 mb-2">No hearings pending</h3>
                <p className="text-midnight-500">You haven't been requested to testify in any hearings</p>
              </div>
            )}
          </div>
        )}

        {/* Judge View - All Hearings */}
        {canJudge && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              All Hearings ({allHearings.length})
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {allHearings.map((hearing) => {
                const incident = getIncidentDetails(hearing.entry_id);
                const totalWitnesses = hearing.witness_ids ? hearing.witness_ids.length : 0;
                const totalResponses = hearing.responses ? hearing.responses.length : 0;
                const agreeCount = hearing.responses ? hearing.responses.filter(r => r.agreement === 'agree').length : 0;
                const disagreeCount = hearing.responses ? hearing.responses.filter(r => r.agreement === 'disagree').length : 0;

                return (
                  <motion.div
                    key={hearing.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-600 rounded-lg p-2">
                          <SafeIcon icon={FiGavel} className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="text-white font-semibold">{hearing.title}</h5>
                          <p className="text-midnight-400 text-sm">
                            Person: {incident?.person_name || 'Unknown'}
                          </p>
                          <p className="text-midnight-500 text-xs">
                            Created by: {hearing.created_by_name}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(hearing.status)}`}>
                        {hearing.status}
                      </span>
                    </div>

                    {/* Question Preview */}
                    <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                      <h6 className="text-midnight-300 text-xs mb-1">Question:</h6>
                      <p className="text-white text-sm line-clamp-2">{hearing.question}</p>
                    </div>

                    {/* Response Summary */}
                    <div className="mb-4 p-3 bg-midnight-800 rounded-lg">
                      <h6 className="text-midnight-300 text-xs mb-2">Response Summary:</h6>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-midnight-700 rounded p-2">
                          <div className="text-white font-semibold">{totalResponses}/{totalWitnesses}</div>
                          <div className="text-midnight-400 text-xs">Responded</div>
                        </div>
                        <div className="bg-green-900/30 rounded p-2">
                          <div className="text-green-400 font-semibold">{agreeCount}</div>
                          <div className="text-midnight-400 text-xs">Agree</div>
                        </div>
                        <div className="bg-red-900/30 rounded p-2">
                          <div className="text-red-400 font-semibold">{disagreeCount}</div>
                          <div className="text-midnight-400 text-xs">Disagree</div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Responses Preview */}
                    {hearing.responses && hearing.responses.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-midnight-300 text-xs mb-2">Recent Responses:</h6>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {hearing.responses.slice(-2).map((response, index) => (
                            <div key={index} className="bg-midnight-800 rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-sm font-medium">{response.witness_name}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getAgreementColor(response.agreement)}`}>
                                  {response.agreement === 'agree' ? 'Agree' : 'Disagree'}
                                </span>
                              </div>
                              {response.comment && (
                                <p className="text-midnight-300 text-xs line-clamp-1">{response.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                      <div className="text-xs text-midnight-400">
                        {new Date(hearing.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleOpenResponse(hearing)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <SafeIcon icon={FiEye} className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {allHearings.length === 0 && (
              <div className="text-center py-12">
                <SafeIcon icon={FiGavel} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-midnight-400 mb-2">No hearings created</h3>
                <p className="text-midnight-500">No hearings have been created yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response Modal */}
      <AnimatePresence>
        {showResponseModal && selectedHearing && (
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
                  {canJudge ? 'Hearing Details' : 'Respond to Hearing'}
                </h3>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedHearing(null);
                    setResponseComment('');
                    setResponseAgreement('');
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {/* Hearing Details */}
              <div className="mb-4 p-4 bg-midnight-800 rounded-lg">
                <h4 className="text-white font-semibold mb-2">{selectedHearing.title}</h4>
                <p className="text-midnight-300 mb-2">
                  <strong>Created by:</strong> {selectedHearing.created_by_name}
                </p>
                <p className="text-midnight-300">
                  <strong>Date:</strong> {new Date(selectedHearing.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Incident Details */}
              {getIncidentDetails(selectedHearing.entry_id) && (
                <div className="mb-4 p-4 bg-midnight-800 rounded-lg">
                  <h5 className="text-white font-semibold mb-2">Incident Details</h5>
                  {(() => {
                    const incident = getIncidentDetails(selectedHearing.entry_id);
                    return (
                      <>
                        <p className="text-midnight-300 mb-2">
                          <strong>Person:</strong> {incident.person_name}
                        </p>
                        <p className="text-midnight-300 mb-2">
                          <strong>Date:</strong> {new Date(incident.date).toLocaleDateString()}
                        </p>
                        
                        {incident.crime_types && incident.crime_types.length > 0 && (
                          <div className="mb-2">
                            <p className="text-midnight-300 text-sm mb-1">Charges:</p>
                            <div className="flex flex-wrap gap-1">
                              {incident.crime_types.map(crimeType => {
                                const crimeInfo = CRIME_TYPES.find(ct => ct.id === crimeType);
                                return (
                                  <span
                                    key={crimeType}
                                    className={`px-2 py-1 rounded text-xs text-white ${crimeInfo?.color || 'bg-gray-600'}`}
                                  >
                                    {crimeInfo?.name || crimeType}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-midnight-300 text-sm mb-1">Description:</p>
                          <p className="text-midnight-300">{incident.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Question */}
              <div className="mb-4 p-4 bg-midnight-800 rounded-lg">
                <h5 className="text-white font-semibold mb-2">Question</h5>
                <p className="text-midnight-300">{selectedHearing.question}</p>
              </div>

              {/* Judge View: All Responses */}
              {canJudge && selectedHearing.responses && selectedHearing.responses.length > 0 && (
                <div className="mb-4 p-4 bg-midnight-800 rounded-lg">
                  <h5 className="text-white font-semibold mb-3">All Responses ({selectedHearing.responses.length})</h5>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedHearing.responses.map((response, index) => (
                      <div key={index} className="bg-midnight-700 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{response.witness_name}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getAgreementColor(response.agreement)}`}>
                              {response.agreement === 'agree' ? 'Agree' : 'Disagree'}
                            </span>
                            <span className="text-midnight-400 text-xs">
                              {new Date(response.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {response.comment && (
                          <p className="text-midnight-300 text-sm">{response.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Response Form (for non-judges) */}
              {!canJudge && selectedHearing.status === 'active' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-3">
                      Your Response *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setResponseAgreement('agree')}
                        className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                          responseAgreement === 'agree'
                            ? 'border-green-500 bg-green-900/30 text-green-300'
                            : 'border-midnight-600 bg-midnight-800 text-midnight-300 hover:border-midnight-500'
                        }`}
                      >
                        <SafeIcon icon={FiThumbsUp} className="w-5 h-5" />
                        <span className="font-medium">Agree</span>
                      </button>
                      <button
                        onClick={() => setResponseAgreement('disagree')}
                        className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                          responseAgreement === 'disagree'
                            ? 'border-red-500 bg-red-900/30 text-red-300'
                            : 'border-midnight-600 bg-midnight-800 text-midnight-300 hover:border-midnight-500'
                        }`}
                      >
                        <SafeIcon icon={FiThumbsDown} className="w-5 h-5" />
                        <span className="font-medium">Disagree</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-300 mb-2">
                      Additional Comment (Optional)
                    </label>
                    <textarea
                      value={responseComment}
                      onChange={(e) => setResponseComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Provide any additional context or explanation for your response..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowResponseModal(false);
                        setSelectedHearing(null);
                        setResponseComment('');
                        setResponseAgreement('');
                      }}
                      className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitResponse}
                      disabled={loading || !responseAgreement}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      {loading ? 'Submitting...' : 'Submit Response'}
                    </button>
                  </div>
                </div>
              )}

              {/* Closed Hearing Message */}
              {selectedHearing.status === 'closed' && !canJudge && (
                <div className="p-4 bg-gray-900/30 border border-gray-500 rounded-lg text-center">
                  <p className="text-gray-300">This hearing has been closed and no longer accepts responses.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default HearingsPage;