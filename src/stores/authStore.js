import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  currentUser: null,
  token: localStorage.getItem('garage_token'),
  isLoading: false,
  error: '',

  login: (user, token) => {
    localStorage.setItem('garage_token', token);
    set({ currentUser: user, token, error: '' });
  },

  logout: () => {
    localStorage.removeItem('garage_token');
    set({ currentUser: null, token: null, error: '' });
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
