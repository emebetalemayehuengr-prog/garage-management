import React, { createContext, useContext } from 'react';
import { useAuthStore } from '../stores/authStore';

const AuthContext = createContext();

export const useAuth = () => {
  const store = useAuthStore();
  return {
    currentUser: store.currentUser,
    token: store.token,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    hasRole: (role) => {
      if (!store.currentUser) return false;
      if (store.currentUser.role === 'owner') return true;
      return store.currentUser.role === role;
    },
    hasAnyRole: (roles) => {
      if (!store.currentUser) return false;
      if (store.currentUser.role === 'owner') return true;
      return roles.includes(store.currentUser.role);
    },
    isMechanic: () => store.currentUser?.role === 'mechanic',
    isAuthenticated: !!store.currentUser,
  };
};

export const AuthProvider = ({ children }) => {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
