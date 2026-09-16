import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconMoon, IconSun, LogoMark } from '../../components/Icons.tsx';
import { useAuthStore } from '../../store/authStore.ts';
import { LAST_UPDATED, LEGAL_ROUTES, PRODUCT_NAME } from './legalConfig.ts';

/**
 * A value the operator still has to supply. Rendered loudly on purpose so an
 * unfilled placeholder can never quietly ship to Meta's review team.
 */
export function Fill({ children }: { children: string }) {
  return (
    <mark className="rounded-[4px] border border-warn-line bg-warn-soft px-1 py-0.5 font-mono text-xs font-medium text-warn">
      [FILL: {children}]
    </mark>
  );
}

/** A numbered top-level section with a stable anchor id for the table of contents. */
export function LegalSection({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line-soft pt-8">
      <h2 className="flex gap-2.5 text-xl font-semibold tracking-[-0.01em] text-ink">
        <span className="tabular-nums text-ink-4">{n}.</span>
        <span>{title}</span>
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-md leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

/** A sub-heading inside a section. */
export function LegalSubhead({ children }: { children: ReactNode }) {
  return <h3 className="mt-2 text-md font-semibold text-ink">{children}</h3>;
}

/** Bulleted list with the app's hairline/ink treatment. */
export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-ink-4">{children}</ul>
  );
}

/** A boxed callout for the points that matter most to a reader in a hurry. */
export function LegalNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border border-brand-line bg-brand-soft px-4 py-3 text-md leading-relaxed text-brand-ink">
      {children}
    </div>
  );
}

export function LegalTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="dc-card overflow-x-auto">
      <table className="dc-table min-w-[36rem]">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/**
 * Shared chrome for every legal page: product name, back link, last-updated
 * date, and its own scroll container (the app shell sets `overflow: hidden`
 * on `body`, so a long document has to scroll itself).
 */
export function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const theme = useAuthStore((s) => s.theme);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = `${title} — ${PRODUCT_NAME}`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = subtitle;
  }, [title, subtitle]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <span className="text-md font-semibold text-ink">{PRODUCT_NAME}</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1.5">
            <Link to="/" className="dc-btn dc-btn-sm dc-btn-ghost">
              <span aria-hidden>&larr;</span> Back to app
            </Link>
            <button
              type="button"
              className="dc-btn dc-btn-sm w-[30px] px-0"
              onClick={() => toggleTheme()}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-ink">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        <p className="mt-3 text-md leading-relaxed text-ink-3">{subtitle}</p>
        <p className="mt-4 text-sm text-ink-4">
          Last updated: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
        </p>

        <div className="mt-8 flex flex-col gap-8">{children}</div>

        <footer className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-soft pt-6 text-sm text-ink-3">
          {LEGAL_ROUTES.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className={
                pathname === r.to ? 'font-medium text-ink' : 'text-ink-3 hover:text-ink'
              }
            >
              {r.label}
            </Link>
          ))}
          <span className="ml-auto text-ink-4">
            &copy; {new Date().getFullYear()} CODEXBIT
          </span>
        </footer>
      </main>
    </div>
  );
}
