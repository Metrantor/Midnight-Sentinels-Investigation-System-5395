import React,{useState,useMemo} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import AssessmentPanel from '../components/AssessmentPanel';
import {useData} from '../contexts/DataContext';
import {useAuth} from '../contexts/AuthContext';

const {FiList,FiAlertTriangle,FiUser,FiCalendar,FiFilter,FiEye,FiSearch,FiClock,FiUsers,FiX,FiMessageSquare}=FiIcons;

const IncidentsListPage=()=> {
  const {personEntries,persons,CRIME_TYPES,getWitnessStatementsForIncident}=useData();
  const {user,hasPermission,getDisplayName}=useAuth();
  const [searchQuery,setSearchQuery]=useState('');
  const [filterCrimeType,setFilterCrimeType]=useState('all');
  const [filterStatus,setFilterStatus]=useState('all');
  const [sortBy,setSortBy]=useState('date'); // 'date' or 'danger_level'
  const [selectedIncident,setSelectedIncident]=useState(null);
  const [showDetailModal,setShowDetailModal]=useState(false);

  // 🔥 FILTER INCIDENTS: Citizens see only their own, others see all
  const filteredIncidents=useMemo(()=> {
    let incidents=personEntries;

    // 🔥 CITIZEN FILTER: Only see incidents they reported
    if (user?.role==='citizen') {
      incidents=incidents.filter(incident=> {
        // Check if incident was reported by this citizen
        return incident.reported_by_id===user.id ||
               incident.reported_by_name?.toLowerCase()===user.real_name?.toLowerCase();
      });
    }

    // Search filter
    if (searchQuery) {
      incidents=incidents.filter(incident=> 
        incident.person_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.reported_by_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Crime type filter
    if (filterCrimeType !== 'all') {
      incidents=incidents.filter(incident=> 
        incident.crime_types && incident.crime_types.includes(filterCrimeType)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      incidents=incidents.filter(incident=> 
        incident.status===filterStatus
      );
    }

    // Sort
    incidents.sort((a,b)=> {
      if (sortBy==='date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy==='danger_level') {
        return (b.danger_level || 1) - (a.danger_level || 1);
      }
      return 0;
    });

    return incidents;
  },[personEntries,user,searchQuery,filterCrimeType,filterStatus,sortBy]);

  const handleOpenDetail=(incident)=> {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  const getDangerLevelColor=(level)=> {
    if (level <= 2) return 'text-green-400';
    if (level <= 4) return 'text-yellow-400';
    if (level === 5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusColor=(status)=> {
    switch (status) {
      case 'confirmed': return 'bg-green-600 text-green-100';
      case 'rejected': return 'bg-red-600 text-red-100';
      case 'reopened': return 'bg-blue-600 text-blue-100';
      default: return 'bg-yellow-600 text-yellow-100';
    }
  };

  const stats={
    total: filteredIncidents.length,
    pending: filteredIncidents.filter(i=> i.status==='pending' || !i.status).length,
    high_danger: filteredIncidents.filter(i=> (i.danger_level || 1) >= 5).length,
    recent: filteredIncidents.filter(i=> {
      const daysDiff=(new Date() - new Date(i.date)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length
  };

  return (
    <Layout title={user?.role==='citizen' ? 'My Reported Incidents' : 'All Incidents'}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-midnight-900 rounded-xl p-4 border border-midnight-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <SafeIcon icon={FiList} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-midnight-400 text-sm">Total Incidents</p>
              </div>
            </div>
          </div>

          <div className="bg-midnight-900 rounded-xl p-4 border border-midnight-700">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-600 rounded-lg p-2">
                <SafeIcon icon={FiClock} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-midnight-400 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-midnight-900 rounded-xl p-4 border border-midnight-700">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 rounded-lg p-2">
                <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.high_danger}</p>
                <p className="text-midnight-400 text-sm">High Danger</p>
              </div>
            </div>
          </div>

          <div className="bg-midnight-900 rounded-xl p-4 border border-midnight-700">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-lg p-2">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.recent}</p>
                <p className="text-midnight-400 text-sm">Last 7 Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-midnight-900 rounded-xl p-4 border border-midnight-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiFilter} className="w-4 h-4 text-midnight-400" />
              <span className="text-midnight-300 text-sm">Filters:</span>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-midnight-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e)=> setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search incidents..."
              />
            </div>

            {/* Crime Type Filter */}
            <select
              value={filterCrimeType}
              onChange={(e)=> setFilterCrimeType(e.target.value)}
              className="px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white text-sm"
            >
              <option value="all">All Crime Types</option>
              {CRIME_TYPES.map(crimeType=> (
                <option key={crimeType.id} value={crimeType.id}>
                  {crimeType.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e)=> setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="reopened">Reopened</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e)=> setSortBy(e.target.value)}
              className="px-3 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="danger_level">Sort by Danger Level</option>
            </select>
          </div>
        </div>

        {/* Incidents List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredIncidents.map((incident)=> {
            const person=persons.find(p=> p.id===incident.person_id);
            const dangerLevel=incident.danger_level || 1;
            const witnessStatements=getWitnessStatementsForIncident(incident.id);

            return (
              <motion.div
                key={incident.id}
                initial={{opacity: 0,scale: 0.95}}
                animate={{opacity: 1,scale: 1}}
                className="bg-midnight-900 rounded-xl p-6 border border-midnight-700 hover:border-midnight-600 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {person?.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e)=> {
                          e.target.style.display='none';
                          e.target.nextSibling.style.display='flex';
                        }}
                      />
                    ) : null}
                    <div className={`bg-red-600 rounded-lg p-2 ${person?.avatar_url ? 'hidden' : 'flex'}`}>
                      <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{incident.person_name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-midnight-400">
                        <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                        <span>{new Date(incident.date).toLocaleDateString()}</span>
                      </div>
                      {/* 🔥 NEW: Reporter Info */}
                      {incident.reported_by_name && (
                        <div className="text-xs text-midnight-500">
                          Reported by: {incident.reported_by_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={()=> handleOpenDetail(incident)}
                    className="text-midnight-400 hover:text-white transition-colors"
                    title="View Details"
                  >
                    <SafeIcon icon={FiEye} className="w-4 h-4" />
                  </button>
                </div>

                {/* Crime Types */}
                {incident.crime_types && incident.crime_types.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {incident.crime_types.slice(0,3).map(crimeType=> {
                        const crimeInfo=CRIME_TYPES.find(ct=> ct.id===crimeType);
                        return (
                          <span
                            key={crimeType}
                            className={`px-2 py-1 rounded text-xs text-white ${crimeInfo?.color || 'bg-gray-600'}`}
                          >
                            {crimeInfo?.name || crimeType}
                          </span>
                        );
                      })}
                      {incident.crime_types.length > 3 && (
                        <span className="px-2 py-1 rounded text-xs bg-midnight-600 text-midnight-300">
                          +{incident.crime_types.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 🔥 NEW: Witnesses Info */}
                {witnessStatements.length > 0 && (
                  <div className="mb-3 flex items-center space-x-2">
                    <SafeIcon icon={FiUsers} className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-400">
                      {witnessStatements.length} witness{witnessStatements.length !== 1 ? 'es' : ''}
                    </span>
                    <div className="flex space-x-1">
                      {witnessStatements.slice(0,3).map(ws=> (
                        <div
                          key={ws.id}
                          className={`w-2 h-2 rounded-full ${
                            ws.statement_status==='submitted' ? 'bg-green-400' :
                            ws.statement_status==='pending' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`}
                          title={`${ws.witness_name}: ${ws.statement_status}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Description Preview */}
                <p className="text-midnight-300 text-sm mb-4 line-clamp-3">
                  {incident.description?.substring(0,150)}{incident.description?.length > 150 ? '...' : ''}
                </p>

                {/* Status & Danger Level */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status || 'pending')}`}>
                    {incident.status || 'Pending'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-midnight-400 text-xs">Danger:</span>
                    <span className={`font-bold ${getDangerLevelColor(dangerLevel)}`}>
                      Level {dangerLevel}
                    </span>
                  </div>
                </div>

                {/* Assessment Panel */}
                {hasPermission('canAssessDangerLevel') && (
                  <AssessmentPanel
                    targetType="entry"
                    targetId={incident.id}
                    currentAssessment={incident}
                    onAssessmentUpdate={()=> window.location.reload()}
                    className="bg-midnight-800"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredIncidents.length===0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiList} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">
              {user?.role==='citizen' ? 'No incidents reported by you' : 'No incidents found'}
            </h3>
            <p className="text-midnight-500">
              {user?.role==='citizen' 
                ? 'Use "Report Incident" to report new incidents'
                : searchQuery || filterCrimeType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No incidents have been reported yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedIncident && (
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
                <h3 className="text-lg font-semibold text-white">Incident Details</h3>
                <button
                  onClick={()=> {
                    setShowDetailModal(false);
                    setSelectedIncident(null);
                  }}
                  className="text-midnight-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Person Info */}
                <div className="bg-midnight-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Person Involved</h4>
                  <p className="text-midnight-300">{selectedIncident.person_name}</p>
                </div>

                {/* 🔥 NEW: Reporter Info */}
                {selectedIncident.reported_by_name && (
                  <div className="bg-midnight-800 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Reported By</h4>
                    <p className="text-midnight-300">{selectedIncident.reported_by_name}</p>
                    <p className="text-midnight-400 text-sm">{selectedIncident.reported_by_role}</p>
                  </div>
                )}

                {/* Date */}
                <div className="bg-midnight-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Date</h4>
                  <p className="text-midnight-300">
                    {new Date(selectedIncident.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Crime Types */}
                {selectedIncident.crime_types && selectedIncident.crime_types.length > 0 && (
                  <div className="bg-midnight-800 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Crime Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.crime_types.map(crimeType=> {
                        const crimeInfo=CRIME_TYPES.find(ct=> ct.id===crimeType);
                        return (
                          <span
                            key={crimeType}
                            className={`px-3 py-1 rounded text-sm text-white ${crimeInfo?.color || 'bg-gray-600'}`}
                          >
                            {crimeInfo?.name || crimeType}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 🔥 NEW: Witnesses */}
                {selectedIncident.witness_names && (
                  <div className="bg-midnight-800 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Witnesses</h4>
                    <p className="text-midnight-300">{selectedIncident.witness_names}</p>
                    
                    {/* Witness Statements */}
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <SafeIcon icon={FiMessageSquare} className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm">Witness Statements</span>
                      </div>
                      
                      {getWitnessStatementsForIncident(selectedIncident.id).map(ws=> (
                        <div key={ws.id} className="bg-midnight-700 rounded p-3 mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm font-medium">{ws.witness_name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              ws.statement_status==='submitted' ? 'bg-green-600 text-green-100' :
                              ws.statement_status==='pending' ? 'bg-yellow-600 text-yellow-100' : 
                              'bg-gray-600 text-gray-100'
                            }`}>
                              {ws.statement_status}
                            </span>
                          </div>
                          {ws.statement && (
                            <p className="text-midnight-300 text-sm">{ws.statement}</p>
                          )}
                          {ws.judge_comment && (
                            <div className="mt-2 p-2 bg-midnight-600 rounded">
                              <p className="text-purple-300 text-xs">Judge Comment: {ws.judge_comment}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="bg-midnight-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Description</h4>
                  <p className="text-midnight-300 leading-relaxed">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Assessment Panel */}
                {hasPermission('canAssessDangerLevel') && (
                  <AssessmentPanel
                    targetType="entry"
                    targetId={selectedIncident.id}
                    currentAssessment={selectedIncident}
                    onAssessmentUpdate={()=> {
                      window.location.reload();
                      setShowDetailModal(false);
                    }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default IncidentsListPage;