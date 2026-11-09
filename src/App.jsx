import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Landing from './components/Landing';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent = () => {
  const { currentUser, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);

  if (currentUser) {
    return <Dashboard currentUser={currentUser} onLogout={logout} />;
  }

  return showLogin ? (
    <Login onBack={() => setShowLogin(false)} />
  ) : (
    <Landing onSignIn={() => setShowLogin(true)} />
  );
};

function App() {
  return (
    <>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  );
}

export default App;
