import { FormEvent, useState } from 'react';
import {
  useAddChatNoteMutation,
  useChatNotesQuery,
  useDeleteChatNoteMutation,
  useReassignLeadMutation,
  useTeamQuery,
  useUpdateLeadStatusMutation,
} from '../../hooks/apiHooks.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { apiErrorMessage } from '../../lib/errors.ts';
import { LEAD_STATUSES, LEAD_STATUS_BADGE, LEAD_STATUS_LABELS, relativeTime } from '../../lib/leadUi.ts';
import { Avatar } from '../workspace/WorkspaceSurface.tsx';
import { IconTrash } from '../Icons.tsx';
import type { ChatRow, LeadStatus } from '../../types/api.ts';

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-ink-4">{props.label}</span>
      {props.children}
    </div>
  );
}

/**
 * Everything about the lead behind the conversation: who owns it, what stage it is at,
 * where it came from, and the internal notes agents leave for each other.
 */
export function LeadDetailsPanel(props: { chat: ChatRow }) {
  const { chat } = props;
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

  const status = (chat.status ?? 'new') as LeadStatus;
  const contactName = chat.contactId?.name || chat.contactId?.phone || 'Contact';
  const assignees = (teamQ.data ?? []).filter((m) => m.userId);

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
        <span className={`dc-badge ${LEAD_STATUS_BADGE[status]} rounded-full px-2.5`}>
          {LEAD_STATUS_LABELS[status]}
        </span>
      </div>

      {err ? <p className="dc-note dc-note-danger">{err}</p> : null}

      <Field label="Phone">
        <span className="text-base tabular-nums text-ink">{chat.contactId?.phone || '—'}</span>
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
          <span className="text-base text-ink">
            {chat.assignedToUser?.name ?? chat.assignedToUser?.email ?? 'Unassigned'}
          </span>
        )}
        {chat.assignmentMethod ? (
          <span className="text-2xs text-ink-4">
            {chat.assignmentMethod === 'auto'
              ? `auto-assigned ${relativeTime(chat.assignedAt)}`
              : `assigned ${relativeTime(chat.assignedAt)}`}
          </span>
        ) : null}
      </Field>

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

      <Field label="Last message">
        <span className="text-base text-ink">{relativeTime(chat.lastMessageAt)}</span>
      </Field>

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
