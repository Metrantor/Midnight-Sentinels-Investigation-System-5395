import React,{useState,useMemo} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {useNavigate} from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import AssessmentPanel from '../components/AssessmentPanel';
import {useData} from '../contexts/DataContext';
import {useAuth} from '../contexts/AuthContext';

const {FiShield,FiUser,FiBuilding,FiFileText,FiAlertTriangle,FiFilter,FiEye,FiCalendar}=FiIcons;

const AssessmentsPage=()=> {
  const navigate=useNavigate();
  const {
    persons,
    organizations,
    personEntries,
    CRIME_TYPES,
    DANGER_LEVELS
  }=useData();
  const {hasPermission,DANGER_LEVELS: AUTH_DANGER_LEVELS}=useAuth();
  const [filterLevel,setFilterLevel]=useState('all');
  const [filterType,setFilterType]=useState('all');
  const [showUnassessed,setShowUnassessed]=useState(true);

  // Combine all assessable items
  const assessmentItems=useMemo(()=> {
    const items=[];

    // Add persons
    persons.forEach(person=> {
      items.push({
        id: person.id,
        type: 'person',
        name: person.name,
        handle: person.handle,
        avatar: person.avatar_url,
        dangerLevel: person.danger_level || 'unknown',
        assessedBy: person.assessed_by_name,
        assessedAt: person.assessed_at,
        assessmentNotes: person.assessment_notes,
        data: person
      });
    });

    // Add organizations
    organizations.forEach(org=> {
      items.push({
        id: org.id,
        type: 'organization',
        name: org.name,
        handle: org.handle,
        avatar: org.logo_url,
        dangerLevel: org.danger_level || 'unknown',
        assessedBy: org.assessed_by_name,
        assessedAt: org.assessed_at,
        assessmentNotes: org.assessment_notes,
        data: org
      });
    });

    // Add person entries
    personEntries.forEach(entry=> {
      items.push({
        id: entry.id,
        type: 'entry',
        name: `Entry: ${entry.person_name}`,
        handle: entry.person_name,
        avatar: null,
        dangerLevel: entry.danger_level || 'unknown',
        assessedBy: entry.assessed_by_name,
        assessedAt: entry.assessed_at,
        assessmentNotes: entry.assessment_notes,
        crimeTypes: entry.crime_types,
        description: entry.description,
        date: entry.date,
        data: entry
      });
    });

    return items;
  },[persons,organizations,personEntries]);

  // Filter items
  const filteredItems=useMemo(()=> {
    return assessmentItems.filter(item=> {
      // Filter by assessment status
      if (showUnassessed && item.assessedBy) return false;
      if (!showUnassessed && !item.assessedBy) return false;

      // Filter by danger level
      if (filterLevel !== 'all' && item.dangerLevel !== filterLevel) return false;

      // Filter by type
      if (filterType !== 'all' && item.type !== filterType) return false;

      return true;
    });
  },[assessmentItems,filterLevel,filterType,showUnassessed]);

  const getDangerLevelInfo=(level)=> {
    return AUTH_DANGER_LEVELS.find(dl=> dl.id===level) || AUTH_DANGER_LEVELS[0];
  };

  const getTypeIcon=(type)=> {
    switch (type) {
      case 'person': return FiUser;
      case 'organization': return FiBuilding;
      case 'entry': return FiFileText;
      default: return FiShield;
    }
  };

  const getTypeColor=(type)=> {
    switch (type) {
      case 'person': return 'bg-red-600';
      case 'organization': return 'bg-blue-600';
      case 'entry': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const navigateToItem=(item)=> {
    switch (item.type) {
      case 'person':
        navigate('/persons');
        break;
      case 'organization':
        navigate('/organizations');
        break;
      case 'entry':
        navigate('/persons');
        break;
      default:
        break;
    }
  };

  const stats={
    unassessed: assessmentItems.filter(item=> !item.assessedBy).length,
    high: assessmentItems.filter(item=> ['high','extreme','critical'].includes(item.dangerLevel)).length,
    total: assessmentItems.length
  };

  if (!hasPermission('canAssessDangerLevel')) {
    return (
      <Layout title="Assessments">
        <div className="text-center py-12">
          <SafeIcon icon={FiShield} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-midnight-400 mb-2">Access Denied</h3>
          <p className="text-midnight-500">You don't have permission to manage assessments</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Danger Level Assessments">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-midnight-900 rounded-xl p-4 border border-midnight-700">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-600 rounded-lg p-2">
                <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.unassessed}</p>
                <p className="text-midnight-400 text-sm">Unassessed Items</p>
              </div>
            </div>
          </div>

          <div className="bg-midnight-900 rounded-xl p-4 border border-midnight-700">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 rounded-lg p-2">
                <SafeIcon icon={FiShield} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.high}</p>
                <p className="text-midnight-400 text-sm">High Risk+</p>
              </div>
            </div>
          </div>

          <div className="bg-midnight-900 rounded-xl p-4 border border-midnight-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <SafeIcon icon={FiFileText} className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-midnight-400 text-sm">Total Items</p>
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

            <div className="flex items-center space-x-2">
              <button
                onClick={()=> setShowUnassessed(true)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  showUnassessed
                    ? 'bg-yellow-600 text-white'
                    : 'bg-midnight-800 text-midnight-400 hover:text-white'
                }`}
              >
                Unassessed
              </button>
              <button
                onClick={()=> setShowUnassessed(false)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  !showUnassessed
                    ? 'bg-blue-600 text-white'
                    : 'bg-midnight-800 text-midnight-400 hover:text-white'
                }`}
              >
                Assessed
              </button>
            </div>

            <select
              value={filterType}
              onChange={(e)=> setFilterType(e.target.value)}
              className="px-3 py-1 bg-midnight-800 border border-midnight-600 rounded text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="person">Persons</option>
              <option value="organization">Organizations</option>
              <option value="entry">Entries</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e)=> setFilterLevel(e.target.value)}
              className="px-3 py-1 bg-midnight-800 border border-midnight-600 rounded text-white text-sm"
            >
              <option value="all">All Levels</option>
              {AUTH_DANGER_LEVELS.map(level=> (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assessment Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item)=> {
            const dangerInfo=getDangerLevelInfo(item.dangerLevel);
            const TypeIcon=getTypeIcon(item.type);
            
            return (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{opacity: 0,scale: 0.95}}
                animate={{opacity: 1,scale: 1}}
                className="bg-midnight-900 rounded-xl p-6 border border-midnight-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e)=> {
                          e.target.style.display='none';
                          e.target.nextSibling.style.display='flex';
                        }}
                      />
                    ) : null}
                    <div className={`${getTypeColor(item.type)} rounded-lg p-2 ${item.avatar ? 'hidden' : 'flex'}`}>
                      <SafeIcon icon={TypeIcon} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                      {item.handle && (
                        <p className="text-midnight-400 text-sm">@{item.handle}</p>
                      )}
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                        item.type === 'person' ? 'bg-red-600 text-red-100' :
                        item.type === 'organization' ? 'bg-blue-600 text-blue-100' :
                        'bg-purple-600 text-purple-100'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={()=> navigateToItem(item)}
                    className="text-midnight-400 hover:text-white transition-colors"
                    title="View Details"
                  >
                    <SafeIcon icon={FiEye} className="w-4 h-4" />
                  </button>
                </div>

                {/* Entry-specific info */}
                {item.type === 'entry' && (
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiCalendar} className="w-3 h-3 text-midnight-400" />
                      <span className="text-midnight-300 text-xs">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    {item.crimeTypes && item.crimeTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.crimeTypes.map(crimeType=> {
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
                      </div>
                    )}
                    <p className="text-midnight-300 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Assessment Panel */}
                <AssessmentPanel
                  targetType={item.type}
                  targetId={item.id}
                  currentAssessment={item.data}
                  onAssessmentUpdate={()=> window.location.reload()}
                />
              </motion.div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiShield} className="w-16 h-16 text-midnight-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-400 mb-2">No items found</h3>
            <p className="text-midnight-500">
              {showUnassessed ? 'All items have been assessed' : 'No assessed items match your filters'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssessmentsPage;