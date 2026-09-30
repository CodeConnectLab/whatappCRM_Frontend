import { useId, useState, type ReactNode } from 'react';
import { IconInfo } from './Icons.tsx';

/**
 * Small "why?" affordance: an info icon that reveals a short explanation.
 *
 * Built on the app's own tokens rather than pulling in a component library for one
 * tooltip. It opens on hover *and* on click, because hover alone is unreachable on a
 * phone, and it is a real `aria-describedby` target so a screen reader gets the same
 * explanation sighted users do.
 */
export function InfoTip(props: {
  children: ReactNode;
  /** Which side to open on. Defaults to above, which suits the composer. */
  placement?: 'top' | 'bottom';
  label?: string;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const placement = props.placement ?? 'top';

  return (
    <span className={`relative inline-flex ${props.className ?? ''}`}>
      <button
        type="button"
        aria-label={props.label ?? 'More information'}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        className="rounded-full p-0.5 text-current opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        <IconInfo className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <span
          id={id}
          role="tooltip"
          className={`absolute left-1/2 z-40 w-[min(22rem,calc(100vw-3rem))] -translate-x-1/2 rounded-card border border-line bg-surface px-3 py-2.5 text-left text-sm font-normal leading-relaxed text-ink shadow-modal ${
            placement === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
          }`}
        >
          {props.children}
        </span>
      ) : null}
    </span>
  );
}
