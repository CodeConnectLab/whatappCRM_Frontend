import { useState } from 'react';
import { IconDownload, IconFile } from '../Icons.tsx';
import { formatBytes } from '../../lib/leadUi.ts';
import { refreshMediaUrl } from '../../hooks/apiHooks.ts';
import type { MessageMedia } from '../../types/api.ts';

/**
 * Renders a message attachment the way WhatsApp does: pictures and video inline, voice
 * notes as a player, everything else as a named file to download.
 *
 * Read URLs are short-lived signed links, so one can expire while a long thread stays
 * open. On a load error the component asks the API for a fresh URL once rather than
 * leaving a broken image in the thread.
 */
export function MessageAttachment(props: { media: MessageMedia; outbound: boolean }) {
  const { media } = props;
  const [url, setUrl] = useState(media.url ?? null);
  const [retried, setRetried] = useState(false);
  const [failed, setFailed] = useState(false);

  async function retry(): Promise<void> {
    if (retried || !media.mediaId) {
      setFailed(true);
      return;
    }
    setRetried(true);
    try {
      setUrl(await refreshMediaUrl(media.mediaId));
    } catch {
      setFailed(true);
    }
  }

  const name = media.filename ?? 'attachment';
  const meta = [media.kind ?? 'file', formatBytes(media.size)].filter(Boolean).join(' · ');

  // The server records why an inbound file could not be stored. Showing that beats a
  // generic "unavailable", because it tells the operator whether to fix a setting or
  // ask the customer to resend.
  if (media.unavailableReason) {
    return (
      <span className="flex flex-col gap-0.5 rounded-control border border-dashed border-line bg-subtle px-2.5 py-2">
        <span className="flex items-center gap-2 text-sm text-ink-3">
          <IconFile className="h-3.5 w-3.5 shrink-0" />
          {media.filename ?? `${media.kind ?? 'Attachment'} could not be saved`}
        </span>
        <span className="text-2xs leading-snug text-ink-4">{media.unavailableReason}</span>
      </span>
    );
  }

  if (!url || failed) {
    return (
      <span className="flex items-center gap-2 rounded-control border border-dashed border-line bg-subtle px-2.5 py-2 text-sm text-ink-4">
        <IconFile className="h-3.5 w-3.5 shrink-0" />
        {failed ? 'Attachment unavailable' : 'Attachment loading…'}
      </span>
    );
  }

  if (media.kind === 'image' || media.kind === 'sticker') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={url}
          alt={name}
          onError={() => void retry()}
          className={
            media.kind === 'sticker'
              ? 'max-h-[140px] w-auto rounded-control'
              : 'max-h-[320px] w-auto rounded-control object-cover'
          }
        />
      </a>
    );
  }

  if (media.kind === 'video') {
    return (
      <video
        src={url}
        controls
        onError={() => void retry()}
        className="max-h-[320px] w-full rounded-control"
      />
    );
  }

  if (media.kind === 'audio') {
    return <audio src={url} controls onError={() => void retry()} className="w-[240px] max-w-full" />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={name}
      className={`flex items-center gap-2.5 rounded-control border px-2.5 py-2 transition-colors ${
        props.outbound
          ? 'border-brand-line bg-surface/70 hover:bg-surface'
          : 'border-line bg-subtle hover:bg-muted'
      }`}
    >
      <IconFile className="h-4 w-4 shrink-0 text-ink-3" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-ink">{name}</span>
        <span className="text-2xs uppercase tracking-wide text-ink-4">{meta}</span>
      </span>
      <IconDownload className="ml-1 h-3.5 w-3.5 shrink-0 text-ink-4" />
    </a>
  );
}
