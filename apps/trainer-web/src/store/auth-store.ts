'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Trainer, AuthTokens } from '@/types';
import { setTokens, clearTokens, storeTrainer } from '@/lib/auth';
import { post } from '@/lib/api';

interface AuthStore {
  trainer: Trainer | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTrainer: (trainer: Trainer) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  refreshProfile: () => Promise<void>;
}

interface LoginResponse {
  trainer: Trainer;
  tokens: AuthTokens;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      trainer: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await post<LoginResponse>('/auth/trainer/login', {
            email,
            password,
          });

          const { trainer, tokens } = response;

          setTokens(tokens);
          storeTrainer(trainer);

          set({
            trainer,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        clearTokens();
        set({
          trainer: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      setTrainer: (trainer: Trainer) => {
        storeTrainer(trainer);
        set({ trainer });
      },

      setTokens: (tokens: AuthTokens) => {
        setTokens(tokens);
        set({ tokens, isAuthenticated: true });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      refreshProfile: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        try {
          const trainer = await post<Trainer>('/auth/trainer/me');
          storeTrainer(trainer);
          set({ trainer });
        } catch {
          // If refresh fails, don't logout automatically
        }
      },
    }),
    {
      name: 'gymos-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        trainer: state.trainer,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
