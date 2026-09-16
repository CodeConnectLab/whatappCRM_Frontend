import { FormEvent, useEffect, useState } from 'react';
import {
  useCrmBridgeQuery,
  useDisconnectCrmBridgeMutation,
  useTestCrmBridgeMutation,
  useUpsertCrmBridgeMutation,
} from '../../hooks/apiHooks.ts';
import { apiErrorMessage } from '../../lib/errors.ts';
import { CardNote, WorkspaceCard } from '../workspace/WorkspaceSurface.tsx';
import type { CrmBridgePushMode } from '../../types/api.ts';

function statusTone(status: string | undefined): string {
  if (!status) return 'text-ink-3';
  if (status === 'failed' || status === 'test-failed') return 'text-rose-600 dark:text-rose-400';
  return 'text-brand-ink';
}

/**
 * Connects a workspace to the client's CRM so WhatsApp leads land there automatically.
 *
 * The panel is deliberately self-service: an operator pastes the CRM's own API key
 * (generated from the CRM's "Get API" screen, which already encodes the company and
 * lead source), proves it with a test push, and only then flips the switch on.
 */
export function CrmBridgePanel(props: { canEdit: boolean }) {
  const bridge = useCrmBridgeQuery();
  const upsert = useUpsertCrmBridgeMutation();
  const test = useTestCrmBridgeMutation();
  const disconnect = useDisconnectCrmBridgeMutation();

  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [pushMode, setPushMode] = useState<CrmBridgePushMode>('ad_only');
  const [label, setLabel] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const cfg = bridge.data;
  const savedBaseUrl = cfg?.crmBaseUrl;
  const savedPushMode = cfg?.pushMode;
  const savedLabel = cfg?.leadSourceLabel;

  useEffect(() => {
    setBaseUrl(savedBaseUrl ?? '');
    if (savedPushMode) setPushMode(savedPushMode);
    setLabel(savedLabel ?? '');
  }, [savedBaseUrl, savedPushMode, savedLabel]);

  const busy = upsert.isPending || test.isPending || disconnect.isPending;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setNote(null);
    try {
      await upsert.mutateAsync({
        crmBaseUrl: baseUrl.trim() || undefined,
        crmApiKey: apiKey.trim() || undefined,
        pushMode,
        leadSourceLabel: label.trim(),
      });
      setApiKey('');
      setNote('CRM settings saved.');
    } catch (e2) {
      setErr(apiErrorMessage(e2));
    }
  }

  async function onToggle(next: boolean) {
    setErr(null);
    setNote(null);
    try {
      await upsert.mutateAsync({ enabled: next });
      setNote(next ? 'Bridge is on — new leads will be pushed to the CRM.' : 'Bridge paused.');
    } catch (e2) {
      setErr(apiErrorMessage(e2));
    }
  }

  async function onTest() {
    setErr(null);
    setNote(null);
    try {
      const res = await test.mutateAsync();
      setNote(res.message);
    } catch (e2) {
      setErr(apiErrorMessage(e2));
    }
  }

  async function onDisconnect() {
    setErr(null);
    setNote(null);
    try {
      await disconnect.mutateAsync();
      setApiKey('');
      setNote('CRM disconnected. Saved credentials were removed.');
    } catch (e2) {
      setErr(apiErrorMessage(e2));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <WorkspaceCard title="CRM lead bridge">
        <p className="text-sm leading-relaxed text-ink-3">
          Push every new WhatsApp conversation into the client&apos;s CRM as a lead, with the
          Click-to-WhatsApp ad it came from attached. The CRM stays the system of record; this panel
          only decides what gets forwarded.
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-3 rounded-card border border-line bg-muted p-4">
          <div className="flex-1 min-w-[12rem]">
            <div className="text-sm font-semibold text-ink-1">
              {cfg?.enabled ? 'Bridge is on' : 'Bridge is off'}
            </div>
            <div className="mt-0.5 text-sm text-ink-3">
              {cfg?.configured
                ? cfg.enabled
                  ? 'New leads are being forwarded to the CRM.'
                  : 'Credentials saved. Turn the switch on to start forwarding.'
                : 'Add the CRM URL and API key below, then turn it on.'}
            </div>
          </div>
          <button
            type="button"
            disabled={!props.canEdit || busy || !cfg?.configured}
            onClick={() => void onToggle(!cfg?.enabled)}
            className={`dc-btn ${cfg?.enabled ? '' : 'dc-btn-primary'}`}
          >
            {cfg?.enabled ? 'Pause bridge' : 'Turn bridge on'}
          </button>
        </div>

        {err ? (
          <div className="mt-3.5 rounded-card border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            {err}
          </div>
        ) : null}
        {note ? (
          <div className="mt-3.5 rounded-card border border-accent-line bg-accent-soft p-3 text-sm text-accent-ink">
            {note}
          </div>
        ) : null}

        <form onSubmit={onSave} className="mt-4 flex flex-col gap-3.5">
          <label className="dc-label">
            <span className="dc-label-text">CRM API base URL</span>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              disabled={!props.canEdit}
              placeholder="https://api.codeconnect.in/api/v1"
              className="dc-input font-mono text-sm"
            />
            <span className="mt-1 block text-xs text-ink-3">
              Everything up to and including the version prefix. The bridge appends{' '}
              <code className="rounded bg-muted px-1 font-mono">/outsource-lead</code>.
            </span>
          </label>

          <label className="dc-label">
            <span className="dc-label-text">
              CRM API key{' '}
              {cfg?.apiKeyConfigured ? (
                <span className="font-normal text-brand-ink">(saved)</span>
              ) : null}
            </span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={!props.canEdit}
              placeholder={cfg?.apiKeyConfigured ? 'Leave blank to keep existing' : 'apikey value from the CRM'}
              className="dc-input font-mono text-sm"
            />
            <span className="mt-1 block text-xs text-ink-3">
              In the CRM: Settings → API → pick the lead source → copy the{' '}
              <code className="rounded bg-muted px-1 font-mono">apikey</code> out of the generated
              cURL. It already carries the company and lead source, so nothing else is needed here.
            </span>
          </label>

          <label className="dc-label">
            <span className="dc-label-text">Which conversations to push</span>
            <select
              value={pushMode}
              onChange={(e) => setPushMode(e.target.value as CrmBridgePushMode)}
              disabled={!props.canEdit}
              className="dc-input text-sm"
            >
              <option value="ad_only">Ad leads only — conversations started from a Meta ad</option>
              <option value="all_inbound">Every new conversation</option>
            </select>
            <span className="mt-1 block text-xs text-ink-3">
              Ad leads only is the safer default: organic chats and support messages stay out of the
              CRM&apos;s lead pipeline.
            </span>
          </label>

          <label className="dc-label">
            <span className="dc-label-text">Fallback campaign name (optional)</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={!props.canEdit}
              placeholder="WhatsApp"
              className="dc-input text-sm"
            />
            <span className="mt-1 block text-xs text-ink-3">
              Used when a conversation has no ad headline of its own.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void onTest()}
              disabled={!props.canEdit || busy || !cfg?.apiKeyConfigured}
              className="dc-btn"
            >
              {test.isPending ? 'Testing…' : 'Send test lead'}
            </button>
            <button
              type="submit"
              disabled={!props.canEdit || busy}
              className="dc-btn dc-btn-primary ml-auto"
            >
              {upsert.isPending ? 'Saving…' : 'Save CRM settings'}
            </button>
          </div>
        </form>
      </WorkspaceCard>

      {cfg?.configured ? (
        <WorkspaceCard title="Delivery">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-[0.06em] text-ink-3">
                Leads pushed
              </dt>
              <dd className="mt-1 text-lg font-semibold text-ink-1">{cfg.totalPushed}</dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-[0.06em] text-ink-3">
                Failures
              </dt>
              <dd className="mt-1 text-lg font-semibold text-ink-1">{cfg.totalFailed}</dd>
            </div>
            <div>
              <dt className="text-2xs font-semibold uppercase tracking-[0.06em] text-ink-3">
                Last push
              </dt>
              <dd className={`mt-1 text-sm font-medium ${statusTone(cfg.lastPushStatus)}`}>
                {cfg.lastPushAt ? new Date(cfg.lastPushAt).toLocaleString() : 'Never'}
                {cfg.lastPushStatus ? ` · ${cfg.lastPushStatus}` : ''}
              </dd>
            </div>
          </dl>

          {cfg.lastPushError ? (
            <div className="mt-3.5 rounded-card border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
              <span className="font-semibold">Last error:</span> {cfg.lastPushError}
            </div>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              onClick={() => void onDisconnect()}
              disabled={!props.canEdit || busy}
              className="dc-btn-link text-rose-600 dark:text-rose-400"
            >
              Disconnect CRM
            </button>
          </div>
        </WorkspaceCard>
      ) : null}

      <WorkspaceCard>
        <CardNote>
          The ad a lead came from is only sent by Meta on the very first message of a conversation,
          so it is captured once and stored on the chat. Repeat enquiries from the same number are
          de-duplicated by the CRM itself, not here.
        </CardNote>
      </WorkspaceCard>
    </div>
  );
}
