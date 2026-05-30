import { FormEvent, useState } from 'react';
import { useInviteMemberMutation, useTeamQuery } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { WorkspaceAlertError, WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';
import { WORKSPACE_INPUT_CLASS, WORKSPACE_PRIMARY_BTN_CLASS } from '../lib/workspaceUi.ts';

export function TeamPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const invite = useInviteMemberMutation();
  const q = useTeamQuery();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'company_admin' | 'agent'>('agent');
  const [err, setErr] = useState<string | null>(null);

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await invite.mutateAsync({ email, role });
      setEmail('');
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-4">
      <NeedsCompanyBanner />
      <WorkspaceIntro
        kicker="Workspace"
        title="Team"
        description="Everyone listed here can work inside this company. Admins can invite registered users and assign roles."
      />

      {workspaceRole === 'company_admin' ? (
        <WorkspaceCard title="Invite teammate">
          <form onSubmit={onInvite} className="flex flex-col gap-4 md:flex-row md:items-end">
            <label className="block flex-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Email (must be registered)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${WORKSPACE_INPUT_CLASS} mt-1.5`}
                required
              />
            </label>
            <label className="block text-sm md:w-44">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'company_admin' | 'agent')}
                className={`${WORKSPACE_INPUT_CLASS} mt-1.5`}
              >
                <option value="agent">Agent</option>
                <option value="company_admin">Company admin</option>
              </select>
            </label>
            <button type="submit" disabled={invite.isPending || !companyId} className={WORKSPACE_PRIMARY_BTN_CLASS}>
              {invite.isPending ? 'Inviting…' : 'Invite'}
            </button>
          </form>
        </WorkspaceCard>
      ) : (
        <WorkspaceCard>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Only company admins can invite teammates.</p>
        </WorkspaceCard>
      )}

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {!companyId ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace to view the team.</p>
      ) : q.isLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : q.isError ? (
        <WorkspaceAlertError>Failed to load team.</WorkspaceAlertError>
      ) : q.data?.length === 0 ? (
        <WorkspaceCard title="Members">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No members yet.</p>
        </WorkspaceCard>
      ) : (
        <WorkspaceCard title="Members">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(q.data ?? []).map((m) => (
              <li
                key={m._id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="font-medium text-zinc-900 dark:text-white">
                    {m.userId?.name ?? '—'} <span className="font-normal text-zinc-500">({m.userId?.email})</span>
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {m.role}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </WorkspaceCard>
      )}
    </div>
  );
}
