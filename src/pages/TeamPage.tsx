import { FormEvent, useState } from 'react';
import { useInviteMemberMutation, useTeamQuery } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import {
  Avatar,
  CardNote,
  PageHeader,
  WorkspaceAlertError,
  WorkspaceCard,
} from '../components/workspace/WorkspaceSurface.tsx';

export function TeamPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const invite = useInviteMemberMutation();
  const q = useTeamQuery();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'company_admin' | 'agent'>('agent');
  const [err, setErr] = useState<string | null>(null);

  const canManage = workspaceRole === 'company_admin';
  const members = q.data ?? [];

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
    <div className="flex flex-col gap-[18px]">
      <NeedsCompanyBanner />

      <PageHeader
        title="Team"
        description="Everyone listed here can work inside this company. Admins invite registered users and assign roles."
      />

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {canManage ? (
        <WorkspaceCard title="Invite teammate">
          <form onSubmit={onInvite} className="flex flex-col gap-3.5 md:flex-row md:items-end">
            <label className="dc-label flex-1">
              <span className="dc-label-text">Email (must be registered)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dc-input"
                placeholder="teammate@company.com"
                required
              />
            </label>
            <label className="dc-label md:w-48">
              <span className="dc-label-text">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'company_admin' | 'agent')}
                className="dc-select"
              >
                <option value="agent">Agent</option>
                <option value="company_admin">Company admin</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={invite.isPending || !companyId}
              className="dc-btn dc-btn-primary shrink-0"
            >
              {invite.isPending ? 'Inviting…' : 'Invite'}
            </button>
          </form>
        </WorkspaceCard>
      ) : (
        <WorkspaceCard>
          <CardNote>Only company admins can invite teammates.</CardNote>
        </WorkspaceCard>
      )}

      <WorkspaceCard title="Members" action={<span className="text-sm text-ink-4">{members.length} total</span>} flush>
        {!companyId ? (
          <div className="p-4">
            <CardNote>Select a workspace to view the team.</CardNote>
          </div>
        ) : q.isLoading ? (
          <div className="p-4">
            <CardNote>Loading…</CardNote>
          </div>
        ) : q.isError ? (
          <div className="p-4">
            <CardNote>Failed to load team.</CardNote>
          </div>
        ) : !members.length ? (
          <div className="p-4">
            <CardNote>No members yet.</CardNote>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dc-table dc-table-hover min-w-[520px]">
              <thead className="bg-muted">
                <tr>
                  <th className="pl-4">Member</th>
                  <th className="pr-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id}>
                    <td className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.userId?.name ?? m.userId?.email} className="h-7 w-7 text-2xs" plain />
                        <div className="flex min-w-0 flex-col gap-px">
                          <span className="truncate font-medium">{m.userId?.name ?? '—'}</span>
                          <span className="truncate text-xs text-ink-4">{m.userId?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="pr-4">
                      <span className={`dc-badge ${m.role === 'company_admin' ? 'dc-badge-brand' : ''}`}>
                        {m.role === 'company_admin' ? 'Company admin' : 'Agent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspaceCard>
    </div>
  );
}
