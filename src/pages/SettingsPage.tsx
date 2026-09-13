import { FormEvent, useEffect, useState } from 'react';
import {
  useMetaWhatsappConfigQuery,
  useUpsertMetaWhatsappConfigMutation,
  useUpsertWhatsappNumberMutation,
  useWhatsappNumbersQuery,
  useUpdateCompanySettingsMutation,
  useWorkspaceSummaryQuery,
} from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { MetaWebhookStatusBanner } from '../components/settings/MetaWebhookStatusBanner.tsx';
import { MetaSetupStatus } from '../components/settings/MetaSetupStatus.tsx';
import { TwilioSettingsPanels } from '../components/settings/TwilioSettingsPanels.tsx';
import { SHOW_TWILIO_UI } from '../config/features.ts';
import { visibleWhatsappSenders } from '../lib/visibleSenders.ts';
import { CardNote, PageHeader, WorkspaceCard } from '../components/workspace/WorkspaceSurface.tsx';

type SettingsTab = 'channel' | 'senders' | 'company';

const TABS: { key: SettingsTab; name: string; hint: string }[] = [
  { key: 'channel', name: 'WhatsApp channel', hint: 'Meta' },
  { key: 'senders', name: 'Senders', hint: 'Numbers' },
  { key: 'company', name: 'Company', hint: 'Profile' },
];

export function SettingsPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const companyName = useAuthStore((s) => s.companyName);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);

  const [tab, setTab] = useState<SettingsTab>('channel');
  const [cName, setCName] = useState(companyName ?? '');
  const [preferredProvider, setPreferredProvider] = useState<'twilio' | 'meta'>('meta');

  const [metaToken, setMetaToken] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [metaWabaId, setMetaWabaId] = useState('');
  const [metaAppId, setMetaAppId] = useState('');
  const [metaVerifyTokenEdit, setMetaVerifyTokenEdit] = useState('');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');
  const [metaDisplayPhone, setMetaDisplayPhone] = useState('');
  const [metaSenderLabel, setMetaSenderLabel] = useState('');
  const [metaIsDefault, setMetaIsDefault] = useState(true);
  const [metaSaveOk, setMetaSaveOk] = useState<string | null>(null);

  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setCName(companyName ?? '');
  }, [companyName]);

  const summary = useWorkspaceSummaryQuery();
  const metaCfg = useMetaWhatsappConfigQuery();
  const numbers = useWhatsappNumbersQuery();
  const upsertWa = useUpsertWhatsappNumberMutation();
  const connectedSenders = visibleWhatsappSenders(numbers.data);
  const upsertMetaCfg = useUpsertMetaWhatsappConfigMutation();
  const updateCompany = useUpdateCompanySettingsMutation();

  useEffect(() => {
    if (summary.data?.whatsappProvider) setPreferredProvider(summary.data.whatsappProvider);
  }, [summary.data?.whatsappProvider]);

  useEffect(() => {
    if (metaCfg.data?.wabaId) setMetaWabaId(metaCfg.data.wabaId);
    if (metaCfg.data?.appId) setMetaAppId(metaCfg.data.appId);
    if (metaCfg.data?.webhookVerifyToken) setMetaVerifyTokenEdit(metaCfg.data.webhookVerifyToken);
  }, [metaCfg.data?.wabaId, metaCfg.data?.appId, metaCfg.data?.webhookVerifyToken]);

  useEffect(() => {
    const metaSender = (numbers.data ?? []).find((n) => n.provider === 'meta');
    if (!metaSender) return;
    setMetaPhoneNumberId(metaSender.metaPhoneNumberId ?? '');
    setMetaDisplayPhone(metaSender.phoneNumber);
    setMetaSenderLabel(metaSender.friendlyName ?? '');
    setMetaIsDefault(metaSender.isDefault ?? true);
  }, [numbers.data]);

  const canManage = workspaceRole === 'company_admin';

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMetaSaveOk(`${label} copied`);
      window.setTimeout(() => setMetaSaveOk(null), 2000);
    } catch {
      setErr('Could not copy to clipboard');
    }
  }

  async function onCompany(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await updateCompany.mutateAsync({
        name: cName,
        whatsappProvider: SHOW_TWILIO_UI ? preferredProvider : 'meta',
      });
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onMetaConfig(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMetaSaveOk(null);
    if (!metaCfg.data?.accessTokenConfigured && !metaToken.trim()) {
      setErr('Access token is required on first setup');
      return;
    }
    if (!metaCfg.data?.appSecretConfigured && !metaAppSecret.trim()) {
      setErr('App secret is required on first setup');
      return;
    }
    try {
      const result = await upsertMetaCfg.mutateAsync({
        accessToken: metaToken.trim() || undefined,
        appSecret: metaAppSecret.trim() || undefined,
        wabaId: metaWabaId.trim() || undefined,
        appId: metaAppId.trim() || undefined,
        webhookVerifyToken: metaVerifyTokenEdit.trim() || undefined,
      });
      setMetaToken('');
      setMetaAppSecret('');
      if (result.webhookVerifyToken) setMetaVerifyTokenEdit(result.webhookVerifyToken);
      setMetaSaveOk('Meta credentials saved');
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onRegenerateVerifyToken() {
    setErr(null);
    setMetaSaveOk(null);
    try {
      const result = await upsertMetaCfg.mutateAsync({ regenerateWebhookVerifyToken: true });
      if (result.webhookVerifyToken) setMetaVerifyTokenEdit(result.webhookVerifyToken);
      setMetaSaveOk('New verify token generated — update it in Meta Developer Console');
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onMetaNumber(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMetaSaveOk(null);
    try {
      await upsertWa.mutateAsync({
        provider: 'meta',
        metaPhoneNumberId: metaPhoneNumberId.trim(),
        phoneNumber: metaDisplayPhone.trim(),
        friendlyName: metaSenderLabel || undefined,
        isDefault: metaIsDefault,
      });
      setMetaSaveOk('Meta sender saved');
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <NeedsCompanyBanner />

      <PageHeader title="Settings" description="Workspace configuration, channels and access." />

      {err ? <div className="dc-note dc-note-danger">{err}</div> : null}
      {metaSaveOk ? <div className="dc-note dc-note-brand">{metaSaveOk}</div> : null}

      <div className="grid items-start gap-4 lg:grid-cols-[220px_1fr]">
        {/* Side tab rail ------------------------------------------------- */}
        <aside className="flex flex-row gap-px overflow-x-auto rounded-card border border-line bg-surface p-1.5 lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex h-[34px] shrink-0 items-center gap-2 rounded-control px-2.5 text-left text-base transition-colors ${
                tab === t.key ? 'bg-brand-soft font-semibold text-brand-ink' : 'text-ink-2 hover:bg-line-soft'
              }`}
            >
              <span className="truncate">{t.name}</span>
              <span className="ml-auto hidden text-xs text-ink-4 lg:inline">{t.hint}</span>
            </button>
          ))}
        </aside>

        <div className="flex min-w-0 flex-col gap-3.5">
          {/* ------------------------------------------------------ channel */}
          {tab === 'channel' ? (
            canManage ? (
              <>
                <MetaSetupStatus summary={summary.data} />

                {SHOW_TWILIO_UI ? <TwilioSettingsPanels onError={setErr} /> : null}

                <WorkspaceCard title="Meta WhatsApp Cloud API">
                  <p className="text-sm leading-relaxed text-ink-3">
                    Each workspace uses its own Meta app. Set{' '}
                    <code className="rounded bg-muted px-1 font-mono text-xs">PUBLIC_API_BASE_URL</code> on the
                    API (ngrok in dev) to generate your unique webhook URL below.
                  </p>

                  <div className="mt-3.5">
                    <MetaWebhookStatusBanner config={metaCfg.data} />
                  </div>

                  {metaCfg.data?.webhookUrl ? (
                    <div className="mt-3.5 flex flex-col gap-3 rounded-card border border-accent-line bg-accent-soft p-4">
                      <div>
                        <div className="text-2xs font-semibold uppercase tracking-[0.06em] text-accent-ink">
                          Webhook callback URL
                        </div>
                        <code className="mt-1 block break-all font-mono text-sm text-accent-ink">
                          {metaCfg.data.webhookUrl}
                        </code>
                        <button
                          type="button"
                          onClick={() => void copyText('Webhook URL', metaCfg.data!.webhookUrl!)}
                          className="mt-1.5 text-sm font-medium text-accent-ink underline underline-offset-2"
                        >
                          Copy URL
                        </button>
                      </div>
                      <div>
                        <div className="text-2xs font-semibold uppercase tracking-[0.06em] text-accent-ink">
                          Verify token
                        </div>
                        <code className="mt-1 block break-all font-mono text-sm text-accent-ink">
                          {metaCfg.data.webhookVerifyToken ?? metaVerifyTokenEdit}
                        </code>
                        <button
                          type="button"
                          onClick={() =>
                            void copyText('Verify token', metaCfg.data?.webhookVerifyToken ?? metaVerifyTokenEdit)
                          }
                          className="mt-1.5 text-sm font-medium text-accent-ink underline underline-offset-2"
                        >
                          Copy verify token
                        </button>
                      </div>
                      <p className="text-xs text-accent-ink/80">
                        Meta Developer → WhatsApp → Configuration: paste URL and verify token, subscribe to
                        messages, then Verify and save.
                      </p>
                    </div>
                  ) : (
                    <p className="dc-note dc-note-warn mt-3.5">
                      Save credentials once to generate your webhook URL (needs PUBLIC_API_BASE_URL on the API).
                    </p>
                  )}

                  <form onSubmit={onMetaConfig} className="mt-4 flex flex-col gap-3.5">
                    <label className="dc-label">
                      <span className="dc-label-text">
                        Access token{' '}
                        {metaCfg.data?.accessTokenConfigured ? (
                          <span className="font-normal text-brand-ink">(saved)</span>
                        ) : null}
                      </span>
                      <input
                        type="password"
                        value={metaToken}
                        onChange={(e) => setMetaToken(e.target.value)}
                        placeholder={metaCfg.data?.accessTokenConfigured ? 'Leave blank to keep existing' : 'EAAG…'}
                        className="dc-input font-mono text-sm"
                      />
                    </label>

                    <label className="dc-label">
                      <span className="dc-label-text">
                        App secret{' '}
                        {metaCfg.data?.appSecretConfigured ? (
                          <span className="font-normal text-brand-ink">(saved)</span>
                        ) : null}
                      </span>
                      <input
                        type="password"
                        value={metaAppSecret}
                        onChange={(e) => setMetaAppSecret(e.target.value)}
                        placeholder={
                          metaCfg.data?.appSecretConfigured ? 'Leave blank to keep existing' : 'App Settings → Basic'
                        }
                        className="dc-input font-mono text-sm"
                      />
                    </label>

                    <label className="dc-label">
                      <span className="dc-label-text">Webhook verify token</span>
                      <input
                        value={metaVerifyTokenEdit}
                        onChange={(e) => setMetaVerifyTokenEdit(e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="dc-input font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => void onRegenerateVerifyToken()}
                        disabled={upsertMetaCfg.isPending}
                        className="dc-btn-link self-start"
                      >
                        Generate new verify token
                      </button>
                    </label>

                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <label className="dc-label">
                        <span className="dc-label-text">
                          WhatsApp Business Account ID <span className="font-normal text-ink-4">(optional)</span>
                        </span>
                        <input
                          value={metaWabaId}
                          onChange={(e) => setMetaWabaId(e.target.value)}
                          placeholder="76756565659623371"
                          className="dc-input font-mono text-sm"
                        />
                      </label>
                      <label className="dc-label">
                        <span className="dc-label-text">
                          App ID <span className="font-normal text-ink-4">(optional)</span>
                        </span>
                        <input
                          value={metaAppId}
                          onChange={(e) => setMetaAppId(e.target.value)}
                          placeholder="1234567890123456"
                          className="dc-input font-mono text-sm"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-ink-4">
                      App ID is only needed to upload template header images. It is detected from your access
                      token automatically — fill it in if a template submit reports it could not be found.
                    </p>

                    <div className="flex items-center gap-3 border-t border-line-soft pt-3.5">
                      <p className="text-sm text-ink-3">
                        Status:{' '}
                        {metaCfg.data?.configured ? (
                          <span className="font-medium text-brand-ink">ready for send and webhook</span>
                        ) : (
                          <span>needs access token and app secret</span>
                        )}
                      </p>
                      <button
                        type="submit"
                        disabled={upsertMetaCfg.isPending || !companyId}
                        className="dc-btn dc-btn-primary ml-auto"
                      >
                        {upsertMetaCfg.isPending ? 'Saving…' : 'Save Meta credentials'}
                      </button>
                    </div>
                  </form>
                </WorkspaceCard>
              </>
            ) : (
              <WorkspaceCard>
                <CardNote>Channel configuration is limited to company admins.</CardNote>
              </WorkspaceCard>
            )
          ) : null}

          {/* ------------------------------------------------------ senders */}
          {tab === 'senders' ? (
            <>
              {canManage ? (
                <WorkspaceCard title="Meta WhatsApp sender">
                  <form onSubmit={onMetaNumber} className="flex flex-col gap-3.5">
                    <p className="text-sm text-ink-3">
                      One sender per workspace — saving again updates the existing record. From Meta Developer →
                      WhatsApp → API Setup, copy the full Phone number ID. Display phone must be E.164.
                    </p>
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <label className="dc-label">
                        <span className="dc-label-text">Phone number ID</span>
                        <input
                          value={metaPhoneNumberId}
                          onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                          placeholder="111037888825216"
                          className="dc-input font-mono text-sm"
                          required
                        />
                      </label>
                      <label className="dc-label">
                        <span className="dc-label-text">Display phone (E.164)</span>
                        <input
                          value={metaDisplayPhone}
                          onChange={(e) => setMetaDisplayPhone(e.target.value)}
                          placeholder="+15558755467"
                          className="dc-input font-mono text-sm"
                          required
                        />
                      </label>
                    </div>
                    <label className="dc-label">
                      <span className="dc-label-text">
                        Label <span className="font-normal text-ink-4">(optional)</span>
                      </span>
                      <input
                        value={metaSenderLabel}
                        onChange={(e) => setMetaSenderLabel(e.target.value)}
                        className="dc-input"
                      />
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-base text-ink-2">
                      <input
                        type="checkbox"
                        checked={metaIsDefault}
                        onChange={(e) => setMetaIsDefault(e.target.checked)}
                        className="dc-checkbox"
                      />
                      Set as default sender
                    </label>
                    <div className="flex border-t border-line-soft pt-3.5">
                      <button
                        type="submit"
                        disabled={upsertWa.isPending || !companyId}
                        className="dc-btn dc-btn-primary ml-auto"
                      >
                        {upsertWa.isPending ? 'Saving…' : 'Save Meta sender'}
                      </button>
                    </div>
                  </form>
                </WorkspaceCard>
              ) : null}

              <WorkspaceCard title="Connected senders" flush>
                {!companyId ? (
                  <div className="p-4">
                    <CardNote>Select a workspace.</CardNote>
                  </div>
                ) : numbers.isLoading ? (
                  <div className="p-4">
                    <CardNote>Loading…</CardNote>
                  </div>
                ) : !connectedSenders.length ? (
                  <div className="p-4">
                    <CardNote>No senders yet. Add your Meta sender above.</CardNote>
                  </div>
                ) : (
                  <ul>
                    {connectedSenders.map((n) => (
                      <li
                        key={n._id}
                        className="flex flex-wrap items-center gap-3.5 border-b border-line-faint px-4 py-3.5 last:border-b-0"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-brand-soft text-base font-bold text-brand-ink">
                          W
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="font-mono text-base text-ink">{n.phoneNumber}</span>
                          <span className="truncate text-sm text-ink-3">
                            {(n.provider ?? 'twilio') === 'meta' ? 'Meta Cloud API' : 'Twilio'}
                            {n.metaPhoneNumberId ? ` · ${n.metaPhoneNumberId}` : ''}
                            {n.friendlyName ? ` · ${n.friendlyName}` : ''}
                          </span>
                        </div>
                        {n.isDefault ? <span className="dc-badge dc-badge-brand ml-auto">Default</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </WorkspaceCard>
            </>
          ) : null}

          {/* ------------------------------------------------------ company */}
          {tab === 'company' ? (
            canManage ? (
              <WorkspaceCard title="Company profile">
                <form onSubmit={onCompany} className="flex flex-col gap-3.5">
                  <label className="dc-label">
                    <span className="dc-label-text">Display name</span>
                    <input value={cName} onChange={(e) => setCName(e.target.value)} className="dc-input max-w-md" />
                  </label>

                  {SHOW_TWILIO_UI ? (
                    <label className="dc-label">
                      <span className="dc-label-text">Default messaging provider</span>
                      <select
                        value={preferredProvider}
                        onChange={(e) => setPreferredProvider(e.target.value as 'twilio' | 'meta')}
                        className="dc-select max-w-md"
                      >
                        <option value="twilio">Twilio</option>
                        <option value="meta">Meta (WhatsApp Cloud API)</option>
                      </select>
                      <span className="text-sm text-ink-4">
                        Actual sends use the sender you choose on each campaign or chat.
                      </span>
                    </label>
                  ) : null}

                  <div className="flex border-t border-line-soft pt-3.5">
                    <button
                      type="submit"
                      disabled={updateCompany.isPending || !companyId}
                      className="dc-btn dc-btn-primary ml-auto"
                    >
                      {updateCompany.isPending ? 'Saving…' : 'Save company'}
                    </button>
                  </div>
                </form>
              </WorkspaceCard>
            ) : (
              <WorkspaceCard>
                <CardNote>Company name changes are limited to admins.</CardNote>
              </WorkspaceCard>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
