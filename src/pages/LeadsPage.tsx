import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useChatsQuery,
  useDistributeLeadsMutation,
  useLeadCountsQuery,
  useProductsQuery,
  useReassignLeadMutation,
  useTeamQuery,
  useUpdateLeadStatusMutation,
  type ChatFilters,
} from '../hooks/apiHooks.ts';
import { useSocket } from '../hooks/useSocket.ts';
import { queryClient } from '../lib/queryClient.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { IconChat, IconFunnel, IconSearch } from '../components/Icons.tsx';
import {
  Avatar,
  CardNote,
  EmptyState,
  PageHeader,
  StatTile,
  Tabs,
  WorkspaceAlertError,
  WorkspaceCard,
  type TabItem,
} from '../components/workspace/WorkspaceSurface.tsx';
import type { LeadStatus } from '../types/api.ts';
import { LEAD_STATUSES, LEAD_STATUS_LABELS, relativeTime } from '../lib/leadUi.ts';

type ScopeTab = 'mine' | 'unassigned' | 'all';

export function LeadsPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const isAdmin = workspaceRole === 'company_admin';

  const [scope, setScope] = useState<ScopeTab>(isAdmin ? 'all' : 'mine');
  const [status, setStatus] = useState<LeadStatus | 'open' | ''>('');
  const [productId, setProductId] = useState('');
  const [adOnly, setAdOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const filters: ChatFilters = useMemo(
    () => ({
      // The server ignores this for agents and pins them to their own leads; sending it
      // keeps the admin and agent code paths identical.
      assigned: scope,
      ...(status ? { status } : {}),
      ...(productId ? { productId } : {}),
      ...(adOnly ? { adOnly: true } : {}),
    }),
    [scope, status, productId, adOnly],
  );

  const leadsQ = useChatsQuery(filters);
  const countsQ = useLeadCountsQuery();
  const teamQ = useTeamQuery();
  const productsQ = useProductsQuery();
  const reassign = useReassignLeadMutation();
  const updateStatus = useUpdateLeadStatusMutation();
  const distribute = useDistributeLeadsMutation();

  // Leads arrive and get reassigned while this page is open; the socket keeps the
  // table honest without a poll.
  useSocket((event) => {
    if (
      event === 'message:new' ||
      event === 'lead:assigned' ||
      event === 'lead:status' ||
      event === 'lead:distributed' ||
      event === 'lead:bulk-unassigned'
    ) {
      void queryClient.invalidateQueries({ queryKey: ['chats', companyId] });
      void queryClient.invalidateQueries({ queryKey: ['lead-counts', companyId] });
    }
  });

  const leads = useMemo(() => {
    const rows = leadsQ.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = `${r.contactId?.name ?? ''} ${r.contactId?.phone ?? ''} ${r.lastMessagePreview ?? ''} ${r.productName ?? ''}`;
      return hay.toLowerCase().includes(q);
    });
  }, [leadsQ.data, search]);

  const assignees = useMemo(
    () => (teamQ.data ?? []).filter((m) => m.userId),
    [teamQ.data],
  );
  const counts = countsQ.data;

  async function run(fn: () => Promise<unknown>) {
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(apiErrorMessage(e));
    }
  }

  const scopeTabs: TabItem<ScopeTab>[] = isAdmin
    ? [
        { key: 'all', label: 'All leads', count: counts?.total },
        { key: 'unassigned', label: 'Unassigned', count: counts?.unassigned },
        { key: 'mine', label: 'Mine' },
      ]
    : [{ key: 'mine', label: 'My leads', count: counts?.total }];

  if (!companyId) {
    return (
      <div className="flex flex-col gap-4">
        <NeedsCompanyBanner />
        <CardNote>Select a workspace to view leads.</CardNote>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Leads"
        description={
          isAdmin
            ? 'Every WhatsApp conversation as a lead. New ones are shared out to whoever has the fewest open — reassign any of them here.'
            : 'The leads assigned to you. Update the stage as you work them, and open the chat to reply.'
        }
        actions={
          isAdmin ? (
            <button
              type="button"
              className="dc-btn"
              disabled={distribute.isPending || !counts?.unassigned}
              title={
                counts?.unassigned
                  ? 'Share the unassigned backlog across the rotation'
                  : 'Nothing unassigned'
              }
              onClick={() => void run(() => distribute.mutateAsync())}
            >
              <IconFunnel className="h-3.5 w-3.5" />
              {distribute.isPending ? 'Distributing…' : `Distribute ${counts?.unassigned ?? 0}`}
            </button>
          ) : undefined
        }
      />

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile label="New" value={counts?.new ?? '—'} />
        <StatTile label="In progress" value={counts?.in_progress ?? '—'} />
        <StatTile label="Qualified" value={counts?.qualified ?? '—'} />
        <StatTile label="Won" value={counts?.won ?? '—'} />
        <StatTile label="Lost" value={counts?.lost ?? '—'} />
      </div>

      <Tabs
        items={scopeTabs}
        value={scope}
        onChange={setScope}
        right={
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex h-8 items-center gap-2 rounded-control border border-line bg-subtle px-2.5">
              <IconSearch className="h-3.5 w-3.5 shrink-0 text-ink-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, phone, product…"
                className="w-[170px] min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-4"
              />
            </div>
            <select
              className="dc-select h-8 w-[136px] text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus | 'open' | '')}
            >
              <option value="">Any stage</option>
              <option value="open">Open only</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <select
              className="dc-select h-8 w-[136px] text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Any product</option>
              {(productsQ.data ?? []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`dc-pill ${adOnly ? 'dc-pill-active' : ''}`}
              onClick={() => setAdOnly((v) => !v)}
              title="Only leads that came from a paid ad"
            >
              Ad leads
            </button>
          </div>
        }
      />

      <WorkspaceCard
        action={<span className="text-sm text-ink-4">{leads.length} shown</span>}
        flush
      >
        {leadsQ.isLoading ? (
          <div className="p-4">
            <CardNote>Loading leads…</CardNote>
          </div>
        ) : leadsQ.isError ? (
          <div className="p-4">
            <CardNote>Could not load leads.</CardNote>
          </div>
        ) : !leads.length ? (
          <EmptyState
            title="No leads here"
            description={
              scope === 'unassigned'
                ? 'Everything is assigned. New leads land with whoever has the fewest open ones.'
                : 'Leads appear as soon as someone messages your WhatsApp number.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="dc-table dc-table-hover min-w-[1020px]">
              <thead className="bg-muted">
                <tr>
                  <th className="pl-4">Lead</th>
                  <th>Source</th>
                  <th>Product</th>
                  <th>Stage</th>
                  <th>Assigned to</th>
                  <th>Last message</th>
                  <th className="pr-4" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const title = lead.contactId?.name || lead.contactId?.phone || 'Contact';
                  const leadStatus = (lead.status ?? 'new') as LeadStatus;
                  return (
                    <tr key={lead._id}>
                      <td className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={title} className="h-7 w-7 text-2xs" />
                          <div className="flex min-w-0 flex-col gap-px">
                            <span className="truncate font-medium text-ink">{title}</span>
                            <span className="truncate font-mono text-xs text-ink-4">
                              {lead.contactId?.phone}
                            </span>
                          </div>
                          {lead.unreadCount ? (
                            <span className="ml-1 flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-2xs font-semibold text-white">
                              {lead.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        {lead.referral?.ctwaClid ? (
                          <div className="flex flex-col gap-px">
                            <span className="dc-badge dc-badge-accent w-fit">Paid ad</span>
                            <span className="max-w-[180px] truncate text-xs text-ink-4">
                              {lead.referral.headline ?? lead.referral.sourceId ?? ''}
                            </span>
                          </div>
                        ) : lead.referral?.sourceId ? (
                          <span className="dc-badge w-fit">Post</span>
                        ) : (
                          <span className="text-sm text-ink-4">Direct</span>
                        )}
                      </td>
                      <td>
                        <span className="text-sm text-ink-2">{lead.productName ?? '—'}</span>
                      </td>
                      <td>
                        <select
                          className="dc-select h-8 w-[130px] text-sm"
                          value={leadStatus}
                          disabled={updateStatus.isPending}
                          onChange={(e) =>
                            void run(() =>
                              updateStatus.mutateAsync({
                                chatId: lead._id,
                                status: e.target.value as LeadStatus,
                              }),
                            )
                          }
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {LEAD_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {isAdmin ? (
                          <select
                            className="dc-select h-8 w-[168px] text-sm"
                            value={lead.assignedTo ?? ''}
                            disabled={reassign.isPending}
                            onChange={(e) =>
                              void run(() =>
                                reassign.mutateAsync({
                                  chatId: lead._id,
                                  assignedTo: e.target.value || null,
                                }),
                              )
                            }
                          >
                            <option value="">Unassigned</option>
                            {assignees.map((m) => (
                              <option key={m.userId!._id} value={m.userId!._id}>
                                {m.userId!.name ?? m.userId!.email} ({m.openLeadCount})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={lead.assignedToUser?.name ?? lead.assignedToUser?.email}
                              className="h-6 w-6 text-2xs"
                              plain
                            />
                            <span className="truncate text-sm text-ink-2">
                              {lead.assignedToUser?.name ?? lead.assignedToUser?.email ?? 'Unassigned'}
                            </span>
                          </div>
                        )}
                        {lead.assignmentMethod === 'auto' ? (
                          <span className="mt-0.5 block text-2xs text-ink-4">auto-assigned</span>
                        ) : null}
                      </td>
                      <td>
                        <div className="flex max-w-[220px] flex-col gap-px">
                          <span className="truncate text-sm text-ink-2">
                            {lead.lastMessagePreview ?? '—'}
                          </span>
                          <span className="text-2xs text-ink-4">
                            {relativeTime(lead.lastMessageAt)}
                          </span>
                        </div>
                      </td>
                      <td className="pr-4">
                        <Link
                          to={`/chats?chat=${lead._id}`}
                          className="dc-btn dc-btn-xs dc-btn-primary"
                        >
                          <IconChat className="h-3.5 w-3.5" />
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </WorkspaceCard>
    </div>
  );
}
