import React from 'react';
import { GarageProvider } from './context/GarageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent = () => {
  const { isAuthenticated, logout, currentUser } = useAuth();

  return (
    <ErrorBoundary>
      {!isAuthenticated ? (
        <Login />
      ) : (
        <Dashboard currentUser={currentUser} onLogout={logout} />
      )}
    </ErrorBoundary>
  );
};

function App() {
  return (
    <AuthProvider>
      <GarageProvider>
        <AppContent />
      </GarageProvider>
    </AuthProvider>
  );
}

export default App;
