import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { stateFromSummary } from '../lib/subscriptionUi.ts';

const EXPIRED_ROUTE = '/subscription-expired';

export function RequireAuth() {
  const token = useAuthStore((s) => s.accessToken);
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const isSuperAdmin = useAuthStore((s) => s.user?.isSuperAdmin);
  const subscription = useAuthStore((s) => s.subscription);
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  const onExpiredRoute = location.pathname === EXPIRED_ROUTE;

  // The wall itself renders before the session settles: it reads the persisted
  // subscription, and waiting would only flash a spinner at a locked-out user.
  if (!sessionReady && !onExpiredRoute) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center text-base text-ink-3">
        Preparing workspace…
      </div>
    );
  }

  // Super admins run support on expired workspaces, so the gate does not apply to them —
  // matching `subscriptionGuard` on the API.
  const isExpired = !isSuperAdmin && Boolean(subscription) && stateFromSummary(subscription).isExpired;

  if (isExpired && !onExpiredRoute) return <Navigate to={EXPIRED_ROUTE} replace />;
  if (!isExpired && onExpiredRoute) return <Navigate to="/" replace />;

  return <Outlet />;
}

export function SuperOnly() {
  const isSuper = useAuthStore((s) => s.user?.isSuperAdmin);
  if (!isSuper) return <Navigate to="/" replace />;
  return <Outlet />;
}
