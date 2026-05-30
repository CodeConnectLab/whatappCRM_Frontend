import { SHOW_TWILIO_UI } from '../config/features.ts';
import type { WhatsappNumber } from '../types/api.ts';

export function visibleWhatsappSenders(senders: WhatsappNumber[] | undefined): WhatsappNumber[] {
  const list = senders ?? [];
  if (SHOW_TWILIO_UI) return list;
  return list.filter((n) => (n.provider ?? 'twilio') === 'meta');
}
