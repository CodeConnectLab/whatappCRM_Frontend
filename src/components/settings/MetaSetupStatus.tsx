import { Link } from 'react-router-dom';
import type { WorkspaceSummary } from '../../types/api.ts';
import { IconCheck } from '../Icons.tsx';

type Props = {
  summary: WorkspaceSummary | undefined;
  compact?: boolean;
};

function Step({ done, label, detail }: { done: boolean; label: string; detail?: string }) {
  return (
    <li className="flex gap-2.5">
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          done ? 'bg-brand text-white' : 'border border-line bg-surface text-ink-4'
        }`}
      >
        {done ? <IconCheck className="h-2.5 w-2.5" /> : <span className="h-1 w-1 rounded-full bg-current" />}
      </span>
      <div className="min-w-0">
        <p className={`text-base ${done ? 'text-ink-2' : 'font-medium text-ink'}`}>{label}</p>
        {detail ? <p className="mt-0.5 text-sm text-ink-3">{detail}</p> : null}
      </div>
    </li>
  );
}

export function MetaSetupStatus({ summary, compact }: Props) {
  if (!summary) return null;

  const steps = [
    {
      done: summary.metaCredentialsConfigured,
      label: 'Meta credentials saved',
      detail: 'Access token and app secret in Settings',
    },
    {
      done: summary.metaWebhookVerified,
      label: 'Webhook verified',
      detail: 'Callback URL verified in Meta Developer Console',
    },
    {
      done: summary.metaSenderConfigured,
      label: 'WhatsApp sender configured',
      detail: 'Phone number ID and display number saved',
    },
  ];
  const allDone = summary.metaReadyForCampaigns;

  if (compact && allDone) {
    return <p className="text-base text-brand-ink">Meta WhatsApp is ready for campaigns and inbound messages.</p>;
  }

  return (
    <div
      className={`rounded-card border px-4 py-3 ${
        allDone ? 'border-brand-line bg-brand-soft' : 'border-warn-line bg-warn-soft'
      }`}
    >
      <p className={`text-base font-semibold ${allDone ? 'text-brand-ink' : 'text-warn'}`}>
        {allDone ? 'Meta WhatsApp ready' : `Setup checklist — ${steps.filter((s) => s.done).length} of 3 done`}
      </p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {steps.map((s) => (
          <Step key={s.label} done={s.done} label={s.label} detail={compact ? undefined : s.detail} />
        ))}
      </ul>
      {!allDone && !compact ? (
        <p className="mt-3 text-sm text-warn/85">
          Finish the steps above in{' '}
          <Link to="/settings" className="font-medium underline underline-offset-2">
            Settings
          </Link>{' '}
          before starting campaigns.
        </p>
      ) : null}
    </div>
  );
}
