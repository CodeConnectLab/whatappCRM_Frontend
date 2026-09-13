import { useMemo, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { useAuthStore } from '../store/authStore.ts';
import type { Wallet } from '../types/api.ts';
import {
  IconActivity,
  IconBuilding,
  IconChat,
  IconClose,
  IconContact,
  IconDashboard,
  IconLogout,
  IconMegaphone,
  IconMenu,
  IconMoon,
  IconSearch,
  IconSettings,
  IconSun,
  IconTemplate,
  IconUsers,
  IconWallet,
} from './Icons.tsx';

function routeTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/': 'Home',
    '/companies': 'Companies',
    '/team': 'Team',
    '/contacts': 'Contacts',
    '/campaigns': 'Campaigns',
    '/templates': 'Templates',
    '/chats': 'Inbox',
    '/activity': 'Activity',
    '/wallet': 'Wallet',
    '/settings': 'Settings',
  };
  return map[pathname] ?? 'Console';
}

function initialsOf(input?: string | null): string {
  const name = input?.trim();
  if (!name) return '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    if (a != null && b != null) return (a + b).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const navBase =
  'flex h-[34px] w-full items-center gap-2.5 rounded-control px-2.5 text-left text-base transition-colors';

function NavRow(props: {
  to: string;
  end?: boolean;
  icon: ReactNode;
  label: string;
  badge?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={props.to}
      end={props.end}
      onClick={props.onClick}
      className={({ isActive }) =>
        isActive
          ? `${navBase} bg-brand-soft font-semibold text-brand-ink`
          : `${navBase} text-ink-2 hover:bg-line-soft`
      }
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">{props.icon}</span>
      <span className="truncate">{props.label}</span>
      {props.badge != null ? <span className="ml-auto shrink-0">{props.badge}</span> : null}
    </NavLink>
  );
}

function NavGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-px">
      <p className="px-2.5 pb-1.5 pt-3.5 text-2xs font-medium uppercase tracking-[0.06em] text-ink-4">{title}</p>
      {children}
    </div>
  );
}

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const companyName = useAuthStore((s) => s.companyName);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);
  const theme = useAuthStore((s) => s.theme);
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const location = useLocation();
  const title = useMemo(() => routeTitle(location.pathname), [location.pathname]);
  const isChatsRoute = location.pathname === '/chats';
  const [mobileOpen, setMobileOpen] = useState(false);

  const walletQ = useQuery({
    queryKey: ['wallet', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<Wallet>('/api/wallet')).data,
  });

  const closeMobile = () => setMobileOpen(false);
  const initials = useMemo(() => initialsOf(user?.name ?? user?.email), [user?.name, user?.email]);
  const roleLabel = user?.isSuperAdmin
    ? 'Super Admin'
    : workspaceRole === 'company_admin'
      ? 'Admin'
      : workspaceRole === 'agent'
        ? 'Agent'
        : 'Member';

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <nav
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[236px] shrink-0 flex-col border-r border-line bg-surface/85 px-3 pb-3 pt-4 backdrop-blur-xl transition-transform duration-200 ease-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2.5 px-2 pb-4">
          <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-control bg-brand text-sm font-bold text-white">
            {(companyName ?? 'W').slice(0, 1).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-base font-semibold text-ink">{companyName ?? 'Workspace'}</span>
            <span className="truncate text-xs text-ink-4">Business account</span>
          </div>
          <button
            type="button"
            className="ml-auto rounded-control p-1.5 text-ink-3 hover:bg-line-soft md:hidden"
            onClick={closeMobile}
            aria-label="Close sidebar"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto">
          <NavRow to="/" end icon={<IconDashboard className="h-4 w-4" />} label="Home" onClick={closeMobile} />
          <NavRow to="/chats" icon={<IconChat className="h-4 w-4" />} label="Inbox" onClick={closeMobile} />
          <NavRow to="/contacts" icon={<IconContact className="h-4 w-4" />} label="Contacts" onClick={closeMobile} />
          <NavRow
            to="/campaigns"
            icon={<IconMegaphone className="h-4 w-4" />}
            label="Campaigns"
            onClick={closeMobile}
          />
          <NavRow to="/templates" icon={<IconTemplate className="h-4 w-4" />} label="Templates" onClick={closeMobile} />

          <NavGroup title="Workspace">
            <NavRow to="/team" icon={<IconUsers className="h-4 w-4" />} label="Team" onClick={closeMobile} />
            <NavRow to="/activity" icon={<IconActivity className="h-4 w-4" />} label="Activity" onClick={closeMobile} />
            <NavRow to="/wallet" icon={<IconWallet className="h-4 w-4" />} label="Wallet" onClick={closeMobile} />
            <NavRow to="/settings" icon={<IconSettings className="h-4 w-4" />} label="Settings" onClick={closeMobile} />
            {user?.isSuperAdmin ? (
              <NavRow
                to="/companies"
                icon={<IconBuilding className="h-4 w-4" />}
                label="Companies"
                onClick={closeMobile}
              />
            ) : null}
          </NavGroup>
        </div>

        <div className="mt-auto flex items-center gap-2.5 border-t border-line-soft pt-2.5">
          <div className="dc-avatar h-7 w-7 text-xs">{initials}</div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-base font-medium text-ink">{user?.name ?? user?.email}</span>
            <span className="truncate text-xs text-ink-4">
              {roleLabel}
              {user?.isSuperAdmin && companyId ? ` · ${companyId.slice(-6)}` : ''}
            </span>
          </div>
          <button
            type="button"
            className="ml-auto shrink-0 rounded-control p-1.5 text-ink-4 hover:bg-line-soft hover:text-ink"
            onClick={() => logout()}
            aria-label="Log out"
            title="Log out"
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-14 shrink-0 items-center gap-3.5 border-b border-line bg-surface px-4 md:px-5">
          <button
            type="button"
            className="dc-btn dc-btn-sm w-9 px-0 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu className="h-4 w-4" />
          </button>

          <div className="hidden h-8 w-full max-w-[400px] items-center gap-2 rounded-control border border-line bg-subtle px-2.5 text-ink-4 sm:flex">
            <IconSearch className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-sm">Search contacts, campaigns, templates</span>
            <span className="ml-auto shrink-0 rounded border border-line bg-surface px-1.5 py-px font-mono text-[10.5px]">
              ⌘K
            </span>
          </div>

          <h1 className="truncate text-md font-semibold text-ink sm:hidden">{title}</h1>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden h-[30px] items-center gap-1.5 rounded-full border border-line bg-surface px-3 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="text-base font-medium tabular-nums text-ink">
                {!companyId ? '—' : walletQ.isLoading ? '…' : (walletQ.data?.balance ?? 0)}
              </span>
              <span className="text-sm text-ink-4">credits</span>
            </div>
            <button
              type="button"
              className="dc-btn dc-btn-sm w-[30px] px-0"
              onClick={() => toggleTheme()}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
            </button>
            <div className="dc-avatar h-[30px] w-[30px] text-sm">{initials}</div>
          </div>
        </header>

        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${
            isChatsRoute ? 'overflow-hidden' : 'overflow-y-auto px-5 pb-12 pt-6 md:px-7'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
