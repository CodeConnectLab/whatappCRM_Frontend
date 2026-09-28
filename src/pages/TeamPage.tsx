import { FormEvent, useState } from 'react';
import {
  useCreateTeamUserMutation,
  useRemoveTeamMemberMutation,
  useResetMemberPasswordMutation,
  useTeamQuery,
  useUpdateTeamMemberMutation,
} from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { IconClose, IconCopy, IconKey, IconPlus, IconRefresh, IconTrash } from '../components/Icons.tsx';
import {
  Avatar,
  CardNote,
  PageHeader,
  WorkspaceAlert,
  WorkspaceAlertError,
  WorkspaceCard,
} from '../components/workspace/WorkspaceSurface.tsx';

type Role = 'company_admin' | 'agent';

/**
 * Readable but strong enough to hand over verbally: mixed case, digits and a symbol,
 * with the ambiguous characters (O/0, l/1) left out.
 */
function suggestPassword(): string {
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#$%&*';
  const all = upper + lower + digits + symbols;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)]!;
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < 12) chars.push(pick(all));
  // Fisher–Yates, so the guaranteed classes are not always in the first four slots.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join('');
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-ink-4">{label}</span>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-control border border-line bg-subtle px-2 py-1 font-mono text-sm text-ink">
          {value}
        </code>
        <button
          type="button"
          className="dc-btn dc-btn-xs shrink-0"
          onClick={() => {
            void navigator.clipboard
              ?.writeText(value)
              .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              })
              .catch(() => setCopied(false));
          }}
        >
          <IconCopy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- add user modal */

function AddUserModal(props: { onClose: () => void }) {
  const create = useCreateTeamUserMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(() => suggestPassword());
  const [role, setRole] = useState<Role>('agent');
  const [availableForLeads, setAvailableForLeads] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string; reused: boolean } | null>(
    null,
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await create.mutateAsync({
        name,
        email,
        password,
        role,
        availableForLeads: role === 'agent' ? availableForLeads : false,
      });
      setCreated({ email, password, reused: res.reusedExistingLogin });
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="dc-scrim" onClick={props.onClose}>
      <div className="dc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dc-card-head">
          <h2 className="dc-card-title">{created ? 'User created' : 'Add new user'}</h2>
          <button
            type="button"
            className="ml-auto rounded-control p-1.5 text-ink-4 hover:bg-line-soft"
            onClick={props.onClose}
            aria-label="Close"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </div>

        {created ? (
          <div className="flex flex-col gap-3.5 p-4">
            {created.reused ? (
              <WorkspaceAlert tone="warn">
                That email already had an account, so it was added to this workspace with its
                existing password — the one below was not used.
              </WorkspaceAlert>
            ) : (
              <WorkspaceAlert tone="brand">
                Share these with the user. The password is shown only now, and they will be asked to
                choose their own after signing in.
              </WorkspaceAlert>
            )}
            <CopyField label="Email" value={created.email} />
            {!created.reused ? <CopyField label="Temporary password" value={created.password} /> : null}
            <div className="flex gap-2">
              <button type="button" className="dc-btn dc-btn-primary flex-1" onClick={props.onClose}>
                Done
              </button>
              <button
                type="button"
                className="dc-btn"
                onClick={() => {
                  setCreated(null);
                  setName('');
                  setEmail('');
                  setPassword(suggestPassword());
                }}
              >
                Add another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3.5 p-4">
            {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

            <label className="dc-label">
              <span className="dc-label-text">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dc-input"
                placeholder="Priya Sharma"
                required
                autoFocus
              />
            </label>

            <label className="dc-label">
              <span className="dc-label-text">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dc-input"
                placeholder="priya@company.com"
                required
              />
            </label>

            <label className="dc-label">
              <span className="dc-label-text">Temporary password</span>
              <div className="flex gap-2">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dc-input font-mono"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="dc-btn shrink-0"
                  onClick={() => setPassword(suggestPassword())}
                  title="Generate a new one"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-xs text-ink-4">
                At least 8 characters. You hand this over; they change it on first sign-in.
              </span>
            </label>

            <label className="dc-label">
              <span className="dc-label-text">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="dc-select"
              >
                <option value="agent">Agent — handles assigned leads</option>
                <option value="company_admin">Company admin — full access</option>
              </select>
            </label>

            {role === 'agent' ? (
              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  className="dc-checkbox mt-0.5"
                  checked={availableForLeads}
                  onChange={(e) => setAvailableForLeads(e.target.checked)}
                />
                <span className="flex flex-col">
                  <span className="text-base text-ink">Include in lead rotation</span>
                  <span className="text-xs text-ink-4">
                    New WhatsApp leads are shared out to whoever has the fewest open ones.
                  </span>
                </span>
              </label>
            ) : null}

            <button type="submit" disabled={create.isPending} className="dc-btn dc-btn-primary">
              {create.isPending ? 'Creating…' : 'Create user'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- reset password modal */

function ResetPasswordModal(props: {
  membershipId: string;
  memberName: string;
  onClose: () => void;
}) {
  const reset = useResetMemberPasswordMutation();
  const [password, setPassword] = useState(() => suggestPassword());
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await reset.mutateAsync({ membershipId: props.membershipId, password });
      setDone(true);
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="dc-scrim" onClick={props.onClose}>
      <div className="dc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dc-card-head">
          <h2 className="dc-card-title">Reset password</h2>
          <button
            type="button"
            className="ml-auto rounded-control p-1.5 text-ink-4 hover:bg-line-soft"
            onClick={props.onClose}
            aria-label="Close"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </div>
        {done ? (
          <div className="flex flex-col gap-3.5 p-4">
            <WorkspaceAlert tone="brand">
              Done. {props.memberName} is signed out everywhere and will be asked to choose a new
              password after signing in with this one.
            </WorkspaceAlert>
            <CopyField label="New password" value={password} />
            <button type="button" className="dc-btn dc-btn-primary" onClick={props.onClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3.5 p-4">
            {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}
            <CardNote>
              Sets a new password for <strong className="text-ink">{props.memberName}</strong> and
              signs them out of every device.
            </CardNote>
            <label className="dc-label">
              <span className="dc-label-text">New password</span>
              <div className="flex gap-2">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dc-input font-mono"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="dc-btn shrink-0"
                  onClick={() => setPassword(suggestPassword())}
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                </button>
              </div>
            </label>
            <button type="submit" disabled={reset.isPending} className="dc-btn dc-btn-primary">
              {reset.isPending ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export function TeamPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const myUserId = useAuthStore((s) => s.user?.id);

  const q = useTeamQuery();
  const updateMember = useUpdateTeamMemberMutation();
  const removeMember = useRemoveTeamMemberMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [resetting, setResetting] = useState<{ id: string; name: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canManage = workspaceRole === 'company_admin';
  const members = q.data ?? [];
  const agentsInRotation = members.filter((m) => m.role === 'agent' && m.availableForLeads).length;

  async function run(fn: () => Promise<unknown>) {
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(apiErrorMessage(e));
    }
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <NeedsCompanyBanner />

      <PageHeader
        title="Team"
        description="Add people directly — no self-registration needed. Agents in the rotation receive new WhatsApp leads automatically."
        actions={
          canManage ? (
            <button
              type="button"
              className="dc-btn dc-btn-primary"
              onClick={() => setAddOpen(true)}
              disabled={!companyId}
            >
              <IconPlus className="h-3.5 w-3.5" />
              Add new user
            </button>
          ) : undefined
        }
      />

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {canManage && companyId && !agentsInRotation && members.length ? (
        <WorkspaceAlert tone="warn">
          No agent is in the lead rotation, so new leads will fall to a company admin. Switch on
          “In rotation” for at least one agent.
        </WorkspaceAlert>
      ) : null}

      <WorkspaceCard
        title="Members"
        action={<span className="text-sm text-ink-4">{members.length} total</span>}
        flush
      >
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
            <table className="dc-table dc-table-hover min-w-[760px]">
              <thead className="bg-muted">
                <tr>
                  <th className="pl-4">Member</th>
                  <th>Role</th>
                  <th>Open leads</th>
                  <th>In rotation</th>
                  {canManage ? <th className="pr-4 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isMe = m.userId?._id === myUserId;
                  const label = m.userId?.name ?? m.userId?.email ?? '—';
                  return (
                    <tr key={m._id}>
                      <td className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={label} className="h-7 w-7 text-2xs" plain />
                          <div className="flex min-w-0 flex-col gap-px">
                            <span className="truncate font-medium">
                              {m.userId?.name ?? '—'}
                              {isMe ? <span className="ml-1.5 text-xs text-ink-4">(you)</span> : null}
                            </span>
                            <span className="truncate text-xs text-ink-4">{m.userId?.email}</span>
                          </div>
                          {m.userId?.mustChangePassword ? (
                            <span className="dc-badge dc-badge-warn shrink-0" title="Still on the password an admin set">
                              Temp password
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        {canManage && !isMe ? (
                          <select
                            className="dc-select h-8 w-[136px] text-sm"
                            value={m.role}
                            disabled={updateMember.isPending}
                            onChange={(e) =>
                              void run(() =>
                                updateMember.mutateAsync({
                                  membershipId: m._id,
                                  role: e.target.value as Role,
                                }),
                              )
                            }
                          >
                            <option value="agent">Agent</option>
                            <option value="company_admin">Company admin</option>
                          </select>
                        ) : (
                          <span className={`dc-badge ${m.role === 'company_admin' ? 'dc-badge-brand' : ''}`}>
                            {m.role === 'company_admin' ? 'Company admin' : 'Agent'}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="tabular-nums text-ink">{m.openLeadCount}</span>
                      </td>
                      <td>
                        {canManage ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="dc-checkbox"
                              checked={m.availableForLeads}
                              disabled={updateMember.isPending}
                              onChange={(e) =>
                                void run(() =>
                                  updateMember.mutateAsync({
                                    membershipId: m._id,
                                    availableForLeads: e.target.checked,
                                  }),
                                )
                              }
                            />
                            <span className="text-sm text-ink-3">
                              {m.availableForLeads ? 'Yes' : 'Paused'}
                            </span>
                          </label>
                        ) : (
                          <span className="text-sm text-ink-3">
                            {m.availableForLeads ? 'Yes' : 'Paused'}
                          </span>
                        )}
                      </td>
                      {canManage ? (
                        <td className="pr-4">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              className="dc-btn dc-btn-xs"
                              onClick={() => setResetting({ id: m._id, name: label })}
                            >
                              <IconKey className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Password</span>
                            </button>
                            <button
                              type="button"
                              className="dc-btn dc-btn-xs dc-btn-danger"
                              disabled={isMe || removeMember.isPending}
                              title={isMe ? 'You cannot remove yourself' : 'Remove from workspace'}
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    `Remove ${label} from this workspace? Their open leads go back into the pool.`,
                                  )
                                ) {
                                  return;
                                }
                                void run(() => removeMember.mutateAsync(m._id));
                              }}
                            >
                              <IconTrash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </WorkspaceCard>

      {!canManage ? (
        <WorkspaceCard>
          <CardNote>Only company admins can add or change members.</CardNote>
        </WorkspaceCard>
      ) : null}

      {addOpen ? <AddUserModal onClose={() => setAddOpen(false)} /> : null}
      {resetting ? (
        <ResetPasswordModal
          membershipId={resetting.id}
          memberName={resetting.name}
          onClose={() => setResetting(null)}
        />
      ) : null}
    </div>
  );
}
