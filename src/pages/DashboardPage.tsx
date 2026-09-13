import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { useAuthStore } from '../store/authStore.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import {
  Avatar,
  CardNote,
  PageHeader,
  WorkspaceCard,
} from '../components/workspace/WorkspaceSurface.tsx';
import {
  useActivityLogsQuery,
  useChatsQuery,
  useTemplatesQuery,
  useWorkspaceSummaryQuery,
} from '../hooks/apiHooks.ts';
import { IconChevronRight, IconPlus } from '../components/Icons.tsx';
import { MetaSetupStatus } from '../components/settings/MetaSetupStatus.tsx';
import type { Wallet } from '../types/api.ts';

/** Big number + caption + call to action, laid out as one cell of a strip. */
function AttentionCell(props: {
  to: string;
  value: string | number;
  label: string;
  cta: string;
  tone?: 'default' | 'alert';
}) {
  return (
    <Link
      to={props.to}
      className="flex flex-col gap-1 border-b border-r border-line-soft p-4 transition-colors last:border-r-0 hover:bg-muted"
    >
      <span
        className={`text-stat font-semibold tracking-[-0.02em] tabular-nums ${
          props.tone === 'alert' ? 'text-danger' : 'text-ink'
        }`}
      >
        {props.value}
      </span>
      <span className="text-base text-ink-3">{props.label}</span>
      <span className="mt-1 text-sm text-brand">{props.cta} →</span>
    </Link>
  );
}

function formatWhen(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function DashboardPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const user = useAuthStore((s) => s.user);
  const companyName = useAuthStore((s) => s.companyName);

  const walletQ = useQuery({
    queryKey: ['wallet', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<Wallet>('/api/wallet')).data,
  });
  const summary = useWorkspaceSummaryQuery();
  const templatesQ = useTemplatesQuery();
  const chatsQ = useChatsQuery();
  const activityQ = useActivityLogsQuery(1);

  const greeting = user?.name?.split(/\s+/)[0] ?? 'there';
  const chats = chatsQ.data ?? [];
  const unread = chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const dash = (node: unknown, loading: boolean) => (!companyId ? '—' : loading ? '…' : String(node ?? 0));

  return (
    <div className="flex flex-col gap-5">
      <NeedsCompanyBanner />

      <PageHeader
        title={`Hello, ${greeting}`}
        description={companyName ? `${companyName} · ${today}` : 'Select a workspace to load tenant data.'}
        actions={
          <>
            <Link to="/templates" className="dc-btn">
              Templates
            </Link>
            <Link to="/campaigns" className="dc-btn dc-btn-primary">
              <IconPlus className="h-3.5 w-3.5" />
              New campaign
            </Link>
          </>
        }
      />

      {user?.isSuperAdmin && companyId ? (
        <div className="dc-note dc-note-warn">
          <span className="font-medium">Super admin</span>
          <span className="rounded border border-warn-line bg-surface/50 px-1.5 py-px font-mono text-2xs">
            {companyId.slice(-8)}
          </span>
          <span>Working inside this tenant.</span>
          <Link to="/companies" className="font-medium underline underline-offset-2">
            Switch workspace
          </Link>
        </div>
      ) : null}

      {/* Needs attention -------------------------------------------------- */}
      <section className="dc-card">
        <div className="dc-card-head">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          <h2 className="dc-card-title">Needs attention</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          <AttentionCell
            to="/chats"
            value={dash(unread, chatsQ.isLoading)}
            label="Unread messages"
            cta="Open inbox"
            tone={unread > 0 ? 'alert' : 'default'}
          />
          <AttentionCell
            to="/chats"
            value={dash(summary.data?.chatCount, summary.isLoading)}
            label="Conversations"
            cta="Go to inbox"
          />
          <AttentionCell
            to="/templates"
            value={dash(summary.data?.templateCount, summary.isLoading)}
            label="Templates"
            cta="Manage"
          />
          <AttentionCell
            to="/wallet"
            value={dash(walletQ.data?.balance, walletQ.isLoading)}
            label="Credits left"
            cta="Top up"
            tone={(walletQ.data?.balance ?? 0) <= 0 ? 'alert' : 'default'}
          />
        </div>
      </section>

      {/* Messaging status ------------------------------------------------- */}
      <WorkspaceCard title="Messaging channel" action={<Link to="/settings" className="dc-btn-link">Settings</Link>}>
        {!companyId ? (
          <CardNote>Select a workspace.</CardNote>
        ) : summary.isLoading ? (
          <CardNote>Loading…</CardNote>
        ) : (
          <MetaSetupStatus summary={summary.data} />
        )}
      </WorkspaceCard>

      {/* Two-column detail ------------------------------------------------ */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <WorkspaceCard
          title="Recent chats"
          action={
            <Link to="/chats" className="dc-btn-link">
              View all
            </Link>
          }
          flush
        >
          {!companyId ? (
            <div className="p-4">
              <CardNote>Select a workspace.</CardNote>
            </div>
          ) : chatsQ.isLoading ? (
            <div className="p-4">
              <CardNote>Loading…</CardNote>
            </div>
          ) : !chats.length ? (
            <div className="p-4">
              <CardNote>No conversations yet.</CardNote>
            </div>
          ) : (
            <ul>
              {chats.slice(0, 6).map((c) => {
                const name = c.contactId?.name || c.contactId?.phone || 'Chat';
                return (
                  <li key={c._id} className="border-b border-line-faint last:border-b-0">
                    <Link
                      to={`/chats?chat=${encodeURIComponent(c._id)}`}
                      className="flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-muted"
                    >
                      <Avatar name={name} className="h-8 w-8 text-xs" />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-base font-medium text-ink">{name}</span>
                        <span className="truncate text-sm text-ink-3">{c.lastMessagePreview ?? '—'}</span>
                      </div>
                      {c.unreadCount ? (
                        <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-2xs font-semibold text-white">
                          {c.unreadCount}
                        </span>
                      ) : c.lastMessageAt ? (
                        <span className="shrink-0 text-xs text-ink-4">{formatWhen(c.lastMessageAt)}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </WorkspaceCard>

        <WorkspaceCard
          title="Templates"
          action={
            <Link to="/templates" className="dc-btn-link">
              Manage
            </Link>
          }
          flush
        >
          {!companyId ? (
            <div className="p-4">
              <CardNote>Select a workspace.</CardNote>
            </div>
          ) : templatesQ.isLoading ? (
            <div className="p-4">
              <CardNote>Loading…</CardNote>
            </div>
          ) : !(templatesQ.data ?? []).length ? (
            <div className="p-4">
              <CardNote>No templates yet.</CardNote>
            </div>
          ) : (
            <ul>
              {(templatesQ.data ?? []).slice(0, 6).map((t) => (
                <li
                  key={t._id}
                  className="flex flex-col gap-1 border-b border-line-faint px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-base font-medium text-ink">{t.name}</span>
                    <span
                      className={`dc-badge ml-auto ${
                        t.status === 'APPROVED'
                          ? 'dc-badge-brand'
                          : t.status === 'REJECTED'
                            ? 'dc-badge-danger'
                            : t.status === 'PENDING'
                              ? 'dc-badge-warn'
                              : ''
                      }`}
                    >
                      {t.status ?? 'local'}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-ink-3">{t.body}</p>
                </li>
              ))}
            </ul>
          )}
        </WorkspaceCard>
      </div>

      <WorkspaceCard
        title="Latest activity"
        action={
          <Link to="/activity" className="dc-btn-link">
            Full log
          </Link>
        }
        flush
      >
        {!companyId ? (
          <div className="p-4">
            <CardNote>Select a workspace.</CardNote>
          </div>
        ) : activityQ.isLoading ? (
          <div className="p-4">
            <CardNote>Loading…</CardNote>
          </div>
        ) : !(activityQ.data?.data ?? []).length ? (
          <div className="p-4">
            <CardNote>No log entries yet.</CardNote>
          </div>
        ) : (
          <ul>
            {(activityQ.data?.data ?? []).slice(0, 8).map((row) => (
              <li
                key={row._id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-faint px-4 py-2.5 last:border-b-0"
              >
                <span className="font-mono text-sm text-ink-2">{row.action}</span>
                {row.userId?.name || row.userId?.email ? (
                  <span className="text-sm text-ink-3">{row.userId.name ?? row.userId.email}</span>
                ) : null}
                <span className="ml-auto text-xs tabular-nums text-ink-4">{formatWhen(row.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </WorkspaceCard>

      {/* Setup checklist -------------------------------------------------- */}
      {!summary.data?.metaReadyForCampaigns ? (
        <section className="dc-card flex flex-wrap items-center gap-4 p-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-base font-semibold text-ink">Finish setup</span>
            <span className="text-base text-ink-3">
              Connect Meta WhatsApp and a default sender before starting campaigns.
            </span>
          </div>
          <Link to="/settings" className="dc-btn dc-btn-primary ml-auto">
            Connect WhatsApp
            <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
