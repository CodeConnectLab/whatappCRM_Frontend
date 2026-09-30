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
  /**
   * Which edge to line the panel up with. The panel is wide, so a centred one hanging
   * off an icon at the right of its row overflows the screen and the surrounding
   * `overflow-hidden` clips it — which is exactly what happened in the inbox.
   */
  align?: 'center' | 'left' | 'right';
  label?: string;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const placement = props.placement ?? 'top';
  const align = props.align ?? 'center';

  const alignment =
    align === 'right'
      ? 'right-0'
      : align === 'left'
        ? 'left-0'
        : 'left-1/2 -translate-x-1/2';

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
          className={`absolute z-40 w-[min(22rem,calc(100vw-3rem))] rounded-card border border-line bg-surface px-3 py-2.5 text-left text-sm font-normal leading-relaxed text-ink shadow-modal ${alignment} ${
            placement === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
          }`}
        >
          {props.children}
        </span>
      ) : null}
    </span>
  );
}
