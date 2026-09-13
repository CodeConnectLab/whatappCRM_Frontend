import { useState } from 'react';
import { useActivityLogsQuery } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { CardNote, PageHeader, WorkspaceCard } from '../components/workspace/WorkspaceSurface.tsx';

export function ActivityPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const [page, setPage] = useState(1);
  const q = useActivityLogsQuery(page);

  return (
    <div className="flex flex-col gap-[18px]">
      <NeedsCompanyBanner />

      <PageHeader
        title="Activity log"
        description="Audit-style events for this company: registrations, campaign actions, wallet moves and other API operations."
      />

      <WorkspaceCard title="Recent events" flush>
        {!companyId ? (
          <div className="p-4">
            <CardNote>Select a workspace.</CardNote>
          </div>
        ) : q.isLoading ? (
          <div className="p-4">
            <CardNote>Loading…</CardNote>
          </div>
        ) : q.isError ? (
          <div className="p-4">
            <CardNote>Could not load activity.</CardNote>
          </div>
        ) : !q.data?.data.length ? (
          <div className="p-4">
            <CardNote>No activity recorded yet.</CardNote>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dc-table dc-table-hover min-w-[640px]">
              <thead className="bg-muted">
                <tr>
                  <th className="pl-4">When</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th className="pr-4">Who</th>
                </tr>
              </thead>
              <tbody>
                {q.data.data.map((row) => (
                  <tr key={row._id}>
                    <td className="whitespace-nowrap pl-4 text-sm tabular-nums text-ink-3">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="font-mono text-sm">{row.action}</td>
                    <td className="text-sm text-ink-3">{row.resource ?? '—'}</td>
                    <td className="pr-4 text-sm">{row.userId?.name ?? row.userId?.email ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspaceCard>

      {q.data ? (
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
            disabled={page * q.data.limit >= q.data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
          <span className="text-sm text-ink-3">
            Page {page} · {q.data.total} total
          </span>
        </div>
      ) : null}
    </div>
  );
}
