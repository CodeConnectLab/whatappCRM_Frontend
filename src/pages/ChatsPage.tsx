import EmojiPicker, { Theme } from 'emoji-picker-react';
import {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IconChevronDown,
  IconClose,
  IconInfo,
  IconPaperclip,
  IconPlus,
  IconSearch,
  IconSmile,
} from '../components/Icons.tsx';
import { WaOutboundTicks } from '../components/WaOutboundTicks.tsx';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { Avatar } from '../components/workspace/WorkspaceSurface.tsx';
import { LeadDetailsPanel } from '../components/chat/LeadDetailsPanel.tsx';
import { MessageAttachment } from '../components/chat/MessageAttachment.tsx';
import { useSocket } from '../hooks/useSocket.ts';
import {
  uploadChatAttachment,
  useChatMessagesInfiniteQuery,
  useChatsQuery,
  useMarkChatReadMutation,
  useContactsQuery,
  useSendChatMessageMutation,
  useStartChatMutation,
  type ChatFilters,
  type UploadedAttachment,
} from '../hooks/apiHooks.ts';
import { MEDIA_SIZE_LIMITS, formatBytes, guessMediaKind } from '../lib/leadUi.ts';
import { queryClient } from '../lib/queryClient.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { useAuthStore } from '../store/authStore.ts';

function formatMsgTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

type ListFilter = 'all' | 'unread' | 'unassigned';

/** Attachment chosen in the composer, with its upload state. */
type PendingAttachment = {
  file: File;
  /** Set once the upload finishes; until then the send button waits. */
  uploaded?: UploadedAttachment;
  progress: number;
  error?: string;
};

export function ChatsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get('chat') ?? '';
  const setChatId = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('chat', id);
    else next.delete('chat');
    setSearchParams(next);
  };

  const companyId = useAuthStore((s) => s.companyId);
  const userId = useAuthStore((s) => s.user?.id);
  const theme = useAuthStore((s) => s.theme);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const isAdmin = workspaceRole === 'company_admin';

  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const chatFilters: ChatFilters = useMemo(
    () => (listFilter === 'unassigned' ? { assigned: 'unassigned' } : {}),
    [listFilter],
  );
  const chatsQ = useChatsQuery(chatFilters);
  const msgQ = useChatMessagesInfiniteQuery(chatId || null);
  const sendM = useSendChatMessageMutation();
  const startChat = useStartChatMutation();
  const markRead = useMarkChatReadMutation();

  // Opening a conversation clears its unread badge. Keyed off the chat's own unread
  // count so re-renders and revisits do not fire a request for an already-read chat.
  const openChatUnread =
    (chatsQ.data ?? []).find((c) => String(c._id) === chatId)?.unreadCount ?? 0;
  const markReadMutate = markRead.mutate;
  useEffect(() => {
    if (!chatId || openChatUnread <= 0) return;
    markReadMutate(chatId);
  }, [chatId, openChatUnread, markReadMutate]);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const contactsQ = useContactsQuery(1, contactSearch);

  const [listQuery, setListQuery] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [listOpenMobile, setListOpenMobile] = useState(false);

  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  // One attachment at a time: WhatsApp delivers a single media object per message, so
  // a multi-file picker would only be a promise the send could not keep.
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [typingHint, setTypingHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const flatMessages = useMemo(() => {
    const pages = msgQ.data?.pages ?? [];
    return [...pages].reverse().flat();
  }, [msgQ.data?.pages]);

  const handleSocket = useCallback(
    (event: string, payload: unknown) => {
      if (event === 'message:new') {
        const p = payload as { chatId: string };
        void queryClient.invalidateQueries({ queryKey: ['messages', companyId, p.chatId] });
        void queryClient.invalidateQueries({ queryKey: ['chats', companyId] });
      }
      if (event === 'chat:read') {
        // Another agent (or another tab) cleared the badge — refresh the list so this
        // inbox does not keep showing the conversation as unread.
        void queryClient.invalidateQueries({ queryKey: ['chats', companyId] });
      }
      if (event === 'message:status' || event === 'message:media') {
        const p = payload as { chatId: string };
        void queryClient.invalidateQueries({ queryKey: ['messages', companyId, p.chatId] });
      }
      if (event === 'lead:assigned' || event === 'lead:status') {
        void queryClient.invalidateQueries({ queryKey: ['chats', companyId] });
        void queryClient.invalidateQueries({ queryKey: ['lead-counts', companyId] });
      }
      if (event === 'typing') {
        const p = payload as { chatId: string; typing: boolean; userId: string };
        if (p.chatId !== chatId) return;
        if (p.userId === userId) return;
        setTypingHint(p.typing);
      }
    },
    [chatId, companyId, userId],
  );

  const { emitTyping } = useSocket(handleSocket);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = msgQ;

  useEffect(() => {
    if (!chatId) return;
    const el = loadMoreRef.current;
    const root = scrollRef.current;
    if (!el || !root || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { root, rootMargin: '80px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [chatId, fetchNextPage, hasNextPage, flatMessages.length]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatId, flatMessages.length]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '0px';
    ta.style.height = `${Math.min(140, Math.max(42, ta.scrollHeight))}px`;
  }, [draft]);

  useEffect(() => {
    if (!chatId) return;
    emitTyping(chatId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(chatId, false), 1500);
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      emitTyping(chatId, false);
    };
  }, [draft, chatId, emitTyping]);

  const [sendErr, setSendErr] = useState<string | null>(null);

  async function onStartChat(contactId: string) {
    setSendErr(null);
    try {
      const chat = await startChat.mutateAsync({ contactId });
      setChatId(chat._id);
      setNewChatOpen(false);
      setContactSearch('');
      setListOpenMobile(false);
    } catch (er) {
      setSendErr(apiErrorMessage(er));
    }
  }

  /**
   * Uploads the picked file straight to storage, then sends the message.
   *
   * The upload starts as soon as the file is chosen, so by the time the agent finishes
   * typing a caption there is usually nothing left to wait for.
   */
  const onPickFile = useCallback((file: File) => {
    setSendErr(null);
    const kind = guessMediaKind(file.type || 'application/octet-stream');
    const limit = MEDIA_SIZE_LIMITS[kind];
    if (file.size > limit) {
      setSendErr(
        `WhatsApp accepts ${kind} files up to ${formatBytes(limit)} — this one is ${formatBytes(file.size)}.`,
      );
      return;
    }

    setAttachment({ file, progress: 0 });
    void uploadChatAttachment(file, (pct) =>
      setAttachment((prev) => (prev?.file === file ? { ...prev, progress: pct } : prev)),
    )
      .then((uploaded) =>
        setAttachment((prev) =>
          prev?.file === file ? { ...prev, uploaded, progress: 100 } : prev,
        ),
      )
      .catch((e: unknown) =>
        setAttachment((prev) =>
          prev?.file === file ? { ...prev, error: apiErrorMessage(e) } : prev,
        ),
      );
  }, []);

  const attachmentReady = Boolean(attachment?.uploaded);
  const attachmentBusy = Boolean(attachment && !attachment.uploaded && !attachment.error);
  const canSend = Boolean(chatId) && (Boolean(draft.trim()) || attachmentReady) && !attachmentBusy;

  const submitMessage = useCallback(async () => {
    setSendErr(null);
    if (!chatId) return;
    const mediaId = attachment?.uploaded?.mediaId;
    const body = draft.trim();
    if (!body && !mediaId) return;
    if (attachment && !mediaId) {
      setSendErr(attachment.error ?? 'Attachment is still uploading');
      return;
    }
    try {
      await sendM.mutateAsync({
        chatId,
        ...(body ? { body } : {}),
        ...(mediaId ? { mediaId } : {}),
      });
      setDraft('');
      setAttachment(null);
      setEmojiOpen(false);
    } catch (er) {
      setSendErr(apiErrorMessage(er));
    }
  }, [attachment, chatId, draft, sendM]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    await submitMessage();
  }

  const allChats = useMemo(() => chatsQ.data ?? [], [chatsQ.data]);
  const unreadTotal = allChats.reduce((n, c) => n + (c.unreadCount ?? 0), 0);

  const visibleChats = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return allChats.filter((c) => {
      // 'unassigned' is a server-side filter; only 'unread' needs narrowing here.
      if (listFilter === 'unread' && !(c.unreadCount ?? 0)) return false;
      if (!q) return true;
      const hay = `${c.contactId?.name ?? ''} ${c.contactId?.phone ?? ''} ${c.lastMessagePreview ?? ''}`;
      return hay.toLowerCase().includes(q);
    });
  }, [allChats, listFilter, listQuery]);

  const openChat = allChats.find((c) => c._id === chatId);

  // Arriving from the Leads page with ?chat=… while the list is narrowed to unassigned
  // would leave the thread open but the details panel empty, because the selected chat
  // is not in the fetched page. Widen the list instead of showing half a screen.
  useEffect(() => {
    if (chatId && !openChat && listFilter === 'unassigned' && !chatsQ.isLoading) {
      setListFilter('all');
    }
  }, [chatId, openChat, listFilter, chatsQ.isLoading]);

  const openName = openChat?.contactId?.name || openChat?.contactId?.phone || 'Conversation';
  const openPhone = openChat?.contactId?.phone ?? '';

  if (!companyId) {
    return (
      <div className="flex flex-col gap-4 px-5 py-6 md:px-7">
        <NeedsCompanyBanner />
        <p className="text-base text-ink-3">Select a workspace to view chats.</p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- list */
  const chatList = (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex flex-col gap-2.5 border-b border-line-soft p-3.5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 flex-1 items-center gap-2 rounded-control border border-line bg-subtle px-2.5">
            <IconSearch className="h-3.5 w-3.5 shrink-0 text-ink-4" />
            <input
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
              placeholder="Search chats"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-4"
            />
          </div>
          <button
            type="button"
            onClick={() => setNewChatOpen((v) => !v)}
            className="dc-btn dc-btn-sm dc-btn-primary w-[30px] px-0"
            aria-label={newChatOpen ? 'Close new chat' : 'New chat'}
          >
            {newChatOpen ? <IconClose className="h-3.5 w-3.5" /> : <IconPlus className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setListFilter('all')}
            className={`dc-pill ${listFilter === 'all' ? 'dc-pill-active' : ''}`}
          >
            All <span className="opacity-60 tabular-nums">{allChats.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setListFilter('unread')}
            className={`dc-pill ${listFilter === 'unread' ? 'dc-pill-active' : ''}`}
          >
            Unread <span className="opacity-60 tabular-nums">{unreadTotal}</span>
          </button>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setListFilter('unassigned')}
              className={`dc-pill ${listFilter === 'unassigned' ? 'dc-pill-active' : ''}`}
              title="Leads nobody owns yet"
            >
              Unassigned
            </button>
          ) : null}
        </div>
      </div>

      {newChatOpen ? (
        <div className="border-b border-line-soft bg-muted p-3">
          <input
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            placeholder="Search contact by name or phone…"
            className="dc-input h-8 text-sm"
          />
          <div className="mt-2 max-h-48 overflow-y-auto">
            {contactsQ.isLoading ? (
              <p className="py-2 text-sm text-ink-3">Loading contacts…</p>
            ) : !(contactsQ.data?.data ?? []).length ? (
              <p className="py-2 text-sm text-ink-3">No contacts found. Add contacts first.</p>
            ) : (
              (contactsQ.data?.data ?? []).map((c) => (
                <button
                  key={c._id}
                  type="button"
                  disabled={startChat.isPending}
                  onClick={() => void onStartChat(c._id)}
                  className="flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-base hover:bg-brand-soft"
                >
                  <span className="truncate font-medium text-ink">{c.name || c.phone}</span>
                  {c.name ? <span className="ml-auto font-mono text-xs text-ink-4">{c.phone}</span> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {chatsQ.isLoading ? (
          <p className="p-4 text-base text-ink-3">Loading…</p>
        ) : chatsQ.isError ? (
          <p className="p-4 text-base text-danger">Failed to load chats.</p>
        ) : !visibleChats.length ? (
          <p className="p-6 text-center text-base text-ink-3">
            {allChats.length ? 'No chats match this filter.' : 'No conversations yet. Start one with +.'}
          </p>
        ) : (
          visibleChats.map((c) => {
            const title = c.contactId?.name || c.contactId?.phone || 'Contact';
            const active = c._id === chatId;
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => {
                  setChatId(c._id);
                  setListOpenMobile(false);
                }}
                className={`flex w-full gap-2.5 border-b border-line-faint border-l-2 px-3.5 py-3 text-left transition-colors ${
                  active ? 'border-l-brand bg-subtle' : 'border-l-transparent bg-surface hover:bg-muted'
                }`}
              >
                <Avatar name={title} className="h-[34px] w-[34px] text-sm" plain />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`truncate text-base text-ink ${c.unreadCount ? 'font-semibold' : 'font-medium'}`}
                    >
                      {title}
                    </span>
                    {c.lastMessageAt ? (
                      <span className="ml-auto shrink-0 text-xs text-ink-4">{formatMsgTime(c.lastMessageAt)}</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-ink-3">{c.lastMessagePreview ?? 'No preview'}</span>
                    {c.unreadCount ? (
                      <span className="ml-auto flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-2xs font-semibold text-white">
                        {c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  {/* Only admins see other people's leads, so the owner is only worth
                      naming for them. */}
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-2xs text-ink-4">
                        {c.assignedToUser?.name ?? c.assignedToUser?.email ?? 'Unassigned'}
                      </span>
                      {c.productName ? (
                        <span className="ml-auto shrink-0 truncate text-2xs text-ink-4">
                          {c.productName}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      {/* Chat list — static column on desktop, drawer on mobile */}
      <div className="hidden w-[300px] shrink-0 border-r border-line md:block">{chatList}</div>
      {listOpenMobile ? (
        <div className="dc-scrim md:hidden" onClick={() => setListOpenMobile(false)}>
          <div className="h-full w-[min(20rem,88vw)] shadow-drawer" onClick={(e) => e.stopPropagation()}>
            {chatList}
          </div>
        </div>
      ) : null}

      {/* Thread */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-subtle">
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line bg-surface px-3.5 md:px-4">
          <button
            type="button"
            className="dc-btn dc-btn-sm w-[30px] px-0 md:hidden"
            onClick={() => setListOpenMobile(true)}
            aria-label="Open chat list"
          >
            <IconChevronDown className="h-3.5 w-3.5 rotate-90" />
          </button>

          {chatId ? (
            <>
              <Avatar name={openName} className="h-8 w-8 text-sm" plain />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-md font-semibold text-ink">{openName}</span>
                <span className="truncate text-sm text-ink-4">
                  {openPhone ? `${openPhone} · ` : ''}WhatsApp
                </span>
              </div>
              <div className="ml-auto flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDetailsOpen((v) => !v)}
                  className={`dc-btn dc-btn-sm ${detailsOpen ? 'border-brand bg-brand-soft text-brand-ink' : ''}`}
                >
                  <IconInfo className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Details</span>
                </button>
              </div>
            </>
          ) : (
            <span className="text-md font-semibold text-ink">Inbox</span>
          )}
        </div>

        {!chatId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-8 text-center">
            <p className="text-md font-semibold text-ink">Pick a conversation</p>
            <p className="max-w-xs text-base text-ink-3">
              Choose a contact from the list to read and reply, or start a new chat.
            </p>
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 py-5 md:px-6"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div ref={loadMoreRef} className="h-px w-full shrink-0" />
              {isFetchingNextPage ? (
                <p className="self-center text-xs text-ink-4">Loading older…</p>
              ) : null}
              {msgQ.isLoading ? (
                <p className="self-center text-base text-ink-3">Loading messages…</p>
              ) : msgQ.isError ? (
                <p className="self-center text-base text-danger">Could not load messages.</p>
              ) : !flatMessages.length ? (
                <p className="self-center text-base text-ink-3">No messages yet — say hello.</p>
              ) : (
                flatMessages.map((m, i) => {
                  const out = m.direction === 'outbound';
                  const prev = flatMessages[i - 1];
                  const showDay =
                    !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                  return (
                    <div key={m._id} className="contents">
                      {showDay ? (
                        <span className="self-center rounded-full bg-line-soft px-2.5 py-0.5 text-xs text-ink-4">
                          {formatDayLabel(m.createdAt)}
                        </span>
                      ) : null}
                      <div
                        className={`flex max-w-[min(88%,32rem)] flex-col gap-1.5 border px-3 py-2.5 ${
                          out
                            ? 'self-end rounded-[10px] rounded-br-[3px] border-brand-line bg-brand-soft'
                            : 'self-start rounded-[10px] rounded-bl-[3px] border-line bg-surface'
                        }`}
                      >
                        {m.media ? <MessageAttachment media={m.media} outbound={out} /> : null}
                        {/* An attachment with no caption carries a placeholder body like
                            "[image]" — showing it under the picture would be noise. */}
                        {m.body && !(m.media && /^\[[a-z ]+(: .*)?\]$/i.test(m.body.trim())) ? (
                          <span className="whitespace-pre-wrap break-words text-base leading-relaxed text-ink">
                            {m.body}
                          </span>
                        ) : null}
                        <span
                          className={`flex items-center gap-1.5 self-end text-2xs ${
                            out ? 'text-brand-ink/75' : 'text-ink-4'
                          }`}
                        >
                          {m.isAutomated ? (
                            <span className="dc-badge px-1.5 py-0 text-2xs" title="Sent by an auto-response rule">
                              auto
                            </span>
                          ) : null}
                          <span className="tabular-nums">{formatMsgTime(m.createdAt)}</span>
                          {out ? <WaOutboundTicks status={m.status} statusDetail={m.statusDetail} /> : null}
                        </span>
                        {out && m.status === 'failed' && m.statusDetail ? (
                          <span className="text-2xs leading-snug text-danger">{m.statusDetail}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
              {typingHint ? (
                <div className="self-start rounded-[10px] rounded-bl-[3px] border border-line bg-surface px-3 py-2 text-sm italic text-ink-4">
                  Someone is typing…
                </div>
              ) : null}
            </div>

            {attachment ? (
              <div className="mx-4 mb-1 flex items-center gap-2.5 rounded-control border border-line bg-surface px-3 py-2">
                <IconPaperclip className="h-3.5 w-3.5 shrink-0 text-ink-4" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm text-ink">
                    {attachment.file.name}{' '}
                    <span className="text-ink-4">({formatBytes(attachment.file.size)})</span>
                  </span>
                  {attachment.error ? (
                    <span className="text-2xs text-danger">{attachment.error}</span>
                  ) : attachment.uploaded ? (
                    <span className="text-2xs text-ink-4">
                      Ready to send as {attachment.uploaded.kind}
                    </span>
                  ) : (
                    <div className="h-1 w-full overflow-hidden rounded-full bg-line-soft">
                      <div
                        className="h-full rounded-full bg-brand transition-[width] duration-200"
                        style={{ width: `${attachment.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-control p-1.5 text-ink-4 hover:bg-line-soft hover:text-ink"
                  onClick={() => setAttachment(null)}
                  aria-label="Remove attachment"
                >
                  <IconClose className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}

            <form
              onSubmit={onSend}
              className="flex shrink-0 flex-col gap-2.5 border-t border-line bg-surface px-4 pb-3.5 pt-3 md:px-5"
              style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
            >
              {sendErr ? <p className="dc-note dc-note-danger">{sendErr}</p> : null}

              <div className="overflow-hidden rounded-card border border-line">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message"
                    rows={1}
                    className="max-h-36 w-full resize-none border-0 bg-surface px-3 py-2.5 text-base leading-relaxed text-ink outline-none placeholder:text-ink-4"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void submitMessage();
                      }
                    }}
                  />
                  {emojiOpen ? (
                    <div className="absolute bottom-[calc(100%+8px)] right-0 z-20 drop-shadow-xl">
                      <EmojiPicker
                        theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                        onEmojiClick={(ev) => setDraft((d) => d + ev.emoji)}
                      />
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5 border-t border-line-soft bg-subtle px-2.5 py-2">
                  <label className="dc-btn dc-btn-xs cursor-pointer">
                    <IconPaperclip className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Attach</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onPickFile(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="dc-btn dc-btn-xs"
                    onClick={() => setEmojiOpen((v) => !v)}
                    aria-label="Emoji"
                  >
                    <IconSmile className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Emoji</span>
                  </button>
                  <button
                    type="submit"
                    disabled={sendM.isPending || !canSend}
                    className="dc-btn dc-btn-xs dc-btn-primary ml-auto px-4 font-medium"
                  >
                    {sendM.isPending ? '…' : attachmentBusy ? 'Uploading…' : 'Send'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </section>

      {/* Contact details */}
      {chatId && detailsOpen && openChat ? (
        <aside className="hidden w-[288px] shrink-0 flex-col overflow-y-auto border-l border-line bg-surface lg:flex">
          <LeadDetailsPanel chat={openChat} />
        </aside>
      ) : null}
      {/* Mobile/tablet: the same panel as a drawer, since there is no room beside the thread. */}
      {chatId && detailsOpen && openChat ? (
        <div className="dc-scrim lg:hidden" onClick={() => setDetailsOpen(false)}>
          <div className="dc-drawer overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-14 shrink-0 items-center border-b border-line px-4">
              <span className="text-md font-semibold text-ink">Lead details</span>
              <button
                type="button"
                className="ml-auto rounded-control p-1.5 text-ink-4 hover:bg-line-soft"
                onClick={() => setDetailsOpen(false)}
                aria-label="Close details"
              >
                <IconClose className="h-3.5 w-3.5" />
              </button>
            </div>
            <LeadDetailsPanel chat={openChat} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
