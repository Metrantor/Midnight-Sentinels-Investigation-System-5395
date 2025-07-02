import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import DatabaseSetupHelper from './DatabaseSetupHelper';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const { FiWifi, FiWifiOff, FiRefreshCw, FiAlertTriangle, FiSettings, FiDatabase } = FiIcons;

const DatabaseStatus = () => {
  const { dbConnected, connectionError, loading, retryConnection, enablePolling, setEnablePolling } = useData();
  const { user, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <div className="animate-spin">
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Connecting to database...</span>
        </motion.div>
      </div>
    );
  }

  if (!dbConnected) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiWifiOff} className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Database Connection Failed</p>
                {connectionError && (
                  <p className="text-xs text-red-200 mt-1">{connectionError}</p>
                )}
                <button
                  onClick={retryConnection}
                  className="mt-2 bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                >
                  <SafeIcon icon={FiRefreshCw} className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* 🔥 NEW: Show database setup helper when connection fails */}
        {(connectionError?.includes('witness_statements') || 
          connectionError?.includes('relation') || 
          connectionError?.includes('does not exist')) && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <DatabaseSetupHelper />
          </div>
        )}
      </>
    );
  }

  // 🔥 ADMIN POLLING CONTROL
  const isAdmin = user?.role === 'sentinel';

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiWifi} className="w-4 h-4" />
          <span className="text-sm font-medium">Database Connected</span>
          
          {/* 🔥 ADMIN POLLING TOGGLE */}
          {isAdmin && (
            <div className="flex items-center space-x-1 ml-3 pl-2 border-l border-green-400">
              <SafeIcon icon={FiSettings} className="w-3 h-3" />
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={enablePolling}
                  onChange={(e) => setEnablePolling(e.target.checked)}
                  className="w-3 h-3 rounded"
                />
                <span className="text-xs">Auto-refresh</span>
              </label>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DatabaseStatus;