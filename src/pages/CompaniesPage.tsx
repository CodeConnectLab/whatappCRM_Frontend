import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminCompaniesQuery, useAdminCreateCompanyMutation, useAdminCreditWalletMutation } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { WorkspaceAlertError, WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';
import {
  WORKSPACE_INPUT_CLASS,
  WORKSPACE_INPUT_MONO_CLASS,
  WORKSPACE_PAGE_BTN_CLASS,
  WORKSPACE_PRIMARY_BTN_CLASS,
  WORKSPACE_TABLE_HEAD_CLASS,
  WORKSPACE_TABLE_WRAP_CLASS,
} from '../lib/workspaceUi.ts';

export function CompaniesPage() {
  const user = useAuthStore((s) => s.user);
  const setCompany = useAuthStore((s) => s.setCompany);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [creditCompanyId, setCreditCompanyId] = useState('');
  const [creditAmount, setCreditAmount] = useState('10');
  const [creditReason, setCreditReason] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const q = useAdminCompaniesQuery(page);
  const create = useAdminCreateCompanyMutation();
  const credit = useAdminCreditWalletMutation();

  if (!user?.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await create.mutateAsync({ name });
      setName('');
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onCredit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await credit.mutateAsync({
        companyId: creditCompanyId,
        amount: Number(creditAmount),
        reason: creditReason || undefined,
      });
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-4">
      <WorkspaceIntro
        kicker="Super admin"
        title="Companies"
        description="Create tenants and credit wallets. Switch the active workspace from the table so API calls use the right company."
      />

      <WorkspaceCard title="New company">
        <form
          onSubmit={onCreate}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
        <label className="block flex-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">New company name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${WORKSPACE_INPUT_CLASS} mt-1.5`}
            required
          />
        </label>
        <button type="submit" className={WORKSPACE_PRIMARY_BTN_CLASS} disabled={create.isPending}>
          {create.isPending ? 'Creating…' : 'Create'}
        </button>
      </form>
      </WorkspaceCard>

      <WorkspaceCard title="Credit wallet">
        <form onSubmit={onCredit} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Company ID</span>
            <input
              value={creditCompanyId}
              onChange={(e) => setCreditCompanyId(e.target.value)}
              className={`${WORKSPACE_INPUT_MONO_CLASS} mt-1.5`}
              placeholder="24-char hex id"
              required
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Amount</span>
            <input
              type="number"
              min="0.01"
              step="any"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className={`${WORKSPACE_INPUT_CLASS} mt-1.5`}
              required
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Reason (optional)</span>
            <input
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              className={`${WORKSPACE_INPUT_CLASS} mt-1.5`}
            />
          </label>
          <button
            type="submit"
            className="rounded-xl border border-zinc-200/90 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60 dark:border-zinc-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 md:col-span-2"
            disabled={credit.isPending}
          >
            {credit.isPending ? 'Sending…' : 'Apply credit'}
          </button>
        </form>
      </WorkspaceCard>

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {q.isLoading ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading companies…</p> : null}
      {q.isError ? (
        <WorkspaceAlertError>
          {q.error instanceof Error ? q.error.message : 'Failed to load'}
        </WorkspaceAlertError>
      ) : null}

      {q.data && q.data.data.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No companies yet.</p>
      ) : null}

      <WorkspaceCard title="All companies">
      <div className={WORKSPACE_TABLE_WRAP_CLASS}>
        <table className="w-full text-left text-sm">
          <thead className={WORKSPACE_TABLE_HEAD_CLASS}>
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Id</th>
              <th className="px-4 py-3"> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {(q.data?.data ?? []).map((c) => (
              <tr key={c._id} className="bg-white/80 dark:bg-zinc-950/30">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{c.name}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{c.slug}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{c._id}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-emerald-500/50 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                    onClick={() => setCompany(c._id, c.name)}
                  >
                    Open workspace
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          className={WORKSPACE_PAGE_BTN_CLASS}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          className={WORKSPACE_PAGE_BTN_CLASS}
          disabled={q.data && page * q.data.limit >= q.data.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
        <span className="text-zinc-500 dark:text-zinc-400">
          Page {page}
          {q.data ? ` · ${q.data.total} total` : ''}
        </span>
      </div>
      </WorkspaceCard>
    </div>
  );
}
