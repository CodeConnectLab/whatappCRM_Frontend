import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  useAdminCompaniesQuery,
  useAdminCreateCompanyMutation,
  useAdminCreditWalletMutation,
} from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import {
  Avatar,
  CardNote,
  PageHeader,
  WorkspaceAlertError,
  WorkspaceCard,
} from '../components/workspace/WorkspaceSurface.tsx';

export function CompaniesPage() {
  const user = useAuthStore((s) => s.user);
  const activeCompanyId = useAuthStore((s) => s.companyId);
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

  const companies = q.data?.data ?? [];

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Companies"
        description="Create tenants and credit wallets. Switch the active workspace so API calls use the right company."
      />

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <WorkspaceCard title="New company">
          <form onSubmit={onCreate} className="flex flex-col gap-3.5 sm:flex-row sm:items-end">
            <label className="dc-label flex-1">
              <span className="dc-label-text">Company name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dc-input"
                placeholder="Acme Retail"
                required
              />
            </label>
            <button type="submit" className="dc-btn dc-btn-primary shrink-0" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create'}
            </button>
          </form>
        </WorkspaceCard>

        <WorkspaceCard title="Credit wallet">
          <form onSubmit={onCredit} className="grid gap-3.5 sm:grid-cols-2">
            <label className="dc-label">
              <span className="dc-label-text">Company ID</span>
              <input
                value={creditCompanyId}
                onChange={(e) => setCreditCompanyId(e.target.value)}
                className="dc-input font-mono text-sm"
                placeholder="24-char hex id"
                required
              />
            </label>
            <label className="dc-label">
              <span className="dc-label-text">Amount</span>
              <input
                type="number"
                min="0.01"
                step="any"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="dc-input tabular-nums"
                required
              />
            </label>
            <label className="dc-label sm:col-span-2">
              <span className="dc-label-text">
                Reason <span className="font-normal text-ink-4">(optional)</span>
              </span>
              <input
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                className="dc-input"
                placeholder="Top-up after invoice #204"
              />
            </label>
            <div className="flex sm:col-span-2">
              <button type="submit" className="dc-btn dc-btn-primary ml-auto" disabled={credit.isPending}>
                {credit.isPending ? 'Sending…' : 'Apply credit'}
              </button>
            </div>
          </form>
        </WorkspaceCard>
      </div>

      <WorkspaceCard title="All companies" flush>
        {q.isLoading ? (
          <div className="p-4">
            <CardNote>Loading companies…</CardNote>
          </div>
        ) : q.isError ? (
          <div className="p-4">
            <CardNote>{q.error instanceof Error ? q.error.message : 'Failed to load.'}</CardNote>
          </div>
        ) : !companies.length ? (
          <div className="p-4">
            <CardNote>No companies yet.</CardNote>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dc-table dc-table-hover min-w-[640px]">
              <thead className="bg-muted">
                <tr>
                  <th className="pl-4">Name</th>
                  <th>Slug</th>
                  <th>Id</th>
                  <th className="pr-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => {
                  const active = c._id === activeCompanyId;
                  return (
                    <tr key={c._id}>
                      <td className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} className="h-7 w-7 rounded-control text-2xs" />
                          <span className="font-medium">{c.name}</span>
                          {active ? <span className="dc-badge dc-badge-brand">Active</span> : null}
                        </div>
                      </td>
                      <td className="text-ink-2">{c.slug}</td>
                      <td className="font-mono text-sm text-ink-4">{c._id}</td>
                      <td className="pr-4 text-right">
                        <button
                          type="button"
                          className={`dc-btn dc-btn-xs ${active ? '' : 'dc-btn-primary'}`}
                          onClick={() => setCompany(c._id, c.name)}
                          disabled={active}
                        >
                          {active ? 'Current' : 'Open workspace'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </WorkspaceCard>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="dc-btn dc-btn-sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          className="dc-btn dc-btn-sm"
          disabled={Boolean(q.data && page * q.data.limit >= q.data.total)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
        <span className="text-sm text-ink-3">
          Page {page}
          {q.data ? ` · ${q.data.total} total` : ''}
        </span>
      </div>
    </div>
  );
}
