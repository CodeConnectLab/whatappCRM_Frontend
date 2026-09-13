import { useState } from 'react';
import { useTransactionsQuery, useWalletQuery } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import {
  CardNote,
  PageHeader,
  StatTile,
  WorkspaceCard,
} from '../components/workspace/WorkspaceSurface.tsx';

export function WalletPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const [page, setPage] = useState(1);
  const w = useWalletQuery();
  const tx = useTransactionsQuery(page);

  const rows = tx.data?.data ?? [];
  const credited = rows.filter((t) => t.type === 'credit').reduce((n, t) => n + t.amount, 0);
  const debited = rows.filter((t) => t.type === 'debit').reduce((n, t) => n + t.amount, 0);

  return (
    <div className="flex flex-col gap-[18px]">
      <NeedsCompanyBanner />

      <PageHeader
        title="Wallet"
        description="Credits are debited when outbound WhatsApp messages send successfully — from live chats or campaigns."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label={`Balance${w.data?.currency ? ` (${w.data.currency})` : ''}`}
          value={!companyId ? '—' : w.isLoading ? '…' : (w.data?.balance ?? '—')}
          delta={w.isError ? 'Could not load wallet' : 'Successful sends debit this balance'}
          tone={w.isError ? 'down' : 'flat'}
        />
        <StatTile label="Credited (this page)" value={credited} tone="up" />
        <StatTile label="Debited (this page)" value={debited} tone="down" />
      </div>

      <WorkspaceCard title="Transactions" flush>
        {!companyId ? (
          <div className="p-4">
            <CardNote>Select a workspace.</CardNote>
          </div>
        ) : tx.isLoading ? (
          <div className="p-4">
            <CardNote>Loading…</CardNote>
          </div>
        ) : tx.isError ? (
          <div className="p-4">
            <CardNote>Failed to load transactions.</CardNote>
          </div>
        ) : !rows.length ? (
          <div className="p-4">
            <CardNote>No transactions yet.</CardNote>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dc-table dc-table-hover min-w-[600px]">
              <thead className="bg-muted">
                <tr>
                  <th className="pl-4">Type</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Balance after</th>
                  <th>Reason</th>
                  <th className="pr-4">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t._id}>
                    <td className="pl-4">
                      <span className={`dc-badge ${t.type === 'credit' ? 'dc-badge-brand' : 'dc-badge-warn'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`dc-num font-medium ${t.type === 'credit' ? 'text-brand-ink' : 'text-ink'}`}>
                      {t.type === 'credit' ? '+' : '−'}
                      {t.amount}
                    </td>
                    <td className="dc-num text-ink-2">{t.balanceAfter}</td>
                    <td className="text-sm text-ink-3">{t.reason}</td>
                    <td className="whitespace-nowrap pr-4 text-sm tabular-nums text-ink-4">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspaceCard>

      {tx.data ? (
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
            disabled={page * tx.data.limit >= tx.data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
          <span className="text-sm text-ink-3">
            Page {page} · {tx.data.total} total
          </span>
        </div>
      ) : null}
    </div>
  );
}
