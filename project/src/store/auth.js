import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user_id: null,
      full_name: null,
      email: null,
      isAuthenticated: false,
      
      login: (userData) => {
        set({
          token: userData.access_token,
          user_id: userData.user_id,
          full_name: userData.full_name,
          email: userData.email,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          token: null,
          user_id: null,
          full_name: null,
          email: null,
          isAuthenticated: false,
        });
        // Redirect to home page
        window.location.href = '/';
      },
      
      getAuthHeaders: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    {
      name: 'tutorwise-auth',
    }
  )
);