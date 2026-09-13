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
import {
  Avatar,
  CardNote,
  PageHeader,
  Tabs,
  WorkspaceAlertError,
  WorkspaceCard,
} from '../components/workspace/WorkspaceSurface.tsx';
import { IconClose, IconImport, IconPlus, IconSearch } from '../components/Icons.tsx';
import type { ContactImportResult } from '../types/api.ts';

type Tab = 'people' | 'groups';

export function ContactsPage() {
  const companyId = useAuthStore((s) => s.companyId);
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('people');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const [drawer, setDrawer] = useState<'contact' | 'import' | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const [importGroupName, setImportGroupName] = useState('');
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [importDetail, setImportDetail] = useState<ContactImportResult | null>(null);

  const q = useContactsQuery(page, search);
  const groupsQ = useContactGroupsQuery();
  const create = useCreateContactMutation();
  const remove = useDeleteContactMutation();
  const importCsv = useImportContactsMutation();
  const startChat = useStartChatMutation();

  const contacts = q.data?.data ?? [];
  const groups = groupsQ.data ?? [];

  function closeDrawer() {
    setDrawer(null);
  }

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
      closeDrawer();
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

  async function onImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
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
          (result.groupAssigned ? ` Added to group "${result.groupAssigned}".` : '') +
          (result.skipped ? ` Skipped ${result.skipped} row(s).` : ''),
      );
      setImportDetail(result);
    } catch (er) {
      setErr(apiErrorMessage(er));
    }
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <NeedsCompanyBanner />

      <PageHeader
        title="Contacts"
        description={
          companyId
            ? `${q.data?.total ?? 0} contacts across ${groups.length} group${groups.length === 1 ? '' : 's'}`
            : 'Select a workspace to manage contacts.'
        }
        actions={
          <>
            <button type="button" className="dc-btn" onClick={() => setDrawer('import')} disabled={!companyId}>
              <IconImport className="h-3.5 w-3.5" />
              Import CSV
            </button>
            <button
              type="button"
              className="dc-btn dc-btn-primary"
              onClick={() => setDrawer('contact')}
              disabled={!companyId}
            >
              <IconPlus className="h-3.5 w-3.5" />
              New contact
            </button>
          </>
        }
      />

      <Tabs
        items={[
          { key: 'people', label: 'People', count: q.data?.total ?? 0 },
          { key: 'groups', label: 'Groups', count: groups.length },
        ]}
        value={tab}
        onChange={setTab}
        right={
          tab === 'people' ? (
            <div className="flex h-8 w-[240px] items-center gap-2 rounded-control border border-line bg-subtle px-2.5">
              <IconSearch className="h-3.5 w-3.5 shrink-0 text-ink-4" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name or phone"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-4"
              />
            </div>
          ) : null
        }
      />

      {err ? <WorkspaceAlertError>{err}</WorkspaceAlertError> : null}
      {importSummary ? <div className="dc-note dc-note-brand">{importSummary}</div> : null}
      {importDetail?.errors?.length ? (
        <ul className="max-h-40 list-inside list-disc overflow-y-auto rounded-card border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
          {importDetail.errors.map((row) => (
            <li key={`${row.line}-${row.message}`}>
              Line {row.line}: {row.message}
            </li>
          ))}
        </ul>
      ) : null}

      {/* ------------------------------------------------------------ people */}
      {tab === 'people' ? (
        <>
          <div className="dc-card">
            {!companyId ? (
              <div className="p-4">
                <CardNote>Select a workspace to manage contacts.</CardNote>
              </div>
            ) : q.isLoading ? (
              <div className="p-4">
                <CardNote>Loading…</CardNote>
              </div>
            ) : q.isError ? (
              <div className="p-4">
                <CardNote>Failed to load contacts.</CardNote>
              </div>
            ) : !contacts.length ? (
              <div className="p-4">
                <CardNote>{search ? 'No contacts match that search.' : 'No contacts yet.'}</CardNote>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="dc-table dc-table-hover min-w-[640px]">
                  <thead className="bg-muted">
                    <tr>
                      <th className="pl-4">Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th className="pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c) => (
                      <tr key={c._id}>
                        <td className="pl-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.name || c.phone} className="h-7 w-7 text-2xs" />
                            <span className="font-medium">{c.name ?? '—'}</span>
                          </div>
                        </td>
                        <td className="tabular-nums text-ink-2">{c.phone}</td>
                        <td className="text-ink-2">{c.email ?? '—'}</td>
                        <td className="pr-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="dc-btn dc-btn-xs"
                              disabled={startChat.isPending}
                              onClick={() => void onMessageContact(c._id)}
                            >
                              Message
                            </button>
                            <button
                              type="button"
                              className="dc-btn dc-btn-xs dc-btn-danger"
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
        </>
      ) : null}

      {/* ------------------------------------------------------------ groups */}
      {tab === 'groups' ? (
        !companyId ? (
          <WorkspaceCard>
            <CardNote>Select a workspace.</CardNote>
          </WorkspaceCard>
        ) : groupsQ.isLoading ? (
          <WorkspaceCard>
            <CardNote>Loading…</CardNote>
          </WorkspaceCard>
        ) : !groups.length ? (
          <WorkspaceCard>
            <CardNote>
              No groups yet. Groups are created when you import a CSV with a group name — use Import CSV above.
            </CardNote>
          </WorkspaceCard>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <article
                key={g._id}
                className="flex min-h-[136px] flex-col gap-3 rounded-panel border border-line bg-surface p-4 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={g.name} className="h-9 w-9 rounded-[9px] text-base" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-md font-semibold text-ink">{g.name}</span>
                    <span className="text-sm text-ink-3">Contact group</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tracking-[-0.02em] tabular-nums text-ink">
                    {g.contactIds?.length ?? 0}
                  </span>
                  <span className="text-sm text-ink-3">contacts</span>
                </div>
                <div className="mt-auto flex items-center gap-2 border-t border-line-soft pt-2.5">
                  <span className="dc-badge dc-badge-brand">WhatsApp</span>
                  <span className="ml-auto text-sm text-ink-4">Use in campaigns →</span>
                </div>
              </article>
            ))}
          </div>
        )
      ) : null}

      {/* ------------------------------------------------------------ drawer */}
      {drawer ? (
        <div className="dc-scrim" onClick={closeDrawer}>
          <aside className="dc-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 border-b border-line-soft px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-semibold text-ink">
                  {drawer === 'contact' ? 'New contact' : 'Import contacts'}
                </span>
                <span className="text-sm text-ink-3">
                  {drawer === 'contact'
                    ? 'Add a lead manually. Import CSV for bulk.'
                    : 'Upload a CSV using the template columns.'}
                </span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="dc-btn dc-btn-sm ml-auto w-[30px] px-0"
                aria-label="Close"
              >
                <IconClose className="h-3 w-3" />
              </button>
            </div>

            {drawer === 'contact' ? (
              <form onSubmit={onCreate} className="flex min-h-0 flex-1 flex-col">
                <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4">
                  <label className="dc-label">
                    <span className="dc-label-text">Phone (WhatsApp)</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98••• •••••"
                      className="dc-input font-mono"
                      required
                    />
                  </label>
                  <label className="dc-label">
                    <span className="dc-label-text">Name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ramesh Gupta"
                      className="dc-input"
                    />
                  </label>
                  <label className="dc-label">
                    <span className="dc-label-text">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="dc-input"
                    />
                  </label>
                </div>
                <div className="flex gap-2 border-t border-line-soft px-5 py-3.5">
                  <button type="button" onClick={closeDrawer} className="dc-btn">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={create.isPending || !companyId}
                    className="dc-btn dc-btn-primary ml-auto px-5"
                  >
                    {create.isPending ? 'Saving…' : 'Save contact'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4">
                  <p className="text-base leading-relaxed text-ink-3">
                    Download the template, fill it in Excel or Sheets, then upload. There is no group column in
                    the file — set a group name below to merge into an existing list or create a new one.
                  </p>
                  <p className="rounded-control bg-muted px-3 py-2 font-mono text-sm text-ink-3">
                    Columns: phone (required), name, email
                  </p>
                  <label className="dc-label">
                    <span className="dc-label-text">
                      Assign imported contacts to group <span className="font-normal text-ink-4">(optional)</span>
                    </span>
                    <input
                      list="contact-import-group-options"
                      value={importGroupName}
                      onChange={(e) => setImportGroupName(e.target.value)}
                      placeholder="e.g. January leads, VIP"
                      className="dc-input"
                      disabled={!companyId}
                    />
                    <datalist id="contact-import-group-options">
                      {groups.map((g) => (
                        <option key={g._id} value={g.name} />
                      ))}
                    </datalist>
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => void onImportFile(e)}
                  />
                </div>
                <div className="flex gap-2 border-t border-line-soft px-5 py-3.5">
                  <button type="button" className="dc-btn" onClick={() => void onDownloadTemplate()}>
                    Download template
                  </button>
                  <button
                    type="button"
                    disabled={!companyId || importCsv.isPending}
                    className="dc-btn dc-btn-primary ml-auto px-5"
                    onClick={() => fileRef.current?.click()}
                  >
                    {importCsv.isPending ? 'Uploading…' : 'Upload CSV'}
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
