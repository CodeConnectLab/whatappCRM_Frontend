import { FormEvent, useMemo, useRef, useState } from 'react';
import { useTemplateMutations, useTemplatesQuery } from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { WhatsAppMessagePreview } from '../components/WhatsAppMessagePreview.tsx';
import { WorkspaceAlertError, WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';
import {
  DEFAULT_PREVIEW_SAMPLE,
  TEMPLATE_PLACEHOLDERS,
  insertAtCursor,
  type PlaceholderSample,
} from '../lib/templatePlaceholders.ts';

export function TemplatesPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const q = useTemplatesQuery();
  const { create, remove } = useTemplateMutations();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [language, setLanguage] = useState('en');
  const [imageUrl, setImageUrl] = useState('');
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
        ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      });
      setName('');
      setBody('');
      setImageUrl('');
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
    <div className="mx-auto max-w-6xl space-y-8 pb-4">
      <NeedsCompanyBanner />

      <WorkspaceIntro
        kicker="Messaging"
        title="Templates"
        description="Draft content your campaigns can reuse. Use placeholders for per-contact fields, add an optional public image URL for rich sends, and preview how the bubble will look."
      />

      {canManage ? (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <WorkspaceCard title="New template">
            <form className="space-y-4" onSubmit={onCreate}>
              <label className="block text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  required
                  placeholder="e.g. Welcome / Promo week"
                />
              </label>

              <div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Placeholders</span>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Click to insert at the cursor. Data comes from each contact when a campaign runs.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TEMPLATE_PLACEHOLDERS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      className="rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-1 font-mono text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/70"
                      onClick={() => addPlaceholder(p.token)}
                      title={p.hint}
                    >
                      {p.token}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Message body</span>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="mt-1.5 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 font-[15px] text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  required
                  placeholder="Hi {{name}}, thanks for joining us!"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Image URL <span className="font-normal text-zinc-500">(optional)</span>
                </span>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Public HTTPS link — shown in preview and attached when campaigns send.
                </p>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  type="url"
                  placeholder="https://cdn.example.com/promo.jpg"
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Language code</span>
                <input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1.5 w-full max-w-xs rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  placeholder="en"
                />
              </label>

              <button
                type="submit"
                disabled={create.isPending || !companyId}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {create.isPending ? 'Saving…' : 'Save template'}
              </button>
            </form>
          </WorkspaceCard>

          <div className="space-y-4 lg:sticky lg:top-4">
            <WorkspaceCard title="Live preview">
              <div className="mb-4 flex flex-wrap gap-2 rounded-xl bg-zinc-50 p-2 dark:bg-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setPreviewMode('tokens')}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition sm:flex-none ${
                    previewMode === 'tokens'
                      ? 'bg-white text-emerald-800 shadow-sm dark:bg-zinc-900 dark:text-emerald-300'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Placeholders visible
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('filled')}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition sm:flex-none ${
                    previewMode === 'filled'
                      ? 'bg-white text-emerald-800 shadow-sm dark:bg-zinc-900 dark:text-emerald-300'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Sample contact
                </button>
              </div>
              {previewMode === 'filled' ? (
                <div className="mb-4 grid gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-900/40">
                  {(
                    [
                      ['name', sample.name, (v: string) => setSample((s) => ({ ...s, name: v }))],
                      ['phone', sample.phone, (v: string) => setSample((s) => ({ ...s, phone: v }))],
                      ['email', sample.email, (v: string) => setSample((s) => ({ ...s, email: v }))],
                    ] as const
                  ).map(([key, val, onChange]) => (
                    <label key={key} className="block">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{key}</span>
                      <input
                        value={val}
                        onChange={(e) => onChange(e.target.value)}
                        className="mt-0.5 w-full rounded-lg border border-zinc-200 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
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
        </div>
      ) : (
        <WorkspaceCard>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Only company admins can create or delete templates. You can still use them in campaigns if assigned.
          </p>
        </WorkspaceCard>
      )}

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {!companyId ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace.</p>
      ) : q.isLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : q.isError ? (
        <WorkspaceAlertError>Failed to load templates.</WorkspaceAlertError>
      ) : sortedTemplates.length === 0 ? (
        <WorkspaceCard title="Library">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No templates yet. Create one on the left.</p>
        </WorkspaceCard>
      ) : (
        <WorkspaceCard title="Saved templates">
          <ul className="space-y-4">
            {sortedTemplates.map((t) => (
              <li
                key={t._id}
                className="flex flex-col gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 md:flex-row md:items-stretch"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-white">{t.name}</span>
                      {t.language ? (
                        <span className="ml-2 rounded-md bg-zinc-200/80 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {t.language}
                        </span>
                      ) : null}
                    </div>
                    {canManage ? (
                      <button
                        type="button"
                        className="shrink-0 text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                        disabled={remove.isPending}
                        onClick={() => void remove.mutateAsync(t._id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{t.body}</p>
                  {t.imageUrl ? (
                    <p className="mt-2 truncate font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                      Image: {t.imageUrl}
                    </p>
                  ) : null}
                </div>
                <div className="w-full shrink-0 md:w-[220px]">
                  <WhatsAppMessagePreview
                    body={t.body}
                    imageUrl={t.imageUrl}
                    showRawPlaceholders={false}
                    caption="Quick look"
                  />
                </div>
              </li>
            ))}
          </ul>
        </WorkspaceCard>
      )}
    </div>
  );
}
