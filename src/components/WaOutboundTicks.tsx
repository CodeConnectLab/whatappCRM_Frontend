/** WhatsApp-style delivery indicators for outbound messages. */
export function WaOutboundTicks(props: { status: string; statusDetail?: string }) {
  const s = (props.status || 'sent').toLowerCase();
  const failTitle = props.statusDetail || 'Failed to deliver';

  if (s === 'failed') {
    return (
      <span className="font-semibold text-danger" title={failTitle}>
        !
      </span>
    );
  }
  if (s === 'queued') {
    return (
      <span className="tracking-tight text-ink-4" title="Sending">
        ···
      </span>
    );
  }

  const tick = 'h-3.5 w-3.5 shrink-0';
  if (s === 'sent') {
    return (
      <span className="inline-flex items-center" title="Sent">
        <CheckIcon className={tick} />
      </span>
    );
  }
  if (s === 'delivered' || s === 'read') {
    const read = s === 'read';
    return (
      <span className={`inline-flex items-center ${read ? 'text-accent' : ''}`} title={read ? 'Read' : 'Delivered'}>
        <CheckIcon className={`${tick} -mr-[7px]`} />
        <CheckIcon className={tick} />
      </span>
    );
  }

  return <span className="normal-case opacity-80">{props.status}</span>;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 16.17 5.53 12.7a1 1 0 0 1 0-1.41l.71-.71a1 1 0 0 1 1.41 0L9 13.12l7.35-7.35a1 1 0 0 1 1.41 0l.7.71a1 1 0 0 1 0 1.41L10.41 16.17a1 1 0 0 1-1.41 0z" />
    </svg>
  );
}
