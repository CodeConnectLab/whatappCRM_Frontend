import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  AUTO_RESPONSE_VARIABLES,
  type TemplateVariable,
} from '../lib/templateVariables.ts';

/**
 * Textarea that offers the available placeholders as you type `{{`.
 *
 * Typing `{{name}}` by hand is how a rule ends up shipping `{{naem}}` to a customer —
 * the renderer leaves an unknown placeholder in the message verbatim. Suggesting the
 * real ones removes the guess, and the inserted text is always a well-formed pair.
 */
export function VariableTextarea(props: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  className?: string;
  variables?: TemplateVariable[];
}) {
  const variables = props.variables ?? AUTO_RESPONSE_VARIABLES;
  const ref = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  /** Index of the `{{` that opened the menu, so the insert can replace it. */
  const [triggerAt, setTriggerAt] = useState<number | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return variables;
    return variables.filter(
      (v) => v.key.includes(q) || v.label.toLowerCase().includes(q),
    );
  }, [query, variables]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function closeMenu() {
    setOpen(false);
    setTriggerAt(null);
    setQuery('');
  }

  /** Re-reads the text left of the caret to decide whether a `{{` is still open. */
  function syncMenu(value: string, caret: number) {
    const before = value.slice(0, caret);
    const start = before.lastIndexOf('{{');
    if (start === -1) {
      closeMenu();
      return;
    }
    const between = before.slice(start + 2);
    // A closed pair, or a line break, means the placeholder is finished with.
    if (between.includes('}') || between.includes('\n')) {
      closeMenu();
      return;
    }
    setTriggerAt(start);
    setQuery(between);
    setOpen(true);
  }

  function insert(variable: TemplateVariable) {
    const el = ref.current;
    const caret = el?.selectionStart ?? props.value.length;
    const start = triggerAt ?? caret;
    const next = `${props.value.slice(0, start)}{{${variable.key}}}${props.value.slice(caret)}`;
    props.onChange(next);
    closeMenu();

    // Put the caret after the inserted placeholder rather than at the end of the box.
    const nextCaret = start + variable.key.length + 4;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(nextCaret, nextCaret);
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!open || !matches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insert(matches[active]!);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={props.value}
        rows={props.rows ?? 4}
        placeholder={props.placeholder}
        required={props.required}
        className={props.className ?? 'dc-textarea'}
        onChange={(e) => {
          props.onChange(e.target.value);
          syncMenu(e.target.value, e.target.selectionStart);
        }}
        onKeyUp={(e) => syncMenu(e.currentTarget.value, e.currentTarget.selectionStart)}
        onClick={(e) => syncMenu(e.currentTarget.value, e.currentTarget.selectionStart)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          // Deferred so a click on a suggestion lands before the menu unmounts.
          setTimeout(closeMenu, 120);
        }}
      />

      {open && matches.length ? (
        <div className="absolute left-2 top-full z-30 mt-1 flex w-[min(20rem,calc(100%-1rem))] flex-col overflow-hidden rounded-card border border-line bg-surface py-1 shadow-modal">
          {matches.map((v, i) => (
            <button
              key={v.key}
              type="button"
              className={`flex items-baseline gap-2 px-3 py-1.5 text-left ${
                i === active ? 'bg-brand-soft' : 'hover:bg-line-soft'
              }`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(v)}
            >
              <span className="font-mono text-xs text-brand-ink">{`{{${v.key}}}`}</span>
              <span className="truncate text-sm text-ink">{v.label}</span>
              <span className="ml-auto shrink-0 truncate text-2xs text-ink-4">{v.example}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Chips under the box — clicking one inserts it, for people who do not type `{{`. */
export function VariableHints(props: {
  onPick: (key: string) => void;
  variables?: TemplateVariable[];
}) {
  const variables = props.variables ?? AUTO_RESPONSE_VARIABLES;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-ink-4">Insert:</span>
      {variables.map((v) => (
        <button
          key={v.key}
          type="button"
          className="dc-badge font-mono text-2xs hover:border-brand hover:text-brand-ink"
          title={`${v.label} — e.g. ${v.example}`}
          onClick={() => props.onPick(v.key)}
        >
          {`{{${v.key}}}`}
        </button>
      ))}
    </div>
  );
}
