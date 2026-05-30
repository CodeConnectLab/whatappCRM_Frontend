import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { useAuthStore } from '../store/authStore.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';
import {
  useActivityLogsQuery,
  useChatsQuery,
  useTemplatesQuery,
  useWorkspaceSummaryQuery,
} from '../hooks/apiHooks.ts';
import {
  IconActivity,
  IconChat,
  IconContact,
  IconMegaphone,
  IconSettings,
  IconTemplate,
  IconWallet,
} from '../components/Icons.tsx';
import { MetaSetupStatus } from '../components/settings/MetaSetupStatus.tsx';
import type { Wallet } from '../types/api.ts';

export function DashboardPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const user = useAuthStore((s) => s.user);
  const companyName = useAuthStore((s) => s.companyName);
  const q = useQuery({
    queryKey: ['wallet', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<Wallet>('/api/wallet')).data,
  });

  const summary = useWorkspaceSummaryQuery();
  const templatesQ = useTemplatesQuery();
  const chatsQ = useChatsQuery();
  const activityQ = useActivityLogsQuery(1);

  const greeting = user?.name?.split(/\s+/)[0] ?? 'there';

  const quick = [
    { to: '/chats', label: 'Live chats', desc: 'Inbox & realtime', icon: IconChat },
    { to: '/contacts', label: 'Contacts', desc: 'Lists & groups', icon: IconContact },
    { to: '/campaigns', label: 'Campaigns', desc: 'Broadcasts', icon: IconMegaphone },
    { to: '/templates', label: 'Templates', desc: 'Saved messages', icon: IconTemplate },
    { to: '/activity', label: 'Activity', desc: 'Audit log', icon: IconActivity },
    { to: '/wallet', label: 'Wallet', desc: 'Credits & usage', icon: IconWallet },
    { to: '/settings', label: 'Settings', desc: 'Meta WhatsApp & company', icon: IconSettings },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <NeedsCompanyBanner />

      <WorkspaceIntro
        kicker="Overview"
        title={`Hello, ${greeting}`}
        description={
          companyName
            ? `You are working in ${companyName}. Manage WhatsApp campaigns, templates, and live conversations from one place.`
            : 'Select a workspace to load tenant data and start using the console.'
        }
      />

      {user?.isSuperAdmin && companyId ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <span className="font-medium">Super admin</span>
          <span className="rounded-md bg-amber-100/80 px-2 py-0.5 font-mono text-xs dark:bg-amber-900/50">
            {companyId.slice(-8)}
          </span>
          <span className="text-amber-800/90 dark:text-amber-200/90">Switch tenant from</span>
          <Link
            className="font-semibold text-amber-900 underline decoration-amber-400 underline-offset-2 hover:text-amber-950 dark:text-amber-100"
            to="/companies"
          >
            Companies
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <WorkspaceCard title="At a glance">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Chats
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
                {!companyId ? '—' : summary.isLoading ? '…' : (summary.data?.chatCount ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Templates
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
                {!companyId ? '—' : summary.isLoading ? '…' : (summary.data?.templateCount ?? 0)}
              </p>
            </div>
            <div className="col-span-2 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Messaging
              </p>
              <div className="mt-2">
                <MetaSetupStatus summary={summary.data} compact />
              </div>
            </div>
          </div>
        </WorkspaceCard>

        <WorkspaceCard title="Recent chats">
          {!companyId ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace.</p>
          ) : chatsQ.isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          ) : !(chatsQ.data ?? []).length ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No conversations yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(chatsQ.data ?? []).slice(0, 6).map((c) => (
                <li key={c._id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    to={`/chats?chat=${encodeURIComponent(c._id)}`}
                    className="block text-sm font-medium text-zinc-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
                  >
                    {c.contactId?.name || c.contactId?.phone || 'Chat'}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {c.lastMessagePreview ?? '—'}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/chats"
            className="mt-3 inline-block text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Open inbox →
          </Link>
        </WorkspaceCard>

        <WorkspaceCard title="Templates">
          {!companyId ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace.</p>
          ) : templatesQ.isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          ) : !(templatesQ.data ?? []).length ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No templates yet.</p>
          ) : (
            <ul className="space-y-2">
              {(templatesQ.data ?? []).slice(0, 6).map((t) => (
                <li
                  key={t._id}
                  className="rounded-lg border border-zinc-100 bg-zinc-50/60 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/30"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{t.body}</p>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/templates"
            className="mt-3 inline-block text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Manage templates →
          </Link>
        </WorkspaceCard>

        <WorkspaceCard title="Latest activity">
          {!companyId ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace.</p>
          ) : activityQ.isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          ) : !(activityQ.data?.data ?? []).length ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No log entries yet.</p>
          ) : (
            <ul className="space-y-2">
              {activityQ.data!.data.slice(0, 6).map((row) => (
                <li
                  key={row._id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2 text-xs dark:border-zinc-800"
                >
                  <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{row.action}</span>
                  <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                    {new Date(row.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/activity"
            className="mt-3 inline-block text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Full activity log →
          </Link>
        </WorkspaceCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <WorkspaceCard>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Credits</p>
            <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Wallet
            </span>
          </div>
          <p className="mt-3 text-4xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
            {!companyId ? '—' : q.isLoading ? '…' : q.data?.balance ?? '0'}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Charged on successful outbound sends from chats and campaigns.
          </p>
          {q.isError ? (
            <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">Wallet unavailable for this workspace.</p>
          ) : null}
        </WorkspaceCard>

        <WorkspaceCard className="sm:col-span-2 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Get setup</p>
          <div className="mt-4">
            <MetaSetupStatus summary={summary.data} />
          </div>
          <ol className="mt-4 space-y-4">
            {[
              { n: '1', text: 'Connect Meta & your default WhatsApp sender', href: '/settings' },
              { n: '2', text: 'Import contacts and create a message template', href: '/contacts' },
              { n: '3', text: 'Open Live chats for real-time inbox updates', href: '/chats' },
            ].map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {step.n}
                </span>
                <div>
                  <Link
                    to={step.href}
                    className="text-sm font-medium text-zinc-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
                  >
                    {step.text}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </WorkspaceCard>
      </div>

      <WorkspaceCard title="Shortcuts">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex gap-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 transition-all hover:border-emerald-300/60 hover:bg-white hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:hover:border-emerald-800/50 dark:hover:bg-zinc-900/80"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-white text-zinc-600 shadow-sm transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300 dark:group-hover:border-emerald-800 dark:group-hover:bg-emerald-950/40 dark:group-hover:text-emerald-300">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-zinc-900 dark:text-white">{item.label}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </WorkspaceCard>
    </div>
  );
}
