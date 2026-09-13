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
import {
  CardNote,
  PageHeader,
  WorkspaceAlertError,
  WorkspaceCard,
} from '../components/workspace/WorkspaceSurface.tsx';
import { IconClose, IconPlus } from '../components/Icons.tsx';
import { visibleWhatsappSenders } from '../lib/visibleSenders.ts';

function toIsoOrUndefined(localDatetime: string): string | undefined {
  const s = localDatetime.trim();
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** Maps a backend status string onto one of the design's badge tones. */
function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'running' || s === 'completed' || s === 'sent') return 'dc-badge dc-badge-brand';
  if (s === 'scheduled' || s === 'paused') return 'dc-badge dc-badge-warn';
  if (s === 'failed' || s === 'cancelled') return 'dc-badge dc-badge-danger';
  return 'dc-badge';
}

export function CampaignsPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const [page, setPage] = useState(1);
  const [composerOpen, setComposerOpen] = useState(false);
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
      summary.data?.defaultWhatsappNumberId ?? senders.find((n) => n.isDefault)?._id ?? senders[0]?._id;
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

  const groupNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups.data ?? []) map.set(g._id, g.name);
    return map;
  }, [groups.data]);

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
      setComposerOpen(false);
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <NeedsCompanyBanner />

      <PageHeader
        title="Campaigns"
        description="One-time broadcasts tied to a WhatsApp sender and an approved template."
        actions={
          canManage ? (
            <button
              type="button"
              className="dc-btn dc-btn-primary"
              onClick={() => setComposerOpen((v) => !v)}
              disabled={!companyId}
            >
              {composerOpen ? <IconClose className="h-3.5 w-3.5" /> : <IconPlus className="h-3.5 w-3.5" />}
              {composerOpen ? 'Close' : 'New campaign'}
            </button>
          ) : null
        }
      />

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {canManage && summary.data && !summary.data.metaReadyForCampaigns ? (
        <div className="rounded-card border border-warn-line bg-warn-soft px-4 py-3 text-warn">
          <p className="text-base font-semibold">Complete Meta setup before starting campaigns</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            {(summary.data.metaSetupIssues.length > 0
              ? summary.data.metaSetupIssues
              : ['Open Settings and finish Meta WhatsApp configuration']
            ).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!canManage ? (
        <WorkspaceCard>
          <CardNote>Only company admins create or control campaigns.</CardNote>
        </WorkspaceCard>
      ) : null}

      {/* ---------------------------------------------------------- composer */}
      {canManage && composerOpen ? (
        <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
          <WorkspaceCard title="New campaign">
            <form className="flex flex-col gap-3.5" onSubmit={onCreate}>
              <label className="dc-label">
                <span className="dc-label-text">Campaign name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dc-input"
                  required
                  placeholder="Spring promo blast"
                />
              </label>

              <label className="dc-label">
                <span className="dc-label-text">WhatsApp sender</span>
                <select
                  value={whatsappNumberId}
                  onChange={(e) => setWhatsappNumberId(e.target.value)}
                  className="dc-select"
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

              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="dc-label">
                  <span className="dc-label-text">Template</span>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="dc-select"
                    required
                  >
                    <option value="">Select a template…</option>
                    {(templates.data ?? []).map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-ink-4">Required before you start the campaign</span>
                </label>
                <label className="dc-label">
                  <span className="dc-label-text">Contact group</span>
                  <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="dc-select">
                    <option value="">— None —</option>
                    {(groups.data ?? []).map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name} ({g.contactIds?.length ?? 0})
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-ink-4">Who receives this campaign</span>
                </label>
              </div>

              <label className="dc-label">
                <span className="dc-label-text">Schedule (optional)</span>
                <input
                  type="datetime-local"
                  value={scheduledLocal}
                  onChange={(e) => setScheduledLocal(e.target.value)}
                  className="dc-input max-w-xs"
                />
              </label>

              <div className="flex gap-2 border-t border-line-soft pt-3.5">
                <button type="button" className="dc-btn" onClick={() => setComposerOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending || !companyId}
                  className="dc-btn dc-btn-primary ml-auto px-5"
                >
                  {create.isPending ? 'Saving…' : 'Create draft'}
                </button>
              </div>
            </form>
          </WorkspaceCard>

          <WorkspaceCard title="Template preview" className="lg:sticky lg:top-4">
            {!selectedTemplate ? (
              <div className="rounded-card border border-dashed border-line bg-muted py-10 text-center text-base text-ink-3">
                Select a template to see the WhatsApp bubble, including image and placeholders like{' '}
                {'{{name}}'}.
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-ink-3">
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
      ) : null}

      {/* ------------------------------------------------------------- table */}
      <div className="dc-card">
        {!companyId ? (
          <div className="p-4">
            <CardNote>Select a workspace.</CardNote>
          </div>
        ) : q.isLoading ? (
          <div className="p-4">
            <CardNote>Loading…</CardNote>
          </div>
        ) : q.isError ? (
          <div className="p-4">
            <CardNote>Failed to load campaigns.</CardNote>
          </div>
        ) : !sortedCampaigns.length ? (
          <div className="p-4">
            <CardNote>No campaigns yet. Create a draft with “New campaign”.</CardNote>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dc-table dc-table-hover min-w-[720px]">
              <thead className="bg-muted">
                <tr>
                  <th className="pl-4">Campaign</th>
                  <th>Channel</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th className="text-right">Sent</th>
                  <th className="text-right">Failed</th>
                  <th className="pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCampaigns.map((c) => {
                  const audience = c.contactGroupIds?.length
                    ? c.contactGroupIds.map((id) => groupNameById.get(id) ?? 'Group').join(', ')
                    : c.contactIds?.length
                      ? `${c.contactIds.length} contacts`
                      : '—';
                  return (
                    <tr key={c._id}>
                      <td className="pl-4 font-medium">{c.name}</td>
                      <td>
                        <span className="dc-badge dc-badge-brand">WhatsApp</span>
                      </td>
                      <td className="text-sm text-ink-3">{audience}</td>
                      <td>
                        <span className={statusBadgeClass(c.status)}>{c.status}</span>
                      </td>
                      <td className="dc-num">
                        {c.stats?.sent ?? 0}
                        <span className="text-ink-4"> / {c.stats?.total ?? 0}</span>
                      </td>
                      <td className={`dc-num ${c.stats?.failed ? 'text-danger' : ''}`}>{c.stats?.failed ?? 0}</td>
                      <td className="pr-4">
                        {canManage ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              className="dc-btn dc-btn-xs dc-btn-primary"
                              disabled={action.isPending}
                              onClick={() => void action.mutateAsync({ id: c._id, action: 'start' })}
                            >
                              Start
                            </button>
                            <button
                              type="button"
                              className="dc-btn dc-btn-xs"
                              disabled={action.isPending}
                              onClick={() => void action.mutateAsync({ id: c._id, action: 'pause' })}
                            >
                              Pause
                            </button>
                            <button
                              type="button"
                              className="dc-btn dc-btn-xs"
                              disabled={action.isPending}
                              onClick={() => void action.mutateAsync({ id: c._id, action: 'resume' })}
                            >
                              Resume
                            </button>
                            <button
                              type="button"
                              className="dc-btn dc-btn-xs dc-btn-danger"
                              disabled={action.isPending}
                              onClick={() => void action.mutateAsync({ id: c._id, action: 'delete' })}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {q.data ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="dc-btn dc-btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="dc-btn dc-btn-sm"
            disabled={page * q.data.limit >= q.data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
          <span className="text-sm text-ink-3">
            Page {page} · {q.data.total} total
          </span>
        </div>
      ) : null}
    </div>
  );
}
