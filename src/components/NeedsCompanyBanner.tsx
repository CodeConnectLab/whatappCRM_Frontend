import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';
import { IconBuilding } from './Icons.tsx';

export function NeedsCompanyBanner() {
  const user = useAuthStore((s) => s.user);
  const companyId = useAuthStore((s) => s.companyId);
  if (!user?.isSuperAdmin || companyId) return null;

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-card border border-warn-line bg-warn-soft p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-surface/60 text-warn">
        <IconBuilding className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-base font-semibold text-warn">Choose a workspace</p>
        <p className="max-w-2xl text-base text-warn/85">
          Super admin mode needs an active company so API requests use the right tenant.
        </p>
      </div>
      <Link to="/companies" className="dc-btn dc-btn-primary ml-auto">
        Open companies
      </Link>
    </section>
  );
}
