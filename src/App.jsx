import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import OrganizationsPage from './pages/OrganizationsPage';
import PersonsPage from './pages/PersonsPage';
import SearchPage from './pages/SearchPage';
import IncidentPage from './pages/IncidentPage';
import RelationshipsPage from './pages/RelationshipsPage';
import ManufacturersPage from './pages/ManufacturersPage';
import ShipsPage from './pages/ShipsPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-midnight-950">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations"
                element={
                  <ProtectedRoute>
                    <OrganizationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/persons"
                element={
                  <ProtectedRoute>
                    <PersonsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/incident"
                element={
                  <ProtectedRoute>
                    <IncidentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relationships"
                element={
                  <ProtectedRoute>
                    <RelationshipsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manufacturers"
                element={
                  <ProtectedRoute>
                    <ManufacturersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ships"
                element={
                  <ProtectedRoute>
                    <ShipsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;