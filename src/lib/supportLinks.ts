const DEFAULT_MESSAGE =
  'Hi, my WhatsApp CRM workspace is deactivated. Please help me renew my subscription.';

/**
 * Both helpers return null when the env var is unset, so the calling screen simply
 * omits that button rather than rendering a dead link.
 */
export function buildWhatsAppSupportUrl(companyName?: string | null): string | null {
  const raw = import.meta.env.VITE_SUPPORT_WHATSAPP_E164 as string | undefined;
  const digits = raw?.replace(/\D/g, '');
  if (!digits) return null;
  const text = `${DEFAULT_MESSAGE}\nWorkspace: ${companyName?.trim() || '—'}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function getSupportTelHref(): string | null {
  const raw = (import.meta.env.VITE_SUPPORT_PHONE_TEL as string | undefined)?.trim();
  return raw ? `tel:${raw}` : null;
}

export function getSupportEmailHref(subject: string): string | null {
  const raw = (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined)?.trim();
  return raw ? `mailto:${raw}?subject=${encodeURIComponent(subject)}` : null;
}
