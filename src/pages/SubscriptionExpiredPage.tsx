import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { useAuthStore, type MeResponse } from '../store/authStore.ts';
import { buildWhatsAppSupportUrl, getSupportEmailHref, getSupportTelHref } from '../lib/supportLinks.ts';
import { SubscriptionPanel } from '../components/settings/SubscriptionPanel.tsx';

/**
 * Full-page wall, mounted outside AppShell so there is no sidebar or header to click
 * through. Company admins also get the read-only subscription detail below, so they can
 * see which plan lapsed and what it costs without reaching Settings.
 */
export function SubscriptionExpiredPage() {
  const companyName = useAuthStore((s) => s.companyName);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const applyMe = useAuthStore((s) => s.applyMe);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const wa = buildWhatsAppSupportUrl(companyName);
  const tel = getSupportTelHref();
  const mail = getSupportEmailHref(`Subscription renewal — ${companyName ?? 'workspace'}`);

  // Re-reads /me so a renewal applied in the database lets the user straight back in:
  // RequireAuth bounces them to the app as soon as the state stops saying expired.
  async function refreshStatus() {
    try {
      const { data } = await api.get<MeResponse>('/api/me');
      applyMe(data);
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
    } catch {
      logout();
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-canvas">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-12 sm:py-16">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-panel bg-danger-soft text-danger">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <path d="M12 3l7.5 3.5v5c0 4.5-3 8.2-7.5 9.5-4.5-1.3-7.5-5-7.5-9.5v-5L12 3z" />
            <path d="M12 9v4" />
            <path d="M12 16.5h.01" />
          </svg>
        </span>

        <h1 className="mb-2 text-center text-2xl font-semibold text-ink">
          Your subscription has expired
        </h1>
        <p className="mb-1.5 max-w-md text-center text-base text-ink-2">
          This workspace is deactivated, so the console is locked. Contact your account manager
          to renew and access will come back straight away.
        </p>
        {companyName ? (
          <p className="mb-6 text-center text-sm text-ink-3">
            Workspace: <span className="font-semibold text-ink-2">{companyName}</span>
          </p>
        ) : (
          <p className="mb-6 text-center text-sm text-ink-3">
            Could not load the workspace name — try refreshing the status.
          </p>
        )}

        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="dc-btn dc-btn-primary">
              WhatsApp support
            </a>
          ) : null}
          {tel ? (
            <a href={tel} className="dc-btn">
              Call support
            </a>
          ) : null}
          {mail ? (
            <a href={mail} className="dc-btn">
              Email support
            </a>
          ) : null}
          <button type="button" onClick={() => void refreshStatus()} className="dc-btn">
            Refresh status
          </button>
        </div>

        <p className="mb-8 max-w-md text-center text-sm text-ink-4">
          Your incoming leads and WhatsApp messages are still being captured while the
          workspace is locked. Nothing is lost — they will all be waiting once you renew.
        </p>

        {workspaceRole === 'company_admin' ? (
          <div className="w-full">
            <SubscriptionPanel />
          </div>
        ) : null}

        <button type="button" onClick={logout} className="dc-btn dc-btn-link mt-8">
          Sign out
        </button>
      </div>
    </div>
  );
}
