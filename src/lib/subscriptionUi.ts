import type { SubscriptionKind, SubscriptionSummary } from '../types/api.ts';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const EXPIRING_SOON_DAYS = 7;
const DEFAULT_USER_LIMIT = 3;

export type SubscriptionState = {
  kind: SubscriptionKind;
  label: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
};

const EXPIRED: SubscriptionState = {
  kind: 'expired',
  label: 'Expired',
  daysRemaining: 0,
  isExpired: true,
  isExpiringSoon: false,
};

/**
 * Mirrors the server's `isExpired`, so the UI and the API agree on who is locked out.
 * A missing `endDate` counts as expired, the same fail-closed rule the backend applies.
 */
export function deriveSubscriptionState(
  sub: { endDate?: string | null; status?: string } | null | undefined,
): SubscriptionState {
  if (!sub?.endDate) return EXPIRED;
  if (sub.status === 'expired') return EXPIRED;

  const endMs = new Date(sub.endDate).getTime();
  if (!Number.isFinite(endMs) || endMs <= Date.now()) return EXPIRED;

  const daysRemaining = Math.ceil((endMs - Date.now()) / MS_PER_DAY);
  if (daysRemaining <= EXPIRING_SOON_DAYS) {
    return {
      kind: 'expiring_soon',
      label: 'Expiring soon',
      daysRemaining,
      isExpired: false,
      isExpiringSoon: true,
    };
  }
  return {
    kind: 'active',
    label: 'Active',
    daysRemaining,
    isExpired: false,
    isExpiringSoon: false,
  };
}

export function resolveUserLimit(limit?: number | null): number {
  if (typeof limit === 'number' && Number.isFinite(limit) && limit >= 1) return limit;
  return DEFAULT_USER_LIMIT;
}

export function gstBreakdown(
  priceAmount?: number | null,
  gstPercent?: number | null,
): { base: number; gstRate: number; gst: number; total: number } {
  const base = typeof priceAmount === 'number' && Number.isFinite(priceAmount) ? priceAmount : 0;
  const gstRate =
    typeof gstPercent === 'number' && Number.isFinite(gstPercent) && gstPercent >= 0
      ? gstPercent
      : 18;
  const gst = (base * gstRate) / 100;
  return { base, gstRate, gst, total: base + gst };
}

export function formatMoney(amount: number, currency = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatSubscriptionDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function titleCase(value?: string | null): string {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** `/api/me` already ships a computed state; fall back to deriving it if an older API omits it. */
export function stateFromSummary(sub: SubscriptionSummary | null | undefined): SubscriptionState {
  if (!sub) return EXPIRED;
  if (typeof sub.isExpired === 'boolean' && sub.kind) {
    return {
      kind: sub.kind,
      label: sub.kind === 'expired' ? 'Expired' : sub.kind === 'expiring_soon' ? 'Expiring soon' : 'Active',
      daysRemaining: sub.daysRemaining ?? 0,
      isExpired: sub.isExpired,
      isExpiringSoon: Boolean(sub.isExpiringSoon),
    };
  }
  return deriveSubscriptionState(sub);
}
