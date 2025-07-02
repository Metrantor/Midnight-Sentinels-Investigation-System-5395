import React from 'react';
import {HashRouter as Router,Routes,Route} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {DataProvider} from './contexts/DataContext';
import DatabaseStatus from './components/DatabaseStatus';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AssessmentsPage from './pages/AssessmentsPage';
import OrganizationsPage from './pages/OrganizationsPage';
import PersonsPage from './pages/PersonsPage';
import SearchPage from './pages/SearchPage';
import IncidentPage from './pages/IncidentPage';
import IncidentsListPage from './pages/IncidentsListPage';
import HearingsPage from './pages/HearingsPage';
import RelationshipsPage from './pages/RelationshipsPage';
import ShipsPage from './pages/ShipsPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-midnight-950">
            <DatabaseStatus />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/assessments" element={<ProtectedRoute><AssessmentsPage /></ProtectedRoute>} />
              <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
              <Route path="/persons" element={<ProtectedRoute><PersonsPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/incident" element={<ProtectedRoute><IncidentPage /></ProtectedRoute>} />
              <Route path="/incidents" element={<ProtectedRoute><IncidentsListPage /></ProtectedRoute>} />
              <Route path="/hearings" element={<ProtectedRoute><HearingsPage /></ProtectedRoute>} />
              <Route path="/relationships" element={<ProtectedRoute><RelationshipsPage /></ProtectedRoute>} />
              <Route path="/ships" element={<ProtectedRoute><ShipsPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;