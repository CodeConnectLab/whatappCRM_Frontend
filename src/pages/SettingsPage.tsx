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
import { WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';

const field =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';

export function SettingsPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const companyName = useAuthStore((s) => s.companyName);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const [cName, setCName] = useState(companyName ?? '');
  const [preferredProvider, setPreferredProvider] = useState<'twilio' | 'meta'>('meta');

  const [metaToken, setMetaToken] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [metaWabaId, setMetaWabaId] = useState('');
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
    if (summary.data?.whatsappProvider) {
      setPreferredProvider(summary.data.whatsappProvider);
    }
  }, [summary.data?.whatsappProvider]);

  useEffect(() => {
    if (metaCfg.data?.wabaId) setMetaWabaId(metaCfg.data.wabaId);
    if (metaCfg.data?.webhookVerifyToken) setMetaVerifyTokenEdit(metaCfg.data.webhookVerifyToken);
  }, [metaCfg.data?.wabaId, metaCfg.data?.webhookVerifyToken]);

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMetaSaveOk(`${label} copied`);
      window.setTimeout(() => setMetaSaveOk(null), 2000);
    } catch {
      setErr('Could not copy to clipboard');
    }
  }

  const canManage = workspaceRole === 'company_admin';

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
    const needsToken = !metaCfg.data?.accessTokenConfigured;
    const needsSecret = !metaCfg.data?.appSecretConfigured;
    if (needsToken && !metaToken.trim()) {
      setErr('Access token is required on first setup');
      return;
    }
    if (needsSecret && !metaAppSecret.trim()) {
      setErr('App secret is required on first setup');
      return;
    }
    try {
      const result = await upsertMetaCfg.mutateAsync({
        accessToken: metaToken.trim() || undefined,
        appSecret: metaAppSecret.trim() || undefined,
        wabaId: metaWabaId.trim() || undefined,
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

  useEffect(() => {
    const metaSender = (numbers.data ?? []).find((n) => n.provider === 'meta');
    if (!metaSender) return;
    setMetaPhoneNumberId(metaSender.metaPhoneNumberId ?? '');
    setMetaDisplayPhone(metaSender.phoneNumber);
    setMetaSenderLabel(metaSender.friendlyName ?? '');
    setMetaIsDefault(metaSender.isDefault ?? true);
  }, [numbers.data]);

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

  const primaryBtn =
    'rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 dark:shadow-emerald-900/30';

  const secondaryBtn =
    'rounded-xl border border-blue-200/90 bg-blue-50/80 px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/70 disabled:opacity-50';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <NeedsCompanyBanner />

      <WorkspaceIntro
        kicker="Workspace"
        title="Settings"
        description="Connect Meta WhatsApp Cloud API for this workspace (credentials encrypted on the server). Campaigns and live chats use the sender you configure below."
      />

      {err ? (
        <div className="rounded-xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-200">
          {err}
        </div>
      ) : null}

      {metaSaveOk ? (
        <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/35 dark:text-emerald-200">
          {metaSaveOk}
        </div>
      ) : null}

      {canManage ? <MetaSetupStatus summary={summary.data} /> : null}

      {canManage ? (
        <WorkspaceCard title="Company profile">
          <form onSubmit={onCompany} className="space-y-4">
            <div>
              <label htmlFor="settings-company-name" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Display name
              </label>
              <input
                id="settings-company-name"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                className={`${field} mt-1.5`}
              />
            </div>
            {SHOW_TWILIO_UI ? (
              <div>
                <label htmlFor="settings-provider" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Default messaging provider (hint for new setup)
                </label>
                <select
                  id="settings-provider"
                  value={preferredProvider}
                  onChange={(e) => setPreferredProvider(e.target.value as 'twilio' | 'meta')}
                  className={`${field} mt-1.5`}
                >
                  <option value="twilio">Twilio</option>
                  <option value="meta">Meta (WhatsApp Cloud API)</option>
                </select>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Actual sends use the <strong>sender</strong> you choose on each campaign or chat.
                </p>
              </div>
            ) : null}
            <button type="submit" disabled={updateCompany.isPending || !companyId} className={primaryBtn}>
              {updateCompany.isPending ? 'Saving…' : 'Save company'}
            </button>
          </form>
        </WorkspaceCard>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Company name changes are limited to admins.</p>
      )}

      {canManage ? (
        <>
          {SHOW_TWILIO_UI ? <TwilioSettingsPanels onError={setErr} /> : null}

          <WorkspaceCard title="Meta WhatsApp Cloud API (this workspace)">
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Each workspace uses its own Meta app. Set{' '}
              <code className="rounded bg-zinc-100 px-1 text-[11px] dark:bg-zinc-800">PUBLIC_API_BASE_URL</code> on
              the API (ngrok in dev) to generate your unique webhook URL below.
            </p>

            <MetaWebhookStatusBanner config={metaCfg.data} />

            {metaCfg.data?.webhookUrl ? (
              <div className="mt-4 space-y-3 rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200">
                    Webhook callback URL
                  </div>
                  <code className="mt-1 block break-all font-mono text-[12px] text-blue-950 dark:text-blue-100">
                    {metaCfg.data.webhookUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyText('Webhook URL', metaCfg.data!.webhookUrl!)}
                    className="mt-2 text-xs font-semibold text-blue-800 underline dark:text-blue-300"
                  >
                    Copy URL
                  </button>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200">
                    Verify token
                  </div>
                  <code className="mt-1 block break-all font-mono text-[12px] text-blue-950 dark:text-blue-100">
                    {metaCfg.data.webhookVerifyToken ?? metaVerifyTokenEdit}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      void copyText(
                        'Verify token',
                        metaCfg.data?.webhookVerifyToken ?? metaVerifyTokenEdit,
                      )
                    }
                    className="mt-2 text-xs font-semibold text-blue-800 underline dark:text-blue-300"
                  >
                    Copy verify token
                  </button>
                </div>
                <p className="text-[11px] text-blue-900/80 dark:text-blue-200/80">
                  Meta Developer, WhatsApp, Configuration: paste URL and verify token, subscribe to messages, then
                  Verify and save.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
                Save credentials once to generate your webhook URL (needs PUBLIC_API_BASE_URL on the API).
              </p>
            )}

            <form onSubmit={onMetaConfig} className="mt-4 space-y-4">
              <div>
                <label htmlFor="meta-token" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Access token{' '}
                  {metaCfg.data?.accessTokenConfigured ? (
                    <span className="font-normal text-emerald-600 dark:text-emerald-400">(saved)</span>
                  ) : null}
                </label>
                <input
                  id="meta-token"
                  type="password"
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  placeholder={metaCfg.data?.accessTokenConfigured ? 'Leave blank to keep existing' : 'EAAG'}
                  className={`${field} mt-1.5 font-mono text-[12px]`}
                />
              </div>
              <div>
                <label htmlFor="meta-app-secret" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  App secret{' '}
                  {metaCfg.data?.appSecretConfigured ? (
                    <span className="font-normal text-emerald-600 dark:text-emerald-400">(saved)</span>
                  ) : null}
                </label>
                <input
                  id="meta-app-secret"
                  type="password"
                  value={metaAppSecret}
                  onChange={(e) => setMetaAppSecret(e.target.value)}
                  placeholder={
                    metaCfg.data?.appSecretConfigured ? 'Leave blank to keep existing' : 'App Settings, Basic'
                  }
                  className={`${field} mt-1.5 font-mono text-[12px]`}
                />
              </div>
              <div>
                <label htmlFor="meta-verify-token" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Webhook verify token
                </label>
                <input
                  id="meta-verify-token"
                  value={metaVerifyTokenEdit}
                  onChange={(e) => setMetaVerifyTokenEdit(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className={`${field} mt-1.5 font-mono text-[12px]`}
                />
                <button
                  type="button"
                  onClick={() => void onRegenerateVerifyToken()}
                  disabled={upsertMetaCfg.isPending}
                  className="mt-2 text-xs font-semibold text-zinc-600 underline dark:text-zinc-400"
                >
                  Generate new verify token
                </button>
              </div>
              <div>
                <label htmlFor="meta-waba" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  WhatsApp Business Account ID <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <input
                  id="meta-waba"
                  value={metaWabaId}
                  onChange={(e) => setMetaWabaId(e.target.value)}
                  placeholder="76756565659623371"
                  className={`${field} mt-1.5 font-mono text-[13px]`}
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Status:{' '}
                {metaCfg.data?.configured ? (
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">ready for send and webhook</span>
                ) : (
                  <span>needs access token and app secret</span>
                )}
              </p>
              <button type="submit" disabled={upsertMetaCfg.isPending || !companyId} className={secondaryBtn}>
                {upsertMetaCfg.isPending ? 'Saving…' : 'Save Meta credentials'}
              </button>
            </form>
          </WorkspaceCard>

          <WorkspaceCard title="Meta WhatsApp sender (phone number ID)">
            <form onSubmit={onMetaNumber} className="space-y-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                One sender per workspace — saving again updates the existing record. From Meta Developer,
                WhatsApp, API Setup: copy the full Phone number ID. Display phone must be E.164 (e.g.
                +917376103969).
              </p>
              <div>
                <label htmlFor="meta-pnid" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Phone number ID
                </label>
                <input
                  id="meta-pnid"
                  value={metaPhoneNumberId}
                  onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                  placeholder="111037888825216"
                  className={`${field} mt-1.5 font-mono text-[13px]`}
                  required
                />
              </div>
              <div>
                <label htmlFor="meta-display" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Display phone (E.164)
                </label>
                <input
                  id="meta-display"
                  value={metaDisplayPhone}
                  onChange={(e) => setMetaDisplayPhone(e.target.value)}
                  placeholder="+15558755467"
                  className={`${field} mt-1.5 font-mono text-[13px]`}
                  required
                />
              </div>
              <div>
                <label htmlFor="meta-slabel" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Label <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <input
                  id="meta-slabel"
                  value={metaSenderLabel}
                  onChange={(e) => setMetaSenderLabel(e.target.value)}
                  className={`${field} mt-1.5`}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={metaIsDefault}
                  onChange={(e) => setMetaIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900"
                />
                Set as default sender
              </label>
              <button type="submit" disabled={upsertWa.isPending || !companyId} className={secondaryBtn}>
                {upsertWa.isPending ? 'Saving…' : 'Save Meta sender'}
              </button>
            </form>
          </WorkspaceCard>
        </>
      ) : null}

      <WorkspaceCard title="Connected senders">
        {!companyId ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace.</p>
        ) : numbers.isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : connectedSenders.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No senders yet. Add your Meta sender above.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {connectedSenders.map((n) => (
              <li key={n._id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{n.phoneNumber}</div>
                  <div className="mt-0.5 flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-semibold uppercase dark:bg-zinc-800">
                      {(n.provider ?? 'twilio') === 'meta' ? 'Meta' : 'Twilio'}
                    </span>
                    {n.metaPhoneNumberId ? (
                      <span className="font-mono">phone_number_id: {n.metaPhoneNumberId}</span>
                    ) : null}
                    {n.friendlyName ? <span>{n.friendlyName}</span> : null}
                  </div>
                </div>
                {n.isDefault ? (
                  <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Default
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </WorkspaceCard>
    </div>
  );
}
