import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('garage_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('garage_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('garage_current_user');
    }
  }, [currentUser]);

  const login = async (username, password) => {
    setIsLoading(true);
    setError('');
    
    try {
      const user = await api.post('/login', { username, password });
      
      if (user) {
        setCurrentUser(user);
        setIsLoading(false);
        return user;
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
        return null;
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError('');
  };

  const hasRole = (role) => {
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true;
    return currentUser.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true;
    return roles.includes(currentUser.role);
  };

  const isMechanic = () => {
    return currentUser?.role === 'mechanic';
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isMechanic,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
