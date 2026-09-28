import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import {
  useAddChatNoteMutation,
  useChatNotesQuery,
  useDeleteChatNoteMutation,
  useReassignLeadMutation,
  useTeamQuery,
  useUpdateContactTagsMutation,
  useUpdateLeadStatusMutation,
} from '../../hooks/apiHooks.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { apiErrorMessage } from '../../lib/errors.ts';
import { LEAD_STATUSES, LEAD_STATUS_BADGE, LEAD_STATUS_LABELS, relativeTime } from '../../lib/leadUi.ts';
import { Avatar } from '../workspace/WorkspaceSurface.tsx';
import { IconCheck, IconClose, IconPlus, IconTrash } from '../Icons.tsx';
import type { ChatDetail, ChatRow, LeadStatus } from '../../types/api.ts';

function Field(props: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-ink-4">{props.label}</span>
      {props.children}
    </div>
  );
}

/** Turns "lead.auto_assigned" into "Auto assigned" for the activity trail. */
function activityLabel(action: string): string {
  const tail = action.includes('.') ? action.split('.').slice(1).join('.') : action;
  const words = tail.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* ----------------------------------------------------------------- tags */

function TagEditor(props: { chatId: string; tags: string[] }) {
  const update = useUpdateContactTagsMutation();
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [err, setErr] = useState<string | null>(null);

  async function commit(next: string[]) {
    setErr(null);
    try {
      await update.mutateAsync({ chatId: props.chatId, tags: next });
    } catch (e) {
      setErr(apiErrorMessage(e));
    }
  }

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const tag = value.trim();
    if (!tag) return;
    setValue('');
    setAdding(false);
    await commit([...props.tags, tag]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {props.tags.map((tag) => (
          <span key={tag} className="dc-badge group gap-1 pr-1">
            {tag}
            <button
              type="button"
              className="rounded p-0.5 text-ink-4 hover:text-danger"
              aria-label={`Remove ${tag}`}
              disabled={update.isPending}
              onClick={() => void commit(props.tags.filter((t) => t !== tag))}
            >
              <IconClose className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}

        {adding ? (
          <form onSubmit={onAdd} className="flex items-center gap-1">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => {
                if (!value.trim()) setAdding(false);
              }}
              placeholder="Tag"
              maxLength={40}
              className="h-6 w-20 rounded-control border border-line bg-surface px-1.5 text-xs text-ink outline-none"
            />
            <button type="submit" className="rounded p-1 text-ink-4 hover:text-brand-ink" aria-label="Save tag">
              <IconCheck className="h-3 w-3" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="dc-badge gap-1 border-dashed text-ink-4 hover:text-ink"
            onClick={() => setAdding(true)}
          >
            <IconPlus className="h-2.5 w-2.5" />
            Add
          </button>
        )}
      </div>
      {err ? <span className="text-2xs text-danger">{err}</span> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- panel */

/**
 * Everything about the lead behind the conversation: who owns it, what stage it is at,
 * where it came from, how it is tagged and grouped, what has happened to it, and the
 * internal notes agents leave for each other.
 */
export function LeadDetailsPanel(props: { chat: ChatRow; detail: ChatDetail | null }) {
  const { chat, detail } = props;
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const myUserId = useAuthStore((s) => s.user?.id);
  const isAdmin = workspaceRole === 'company_admin';

  const teamQ = useTeamQuery();
  const notesQ = useChatNotesQuery(chat._id);
  const reassign = useReassignLeadMutation();
  const updateStatus = useUpdateLeadStatusMutation();
  const addNote = useAddChatNoteMutation();
  const deleteNote = useDeleteChatNoteMutation();

  const [draft, setDraft] = useState('');
  const [err, setErr] = useState<string | null>(null);

  // A stale error from the previous lead would be confusing once another is opened.
  useEffect(() => {
    setErr(null);
    setDraft('');
  }, [chat._id]);

  const status = (chat.status ?? 'new') as LeadStatus;
  const contact = chat.contactId;
  const contactName = contact?.name || contact?.phone || 'Contact';
  const assignees = (teamQ.data ?? []).filter((m) => m.userId);
  // The detail call carries the freshest tags; the list row's copy is the fallback
  // while that request is still in flight.
  const tags = detail?.chat.contactId?.tags ?? contact?.tags ?? [];

  async function run(fn: () => Promise<unknown>) {
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(apiErrorMessage(e));
    }
  }

  async function onAddNote(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    await run(async () => {
      await addNote.mutateAsync({ chatId: chat._id, body: draft.trim() });
      setDraft('');
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar name={contactName} className="h-[52px] w-[52px] text-lg" />
        <span className="text-md font-semibold text-ink">{contactName}</span>
        <div className="flex flex-wrap justify-center gap-1.5">
          <span className="dc-badge dc-badge-brand gap-1 rounded-full px-2.5">
            <IconCheck className="h-2.5 w-2.5" />
            WhatsApp
          </span>
          <span
            className={`dc-badge gap-1 rounded-full px-2.5 ${contact?.email ? '' : 'text-ink-4'}`}
          >
            {contact?.email ? null : <IconClose className="h-2.5 w-2.5" />}
            {contact?.email ?? 'No email'}
          </span>
        </div>
        <span className={`dc-badge ${LEAD_STATUS_BADGE[status]} rounded-full px-2.5`}>
          {LEAD_STATUS_LABELS[status]}
        </span>
      </div>

      {err ? <p className="dc-note dc-note-danger">{err}</p> : null}

      <Field label="Phone">
        <span className="text-base tabular-nums text-ink">{contact?.phone || '—'}</span>
      </Field>

      <Field label="Stage">
        <select
          className="dc-select h-8 text-sm"
          value={status}
          disabled={updateStatus.isPending}
          onChange={(e) =>
            void run(() =>
              updateStatus.mutateAsync({ chatId: chat._id, status: e.target.value as LeadStatus }),
            )
          }
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Assigned to">
        {isAdmin ? (
          <select
            className="dc-select h-8 text-sm"
            value={chat.assignedTo ?? ''}
            disabled={reassign.isPending}
            onChange={(e) =>
              void run(() =>
                reassign.mutateAsync({ chatId: chat._id, assignedTo: e.target.value || null }),
              )
            }
          >
            <option value="">Unassigned</option>
            {assignees.map((m) => (
              <option key={m.userId!._id} value={m.userId!._id}>
                {m.userId!.name ?? m.userId!.email} ({m.openLeadCount})
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar
              name={chat.assignedToUser?.name ?? chat.assignedToUser?.email}
              className="h-6 w-6 text-2xs"
              plain
            />
            <span className="truncate text-base text-ink">
              {chat.assignedTo === myUserId
                ? 'You'
                : (chat.assignedToUser?.name ?? chat.assignedToUser?.email ?? 'Unassigned')}
            </span>
          </div>
        )}
        {chat.assignmentMethod ? (
          <span className="text-2xs text-ink-4">
            {chat.assignmentMethod === 'auto'
              ? `auto-assigned ${relativeTime(chat.assignedAt)}`
              : `assigned ${relativeTime(chat.assignedAt)}`}
          </span>
        ) : null}
      </Field>

      <Field label="Tags">
        <TagEditor chatId={chat._id} tags={tags} />
      </Field>

      {detail?.groups.length ? (
        <Field label="Groups">
          <div className="flex flex-wrap gap-1.5">
            {detail.groups.map((g) => (
              <span key={g._id} className="dc-badge">
                {g.name}
              </span>
            ))}
          </div>
        </Field>
      ) : null}

      {chat.productName ? (
        <Field label="Product">
          <span className="text-base text-ink">{chat.productName}</span>
        </Field>
      ) : null}

      {chat.referral?.sourceId || chat.referral?.headline ? (
        <Field label="Came from">
          <span className="text-base text-ink">
            {chat.referral.headline ?? chat.referral.sourceType ?? 'Ad'}
          </span>
          {chat.referral.ctwaClid ? (
            <span className="dc-badge dc-badge-accent w-fit">Paid ad click</span>
          ) : null}
          {chat.referral.sourceId ? (
            <span className="break-all font-mono text-2xs text-ink-4">
              id {chat.referral.sourceId}
            </span>
          ) : null}
        </Field>
      ) : null}

      {detail?.activity.length ? (
        <Field label="Recent activity">
          <div className="flex flex-col gap-2">
            {detail.activity.map((row) => (
              <div key={row._id} className="flex flex-col gap-px">
                <span className="text-sm text-ink">{activityLabel(row.action)}</span>
                <span className="text-2xs text-ink-4">
                  {relativeTime(row.createdAt)}
                  {row.userId?.name ? ` · ${row.userId.name}` : ''}
                </span>
              </div>
            ))}
          </div>
        </Field>
      ) : null}

      {/* Notes are internal: nothing here is ever delivered to the contact. */}
      <div className="flex flex-col gap-2 border-t border-line-soft pt-3.5">
        <span className="text-xs text-ink-4">
          Internal notes <span className="text-ink-4">· not sent to the customer</span>
        </span>

        <form onSubmit={onAddNote} className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Budget, call outcome, next step…"
            className="dc-textarea text-sm"
          />
          <button
            type="submit"
            disabled={addNote.isPending || !draft.trim()}
            className="dc-btn dc-btn-xs dc-btn-primary self-end"
          >
            {addNote.isPending ? 'Saving…' : 'Add note'}
          </button>
        </form>

        {notesQ.isLoading ? (
          <p className="text-sm text-ink-4">Loading notes…</p>
        ) : !(notesQ.data ?? []).length ? (
          <p className="text-sm text-ink-4">No notes yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {(notesQ.data ?? []).map((note) => {
              const canDelete = isAdmin || note.userId?._id === myUserId;
              return (
                <div
                  key={note._id}
                  className="flex flex-col gap-1 rounded-control border border-line bg-subtle px-2.5 py-2"
                >
                  <p className="whitespace-pre-wrap break-words text-sm text-ink">{note.body}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-2xs text-ink-4">
                      {note.userId?.name ?? note.userId?.email ?? 'Someone'} ·{' '}
                      {relativeTime(note.createdAt)}
                    </span>
                    {canDelete ? (
                      <button
                        type="button"
                        className="ml-auto shrink-0 rounded p-1 text-ink-4 hover:bg-line-soft hover:text-danger"
                        aria-label="Delete note"
                        onClick={() =>
                          void run(() =>
                            deleteNote.mutateAsync({ chatId: chat._id, noteId: note._id }),
                          )
                        }
                      >
                        <IconTrash className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
