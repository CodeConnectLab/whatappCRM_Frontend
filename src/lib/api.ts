import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { apiUrl } from './urls.ts';
import { useAuthStore } from '../store/authStore.ts';

export const api = axios.create({
  baseURL: apiUrl('/'),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken, companyId } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (companyId) {
    config.headers['x-company-id'] = companyId;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config;

    /**
     * Safety net for a stale store: the guard in RequireAuth normally catches expiry
     * first, but a subscription that lapses mid-session only shows up as a 403 here.
     */
    const body = error.response?.data as { code?: string } | undefined;
    if (
      error.response?.status === 403 &&
      body?.code === 'SUBSCRIPTION_EXPIRED' &&
      window.location.pathname !== '/subscription-expired'
    ) {
      window.location.assign('/subscription-expired');
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      original &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) {
        try {
          const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
            apiUrl('/api/auth/refresh'),
            { refreshToken: refresh },
          );
          useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  },
);
