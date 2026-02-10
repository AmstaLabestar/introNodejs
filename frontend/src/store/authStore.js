import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: (user, token) => {
        set({ user, token, isLoggedIn: true, error: null });
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
        window.location.href = '/login';
      },

      register: (user, token) => {
        set({ user, token, isLoggedIn: true, error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
