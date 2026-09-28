import type { LeadStatus, MediaKind } from '../types/api.ts';

export const LEAD_STATUSES: LeadStatus[] = ['new', 'in_progress', 'qualified', 'won', 'lost'];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
};

/** Badge modifier per stage, so the Leads table and the chat header agree. */
export const LEAD_STATUS_BADGE: Record<LeadStatus, string> = {
  new: 'dc-badge-brand',
  in_progress: 'dc-badge-accent',
  qualified: 'dc-badge-warn',
  won: 'dc-badge-brand',
  lost: 'dc-badge-danger',
};

export function relativeTime(iso?: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatBytes(size?: number | null): string {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Bucket a browser File will be delivered as, mirroring the server's own mapping.
 * Used only to preview the choice before upload; the server decides for real.
 */
export function guessMediaKind(mimeType: string): MediaKind {
  const mime = mimeType.split(';')[0]!.trim().toLowerCase();
  if (mime === 'image/webp') return 'sticker';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'document';
}

/** What WhatsApp accepts per bucket, so an oversize file is caught before the upload. */
export const MEDIA_SIZE_LIMITS: Record<MediaKind, number> = {
  image: 5 * 1024 * 1024,
  video: 16 * 1024 * 1024,
  audio: 16 * 1024 * 1024,
  document: 100 * 1024 * 1024,
  sticker: 512 * 1024,
};
