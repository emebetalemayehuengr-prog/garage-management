import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent = () => {
  const { currentUser, logout } = useAuthStore();

  return (
    <ErrorBoundary>
      {!currentUser ? (
        <Login />
      ) : (
        <Dashboard currentUser={currentUser} onLogout={logout} />
      )}
    </ErrorBoundary>
  );
};

function App() {
  return (
    <>
      <AppContent />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  );
}

export default App;
