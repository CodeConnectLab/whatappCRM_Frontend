import type { ReactNode } from 'react';
import { useSubscriptionQuery } from '../../hooks/apiHooks.ts';
import { apiErrorMessage } from '../../lib/errors.ts';
import {
  formatMoney,
  formatSubscriptionDate,
  gstBreakdown,
  titleCase,
} from '../../lib/subscriptionUi.ts';
import { buildWhatsAppSupportUrl, getSupportEmailHref, getSupportTelHref } from '../../lib/supportLinks.ts';
import { CardNote, WorkspaceCard } from '../workspace/WorkspaceSurface.tsx';

function Row(props: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line-faint py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="text-sm text-ink-3 sm:w-44 sm:shrink-0">{props.label}</span>
      <span className="text-base font-medium text-ink">{props.children}</span>
      {props.hint ? <span className="text-sm text-ink-4 sm:ml-auto">{props.hint}</span> : null}
    </div>
  );
}

const CYCLE_SUFFIX: Record<string, string> = {
  monthly: 'per month',
  quarterly: 'per quarter',
  yearly: 'per year',
};

function StatusPill(props: { kind: 'active' | 'expiring_soon' | 'expired'; label: string }) {
  const tone =
    props.kind === 'expired'
      ? 'dc-badge dc-badge-danger'
      : props.kind === 'expiring_soon'
        ? 'dc-badge dc-badge-warn'
        : 'dc-badge dc-badge-brand';
  return <span className={tone}>{props.label}</span>;
}

/**
 * Read-only on purpose: plan, seats, price and term are set by the operator directly in
 * the database, so there is nothing here for a customer to edit.
 */
export function SubscriptionPanel() {
  const q = useSubscriptionQuery();

  if (q.isLoading) {
    return (
      <WorkspaceCard title="Subscription">
        <CardNote>Loading subscription…</CardNote>
      </WorkspaceCard>
    );
  }
  if (q.isError || !q.data) {
    return (
      <WorkspaceCard title="Subscription">
        <CardNote>{apiErrorMessage(q.error, 'Could not load subscription details.')}</CardNote>
      </WorkspaceCard>
    );
  }

  const d = q.data;
  const sub = d.subscription;
  const { base, gstRate, gst, total } = gstBreakdown(sub?.priceAmount, sub?.gstPercent);
  const currency = sub?.currency ?? 'INR';
  const overLimit = d.usersUsed > d.userLimit;
  const statusLabel =
    d.kind === 'expired' ? 'Expired' : d.kind === 'expiring_soon' ? 'Expiring soon' : 'Active';

  const wa = buildWhatsAppSupportUrl(d.companyName);
  const tel = getSupportTelHref();
  const mail = getSupportEmailHref(`Subscription renewal — ${d.companyName}`);

  return (
    <div className="flex flex-col gap-4">
      <WorkspaceCard
        title="Subscription"
        action={
          <button
            type="button"
            onClick={() => void q.refetch()}
            disabled={q.isFetching}
            className="dc-btn dc-btn-ghost dc-btn-sm"
          >
            {q.isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      >
        <Row label="Workspace">{d.companyName}</Row>
        <Row label="Plan">{titleCase(sub?.plan)}</Row>
        <Row label="Status">
          <StatusPill kind={d.kind} label={statusLabel} />
        </Row>
        <Row label="Billing cycle">{titleCase(sub?.billingCycle)}</Row>
        <Row label="Price (excl. tax)">{formatMoney(base, currency)}</Row>
        <Row label={`GST (${gstRate}%)`}>{formatMoney(gst, currency)}</Row>
        <Row label="Total payable" hint={CYCLE_SUFFIX[sub?.billingCycle ?? 'monthly'] ?? 'per month'}>
          {formatMoney(total, currency)}
        </Row>
        <Row label="User limit">{d.userLimit}</Row>
        <Row label="Users added">
          <span className={overLimit ? 'text-danger' : undefined}>
            {d.usersUsed} / {d.userLimit}
          </span>
        </Row>
        <Row label="Start date">{formatSubscriptionDate(sub?.startDate)}</Row>
        <Row label="Expiry date">{formatSubscriptionDate(sub?.endDate)}</Row>
        <Row label="Days remaining">{d.isExpired ? '0' : d.daysRemaining}</Row>
        {sub?.notes ? <Row label="Notes">{sub.notes}</Row> : null}
      </WorkspaceCard>

      {overLimit ? (
        <div className="dc-note dc-note-warn">
          This workspace has {d.usersUsed} users against a limit of {d.userLimit}. Adding users
          still works, but the extra seats will be billed in the next cycle.
        </div>
      ) : null}

      <WorkspaceCard title="Renewal">
        <p className="text-base text-ink-2">
          Plan, price, seats and expiry are managed by your account manager. Reach out to renew
          or to change any of them.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="dc-btn dc-btn-primary">
              WhatsApp support
            </a>
          ) : null}
          {tel ? (
            <a href={tel} className="dc-btn">
              Call support
            </a>
          ) : null}
          {mail ? (
            <a href={mail} className="dc-btn">
              Email support
            </a>
          ) : null}
          {!wa && !tel && !mail ? (
            <CardNote>
              Set VITE_SUPPORT_WHATSAPP_E164, VITE_SUPPORT_PHONE_TEL or VITE_SUPPORT_EMAIL to show
              contact shortcuts here.
            </CardNote>
          ) : null}
        </div>
      </WorkspaceCard>
    </div>
  );
}
