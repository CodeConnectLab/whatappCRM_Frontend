import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { IconBuilding } from './Icons.tsx';

export function NeedsCompanyBanner() {
  const user = useAuthStore((s) => s.user);
  const companyId = useAuthStore((s) => s.companyId);
  if (!user?.isSuperAdmin || companyId) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-5 shadow-sm dark:border-amber-900/50 dark:from-amber-950/50 dark:via-zinc-900 dark:to-amber-950/20">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl dark:bg-amber-600/10" aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/80 bg-amber-100/80 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/40 dark:text-amber-200">
            <IconBuilding className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-950 dark:text-amber-50">Choose a workspace</p>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-amber-900/85 dark:text-amber-100/80">
              Super admin mode needs an active company so API requests use the right tenant. Open{' '}
              <Link
                className="font-semibold text-amber-900 underline decoration-amber-400/80 underline-offset-2 hover:text-amber-950 dark:text-amber-50 dark:hover:text-white"
                to="/companies"
              >
                Companies
              </Link>{' '}
              and select one.
            </p>
          </div>
        </div>
        <Link
          to="/companies"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-600/25 transition hover:bg-amber-500 dark:bg-amber-700 dark:hover:bg-amber-600"
        >
          Open companies
        </Link>
      </div>
    </div>
  );
}
