import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';

export function RequireAuth() {
  const token = useAuthStore((s) => s.accessToken);
  const sessionReady = useAuthStore((s) => s.sessionReady);
  if (!token) return <Navigate to="/login" replace />;
  if (!sessionReady) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
        Preparing workspace…
      </div>
    );
  }
  return <Outlet />;
}

export function SuperOnly() {
  const isSuper = useAuthStore((s) => s.user?.isSuperAdmin);
  if (!isSuper) return <Navigate to="/" replace />;
  return <Outlet />;
}
