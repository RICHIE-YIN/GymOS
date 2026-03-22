import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.gymos.app/v1';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: inject auth token ─────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: unwrap data, handle 401 ─────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap { data, meta } envelope if present
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      // Trigger global logout — store listener will handle navigation
      const { useAppStore } = await import('./store');
      useAppStore.getState().logout();
    }
    return Promise.reject(error?.response?.data ?? error);
  },
);

// ── Typed helpers ─────────────────────────────────────────────────────────
export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  api.get<T, T>(url, { params });

export const apiPost = <T>(url: string, data?: unknown) =>
  api.post<T, T>(url, data);

export const apiPut = <T>(url: string, data?: unknown) =>
  api.put<T, T>(url, data);

export const apiPatch = <T>(url: string, data?: unknown) =>
  api.patch<T, T>(url, data);

export const apiDelete = <T>(url: string) =>
  api.delete<T, T>(url);

export default api;
