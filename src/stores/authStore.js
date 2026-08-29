import { create } from 'zustand';
import { api } from '../utils/api';

export const useAuthStore = create((set) => ({
  currentUser: null,
  token: localStorage.getItem('garage_token'),
  isLoading: false,
  error: '',

  login: async (username, password) => {
    set({ isLoading: true, error: '' });
    try {
      const result = await api.post('/login', { username, password });
      localStorage.setItem('garage_token', result.token);
      set({ currentUser: result.user, token: result.token, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('garage_token');
    set({ currentUser: null, token: null, error: '' });
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
