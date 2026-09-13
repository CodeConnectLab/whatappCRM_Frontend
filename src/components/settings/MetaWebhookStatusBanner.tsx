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
      <div className="rounded-card border border-brand-line bg-brand-soft px-4 py-3 text-brand-ink" role="status">
        <p className="text-base font-semibold">Webhook verified</p>
        <p className="mt-1 text-sm text-brand-ink/85">
          Meta successfully reached your server.{verifiedAt ? ` Verified at ${verifiedAt}.` : ''}
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="rounded-card border border-danger-line bg-danger-soft px-4 py-3 text-danger" role="alert">
        <p className="text-base font-semibold">Webhook verification failed</p>
        <p className="mt-1 text-sm text-danger/90">
          {config.webhookLastVerifyError ??
            'Meta could not validate the callback URL or verify token. Copy both fields below exactly, then click Verify and save in Meta.'}
          {lastAt ? ` Last attempt: ${lastAt}.` : ''}
        </p>
        <p className="mt-2 text-sm text-danger/80">
          Callback URL must include <strong>/webhooks/</strong> (or use the URL below — we also accept{' '}
          <code className="font-mono">/meta/whatsapp/…</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-warn-line bg-warn-soft px-4 py-3 text-warn" role="status">
      <p className="text-base font-semibold">Webhook not verified yet</p>
      <p className="mt-1 text-sm text-warn/90">
        Paste the callback URL and verify token in Meta, then click <strong>Verify and save</strong>. This page
        refreshes every few seconds; your backend terminal will log{' '}
        <code className="font-mono text-xs">[webhook] GET …</code> when Meta calls you.
      </p>
    </div>
  );
}
