import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useActivityLogsQuery } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';
import { WORKSPACE_PAGE_BTN_CLASS } from '../lib/workspaceUi.ts';

export function ActivityPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const [page, setPage] = useState(1);
  const q = useActivityLogsQuery(page);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-4">
      <NeedsCompanyBanner />

      <WorkspaceIntro
        kicker="Workspace"
        title="Activity log"
        description="Audit-style events for this company: registrations, campaign actions, wallet moves, and other operations logged by the API."
      />

      <WorkspaceCard title="Recent events">
        {!companyId ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace.</p>
        ) : q.isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : q.isError ? (
          <p className="text-sm text-red-600 dark:text-red-400">Could not load activity.</p>
        ) : !q.data?.data.length ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="pb-3 pr-4">When</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Resource</th>
                  <th className="pb-3">Who</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {q.data.data.map((row) => (
                  <tr key={row._id} className="text-zinc-800 dark:text-zinc-200">
                    <td className="py-3 pr-4 whitespace-nowrap tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{row.action}</td>
                    <td className="py-3 pr-4 text-xs text-zinc-600 dark:text-zinc-300">
                      {row.resource ?? '—'}
                    </td>
                    <td className="py-3 text-xs">
                      {row.userId?.name ?? row.userId?.email ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {q.data ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
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
              disabled={page * q.data.limit >= q.data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Page {page} · {q.data.total} total
            </span>
          </div>
        ) : null}
      </WorkspaceCard>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link to="/" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
