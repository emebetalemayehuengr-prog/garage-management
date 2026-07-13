import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const DEFAULT_USERS = [
  { id: 1, name: 'Owner', username: 'owner', password: 'owner123', role: 'owner' },
  { id: 2, name: 'Admin User', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 3, name: 'John Smith', username: 'mechanic', password: 'mechanic123', role: 'mechanic' }
];

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('garage_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('garage_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('garage_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('garage_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('garage_current_user');
    }
  }, [currentUser]);

  const login = (username, password) => {
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      
      if (user) {
        const { password: _, ...safeUser } = user;
        setCurrentUser(safeUser);
        setIsLoading(false);
        return safeUser;
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
        return null;
      }
    }, 500);
  };

  const logout = () => {
    setCurrentUser(null);
    setError('');
  };

  const updateUser = (userId, updates) => {
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const addUser = (user) => {
    const newUser = { ...user, id: Date.now() };
    setUsers([...users, newUser]);
    return newUser;
  };

  const deleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
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
    users,
    currentUser,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    addUser,
    deleteUser,
    hasRole,
    hasAnyRole,
    isMechanic,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
