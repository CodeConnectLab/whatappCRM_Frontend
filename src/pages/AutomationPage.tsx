import { FormEvent, useMemo, useState } from 'react';
import {
  useAutoResponseMutations,
  useAutoResponsesQuery,
  useProductMutations,
  useProductsQuery,
  useQuickRepliesQuery,
  useQuickReplyMutations,
  useTemplatesQuery,
  useWhatsappNumbersQuery,
  type AutoResponseInput,
  type ProductInput,
} from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { IconBolt, IconClose, IconPlus, IconTag, IconTrash } from '../components/Icons.tsx';
import {
  CardNote,
  EmptyState,
  PageHeader,
  Tabs,
  WorkspaceAlert,
  WorkspaceAlertError,
  WorkspaceCard,
} from '../components/workspace/WorkspaceSurface.tsx';
import type { AutoResponseRule, AutoResponseTrigger, Product, QuickReply } from '../types/api.ts';

const TRIGGER_LABELS: Record<AutoResponseTrigger, string> = {
  first_inbound: 'First message from a new lead',
  every_inbound: 'Every message from the contact',
  keyword: 'Message contains a keyword',
  outside_hours: 'First message outside business hours',
  no_agent_reply: 'Nobody replied in time',
};

const THROTTLE_LABELS: Record<NonNullable<AutoResponseRule['throttle']>, string> = {
  once_per_chat: 'Once per conversation',
  once_per_day: 'At most once a day',
  always: 'Every time it matches',
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "09:30" ⇄ minutes-from-midnight, the shape the rule stores. */
function toTimeInput(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function fromTimeInput(value: string): number {
  const [h, m] = value.split(':');
  return Number(h ?? 0) * 60 + Number(m ?? 0);
}

function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------- product form */

function ProductForm(props: { product?: Product; onDone: () => void }) {
  const { create, update } = useProductMutations();
  const numbersQ = useWhatsappNumbersQuery();
  const p = props.product;

  const [name, setName] = useState(p?.name ?? '');
  const [description, setDescription] = useState(p?.description ?? '');
  const [keywords, setKeywords] = useState((p?.keywords ?? []).join(', '));
  const [adIds, setAdIds] = useState((p?.adIds ?? []).join(', '));
  const [campaignNames, setCampaignNames] = useState((p?.campaignNames ?? []).join(', '));
  const [whatsappNumberIds, setWhatsappNumberIds] = useState<string[]>(p?.whatsappNumberIds ?? []);
  const [crmLabel, setCrmLabel] = useState(p?.crmLabel ?? '');
  const [active, setActive] = useState(p?.active ?? true);
  const [err, setErr] = useState<string | null>(null);

  const pending = create.isPending || update.isPending;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const body: ProductInput = {
      name,
      description: description || undefined,
      keywords: splitList(keywords),
      adIds: splitList(adIds),
      campaignNames: splitList(campaignNames),
      whatsappNumberIds,
      crmLabel: crmLabel || undefined,
      active,
    };
    try {
      if (p) await update.mutateAsync({ id: p._id, ...body });
      else await create.mutateAsync(body);
      props.onDone();
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 p-4">
      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      <label className="dc-label">
        <span className="dc-label-text">Product name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="dc-input"
          placeholder="Solar Rooftop 3kW"
          required
        />
      </label>

      <label className="dc-label">
        <span className="dc-label-text">Description (optional)</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="dc-input"
          placeholder="Residential rooftop solar, 3kW package"
        />
      </label>

      <label className="dc-label">
        <span className="dc-label-text">Meta ad / post IDs</span>
        <input
          value={adIds}
          onChange={(e) => setAdIds(e.target.value)}
          className="dc-input font-mono text-sm"
          placeholder="120210000000000, 120220000000000"
        />
        <span className="text-xs text-ink-4">
          Strongest signal — Meta sends the ad ID with the lead's first message. Comma separated.
        </span>
      </label>

      <label className="dc-label">
        <span className="dc-label-text">Ad headline contains</span>
        <input
          value={campaignNames}
          onChange={(e) => setCampaignNames(e.target.value)}
          className="dc-input"
          placeholder="Rooftop Solar, Solar Subsidy"
        />
        <span className="text-xs text-ink-4">Used when the ad ID is unknown but the creative is named.</span>
      </label>

      <label className="dc-label">
        <span className="dc-label-text">Keywords in the lead's message</span>
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="dc-input"
          placeholder="solar, rooftop, panel"
        />
      </label>

      {(numbersQ.data ?? []).length ? (
        <div className="dc-label">
          <span className="dc-label-text">Dedicated WhatsApp senders (optional)</span>
          <div className="flex flex-col gap-1.5">
            {(numbersQ.data ?? []).map((n) => (
              <label key={n._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="dc-checkbox"
                  checked={whatsappNumberIds.includes(n._id)}
                  onChange={(e) =>
                    setWhatsappNumberIds((prev) =>
                      e.target.checked ? [...prev, n._id] : prev.filter((id) => id !== n._id),
                    )
                  }
                />
                <span className="text-base text-ink">{n.friendlyName ?? n.phoneNumber}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <label className="dc-label">
        <span className="dc-label-text">Label sent to your CRM (optional)</span>
        <input
          value={crmLabel}
          onChange={(e) => setCrmLabel(e.target.value)}
          className="dc-input"
          placeholder="Defaults to the product name"
        />
      </label>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          className="dc-checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <span className="text-base text-ink">Active — match new leads against this product</span>
      </label>

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="dc-btn dc-btn-primary flex-1">
          {pending ? 'Saving…' : p ? 'Save product' : 'Create product'}
        </button>
        <button type="button" className="dc-btn" onClick={props.onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ----------------------------------------------------------- quick replies */

function QuickReplyForm(props: { reply?: QuickReply; onDone: () => void }) {
  const { create, update } = useQuickReplyMutations();
  const r = props.reply;

  const [title, setTitle] = useState(r?.title ?? '');
  const [body, setBody] = useState(r?.body ?? '');
  const [shortcut, setShortcut] = useState(r?.shortcut ?? '');
  const [err, setErr] = useState<string | null>(null);
  const pending = create.isPending || update.isPending;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      if (r) await update.mutateAsync({ id: r._id, title, body, shortcut: shortcut || null });
      else await create.mutateAsync({ title, body, ...(shortcut ? { shortcut } : {}) });
      props.onDone();
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 p-4">
      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      <WorkspaceAlert tone="neutral">
        A saved reply is your own text, not a WhatsApp template — it needs no Meta
        approval, but it only reaches a contact within 24 hours of their last message.
      </WorkspaceAlert>

      <label className="dc-label">
        <span className="dc-label-text">Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="dc-input"
          placeholder="Bulk pricing"
          required
        />
      </label>

      <label className="dc-label">
        <span className="dc-label-text">Message</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="dc-textarea"
          placeholder="Bulk orders above 50 units get 25%. Shall I share the price list?"
          required
        />
      </label>

      <label className="dc-label">
        <span className="dc-label-text">Shortcut (optional)</span>
        <input
          value={shortcut}
          onChange={(e) => setShortcut(e.target.value)}
          className="dc-input font-mono"
          placeholder="price"
          maxLength={40}
        />
        <span className="text-xs text-ink-4">Shown in the composer's picker as /price.</span>
      </label>

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="dc-btn dc-btn-primary flex-1">
          {pending ? 'Saving…' : r ? 'Save reply' : 'Create reply'}
        </button>
        <button type="button" className="dc-btn" onClick={props.onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* --------------------------------------------------------- auto-response form */

function AutoResponseForm(props: { rule?: AutoResponseRule; onDone: () => void }) {
  const { create, update, preview } = useAutoResponseMutations();
  const productsQ = useProductsQuery();
  const templatesQ = useTemplatesQuery();
  const numbersQ = useWhatsappNumbersQuery();
  const r = props.rule;

  const [name, setName] = useState(r?.name ?? '');
  const [enabled, setEnabled] = useState(r?.enabled ?? true);
  const [priority, setPriority] = useState(String(r?.priority ?? 100));
  const [trigger, setTrigger] = useState<AutoResponseTrigger>(r?.trigger ?? 'first_inbound');
  const [productId, setProductId] = useState(r?.productId ?? '');
  const [keywords, setKeywords] = useState((r?.keywords ?? []).join(', '));
  const [adIds, setAdIds] = useState((r?.adIds ?? []).join(', '));
  const [campaignNames, setCampaignNames] = useState((r?.campaignNames ?? []).join(', '));
  const [whatsappNumberIds, setWhatsappNumberIds] = useState<string[]>(r?.whatsappNumberIds ?? []);
  const [adLeadsOnly, setAdLeadsOnly] = useState(r?.adLeadsOnly ?? false);
  const [actionType, setActionType] = useState<'text' | 'template'>(r?.actionType ?? 'text');
  const [body, setBody] = useState(r?.body ?? '');
  const [templateId, setTemplateId] = useState(r?.templateId ?? '');
  const [delaySeconds, setDelaySeconds] = useState(String(r?.delaySeconds ?? 0));
  const [throttle, setThrottle] = useState<NonNullable<AutoResponseRule['throttle']>>(
    r?.throttle ?? 'once_per_chat',
  );
  const [delayMinutes, setDelayMinutes] = useState(String(r?.delayMinutes ?? 15));

  const [hoursOn, setHoursOn] = useState(Boolean(r?.businessHours));
  const [timezone, setTimezone] = useState(
    r?.businessHours?.timezone ??
      // The workspace's own zone is a better default than a hardcoded one.
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      'Asia/Kolkata',
  );
  const [startMinute, setStartMinute] = useState(r?.businessHours?.startMinute ?? 9 * 60);
  const [endMinute, setEndMinute] = useState(r?.businessHours?.endMinute ?? 19 * 60);
  const [weekdays, setWeekdays] = useState<number[]>(
    r?.businessHours?.weekdays ?? [1, 2, 3, 4, 5, 6],
  );

  const [err, setErr] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('');
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const pending = create.isPending || update.isPending;
  const approvedTemplates = (templatesQ.data ?? []).filter((t) => t.status === 'APPROVED');

  // `outside_hours` reads the window as its trigger, so it cannot be switched off there.
  const hoursRequired = trigger === 'outside_hours';

  function buildBody(): AutoResponseInput {
    return {
      name,
      enabled,
      priority: Number(priority) || 100,
      trigger,
      productId: productId || null,
      keywords: splitList(keywords),
      adIds: splitList(adIds),
      campaignNames: splitList(campaignNames),
      whatsappNumberIds,
      adLeadsOnly,
      actionType,
      ...(actionType === 'text' ? { body } : {}),
      templateId: actionType === 'template' ? templateId || null : null,
      delaySeconds: Number(delaySeconds) || 0,
      delayMinutes: Number(delayMinutes) || 15,
      throttle,
      businessHours:
        hoursOn || hoursRequired
          ? { timezone, startMinute, endMinute, weekdays }
          : null,
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const payload = buildBody();
      if (r) await update.mutateAsync({ id: r._id, ...payload });
      else await create.mutateAsync(payload);
      props.onDone();
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onPreview() {
    setPreviewResult(null);
    try {
      const res = await preview.mutateAsync({
        messageBody: previewText,
        ...(productId ? { productId } : {}),
      });
      setPreviewResult(
        res.match
          ? `“${res.match.name}” would answer this lead.`
          : 'No rule matches this lead — it would get no automatic reply.',
      );
    } catch (er) {
      setPreviewResult(apiErrorMessage(er));
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 p-4">
      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      <label className="dc-label">
        <span className="dc-label-text">Rule name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="dc-input"
          placeholder="Solar ad — instant welcome"
          required
        />
      </label>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="dc-label">
          <span className="dc-label-text">When</span>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as AutoResponseTrigger)}
            className="dc-select"
          >
            {(Object.keys(TRIGGER_LABELS) as AutoResponseTrigger[]).map((t) => (
              <option key={t} value={t}>
                {TRIGGER_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="dc-label">
          <span className="dc-label-text">Priority</span>
          <input
            type="number"
            min={0}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="dc-input"
          />
          <span className="text-xs text-ink-4">Lower runs first. The first matching rule wins.</span>
        </label>
      </div>

      {trigger === 'no_agent_reply' ? (
        <WorkspaceAlert tone="warn">
          This trigger needs a background sweep that is not running yet, so the rule will be saved
          but will not fire. Everything else works today.
        </WorkspaceAlert>
      ) : null}

      <div className="flex flex-col gap-2 rounded-card border border-line bg-subtle p-3">
        <span className="text-sm font-medium text-ink">Only for these leads</span>
        <CardNote>Leave a field empty to ignore it. Everything set must match.</CardNote>

        <label className="dc-label">
          <span className="dc-label-text">Product</span>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="dc-select"
          >
            <option value="">Any product</option>
            {(productsQ.data ?? []).map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="dc-label">
          <span className="dc-label-text">
            Keywords {trigger === 'keyword' ? '(required)' : '(optional)'}
          </span>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="dc-input"
            placeholder="price, cost, demo"
            required={trigger === 'keyword'}
          />
        </label>

        <label className="dc-label">
          <span className="dc-label-text">Meta ad / post IDs</span>
          <input
            value={adIds}
            onChange={(e) => setAdIds(e.target.value)}
            className="dc-input font-mono text-sm"
            placeholder="120210000000000"
          />
        </label>

        <label className="dc-label">
          <span className="dc-label-text">Ad headline contains</span>
          <input
            value={campaignNames}
            onChange={(e) => setCampaignNames(e.target.value)}
            className="dc-input"
            placeholder="Monsoon Offer"
          />
        </label>

        {(numbersQ.data ?? []).length ? (
          <div className="dc-label">
            <span className="dc-label-text">WhatsApp senders</span>
            <div className="flex flex-col gap-1.5">
              {(numbersQ.data ?? []).map((n) => (
                <label key={n._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="dc-checkbox"
                    checked={whatsappNumberIds.includes(n._id)}
                    onChange={(e) =>
                      setWhatsappNumberIds((prev) =>
                        e.target.checked ? [...prev, n._id] : prev.filter((id) => id !== n._id),
                      )
                    }
                  />
                  <span className="text-base text-ink">{n.friendlyName ?? n.phoneNumber}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            className="dc-checkbox"
            checked={adLeadsOnly}
            onChange={(e) => setAdLeadsOnly(e.target.checked)}
          />
          <span className="text-base text-ink">Only leads that came from a paid ad</span>
        </label>
      </div>

      <div className="flex flex-col gap-2 rounded-card border border-line bg-subtle p-3">
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            className="dc-checkbox"
            checked={hoursOn || hoursRequired}
            disabled={hoursRequired}
            onChange={(e) => setHoursOn(e.target.checked)}
          />
          <span className="text-base text-ink">
            {hoursRequired ? 'Business hours (this trigger fires outside them)' : 'Limit to business hours'}
          </span>
        </label>

        {hoursOn || hoursRequired ? (
          <div className="flex flex-col gap-2.5">
            <div className="grid gap-2.5 sm:grid-cols-3">
              <label className="dc-label">
                <span className="dc-label-text">From</span>
                <input
                  type="time"
                  value={toTimeInput(startMinute)}
                  onChange={(e) => setStartMinute(fromTimeInput(e.target.value))}
                  className="dc-input"
                />
              </label>
              <label className="dc-label">
                <span className="dc-label-text">To</span>
                <input
                  type="time"
                  value={toTimeInput(endMinute)}
                  onChange={(e) => setEndMinute(fromTimeInput(e.target.value))}
                  className="dc-input"
                />
              </label>
              <label className="dc-label">
                <span className="dc-label-text">Time zone</span>
                <input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="dc-input"
                  placeholder="Asia/Kolkata"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAY_LABELS.map((label, day) => (
                <button
                  key={label}
                  type="button"
                  className={`dc-pill ${weekdays.includes(day) ? 'dc-pill-active' : ''}`}
                  onClick={() =>
                    setWeekdays((prev) =>
                      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
                    )
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2.5 rounded-card border border-line bg-subtle p-3">
        <span className="text-sm font-medium text-ink">What to send</span>

        <label className="dc-label">
          <span className="dc-label-text">Type</span>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as 'text' | 'template')}
            className="dc-select"
          >
            <option value="text">Plain message</option>
            <option value="template">Approved template</option>
          </select>
          <span className="text-xs text-ink-4">
            A plain message only reaches the contact within 24 hours of their last one — fine for a
            welcome. Outside that window WhatsApp requires an approved template.
          </span>
        </label>

        {actionType === 'text' ? (
          <label className="dc-label">
            <span className="dc-label-text">Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="dc-textarea"
              placeholder="Hi {{name}}, thanks for your interest in {{product}}! {{agent}} will call you shortly."
              required={actionType === 'text'}
            />
            <span className="text-xs text-ink-4">
              Placeholders: {'{{name}}'} {'{{phone}}'} {'{{email}}'} {'{{product}}'} {'{{agent}}'}
            </span>
          </label>
        ) : (
          <label className="dc-label">
            <span className="dc-label-text">Template</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="dc-select"
              required={actionType === 'template'}
            >
              <option value="">Select an approved template…</option>
              {approvedTemplates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            {!approvedTemplates.length ? (
              <span className="text-xs text-danger">
                No approved templates yet — submit one on the Templates page first.
              </span>
            ) : null}
          </label>
        )}

        <div className="grid gap-2.5 sm:grid-cols-2">
          <label className="dc-label">
            <span className="dc-label-text">Delay before sending (seconds)</span>
            <input
              type="number"
              min={0}
              max={60}
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(e.target.value)}
              className="dc-input"
            />
          </label>
          <label className="dc-label">
            <span className="dc-label-text">How often</span>
            <select
              value={throttle}
              onChange={(e) =>
                setThrottle(e.target.value as NonNullable<AutoResponseRule['throttle']>)
              }
              className="dc-select"
            >
              {(Object.keys(THROTTLE_LABELS) as NonNullable<AutoResponseRule['throttle']>[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {THROTTLE_LABELS[t]}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        {trigger === 'no_agent_reply' ? (
          <label className="dc-label">
            <span className="dc-label-text">Minutes of silence before firing</span>
            <input
              type="number"
              min={1}
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(e.target.value)}
              className="dc-input"
            />
          </label>
        ) : null}
      </div>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          className="dc-checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="text-base text-ink">Enabled</span>
      </label>

      {/* Dry run against the live rule set, so an operator can check ordering before an
          ad points real money at it. Saves the rule first if it is new. */}
      <div className="flex flex-col gap-2 rounded-card border border-dashed border-line p-3">
        <span className="text-sm font-medium text-ink">Test which rule would answer</span>
        <div className="flex gap-2">
          <input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="dc-input"
            placeholder="What would the lead say? e.g. “price for solar”"
          />
          <button
            type="button"
            className="dc-btn shrink-0"
            disabled={preview.isPending}
            onClick={() => void onPreview()}
          >
            {preview.isPending ? 'Checking…' : 'Check'}
          </button>
        </div>
        {previewResult ? <CardNote>{previewResult}</CardNote> : null}
        <span className="text-xs text-ink-4">Checks the rules already saved, not unsaved edits.</span>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="dc-btn dc-btn-primary flex-1">
          {pending ? 'Saving…' : r ? 'Save rule' : 'Create rule'}
        </button>
        <button type="button" className="dc-btn" onClick={props.onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------- page */

type Tab = 'responses' | 'products' | 'quick';

function Drawer(props: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="dc-scrim" onClick={props.onClose}>
      <div className="dc-drawer overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-14 shrink-0 items-center border-b border-line px-4">
          <span className="text-md font-semibold text-ink">{props.title}</span>
          <button
            type="button"
            className="ml-auto rounded-control p-1.5 text-ink-4 hover:bg-line-soft"
            onClick={props.onClose}
            aria-label="Close"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

export function AutomationPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const canManage = workspaceRole === 'company_admin';

  const [tab, setTab] = useState<Tab>('responses');
  const [editingRule, setEditingRule] = useState<AutoResponseRule | 'new' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | 'new' | null>(null);
  const [editingQuick, setEditingQuick] = useState<QuickReply | 'new' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const rulesQ = useAutoResponsesQuery();
  const productsQ = useProductsQuery();
  const quickQ = useQuickRepliesQuery();
  const { update: updateRule, remove: removeRule } = useAutoResponseMutations();
  const { remove: removeProduct } = useProductMutations();
  const { remove: removeQuick } = useQuickReplyMutations();

  const productNames = useMemo(
    () => new Map((productsQ.data ?? []).map((p) => [p._id, p.name])),
    [productsQ.data],
  );

  async function run(fn: () => Promise<unknown>) {
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(apiErrorMessage(e));
    }
  }

  if (!companyId) {
    return (
      <div className="flex flex-col gap-4">
        <NeedsCompanyBanner />
        <CardNote>Select a workspace to configure automation.</CardNote>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="flex flex-col gap-[18px]">
        <PageHeader title="Automation" />
        <WorkspaceCard>
          <CardNote>Only company admins can configure products and auto-responses.</CardNote>
        </WorkspaceCard>
      </div>
    );
  }

  const rules = rulesQ.data ?? [];
  const products = productsQ.data ?? [];
  const quickReplies = quickQ.data ?? [];

  return (
    <div className="flex flex-col gap-[18px]">
      <PageHeader
        title="Automation"
        description="Answer new leads the moment they arrive, and tell the system which product each lead is about."
        actions={
          <button
            type="button"
            className="dc-btn dc-btn-primary"
            onClick={() => {
              if (tab === 'responses') setEditingRule('new');
              else if (tab === 'products') setEditingProduct('new');
              else setEditingQuick('new');
            }}
          >
            <IconPlus className="h-3.5 w-3.5" />
            {tab === 'responses'
              ? 'New auto-response'
              : tab === 'products'
                ? 'New product'
                : 'New saved reply'}
          </button>
        }
      />

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      <Tabs
        items={[
          { key: 'responses' as Tab, label: 'Auto responses', count: rules.length },
          { key: 'products' as Tab, label: 'Products', count: products.length },
          { key: 'quick' as Tab, label: 'Saved replies', count: quickReplies.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'responses' ? (
        <WorkspaceCard flush>
          {rulesQ.isLoading ? (
            <div className="p-4">
              <CardNote>Loading…</CardNote>
            </div>
          ) : !rules.length ? (
            <EmptyState
              title="No auto-responses yet"
              description="Add one so a new lead gets an answer in seconds instead of waiting for an agent."
              action={
                <button
                  type="button"
                  className="dc-btn dc-btn-primary"
                  onClick={() => setEditingRule('new')}
                >
                  <IconBolt className="h-3.5 w-3.5" />
                  Create the first rule
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="dc-table dc-table-hover min-w-[860px]">
                <thead className="bg-muted">
                  <tr>
                    <th className="pl-4">Rule</th>
                    <th>Trigger</th>
                    <th>Scope</th>
                    <th>Sends</th>
                    <th>Sent</th>
                    <th className="pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule._id}>
                      <td className="pl-4">
                        <div className="flex min-w-0 flex-col gap-px">
                          <span className="truncate font-medium text-ink">{rule.name}</span>
                          <span className="text-xs text-ink-4">priority {rule.priority ?? 100}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-ink-2">{TRIGGER_LABELS[rule.trigger]}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {rule.productId ? (
                            <span className="dc-badge">{productNames.get(rule.productId) ?? 'Product'}</span>
                          ) : null}
                          {rule.keywords?.length ? (
                            <span className="dc-badge">{rule.keywords.length} keywords</span>
                          ) : null}
                          {rule.adIds?.length ? (
                            <span className="dc-badge">{rule.adIds.length} ads</span>
                          ) : null}
                          {rule.adLeadsOnly ? <span className="dc-badge dc-badge-accent">Ad only</span> : null}
                          {rule.businessHours ? <span className="dc-badge">Hours</span> : null}
                          {!rule.productId &&
                          !rule.keywords?.length &&
                          !rule.adIds?.length &&
                          !rule.adLeadsOnly &&
                          !rule.businessHours ? (
                            <span className="text-sm text-ink-4">All leads</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-ink-2">
                          {rule.actionType === 'template' ? 'Template' : 'Message'}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col gap-px">
                          <span className="tabular-nums text-ink">{rule.stats?.sent ?? 0}</span>
                          {rule.stats?.failed ? (
                            <span
                              className="text-2xs text-danger"
                              title={rule.stats.lastError ?? 'See activity log'}
                            >
                              {rule.stats.failed} failed
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="pr-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            className={`dc-pill ${rule.enabled ? 'dc-pill-active' : ''}`}
                            disabled={updateRule.isPending}
                            onClick={() =>
                              void run(() =>
                                updateRule.mutateAsync({ id: rule._id, enabled: !rule.enabled }),
                              )
                            }
                          >
                            {rule.enabled ? 'On' : 'Off'}
                          </button>
                          <button
                            type="button"
                            className="dc-btn dc-btn-xs"
                            onClick={() => setEditingRule(rule)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="dc-btn dc-btn-xs dc-btn-danger"
                            disabled={removeRule.isPending}
                            onClick={() => {
                              if (!window.confirm(`Delete “${rule.name}”?`)) return;
                              void run(() => removeRule.mutateAsync(rule._id));
                            }}
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspaceCard>
      ) : tab === 'products' ? (
        <WorkspaceCard flush>
          {productsQ.isLoading ? (
            <div className="p-4">
              <CardNote>Loading…</CardNote>
            </div>
          ) : !products.length ? (
            <EmptyState
              title="No products yet"
              description="A product ties ad IDs, headlines and keywords together, so leads get the right greeting and your CRM gets a meaningful label."
              action={
                <button
                  type="button"
                  className="dc-btn dc-btn-primary"
                  onClick={() => setEditingProduct('new')}
                >
                  <IconTag className="h-3.5 w-3.5" />
                  Add the first product
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="dc-table dc-table-hover min-w-[760px]">
                <thead className="bg-muted">
                  <tr>
                    <th className="pl-4">Product</th>
                    <th>Ad IDs</th>
                    <th>Keywords</th>
                    <th>CRM label</th>
                    <th>Status</th>
                    <th className="pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td className="pl-4">
                        <div className="flex min-w-0 flex-col gap-px">
                          <span className="truncate font-medium text-ink">{p.name}</span>
                          {p.description ? (
                            <span className="truncate text-xs text-ink-4">{p.description}</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className="tabular-nums text-sm text-ink-2">{p.adIds?.length ?? 0}</span>
                      </td>
                      <td>
                        <span className="max-w-[200px] truncate text-sm text-ink-2">
                          {(p.keywords ?? []).join(', ') || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-ink-2">{p.crmLabel || p.name}</span>
                      </td>
                      <td>
                        <span className={`dc-badge ${p.active ? 'dc-badge-brand' : ''}`}>
                          {p.active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="pr-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            className="dc-btn dc-btn-xs"
                            onClick={() => setEditingProduct(p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="dc-btn dc-btn-xs dc-btn-danger"
                            disabled={removeProduct.isPending}
                            onClick={() => {
                              if (!window.confirm(`Delete “${p.name}”?`)) return;
                              void run(() => removeProduct.mutateAsync(p._id));
                            }}
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspaceCard>
      ) : (
        <WorkspaceCard flush>
          {quickQ.isLoading ? (
            <div className="p-4">
              <CardNote>Loading…</CardNote>
            </div>
          ) : !quickReplies.length ? (
            <EmptyState
              title="No saved replies yet"
              description="Answers your agents type over and over — pricing, timings, address — kept one keystroke away in the composer."
              action={
                <button
                  type="button"
                  className="dc-btn dc-btn-primary"
                  onClick={() => setEditingQuick('new')}
                >
                  <IconBolt className="h-3.5 w-3.5" />
                  Add the first reply
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="dc-table dc-table-hover min-w-[680px]">
                <thead className="bg-muted">
                  <tr>
                    <th className="pl-4">Reply</th>
                    <th>Shortcut</th>
                    <th>Used</th>
                    <th className="pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quickReplies.map((q) => (
                    <tr key={q._id}>
                      <td className="pl-4">
                        <div className="flex min-w-0 flex-col gap-px">
                          <span className="truncate font-medium text-ink">{q.title}</span>
                          <span className="line-clamp-1 max-w-[380px] text-xs text-ink-4">
                            {q.body}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm text-ink-2">
                          {q.shortcut ? `/${q.shortcut}` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="tabular-nums text-ink">{q.useCount ?? 0}</span>
                      </td>
                      <td className="pr-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            className="dc-btn dc-btn-xs"
                            onClick={() => setEditingQuick(q)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="dc-btn dc-btn-xs dc-btn-danger"
                            disabled={removeQuick.isPending}
                            onClick={() => {
                              if (!window.confirm(`Delete “${q.title}”?`)) return;
                              void run(() => removeQuick.mutateAsync(q._id));
                            }}
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspaceCard>
      )}

      {editingQuick ? (
        <Drawer
          title={editingQuick === 'new' ? 'New saved reply' : 'Edit saved reply'}
          onClose={() => setEditingQuick(null)}
        >
          <QuickReplyForm
            {...(editingQuick !== 'new' ? { reply: editingQuick } : {})}
            onDone={() => setEditingQuick(null)}
          />
        </Drawer>
      ) : null}

      {editingRule ? (
        <Drawer
          title={editingRule === 'new' ? 'New auto-response' : 'Edit auto-response'}
          onClose={() => setEditingRule(null)}
        >
          <AutoResponseForm
            {...(editingRule !== 'new' ? { rule: editingRule } : {})}
            onDone={() => setEditingRule(null)}
          />
        </Drawer>
      ) : null}

      {editingProduct ? (
        <Drawer
          title={editingProduct === 'new' ? 'New product' : 'Edit product'}
          onClose={() => setEditingProduct(null)}
        >
          <ProductForm
            {...(editingProduct !== 'new' ? { product: editingProduct } : {})}
            onDone={() => setEditingProduct(null)}
          />
        </Drawer>
      ) : null}
    </div>
  );
}
