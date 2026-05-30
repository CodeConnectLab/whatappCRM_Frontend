import { useMemo, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
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
  IconSettings,
  IconSun,
  IconTemplate,
  IconUsers,
  IconWallet,
  LogoMark,
} from './Icons.tsx';

function routeTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/': 'Dashboard',
    '/companies': 'Companies',
    '/team': 'Team',
    '/contacts': 'Contacts',
    '/campaigns': 'Campaigns',
    '/templates': 'Templates',
    '/chats': 'Live chats',
    '/activity': 'Activity',
    '/wallet': 'Wallet',
    '/settings': 'Settings',
  };
  return map[pathname] ?? 'Console';
}

const navInactive =
  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80';
const navActive =
  'flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm dark:bg-emerald-950/50 dark:text-emerald-200';

function NavRow(props: {
  to: string;
  end?: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={props.to}
      end={props.end}
      onClick={props.onClick}
      className={({ isActive }) =>
        isActive
          ? `${navActive} [&>span:first-child]:border-emerald-200 [&>span:first-child]:bg-emerald-100/80 [&>span:first-child]:text-emerald-700 dark:[&>span:first-child]:border-emerald-800 dark:[&>span:first-child]:bg-emerald-900/40 dark:[&>span:first-child]:text-emerald-300`
          : `${navInactive} [&>span:first-child]:group-hover:border-zinc-300 dark:[&>span:first-child]:group-hover:border-zinc-600`
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
        {props.icon}
      </span>
      <span>{props.label}</span>
    </NavLink>
  );
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
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
  const location = useLocation();
  const title = useMemo(() => routeTitle(location.pathname), [location.pathname]);
  const isChatsRoute = location.pathname === '/chats';
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const initials = useMemo(() => {
    const n = user?.name?.trim() || user?.email || '?';
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0];
      const b = parts[1]?.[0];
      if (a != null && b != null) return (a + b).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }, [user?.name, user?.email]);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full max-h-full w-[min(18rem,88vw)] flex-col border-r border-zinc-200/80 bg-white shadow-shell transition-transform duration-200 ease-out dark:border-zinc-800/80 dark:bg-zinc-900 md:static md:w-64 md:shrink-0 md:translate-x-0 md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4 dark:border-zinc-800/80 md:border-0 md:pb-2 md:pt-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                WTSP
              </div>
              <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                {companyName ?? 'Workspace'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 md:hidden dark:hover:bg-zinc-800"
            onClick={closeMobile}
            aria-label="Close sidebar"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 pt-2">
          <NavSection title="Overview">
            <NavRow
              to="/"
              end
              icon={<IconDashboard className="h-4 w-4" />}
              label="Dashboard"
              onClick={closeMobile}
            />
            {user?.isSuperAdmin ? (
              <NavRow
                to="/companies"
                icon={<IconBuilding className="h-4 w-4" />}
                label="Companies"
                onClick={closeMobile}
              />
            ) : null}
          </NavSection>
          <NavSection title="Engage">
            <NavRow
              to="/chats"
              icon={<IconChat className="h-4 w-4" />}
              label="Live chats"
              onClick={closeMobile}
            />
            <NavRow
              to="/contacts"
              icon={<IconContact className="h-4 w-4" />}
              label="Contacts"
              onClick={closeMobile}
            />
            <NavRow
              to="/campaigns"
              icon={<IconMegaphone className="h-4 w-4" />}
              label="Campaigns"
              onClick={closeMobile}
            />
            <NavRow
              to="/templates"
              icon={<IconTemplate className="h-4 w-4" />}
              label="Templates"
              onClick={closeMobile}
            />
          </NavSection>
          <NavSection title="Workspace">
            <NavRow to="/team" icon={<IconUsers className="h-4 w-4" />} label="Team" onClick={closeMobile} />
            <NavRow
              to="/activity"
              icon={<IconActivity className="h-4 w-4" />}
              label="Activity"
              onClick={closeMobile}
            />
            <NavRow
              to="/wallet"
              icon={<IconWallet className="h-4 w-4" />}
              label="Wallet"
              onClick={closeMobile}
            />
            <NavRow
              to="/settings"
              icon={<IconSettings className="h-4 w-4" />}
              label="Settings"
              onClick={closeMobile}
            />
          </NavSection>
        </nav>

        <div className="mt-auto space-y-3 border-t border-zinc-100 p-4 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-zinc-900 dark:text-white">{user?.name}</div>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</div>
              {user?.isSuperAdmin && companyId ? (
                <div className="mt-0.5 truncate text-[10px] font-medium text-amber-700 dark:text-amber-400">
                  Super admin · active tenant {companyId.slice(-8)}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => toggleTheme()}
            >
              {theme === 'dark' ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
              Theme
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              onClick={() => logout()}
            >
              <IconLogout className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/85 px-4 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:supports-[backdrop-filter]:bg-zinc-950/70 md:h-16 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 md:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="hidden truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400 md:block">
                Workspace
              </p>
              <h1 className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-white md:text-lg">
                {title}
              </h1>
              <p className="hidden truncate text-xs text-zinc-500 sm:block dark:text-zinc-400">
                {companyName ? companyName : 'Select a workspace'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="hidden h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:flex dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => toggleTheme()}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white shadow-sm md:h-10 md:w-10 md:text-xs">
              {initials}
            </div>
          </div>
        </header>

        <main
          className={`relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-100/70 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/80 ${
            isChatsRoute
              ? 'overflow-hidden px-3 py-3 md:px-5 md:py-4'
              : 'overflow-y-auto px-4 py-6 md:px-8 md:py-8'
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_-35%,rgba(16,185,129,0.14),transparent_58%)] dark:bg-[radial-gradient(ellipse_120%_70%_at_50%_-35%,rgba(16,185,129,0.08),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='1' cy='1' r='0.65' fill='%23a1a1aa' fill-opacity='0.28'/%3E%3C/svg%3E")`,
            }}
            aria-hidden
          />
          <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
