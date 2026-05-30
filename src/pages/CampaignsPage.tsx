import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  useCampaignsQuery,
  useCampaignActionMutation,
  useCreateCampaignMutation,
  useContactGroupsQuery,
  useTemplatesQuery,
  useWhatsappNumbersQuery,
  useWorkspaceSummaryQuery,
} from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { WhatsAppMessagePreview } from '../components/WhatsAppMessagePreview.tsx';
import { WorkspaceAlertError, WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';
import { WORKSPACE_PAGE_BTN_CLASS } from '../lib/workspaceUi.ts';
import { visibleWhatsappSenders } from '../lib/visibleSenders.ts';

function toIsoOrUndefined(localDatetime: string): string | undefined {
  const s = localDatetime.trim();
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function CampaignsPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [whatsappNumberId, setWhatsappNumberId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [scheduledLocal, setScheduledLocal] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const q = useCampaignsQuery(page);
  const summary = useWorkspaceSummaryQuery();
  const numbers = useWhatsappNumbersQuery();
  const senders = useMemo(() => visibleWhatsappSenders(numbers.data), [numbers.data]);
  const templates = useTemplatesQuery();
  const groups = useContactGroupsQuery();
  const create = useCreateCampaignMutation();
  const action = useCampaignActionMutation();

  const canManage = workspaceRole === 'company_admin';

  useEffect(() => {
    if (whatsappNumberId) return;
    const preferred =
      summary.data?.defaultWhatsappNumberId ??
      senders.find((n) => n.isDefault)?._id ??
      senders[0]?._id;
    if (preferred) setWhatsappNumberId(preferred);
  }, [senders, summary.data?.defaultWhatsappNumberId, whatsappNumberId]);

  const selectedTemplate = useMemo(
    () => (templates.data ?? []).find((t) => t._id === templateId),
    [templates.data, templateId],
  );

  const sortedCampaigns = useMemo(
    () => [...(q.data?.data ?? [])].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [q.data?.data],
  );

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await create.mutateAsync({
        name,
        whatsappNumberId,
        templateId: templateId || undefined,
        contactGroupIds: groupId ? [groupId] : undefined,
        scheduledAt: toIsoOrUndefined(scheduledLocal),
      });
      setName('');
      setScheduledLocal('');
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-4">
      <NeedsCompanyBanner />

      <WorkspaceIntro
        kicker="Engage"
        title="Campaigns"
        description="Create draft broadcasts tied to a WhatsApp sender and an optional template. Start when credits and Meta are configured—recipients come from the contact group you attach."
      />

      {canManage ? (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <WorkspaceCard title="New campaign">
            <form className="space-y-4" onSubmit={onCreate}>
              <label className="block text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Campaign name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  required
                  placeholder="Spring promo blast"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">WhatsApp number</span>
                <select
                  value={whatsappNumberId}
                  onChange={(e) => setWhatsappNumberId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  required
                >
                  <option value="">Select a sender…</option>
                  {senders.map((n) => (
                    <option key={n._id} value={n._id}>
                      {n.phoneNumber}
                      {n.friendlyName ? ` (${n.friendlyName})` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-1">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Template</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">Required before you start the campaign</span>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    required
                  >
                    <option value="">Select a template…</option>
                    {(templates.data ?? []).map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm sm:col-span-1">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Contact group</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">Who receives this campaign</span>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="">— None —</option>
                    {(groups.data ?? []).map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name} ({g.contactIds?.length ?? 0})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Schedule (optional)</span>
                <input
                  type="datetime-local"
                  value={scheduledLocal}
                  onChange={(e) => setScheduledLocal(e.target.value)}
                  className="mt-1.5 w-full max-w-md rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </label>

              <button
                type="submit"
                disabled={create.isPending || !companyId}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {create.isPending ? 'Saving…' : 'Create draft'}
              </button>
            </form>
          </WorkspaceCard>

          <div className="lg:sticky lg:top-4">
            <WorkspaceCard title="Template preview">
              {!selectedTemplate ? (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
                  Select a template to see how the WhatsApp bubble will look (including image and placeholders
                  like {'{{name}}'}).
                </div>
              ) : (
                <>
                  <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                    Showing sample data. Real sends use each contact&apos;s name, phone, and email.
                  </p>
                  <WhatsAppMessagePreview
                    body={selectedTemplate.body}
                    imageUrl={selectedTemplate.imageUrl}
                    showRawPlaceholders={false}
                    caption={selectedTemplate.name}
                  />
                </>
              )}
            </WorkspaceCard>
          </div>
        </div>
      ) : (
        <WorkspaceCard>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Only company admins create or control campaigns.
          </p>
        </WorkspaceCard>
      )}

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {canManage && summary.data && !summary.data.metaReadyForCampaigns ? (
        <div className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-200">
          <p className="font-medium">Complete Meta setup before starting campaigns</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
            {(summary.data.metaSetupIssues.length > 0
              ? summary.data.metaSetupIssues
              : ['Open Settings and finish Meta WhatsApp configuration']
            ).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!companyId ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace.</p>
      ) : q.isLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : q.isError ? (
        <WorkspaceAlertError>Failed to load campaigns.</WorkspaceAlertError>
      ) : sortedCampaigns.length === 0 ? (
        <WorkspaceCard title="Your campaigns">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No campaigns yet. Create a draft above.</p>
        </WorkspaceCard>
      ) : (
        <WorkspaceCard title="Your campaigns">
          <ul className="space-y-3">
            {sortedCampaigns.map((c) => (
              <li
                key={c._id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-gradient-to-r from-zinc-50/80 to-white px-4 py-4 dark:border-zinc-800 dark:from-zinc-900/50 dark:to-zinc-900/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-900 dark:text-white">{c.name}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    {c.status}
                    <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
                    sent {c.stats?.sent ?? 0} / {c.stats?.total ?? 0}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                      disabled={action.isPending}
                      onClick={() => void action.mutateAsync({ id: c._id, action: 'start' })}
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-zinc-600 dark:bg-zinc-950"
                      disabled={action.isPending}
                      onClick={() => void action.mutateAsync({ id: c._id, action: 'pause' })}
                    >
                      Pause
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-zinc-600 dark:bg-zinc-950"
                      disabled={action.isPending}
                      onClick={() => void action.mutateAsync({ id: c._id, action: 'resume' })}
                    >
                      Resume
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                      disabled={action.isPending}
                      onClick={() => void action.mutateAsync({ id: c._id, action: 'delete' })}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </WorkspaceCard>
      )}

      {q.data ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            className={WORKSPACE_PAGE_BTN_CLASS}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className={WORKSPACE_PAGE_BTN_CLASS}
            disabled={page * q.data.limit >= q.data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
          <span className="text-zinc-500 dark:text-zinc-400">
            Page {page} · {q.data.total} total
          </span>
        </div>
      ) : null}
    </div>
  );
}
