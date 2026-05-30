import type { MetaWhatsappConfig } from '../../types/api.ts';

function formatWhen(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString();
}

type Props = {
  config: MetaWhatsappConfig | undefined;
};

export function MetaWebhookStatusBanner({ config }: Props) {
  if (!config?.webhookUrl) return null;

  const status = config.webhookVerificationStatus ?? 'pending';
  const verifiedAt = formatWhen(config.webhookVerifiedAt);
  const lastAt = formatWhen(config.webhookLastVerifyAt);

  if (status === 'verified') {
    return (
      <div
        className="mt-4 rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/35 dark:text-emerald-100"
        role="status"
      >
        <p className="font-semibold">Webhook verified</p>
        <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-200/90">
          Meta successfully reached your server.{verifiedAt ? ` Verified at ${verifiedAt}.` : ''}
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div
        className="mt-4 rounded-xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-100"
        role="alert"
      >
        <p className="font-semibold">Webhook verification failed</p>
        <p className="mt-1 text-xs text-red-800/90 dark:text-red-200/90">
          {config.webhookLastVerifyError ??
            'Meta could not validate the callback URL or verify token. Copy both fields below exactly, then click Verify and save in Meta.'}
          {lastAt ? ` Last attempt: ${lastAt}.` : ''}
        </p>
        <p className="mt-2 text-xs text-red-800/80 dark:text-red-200/80">
          Callback URL must include <strong>/webhooks/</strong> (or use the URL below — we also accept{' '}
          <code className="font-mono">/meta/whatsapp/…</code>).
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100"
      role="status"
    >
      <p className="font-semibold">Webhook not verified yet</p>
      <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-200/90">
        Paste the callback URL and verify token in Meta, then click <strong>Verify and save</strong>. This page
        refreshes every few seconds; your backend terminal will log{' '}
        <code className="font-mono text-[11px]">[webhook] GET …</code> when Meta calls you.
      </p>
    </div>
  );
}
