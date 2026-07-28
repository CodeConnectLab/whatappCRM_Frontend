import { Link } from 'react-router-dom';
import type { WorkspaceSummary } from '../../types/api.ts';

type Props = {
  summary: WorkspaceSummary | undefined;
  compact?: boolean;
};

function Step({
  done,
  label,
  detail,
}: {
  done: boolean;
  label: string;
  detail?: string;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          done
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
        }`}
      >
        {done ? '✓' : '·'}
      </span>
      <div className="min-w-0">
        <p className={`text-sm ${done ? 'text-zinc-700 dark:text-zinc-300' : 'font-medium text-zinc-900 dark:text-white'}`}>
          {label}
        </p>
        {detail ? <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{detail}</p> : null}
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
    return (
      <p className="text-sm text-emerald-700 dark:text-emerald-400">
        Meta WhatsApp is ready for campaigns and inbound messages.
      </p>
    );
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        allDone
          ? 'border-emerald-200/90 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30'
          : 'border-amber-200/90 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30'
      }`}
    >
      <p
        className={`text-sm font-medium ${
          allDone ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-950 dark:text-amber-100'
        }`}
      >
        {allDone ? 'Meta WhatsApp ready' : 'Setup checklist'}
      </p>
      <ul className="mt-3 space-y-2.5">
        {steps.map((s) => (
          <Step key={s.label} done={s.done} label={s.label} detail={compact ? undefined : s.detail} />
        ))}
      </ul>
      {!allDone && !compact ? (
        <p className="mt-3 text-xs text-amber-900/80 dark:text-amber-200/80">
          Finish the steps above in{' '}
          <Link to="/settings" className="font-semibold underline">
            Settings
          </Link>{' '}
          before starting campaigns.
        </p>
      ) : null}
    </div>
  );
}
