import { create } from 'zustand';
import { api } from '../utils/api';

const readStoredToken = () => {
  try {
    return window.localStorage.getItem('garage_token');
  } catch {
    // Some TV browsers disable storage. The login page must still be usable.
    return null;
  }
};

const storeToken = (token) => {
  try {
    if (token) window.localStorage.setItem('garage_token', token);
    else window.localStorage.removeItem('garage_token');
  } catch {
    // Keep the in-memory session when persistent storage is unavailable.
  }
};

export const useAuthStore = create((set) => ({
  currentUser: null,
  token: readStoredToken(),
  isLoading: false,
  error: '',

  login: async (username, password) => {
    set({ isLoading: true, error: '' });
    try {
      const result = await api.post('/login', { username, password });
      storeToken(result.token);
      set({ currentUser: result.user, token: result.token, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    storeToken(null);
    set({ currentUser: null, token: null, error: '' });
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
