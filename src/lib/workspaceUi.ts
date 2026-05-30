/** Shared class names for tenant workspace pages (light + dark). */

export const WORKSPACE_INPUT_CLASS =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';

export const WORKSPACE_INPUT_MONO_CLASS = `${WORKSPACE_INPUT_CLASS} font-mono text-[13px]`;

export const WORKSPACE_PRIMARY_BTN_CLASS =
  'rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-emerald-900/30';

/** Pagination / secondary actions */
export const WORKSPACE_PAGE_BTN_CLASS =
  'rounded-xl border border-zinc-200/90 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/60 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/25';

export const WORKSPACE_TABLE_WRAP_CLASS =
  'overflow-hidden rounded-xl border border-zinc-200/90 bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/50';

export const WORKSPACE_TABLE_HEAD_CLASS =
  'bg-zinc-100/95 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800/95 dark:text-zinc-400';

export const WORKSPACE_MUTED_TEXT = 'text-sm text-zinc-500 dark:text-zinc-400';
