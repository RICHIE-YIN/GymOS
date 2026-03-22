import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { apiGet, apiPost } from '../lib/api';
import { useAppStore, User } from '../lib/store';

// ── Types ─────────────────────────────────────────────────────────────────
interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'client' | 'trainer';
}

interface AuthResponse {
  user: User;
  token: string;
}

// ── Query keys ─────────────────────────────────────────────────────────────
export const authKeys = {
  me: ['auth', 'me'] as const,
};

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const qc = useQueryClient();
  const { user, token, isAuthenticated, setUser, setToken, logout: storeLogout } = useAppStore();

  // Fetch current user profile when authenticated
  const { data: meData, isLoading: isFetchingUser } = useQuery({
    queryKey: authKeys.me,
    queryFn: () => apiGet<User>('/auth/me'),
    enabled: !!token && !user,
  });

  // Sync fetched user into Zustand store
  useEffect(() => {
    if (meData && !user) {
      setUser(meData);
    }
  }, [meData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiPost<AuthResponse>('/auth/login', payload),
    onSuccess: async (data) => {
      await setToken(data.token);
      setUser(data.user);
      qc.invalidateQueries({ queryKey: authKeys.me });
      if (data.user.onboardingComplete) {
        router.replace('/(tabs)/');
      } else {
        router.replace('/(auth)/onboarding');
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) =>
      apiPost<AuthResponse>('/auth/register', payload),
    onSuccess: async (data) => {
      await setToken(data.token);
      setUser(data.user);
      router.replace('/(auth)/onboarding');
    },
  });

  // Logout
  const logout = async () => {
    try {
      await apiPost('/auth/logout');
    } catch {
      // Ignore logout API errors
    } finally {
      await storeLogout();
      qc.clear();
      router.replace('/(auth)/welcome');
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isFetchingUser,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
}
