import { useEffect } from 'react';
import { api } from '../lib/api.ts';
import { useAuthStore, type MeResponse } from '../store/authStore.ts';

export function SessionBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const applyMe = useAuthStore((s) => s.applyMe);
  const setSessionReady = useAuthStore((s) => s.setSessionReady);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!accessToken) {
      setSessionReady(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await api.get<MeResponse>('/api/me');
        if (!cancelled) applyMe(data);
      } catch {
        if (!cancelled) logout();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, applyMe, logout, setSessionReady]);

  return null;
}
