import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// ── Types ─────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'client' | 'trainer' | 'admin';
  subscription: 'free' | 'pro' | 'elite';
  goal?: string;
  onboardingComplete: boolean;
}

export type UnitsSystem = 'imperial' | 'metric';
export type AppTheme = 'light' | 'dark' | 'system';

// ── Auth slice ─────────────────────────────────────────────────────────────
interface AuthSlice {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

// ── Settings slice ─────────────────────────────────────────────────────────
interface SettingsSlice {
  units: UnitsSystem;
  theme: AppTheme;
  notificationsEnabled: boolean;
  setUnits: (units: UnitsSystem) => void;
  setTheme: (theme: AppTheme) => void;
  setNotifications: (enabled: boolean) => void;
}

// ── Combined store ─────────────────────────────────────────────────────────
type AppStore = AuthSlice & SettingsSlice;

export const useAppStore = create<AppStore>((set) => ({
  // Auth state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({ user, isAuthenticated: true }),

  setToken: async (token) => {
    await SecureStore.setItemAsync('auth_token', token);
    set({ token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  // Settings state
  units: 'imperial',
  theme: 'system',
  notificationsEnabled: true,

  setUnits: (units) => set({ units }),
  setTheme: (theme) => set({ theme }),
  setNotifications: (notificationsEnabled) => set({ notificationsEnabled }),
}));

// ── Hydration helper ───────────────────────────────────────────────────────
export async function hydrateStore(): Promise<void> {
  const store = useAppStore.getState();
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      store.setToken(token);
      // The root layout will refetch the user profile via useAuth
    }
  } catch {
    // Ignore SecureStore errors (e.g. first launch)
  } finally {
    store.setLoading(false);
  }
}
