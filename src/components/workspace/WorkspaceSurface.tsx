import type { ReactNode } from 'react';

/* ---------------------------------------------------------------- notices */

export function WorkspaceAlertError(props: { children: ReactNode }) {
  return <div className="dc-note dc-note-danger">{props.children}</div>;
}

export function WorkspaceAlert(props: {
  tone?: 'neutral' | 'brand' | 'warn' | 'danger';
  children: ReactNode;
}) {
  const tone = props.tone ?? 'neutral';
  const cls =
    tone === 'brand'
      ? 'dc-note-brand'
      : tone === 'warn'
        ? 'dc-note-warn'
        : tone === 'danger'
          ? 'dc-note-danger'
          : '';
  return <div className={`dc-note ${cls}`}>{props.children}</div>;
}

/* ------------------------------------------------------------ page header */

/**
 * Title block that opens every screen: 24px heading, muted one-line summary,
 * and right-aligned actions.
 */
export function PageHeader(props: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-[-0.01em] text-ink">{props.title}</h1>
        {props.description ? <p className="text-base text-ink-3">{props.description}</p> : null}
      </div>
      {props.actions ? <div className="ml-auto flex shrink-0 flex-wrap gap-2">{props.actions}</div> : null}
    </div>
  );
}

/** Legacy alias — kept so older call sites keep compiling. */
export function WorkspaceIntro(props: { kicker?: string; title?: string; description: string }) {
  return <PageHeader title={props.title ?? props.kicker ?? ''} description={props.description} />;
}

/* ------------------------------------------------------------------ cards */

export function WorkspaceCard(props: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Set for tables/lists that draw their own edge-to-edge padding. */
  flush?: boolean;
}) {
  return (
    <section className={`dc-card ${props.className ?? ''}`}>
      {props.title ? (
        <div className="dc-card-head">
          <h2 className="dc-card-title">{props.title}</h2>
          {props.action ? <div className="ml-auto flex items-center gap-2">{props.action}</div> : null}
        </div>
      ) : null}
      <div className={props.bodyClassName ?? (props.flush ? '' : 'p-4')}>{props.children}</div>
    </section>
  );
}

/** Metric tile: label, big number, optional delta. */
export function StatTile(props: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  tone?: 'up' | 'down' | 'flat';
  className?: string;
}) {
  const deltaTone =
    props.tone === 'down' ? 'text-danger' : props.tone === 'up' ? 'text-brand-ink' : 'text-ink-3';
  return (
    <div className={`flex flex-col gap-1 rounded-card border border-line bg-surface px-4 py-3.5 ${props.className ?? ''}`}>
      <span className="text-sm text-ink-3">{props.label}</span>
      <span className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-ink">{props.value}</span>
      {props.delta ? <span className={`text-xs ${deltaTone}`}>{props.delta}</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------------- tabs */

export type TabItem<T extends string = string> = {
  key: T;
  label: ReactNode;
  count?: number | string;
};

export function Tabs<T extends string>(props: {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  right?: ReactNode;
}) {
  return (
    <div className="dc-tabs">
      <div className="flex gap-0.5 overflow-x-auto">
        {props.items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => props.onChange(item.key)}
            className={`dc-tab ${props.value === item.key ? 'dc-tab-active' : ''}`}
          >
            {item.label}
            {item.count != null ? <span className="opacity-55 tabular-nums">{item.count}</span> : null}
          </button>
        ))}
      </div>
      {props.right ? <div className="ml-auto flex items-center gap-1.5 pb-2">{props.right}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------ table shell */

/** Card-wrapped table with a horizontal scroll rail on narrow screens. */
export function DataTable(props: { head: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`dc-card ${props.className ?? ''}`}>
      <div className="overflow-x-auto">
        <table className="dc-table dc-table-hover min-w-[640px]">
          <thead className="bg-muted">{props.head}</thead>
          <tbody>{props.children}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ empty state */

export function EmptyState(props: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="text-md font-semibold text-ink">{props.title}</p>
      {props.description ? <p className="max-w-md text-base text-ink-3">{props.description}</p> : null}
      {props.action ? <div className="mt-2">{props.action}</div> : null}
    </div>
  );
}

/** One-line placeholder used inside cards while data loads or is unavailable. */
export function CardNote(props: { children: ReactNode }) {
  return <p className="text-base text-ink-3">{props.children}</p>;
}

/* ---------------------------------------------------------------- avatars */

const AVATAR_RAMPS = [
  ['#10B981', '#059669'],
  ['#6366F1', '#4338CA'],
  ['#F59E0B', '#B45309'],
  ['#EC4899', '#BE185D'],
  ['#0EA5E9', '#0369A1'],
  ['#8B5CF6', '#6D28D9'],
] as const;

/** Deterministic gradient avatar so the same person keeps the same colour. */
export function Avatar(props: { name?: string | null; className?: string; plain?: boolean }) {
  const label = (props.name ?? '?').trim() || '?';
  const parts = label.split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : label.slice(0, 2).toUpperCase();

  if (props.plain) {
    return <span className={`dc-avatar ${props.className ?? 'h-8 w-8 text-sm'}`}>{initials}</span>;
  }

  let hash = 0;
  for (let i = 0; i < label.length; i += 1) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  const ramp = AVATAR_RAMPS[hash % AVATAR_RAMPS.length]!;

  return (
    <span
      className={`dc-avatar text-white ${props.className ?? 'h-8 w-8 text-sm'}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${ramp[0]}, ${ramp[1]})` }}
    >
      {initials}
    </span>
  );
}
