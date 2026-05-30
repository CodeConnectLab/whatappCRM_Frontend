import { FormEvent, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useContactGroupsQuery,
  useContactsQuery,
  useCreateContactMutation,
  useDeleteContactMutation,
  useImportContactsMutation,
  useStartChatMutation,
  downloadContactsImportTemplate,
} from '../hooks/apiHooks.ts';
import { useAuthStore } from '../store/authStore.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { WorkspaceAlertError, WorkspaceCard, WorkspaceIntro } from '../components/workspace/WorkspaceSurface.tsx';
import {
  WORKSPACE_INPUT_CLASS,
  WORKSPACE_INPUT_MONO_CLASS,
  WORKSPACE_PAGE_BTN_CLASS,
  WORKSPACE_PRIMARY_BTN_CLASS,
  WORKSPACE_TABLE_HEAD_CLASS,
  WORKSPACE_TABLE_WRAP_CLASS,
} from '../lib/workspaceUi.ts';

export function ContactsPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [importGroupName, setImportGroupName] = useState('');
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [importDetail, setImportDetail] = useState<{
    imported: number;
    rowsProcessed: number;
    groupsUpdated: string[];
    groupAssigned: string | null;
    skipped: number;
    errors: { line: number; message: string }[];
  } | null>(null);

  const q = useContactsQuery(page, search);
  const groupsQ = useContactGroupsQuery();
  const create = useCreateContactMutation();
  const remove = useDeleteContactMutation();
  const importCsv = useImportContactsMutation();
  const startChat = useStartChatMutation();

  async function onMessageContact(contactId: string) {
    setErr(null);
    try {
      const chat = await startChat.mutateAsync({ contactId });
      navigate(`/chats?chat=${encodeURIComponent(chat._id)}`);
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await create.mutateAsync({ phone, name: name || undefined, email: email || undefined });
      setPhone('');
      setName('');
      setEmail('');
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  async function onDownloadTemplate() {
    setErr(null);
    try {
      await downloadContactsImportTemplate();
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  function onPickImport() {
    fileRef.current?.click();
  }

  async function onImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.csv')) {
      setErr('Please upload a .csv file (same format as the template).');
      return;
    }
    setErr(null);
    setImportSummary(null);
    setImportDetail(null);
    try {
      const result = await importCsv.mutateAsync({
        file,
        groupName: importGroupName.trim() || undefined,
      });
      setImportSummary(
        `Imported ${result.imported} contact(s) from ${result.rowsProcessed} row(s).` +
          (result.groupAssigned
            ? ` Added to group "${result.groupAssigned}".`
            : '') +
          (result.skipped ? ` Skipped ${result.skipped} row(s).` : ''),
      );
      setImportDetail(result);
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-4">
      <NeedsCompanyBanner />

      <WorkspaceIntro
        kicker="Engage"
        title="Contacts"
        description="Add people manually or bulk-import a CSV. Search uses the text index on name and phone. Optionally assign imports to a group for campaigns."
      />

      <WorkspaceCard title="Find contacts">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Search</span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`${WORKSPACE_INPUT_CLASS} mt-1.5`}
            placeholder="Name or phone"
          />
        </label>
      </WorkspaceCard>

      <WorkspaceCard title="Bulk import (CSV)">
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Download the template (phone, name, email only), fill it in Excel or Sheets, then upload. Use a{' '}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">group name</span> below to merge into an
          existing list or create a new one — there is no group column in the file.
        </p>
        <p className="mt-2 font-mono text-xs text-zinc-500 dark:text-zinc-500">
          Columns: phone (required), name, email
        </p>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Assign imported contacts to group <span className="font-normal text-zinc-400">(optional)</span>
          </span>
          <input
            list="contact-import-group-options"
            value={importGroupName}
            onChange={(e) => setImportGroupName(e.target.value)}
            placeholder="e.g. January leads, VIP"
            className={`${WORKSPACE_INPUT_CLASS} mt-1.5 max-w-md`}
            disabled={!companyId}
          />
          <datalist id="contact-import-group-options">
            {(groupsQ.data ?? []).map((g) => (
              <option key={g._id} value={g.name} />
            ))}
          </datalist>
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-emerald-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-zinc-900 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
            onClick={() => void onDownloadTemplate()}
          >
            Download template
          </button>
          <button
            type="button"
            disabled={!companyId || importCsv.isPending}
            className={WORKSPACE_PRIMARY_BTN_CLASS}
            onClick={onPickImport}
          >
            {importCsv.isPending ? 'Uploading…' : 'Upload CSV'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => void onImportFile(e)}
          />
        </div>
        {importSummary ? (
          <p className="mt-4 text-sm font-medium text-emerald-800 dark:text-emerald-200">{importSummary}</p>
        ) : null}
        {importDetail?.errors?.length ? (
          <ul className="mt-2 max-h-40 list-inside list-disc overflow-y-auto text-xs text-red-600 dark:text-red-400">
            {importDetail.errors.map((row) => (
              <li key={`${row.line}-${row.message}`}>
                Line {row.line}: {row.message}
              </li>
            ))}
          </ul>
        ) : null}
      </WorkspaceCard>

      <WorkspaceCard title="Add contact">
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm sm:col-span-1">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${WORKSPACE_INPUT_MONO_CLASS} mt-1.5`}
              required
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${WORKSPACE_INPUT_CLASS} mt-1.5`}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${WORKSPACE_INPUT_CLASS} mt-1.5`}
            />
          </label>
          <button
            type="submit"
            disabled={create.isPending || !companyId}
            className={`${WORKSPACE_PRIMARY_BTN_CLASS} sm:col-span-3 sm:w-auto`}
          >
            {create.isPending ? 'Saving…' : 'Add contact'}
          </button>
        </form>
      </WorkspaceCard>

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}

      {companyId && groupsQ.data && groupsQ.data.length > 0 ? (
        <WorkspaceCard title="Contact groups">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Groups updated by import appear here with member counts (used for campaigns).
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {groupsQ.data.map((g) => (
              <li
                key={g._id}
                className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-800/40"
              >
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">{g.name}</span>
                <span className="ml-2 tabular-nums text-zinc-500 dark:text-zinc-400">
                  {g.contactIds?.length ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </WorkspaceCard>
      ) : null}

      <WorkspaceCard title="All contacts">
        {!companyId ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace to manage contacts.</p>
        ) : q.isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : q.isError ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load contacts.</p>
        ) : q.data?.data.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No contacts on this page.</p>
        ) : (
          <div className={WORKSPACE_TABLE_WRAP_CLASS}>
            <table className="w-full text-left text-sm">
              <thead className={WORKSPACE_TABLE_HEAD_CLASS}>
                <tr>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {(q.data?.data ?? []).map((c) => (
                  <tr key={c._id} className="bg-white/80 dark:bg-zinc-950/30">
                    <td className="px-4 py-3 font-mono text-xs">{c.phone}</td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-white">{c.name ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{c.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50 dark:text-emerald-400"
                          disabled={startChat.isPending}
                          onClick={() => void onMessageContact(c._id)}
                        >
                          Message
                        </button>
                        <button
                          type="button"
                          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                          disabled={remove.isPending}
                          onClick={() => void remove.mutateAsync(c._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {q.data ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
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
      </WorkspaceCard>
    </div>
  );
}
