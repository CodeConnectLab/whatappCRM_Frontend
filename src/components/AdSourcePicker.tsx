import { useMemo, useState } from 'react';
import { useAdSourcesQuery } from '../hooks/apiHooks.ts';
import { relativeTime } from '../lib/leadUi.ts';
import { IconCheck, IconPlus, IconSearch } from './Icons.tsx';

/**
 * Picks ad IDs and headlines from what Meta has actually sent.
 *
 * Meta puts `referral.source_id` and the creative's headline on the first message of
 * every Click-to-WhatsApp conversation, and those are stored on the lead. So the values
 * these fields need are already in the workspace — an operator copying an ID out of Ads
 * Manager is doing avoidable work, and mistyping one silently breaks the mapping with
 * no error anywhere.
 */
export function AdSourcePicker(props: {
  /** IDs currently in the field, so already-picked rows can be shown as such. */
  selectedIds: string[];
  onPickId: (sourceId: string) => void;
  /** Omitted when the caller has no headline field (e.g. a rule matching on ids only). */
  onPickHeadline?: (headline: string) => void;
}) {
  const q = useAdSourcesQuery();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = q.data ?? [];
    if (!term) return all;
    return all.filter(
      (r) =>
        r.sourceId.toLowerCase().includes(term) ||
        (r.headline ?? '').toLowerCase().includes(term) ||
        (r.productName ?? '').toLowerCase().includes(term),
    );
  }, [q.data, search]);

  const visible = expanded ? rows : rows.slice(0, 5);
  const selected = new Set(props.selectedIds.map((id) => id.trim()));

  if (q.isLoading) {
    return <p className="text-xs text-ink-4">Looking up ads that have sent you leads…</p>;
  }

  if (q.isError) {
    return (
      <p className="text-xs text-ink-4">
        Could not load your ad list — you can still paste an ID from Meta Ads Manager.
      </p>
    );
  }

  if (!(q.data ?? []).length) {
    return (
      <p className="text-xs text-ink-4">
        No ad-sourced leads yet. Once a Click-to-WhatsApp ad sends its first lead, its ID
        and headline appear here to pick from. Until then, paste the ad ID from Meta Ads
        Manager (Ads Manager → Ads → the ID under the ad name).
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-control border border-line bg-surface p-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-ink">Ads that have sent you leads</span>
        <span className="ml-auto text-2xs text-ink-4">{q.data?.length} seen</span>
      </div>

      {(q.data ?? []).length > 5 ? (
        <div className="flex h-7 items-center gap-1.5 rounded-control border border-line bg-subtle px-2">
          <IconSearch className="h-3 w-3 shrink-0 text-ink-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, headline or product"
            className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-4"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        {visible.map((row) => {
          const picked = selected.has(row.sourceId.trim());
          return (
            <div
              key={row.sourceId}
              className="flex items-center gap-2 rounded-control border border-line-soft bg-subtle px-2 py-1.5"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="truncate text-xs font-medium text-ink">
                  {row.headline ?? '(no headline)'}
                </span>
                <span className="truncate font-mono text-2xs text-ink-4">
                  {row.sourceId}
                  {row.sourceType ? ` · ${row.sourceType}` : ''}
                  {` · ${row.leadCount} lead${row.leadCount === 1 ? '' : 's'}`}
                  {row.lastSeenAt ? ` · ${relativeTime(row.lastSeenAt)}` : ''}
                </span>
                {row.productName ? (
                  <span className="truncate text-2xs text-ink-4">
                    already mapped to {row.productName}
                  </span>
                ) : null}
              </div>

              {props.onPickHeadline && row.headline ? (
                <button
                  type="button"
                  className="dc-btn dc-btn-xs shrink-0"
                  title="Use this headline as the match text"
                  onClick={() => props.onPickHeadline?.(row.headline!)}
                >
                  Headline
                </button>
              ) : null}

              <button
                type="button"
                className={`dc-btn dc-btn-xs shrink-0 ${picked ? 'border-brand text-brand-ink' : ''}`}
                disabled={picked}
                onClick={() => props.onPickId(row.sourceId)}
              >
                {picked ? (
                  <IconCheck className="h-3 w-3" />
                ) : (
                  <IconPlus className="h-3 w-3" />
                )}
                {picked ? 'Added' : 'Add ID'}
              </button>
            </div>
          );
        })}
      </div>

      {rows.length > 5 ? (
        <button
          type="button"
          className="dc-btn-link self-start text-xs"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show fewer' : `Show all ${rows.length}`}
        </button>
      ) : null}
    </div>
  );
}
