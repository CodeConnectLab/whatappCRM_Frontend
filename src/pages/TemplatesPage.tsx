import { FormEvent, useMemo, useRef, useState } from 'react';
import { useTemplateMutations, useTemplatesQuery } from '../hooks/apiHooks.ts';
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
import {
  DEFAULT_PREVIEW_SAMPLE,
  TEMPLATE_PLACEHOLDERS,
  insertAtCursor,
  type PlaceholderSample,
} from '../lib/templatePlaceholders.ts';
import type { TemplateCategory, TemplateStatus } from '../types/api.ts';

const CATEGORIES: { value: TemplateCategory; label: string; hint: string }[] = [
  { value: 'UTILITY', label: 'Utility', hint: 'Order updates, reminders, confirmations' },
  { value: 'MARKETING', label: 'Marketing', hint: 'Offers, promotions, announcements' },
  { value: 'AUTHENTICATION', label: 'Authentication', hint: 'One-time passcodes' },
];

const STATUS_STYLES: Record<TemplateStatus, string> = {
  local: 'dc-badge',
  PENDING: 'dc-badge dc-badge-warn',
  APPROVED: 'dc-badge dc-badge-brand',
  REJECTED: 'dc-badge dc-badge-danger',
  PAUSED: 'dc-badge dc-badge-warn',
  DISABLED: 'dc-badge dc-badge-danger',
  IN_APPEAL: 'dc-badge dc-badge-accent',
};

const STATUS_LABELS: Record<TemplateStatus, string> = {
  local: 'Not submitted',
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PAUSED: 'Paused',
  DISABLED: 'Disabled',
  IN_APPEAL: 'In appeal',
};

function StatusBadge({ status }: { status?: TemplateStatus }) {
  const s = status ?? 'local';
  return <span className={STATUS_STYLES[s]}>{STATUS_LABELS[s]}</span>;
}

export function TemplatesPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const q = useTemplatesQuery();
  const { create, remove, submit, sync } = useTemplateMutations();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [language, setLanguage] = useState('en');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('UTILITY');
  const [previewMode, setPreviewMode] = useState<'tokens' | 'filled'>('tokens');
  const [sample, setSample] = useState<PlaceholderSample>(DEFAULT_PREVIEW_SAMPLE);
  const [err, setErr] = useState<string | null>(null);

  const canManage = workspaceRole === 'company_admin';

  const sortedTemplates = useMemo(
    () => [...(q.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [q.data],
  );

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await create.mutateAsync({
        name,
        body,
        language,
        category,
        ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      });
      setName('');
      setBody('');
      setImageUrl('');
      setComposerOpen(false);
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onSubmitForApproval(id: string) {
    setErr(null);
    try {
      await submit.mutateAsync(id);
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onSync() {
    setErr(null);
    try {
      await sync.mutateAsync();
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  function addPlaceholder(token: string) {
    const ta = bodyRef.current;
    if (!ta) {
      setBody((b) => b + token);
      return;
    }
    insertAtCursor(ta, token);
    setBody(ta.value);
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <NeedsCompanyBanner />

      <PageHeader
        title="Templates"
        description="Reusable message drafts. WhatsApp needs Meta approval before a template can be sent."
        actions={
          canManage ? (
            <>
              <button type="button" className="dc-btn" onClick={() => void onSync()} disabled={sync.isPending}>
                {sync.isPending ? 'Refreshing…' : 'Refresh from Meta'}
              </button>
              <button
                type="button"
                className="dc-btn dc-btn-primary"
                onClick={() => setComposerOpen((v) => !v)}
                disabled={!companyId}
              >
                {composerOpen ? <IconClose className="h-3.5 w-3.5" /> : <IconPlus className="h-3.5 w-3.5" />}
                {composerOpen ? 'Close' : 'New template'}
              </button>
            </>
          ) : null
        }
      />

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {!canManage ? (
        <WorkspaceCard>
          <CardNote>
            Only company admins can create or delete templates. You can still use approved templates in campaigns.
          </CardNote>
        </WorkspaceCard>
      ) : null}

      {/* ---------------------------------------------------------- composer */}
      {canManage && composerOpen ? (
        <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
          <WorkspaceCard title="New template">
            <form className="flex flex-col gap-3.5" onSubmit={onCreate}>
              <label className="dc-label">
                <span className="dc-label-text">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dc-input"
                  required
                  placeholder="e.g. Welcome / Promo week"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="dc-label-text">Placeholders</span>
                <span className="text-sm text-ink-4">
                  Click to insert at the cursor. Values come from each contact when a campaign runs.
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_PLACEHOLDERS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      className="rounded-control border border-warn-line bg-warn-soft px-2 py-1 font-mono text-xs font-medium text-warn transition-colors hover:brightness-95"
                      onClick={() => addPlaceholder(p.token)}
                      title={p.hint}
                    >
                      {p.token}
                    </button>
                  ))}
                </div>
              </div>

              <label className="dc-label">
                <span className="dc-label-text">Message body</span>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="dc-textarea"
                  required
                  placeholder="Hi {{name}}, thanks for joining us!"
                />
              </label>

              <label className="dc-label">
                <span className="dc-label-text">
                  Image URL <span className="font-normal text-ink-4">(optional)</span>
                </span>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  type="url"
                  placeholder="https://cdn.example.com/promo.jpg"
                  className="dc-input"
                />
                <span className="text-sm text-ink-4">
                  Public HTTPS link — shown in preview and attached when campaigns send.
                </span>
              </label>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="dc-label">
                  <span className="dc-label-text">Language code</span>
                  <input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="dc-input"
                    placeholder="en"
                  />
                </label>
                <label className="dc-label">
                  <span className="dc-label-text">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    className="dc-select"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label} — {c.hint}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-sm text-ink-4">
                Meta rejects templates filed under the wrong category — promotional content must be Marketing.
              </p>

              <div className="flex gap-2 border-t border-line-soft pt-3.5">
                <button type="button" className="dc-btn" onClick={() => setComposerOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending || !companyId}
                  className="dc-btn dc-btn-primary ml-auto px-5"
                >
                  {create.isPending ? 'Saving…' : 'Save template'}
                </button>
              </div>
            </form>
          </WorkspaceCard>

          <WorkspaceCard title="Live preview" className="lg:sticky lg:top-4">
            <div className="mb-3.5 flex gap-1 rounded-control bg-muted p-1">
              {(
                [
                  ['tokens', 'Placeholders visible'],
                  ['filled', 'Sample contact'],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewMode(mode)}
                  className={`h-7 flex-1 rounded-[5px] px-3 text-sm transition-colors ${
                    previewMode === mode ? 'bg-surface font-semibold text-ink shadow-card' : 'text-ink-3'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {previewMode === 'filled' ? (
              <div className="mb-3.5 grid gap-2 rounded-control border border-line bg-muted p-3">
                {(
                  [
                    ['name', sample.name, (v: string) => setSample((s) => ({ ...s, name: v }))],
                    ['phone', sample.phone, (v: string) => setSample((s) => ({ ...s, phone: v }))],
                    ['email', sample.email, (v: string) => setSample((s) => ({ ...s, email: v }))],
                  ] as const
                ).map(([key, val, onChange]) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-2xs uppercase tracking-[0.06em] text-ink-4">{key}</span>
                    <input
                      value={val}
                      onChange={(e) => onChange(e.target.value)}
                      className="dc-input h-8 text-sm"
                    />
                  </label>
                ))}
              </div>
            ) : null}

            <WhatsAppMessagePreview
              body={body}
              imageUrl={imageUrl}
              showRawPlaceholders={previewMode === 'tokens'}
              sample={sample}
            />
          </WorkspaceCard>
        </div>
      ) : null}

      {/* ----------------------------------------------------------- library */}
      {!companyId ? (
        <WorkspaceCard>
          <CardNote>Select a workspace.</CardNote>
        </WorkspaceCard>
      ) : q.isLoading ? (
        <WorkspaceCard>
          <CardNote>Loading…</CardNote>
        </WorkspaceCard>
      ) : q.isError ? (
        <WorkspaceAlertError>Failed to load templates.</WorkspaceAlertError>
      ) : !sortedTemplates.length ? (
        <WorkspaceCard>
          <CardNote>No templates yet. Create one with “New template”.</CardNote>
        </WorkspaceCard>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {sortedTemplates.map((t) => (
            <article key={t._id} className="flex min-h-[170px] flex-col gap-2.5 rounded-card border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="dc-badge dc-badge-brand">WhatsApp</span>
                <StatusBadge status={t.status} />
                {t.category ? <span className="ml-auto text-xs text-ink-4">{t.category}</span> : null}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-md font-semibold text-ink">
                  {t.name}
                  {t.language ? <span className="ml-2 text-xs font-normal text-ink-4">{t.language}</span> : null}
                </span>
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-3">{t.body}</p>
              </div>

              {t.status === 'REJECTED' && t.rejectedReason ? (
                <p className="rounded-control bg-danger-soft px-2.5 py-1.5 text-sm text-danger">
                  Meta rejected this: {t.rejectedReason}
                </p>
              ) : null}

              {t.imageUrl ? (
                <p className="truncate font-mono text-2xs text-ink-4">Image: {t.imageUrl}</p>
              ) : null}

              {canManage ? (
                <div className="mt-auto flex items-center gap-2 border-t border-line-soft pt-2.5">
                  {t.status !== 'APPROVED' && t.status !== 'PENDING' ? (
                    <button
                      type="button"
                      className="dc-btn dc-btn-xs"
                      disabled={submit.isPending}
                      onClick={() => void onSubmitForApproval(t._id)}
                    >
                      {submit.isPending ? 'Submitting…' : 'Submit for approval'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="dc-btn dc-btn-xs dc-btn-danger ml-auto"
                    disabled={remove.isPending}
                    onClick={() => void remove.mutateAsync(t._id)}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
