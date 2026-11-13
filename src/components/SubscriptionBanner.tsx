import { useAuthStore } from '../store/authStore.ts';
import { stateFromSummary } from '../lib/subscriptionUi.ts';
import { buildWhatsAppSupportUrl, getSupportEmailHref, getSupportTelHref } from '../lib/supportLinks.ts';

/** Amber strip for the last week before expiry. Renders nothing otherwise. */
export function SubscriptionBanner() {
  const subscription = useAuthStore((s) => s.subscription);
  const companyName = useAuthStore((s) => s.companyName);
  const state = stateFromSummary(subscription);

  if (!subscription || !state.isExpiringSoon) return null;

  const contact =
    buildWhatsAppSupportUrl(companyName) ??
    getSupportTelHref() ??
    getSupportEmailHref(`Subscription renewal — ${companyName ?? 'workspace'}`);
  const days = state.daysRemaining;

  return (
    <div className="shrink-0 border-b border-warn-line bg-warn-soft px-4 py-2.5">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-ink">
          Your subscription expires in <span className="font-semibold">{days}</span>{' '}
          {days === 1 ? 'day' : 'days'}. Renew to avoid losing access to the console.
        </p>
        {contact ? (
          <a
            href={contact}
            {...(contact.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="dc-btn dc-btn-primary dc-btn-sm shrink-0"
          >
            Contact support
          </a>
        ) : null}
      </div>
    </div>
  );
}
