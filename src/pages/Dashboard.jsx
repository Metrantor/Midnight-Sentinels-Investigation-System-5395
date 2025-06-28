import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';

const { FiBuilding, FiUsers, FiBook, FiFileText, FiTrendingUp, FiClock, FiExternalLink } = FiIcons;

const Dashboard = () => {
  const navigate = useNavigate();
  const { organizations, persons, journals, personEntries } = useData();

  const stats = [
    {
      name: 'Organizations',
      value: organizations.length,
      icon: FiBuilding,
      color: 'bg-blue-600',
      link: '/organizations'
    },
    {
      name: 'Persons',
      value: persons.length,
      icon: FiUsers,
      color: 'bg-red-600',
      link: '/persons'
    },
    {
      name: 'Journal Entries',
      value: journals.length,
      icon: FiBook,
      color: 'bg-green-600',
      link: '/organizations'
    },
    {
      name: 'Person Entries',
      value: personEntries.length,
      icon: FiFileText,
      color: 'bg-purple-600',
      link: '/persons'
    }
  ];

  const recentActivity = [
    ...journals.slice(-3).map(j => ({ ...j, type: 'journal' })),
    ...personEntries.slice(-3).map(e => ({ ...e, type: 'entry' }))
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const navigateToActivity = (activity) => {
    if (activity.type === 'journal') {
      navigate('/organizations');
    } else {
      navigate('/persons');
    }
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(stat.link)}
              className="bg-midnight-900 rounded-xl p-6 border border-midnight-700 cursor-pointer hover:border-midnight-600 hover:scale-105 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-midnight-400 text-sm font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                  <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <SafeIcon icon={FiExternalLink} className="w-4 h-4 text-midnight-400" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-midnight-900 rounded-xl border border-midnight-700"
        >
          <div className="p-6 border-b border-midnight-700">
            <div className="flex items-center">
              <SafeIcon icon={FiClock} className="w-5 h-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    onClick={() => navigateToActivity(activity)}
                    className="flex items-start space-x-3 p-3 bg-midnight-800 rounded-lg cursor-pointer hover:bg-midnight-700 transition-colors group"
                  >
                    <div className={`rounded-full p-2 ${activity.type === 'journal' ? 'bg-green-600' : 'bg-purple-600'}`}>
                      <SafeIcon icon={activity.type === 'journal' ? FiBook : FiFileText} className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">
                          {activity.type === 'journal' ? 'Journal Entry' : 'Person Entry'}
                        </p>
                        <SafeIcon 
                          icon={FiExternalLink} 
                          className="w-4 h-4 text-midnight-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                        />
                      </div>
                      <p className="text-midnight-400 text-sm mt-1">
                        {activity.description?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-midnight-500 text-xs">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                        {activity.type === 'entry' && activity.personName && (
                          <p className="text-midnight-500 text-xs">
                            Person: {activity.personName}
                          </p>
                        )}
                        {activity.type === 'journal' && activity.organizationName && (
                          <p className="text-midnight-500 text-xs">
                            Org: {activity.organizationName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiTrendingUp} className="w-12 h-12 text-midnight-600 mx-auto mb-4" />
                <p className="text-midnight-400">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;