import type { ReactNode } from 'react';

export function WorkspaceAlertError(props: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-200">
      {props.children}
    </div>
  );
}

export function WorkspaceIntro(props: {
  kicker?: string;
  title?: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-emerald-500/[0.08] via-white to-teal-500/[0.06] p-5 shadow-card ring-1 ring-zinc-950/[0.04] dark:border-zinc-800/90 dark:from-emerald-950/40 dark:via-zinc-900/95 dark:to-teal-950/18 dark:ring-white/[0.06] md:p-7">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/18 blur-3xl dark:bg-emerald-500/12" aria-hidden />
      <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-600/8" aria-hidden />
      <div className="relative">
        {props.kicker ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
            {props.kicker}
          </p>
        ) : null}
        {props.title ? (
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">
            {props.title}
          </h2>
        ) : null}
        <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {props.description}
        </p>
      </div>
    </div>
  );
}

export function WorkspaceCard(props: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/90 bg-white/90 shadow-card ring-1 ring-zinc-950/[0.03] backdrop-blur-[2px] dark:border-zinc-800/85 dark:bg-zinc-900/75 dark:ring-white/[0.04] ${props.className ?? ''}`}
    >
      {props.title ? (
        <div className="border-b border-zinc-100/90 bg-zinc-50/40 px-5 py-3.5 dark:border-zinc-800/80 dark:bg-zinc-900/40 md:px-6">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">{props.title}</h3>
        </div>
      ) : null}
      <div className={props.title ? 'p-5 pt-4 md:px-6 md:pb-6' : 'p-5 md:p-6'}>{props.children}</div>
    </div>
  );
}
