import { useState } from 'react';
import { useTransactionsQuery, useWalletQuery } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { WorkspaceAlertError, WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';
import { WORKSPACE_PAGE_BTN_CLASS, WORKSPACE_TABLE_HEAD_CLASS, WORKSPACE_TABLE_WRAP_CLASS } from '../lib/workspaceUi.ts';

export function WalletPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const [page, setPage] = useState(1);
  const w = useWalletQuery();
  const tx = useTransactionsQuery(page);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-4">
      <NeedsCompanyBanner />
      <WorkspaceIntro
        kicker="Billing"
        title="Wallet"
        description="Credits are debited when outbound WhatsApp messages send successfully—from live chats or campaigns."
      />

      {!companyId ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace to view the wallet.</p>
      ) : (
        <WorkspaceCard title="Balance">
          <div className="text-4xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
            {w.isLoading ? '…' : w.data ? `${w.data.balance} ${w.data.currency}` : '—'}
          </div>
          {w.isError ? (
            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">Could not load wallet.</p>
          ) : (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Successful sends debit this balance.</p>
          )}
        </WorkspaceCard>
      )}

      <WorkspaceCard title="Transactions">
        {!companyId ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace.</p>
        ) : tx.isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : tx.isError ? (
          <WorkspaceAlertError>Failed to load transactions.</WorkspaceAlertError>
        ) : tx.data?.data.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No transactions yet.</p>
        ) : (
          <div className={WORKSPACE_TABLE_WRAP_CLASS}>
            <table className="w-full text-left text-sm">
              <thead className={WORKSPACE_TABLE_HEAD_CLASS}>
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Balance after</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {(tx.data?.data ?? []).map((t) => (
                  <tr key={t._id} className="bg-white/80 dark:bg-zinc-950/30">
                    <td className="px-4 py-3 uppercase">{t.type}</td>
                    <td className="px-4 py-3">{t.amount}</td>
                    <td className="px-4 py-3">{t.balanceAfter}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{t.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tx.data ? (
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
              disabled={page * tx.data.limit >= tx.data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
            <span className="text-zinc-500 dark:text-zinc-400">
              Page {page}
              {tx.data ? ` · ${tx.data.total} total` : ''}
            </span>
          </div>
        ) : null}
      </WorkspaceCard>
    </div>
  );
}
