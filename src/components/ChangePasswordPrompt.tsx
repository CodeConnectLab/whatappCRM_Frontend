import { FormEvent, useState } from 'react';
import { useChangeOwnPasswordMutation } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { WorkspaceAlert, WorkspaceAlertError } from './workspace/WorkspaceSurface.tsx';

/**
 * Shown once to someone whose account was created by an admin, so the password that
 * was handed over verbally stops being the one that works.
 *
 * Deliberately dismissible: an agent with a lead waiting should not be blocked from the
 * inbox, and the Team screen still flags who is on a temporary password.
 */
export function ChangePasswordPrompt() {
  const user = useAuthStore((s) => s.user);
  const applyUser = useAuthStore((s) => s.applyMe);
  const memberships = useAuthStore((s) => s.memberships);
  const change = useChangeOwnPasswordMutation();

  const [dismissed, setDismissed] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState<string | null>(null);

  if (!user?.mustChangePassword || dismissed) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) {
      setErr('The two new passwords do not match');
      return;
    }
    try {
      await change.mutateAsync({ currentPassword, password });
      // Clear the flag locally so the prompt does not reappear before the next /me.
      if (user) {
        applyUser({ user: { ...user, mustChangePassword: false }, memberships });
      }
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="dc-scrim">
      <div className="dc-modal">
        <div className="dc-card-head">
          <h2 className="dc-card-title">Choose your own password</h2>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5 p-4">
          <WorkspaceAlert tone="brand">
            Your account was set up by an admin. Pick a password only you know.
          </WorkspaceAlert>
          {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

          <label className="dc-label">
            <span className="dc-label-text">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="dc-input"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="dc-label">
            <span className="dc-label-text">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dc-input"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="dc-label">
            <span className="dc-label-text">Confirm new password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="dc-input"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={change.isPending} className="dc-btn dc-btn-primary flex-1">
              {change.isPending ? 'Saving…' : 'Set password'}
            </button>
            <button type="button" className="dc-btn" onClick={() => setDismissed(true)}>
              Later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
