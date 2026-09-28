import EmojiPicker, { Theme } from 'emoji-picker-react';
import {
  FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IconBolt,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconClose,
  IconInfo,
  IconPaperclip,
  IconPlus,
  IconSearch,
  IconSmile,
  IconTemplate,
} from '../components/Icons.tsx';
import { WaOutboundTicks } from '../components/WaOutboundTicks.tsx';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
import { Avatar } from '../components/workspace/WorkspaceSurface.tsx';
import { LeadDetailsPanel } from '../components/chat/LeadDetailsPanel.tsx';
import { MessageAttachment } from '../components/chat/MessageAttachment.tsx';
import { useSocket } from '../hooks/useSocket.ts';
import {
  useReassignLeadMutation,
  useUpdateLeadStatusMutation,
  uploadChatAttachment,
  useChatDetailQuery,
  useChatMessagesInfiniteQuery,
  useChatsQuery,
  useLeadCountsQuery,
  useMarkChatReadMutation,
  useContactsQuery,
  useQuickRepliesQuery,
  useTeamQuery,
  useTemplatesQuery,
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

/** The design's three views. Agents only ever see their own, so they get no tabs. */
/** "3h 12m" / "48m" — the countdown the design shows above the composer. */
function formatWindowLeft(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** Popover anchored to the composer bar, with a click-away layer behind it. */
function Picker(props: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-20 cursor-default"
        aria-label={`Close ${props.title}`}
        onClick={props.onClose}
      />
      <div className="absolute bottom-[calc(100%+8px)] left-2 z-30 flex max-h-72 w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-modal">
        <div className="shrink-0 border-b border-line-soft px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-4">
          {props.title}
        </div>
        <div className="flex min-h-0 flex-col overflow-y-auto py-1">{props.children}</div>
      </div>
    </>
  );
}

/** The design's three views. Agents only ever see their own, so they get no tabs. */
type ListFilter = 'mine' | 'unassigned' | 'all';

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

  const [listFilter, setListFilter] = useState<ListFilter>('mine');
  const chatFilters: ChatFilters = useMemo(() => ({ assigned: listFilter }), [listFilter]);
  const chatsQ = useChatsQuery(chatFilters);
  const countsQ = useLeadCountsQuery();
  const teamQ = useTeamQuery();

  // "Mine" counts the leads still open with me, which the roster already computes —
  // the workspace total from countsQ would be wrong on this pill for an admin.
  const myLeadCount = useMemo(
    () => (teamQ.data ?? []).find((m) => m.userId?._id === userId)?.openLeadCount,
    [teamQ.data, userId],
  );
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

  const [assignOpen, setAssignOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  const [draft, setDraft] = useState('');
  /** Set when the draft came from a saved reply, so its usage counter can be bumped. */
  const [usedQuickReplyId, setUsedQuickReplyId] = useState<string | null>(null);
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

  const openChat = useMemo(
    () => (chatsQ.data ?? []).find((c) => c._id === chatId),
    [chatsQ.data, chatId],
  );

  const detailQ = useChatDetailQuery(chatId || null);
  const quickRepliesQ = useQuickRepliesQuery();
  const templatesQ = useTemplatesQuery();
  const reassign = useReassignLeadMutation();
  const updateStatus = useUpdateLeadStatusMutation();

  const serviceWindow = detailQ.data?.serviceWindow;
  // Only a window we can prove is shut blocks the composer. An in-flight request, or a
  // conversation older than this tracking, leaves the agent free to try — letting
  // WhatsApp refuse is better than greying out the box on a guess.
  const windowClosed = Boolean(serviceWindow?.known && !serviceWindow.open);
  const windowOpen = !windowClosed;
  /** True when the contact has never written, so only a template can open the chat. */
  const neverMessaged = Boolean(serviceWindow?.known && !serviceWindow.expiresAt);
  const isChatClosed = openChat?.status === 'won' || openChat?.status === 'lost';

  const approvedTemplates = useMemo(
    () => (templatesQ.data ?? []).filter((t) => t.status === 'APPROVED'),
    [templatesQ.data],
  );

  async function onAssign(assignedTo: string | null) {
    setSendErr(null);
    setAssignOpen(false);
    if (!chatId) return;
    try {
      await reassign.mutateAsync({ chatId, assignedTo });
    } catch (er) {
      setSendErr(apiErrorMessage(er));
    }
  }

  async function onCloseChat(status: 'won' | 'lost') {
    setSendErr(null);
    setCloseOpen(false);
    if (!chatId) return;
    try {
      await updateStatus.mutateAsync({ chatId, status });
    } catch (er) {
      setSendErr(apiErrorMessage(er));
    }
  }

  async function onSendTemplate(templateId: string) {
    setSendErr(null);
    setTemplateOpen(false);
    if (!chatId) return;
    try {
      await sendM.mutateAsync({ chatId, templateId });
      setDraft('');
      setAttachment(null);
    } catch (er) {
      setSendErr(apiErrorMessage(er));
    }
  }

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
  const canSend =
    Boolean(chatId) && (Boolean(draft.trim()) || attachmentReady) && !attachmentBusy && windowOpen;

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
    if (windowClosed) {
      setSendErr('Free text will not reach this contact — send an approved template instead.');
      return;
    }
    try {
      await sendM.mutateAsync({
        chatId,
        ...(body ? { body } : {}),
        ...(mediaId ? { mediaId } : {}),
        ...(usedQuickReplyId ? { quickReplyId: usedQuickReplyId } : {}),
      });
      setDraft('');
      setAttachment(null);
      setUsedQuickReplyId(null);
      setEmojiOpen(false);
    } catch (er) {
      setSendErr(apiErrorMessage(er));
    }
  }, [attachment, chatId, draft, sendM, windowClosed, usedQuickReplyId]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    await submitMessage();
  }

  const allChats = useMemo(() => chatsQ.data ?? [], [chatsQ.data]);
  const unreadTotal = allChats.reduce((n, c) => n + (c.unreadCount ?? 0), 0);

  // Scope is applied server-side; only the search box narrows further.
  const visibleChats = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return allChats;
    return allChats.filter((c) => {
      const hay = `${c.contactId?.name ?? ''} ${c.contactId?.phone ?? ''} ${c.lastMessagePreview ?? ''}`;
      return hay.toLowerCase().includes(q);
    });
  }, [allChats, listQuery]);

  // Arriving from the Leads page with ?chat=… for someone else's lead would leave the
  // thread open but the rail empty, because the selected chat is not in the fetched
  // page. Widen to all chats instead of showing half a screen. Agents are pinned
  // server-side, so this only ever helps an admin.
  useEffect(() => {
    if (chatId && !openChat && isAdmin && listFilter !== 'all' && !chatsQ.isLoading) {
      setListFilter('all');
    }
  }, [chatId, openChat, isAdmin, listFilter, chatsQ.isLoading]);

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
        {/* Agents are pinned to their own leads server-side, so the other two views
            would only ever repeat "Mine" for them. */}
        {isAdmin ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setListFilter('mine')}
              className={`dc-pill ${listFilter === 'mine' ? 'dc-pill-active' : ''}`}
            >
              Mine
              {myLeadCount != null ? (
                <span className="opacity-60 tabular-nums">{myLeadCount}</span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setListFilter('unassigned')}
              className={`dc-pill ${listFilter === 'unassigned' ? 'dc-pill-active' : ''}`}
              title="Leads nobody owns yet"
            >
              Unassigned
              {countsQ.data?.unassigned != null ? (
                <span className="opacity-60 tabular-nums">{countsQ.data.unassigned}</span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setListFilter('all')}
              className={`dc-pill ${listFilter === 'all' ? 'dc-pill-active' : ''}`}
            >
              All chats
            </button>
          </div>
        ) : unreadTotal ? (
          <span className="px-0.5 text-xs text-ink-4">
            {unreadTotal} unread across your leads
          </span>
        ) : null}
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
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-2xs text-ink-4">
                      {!c.assignedTo
                        ? 'Unassigned'
                        : c.assignedTo === userId
                          ? 'Assigned to you'
                          : `Assigned to ${c.assignedToUser?.name ?? c.assignedToUser?.email ?? 'a teammate'}`}
                    </span>
                    {c.productName ? (
                      <span className="ml-auto shrink-0 truncate text-2xs text-ink-4">
                        {c.productName}
                      </span>
                    ) : null}
                  </div>
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
              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                {isAdmin ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAssignOpen((v) => !v)}
                      className="dc-btn dc-btn-sm"
                    >
                      <span className="hidden sm:inline">Assign</span>
                      <IconChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {assignOpen ? (
                      <>
                        {/* Click-away layer; a menu that only closes on re-click is a trap
                            on touch. */}
                        <button
                          type="button"
                          className="fixed inset-0 z-20 cursor-default"
                          aria-label="Close assign menu"
                          onClick={() => setAssignOpen(false)}
                        />
                        <div className="absolute right-0 top-[calc(100%+6px)] z-30 flex w-[230px] flex-col overflow-hidden rounded-card border border-line bg-surface py-1 shadow-modal">
                          <button
                            type="button"
                            className="px-3 py-2 text-left text-sm text-ink-3 hover:bg-line-soft"
                            onClick={() => void onAssign(null)}
                          >
                            Unassign — back to the pool
                          </button>
                          <div className="my-1 h-px bg-line-soft" />
                          {(teamQ.data ?? [])
                            .filter((m) => m.userId)
                            .map((m) => (
                              <button
                                key={m.userId!._id}
                                type="button"
                                className={`flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-line-soft ${
                                  openChat?.assignedTo === m.userId!._id
                                    ? 'font-semibold text-brand-ink'
                                    : 'text-ink'
                                }`}
                                onClick={() => void onAssign(m.userId!._id)}
                              >
                                <Avatar
                                  name={m.userId!.name ?? m.userId!.email}
                                  className="h-5 w-5 text-[9px]"
                                  plain
                                />
                                <span className="truncate">
                                  {m.userId!.name ?? m.userId!.email}
                                </span>
                                <span className="ml-auto shrink-0 tabular-nums text-2xs text-ink-4">
                                  {m.openLeadCount}
                                </span>
                              </button>
                            ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="dc-btn dc-btn-sm"
                  disabled={updateStatus.isPending || isChatClosed}
                  title={
                    isChatClosed
                      ? 'This lead is already closed'
                      : 'Mark the lead won or lost and stop counting it as open'
                  }
                  onClick={() => setCloseOpen(true)}
                >
                  <span className="hidden sm:inline">
                    {isChatClosed ? 'Closed' : 'Close chat'}
                  </span>
                  <IconCheck className="h-3.5 w-3.5 sm:hidden" />
                </button>

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

            {/* WhatsApp only delivers a free-form reply within 24 hours of the contact's
                last message. Saying so up front beats an agent typing a paragraph that
                Meta then refuses. */}
            {serviceWindow?.known ? (
              <div
                className={`mx-4 mb-1 flex items-center gap-2 rounded-control border px-3 py-2 text-sm md:mx-5 ${
                  serviceWindow.open
                    ? 'border-warn-line bg-warn-soft text-warn'
                    : 'border-line bg-subtle text-ink-3'
                }`}
              >
                <IconClock className="h-3.5 w-3.5 shrink-0" />
                {serviceWindow.open ? (
                  <span>
                    Free-text window closes in{' '}
                    <strong className="font-semibold">
                      {formatWindowLeft(serviceWindow.minutesLeft)}
                    </strong>
                    . After that only approved templates can be sent.
                  </span>
                ) : neverMessaged ? (
                  <span>
                    This contact has not messaged you yet — WhatsApp only allows an
                    approved template to open the conversation.
                  </span>
                ) : (
                  <span>
                    The 24-hour window has closed — only an approved template will reach
                    this contact now.
                  </span>
                )}
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
                    onChange={(e) => {
                      setDraft(e.target.value);
                      // The credit belongs to the saved reply only while its text is
                      // still in the box.
                      if (!e.target.value.trim()) setUsedQuickReplyId(null);
                    }}
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

                <div className="relative flex items-center gap-1.5 border-t border-line-soft bg-subtle px-2.5 py-2">
                  <button
                    type="button"
                    className={`dc-btn dc-btn-xs ${!windowOpen ? 'border-brand bg-brand-soft text-brand-ink' : ''}`}
                    onClick={() => {
                      setQuickOpen(false);
                      setTemplateOpen((v) => !v);
                    }}
                  >
                    <IconTemplate className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Template</span>
                  </button>
                  <button
                    type="button"
                    className="dc-btn dc-btn-xs"
                    disabled={!windowOpen}
                    title={
                      windowOpen
                        ? 'Insert a saved reply'
                        : 'Saved replies are free text, so they need an open window'
                    }
                    onClick={() => {
                      setTemplateOpen(false);
                      setQuickOpen((v) => !v);
                    }}
                  >
                    <IconBolt className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Quick reply</span>
                  </button>

                  {templateOpen ? (
                    <Picker onClose={() => setTemplateOpen(false)} title="Approved templates">
                      {!approvedTemplates.length ? (
                        <p className="px-3 py-2.5 text-sm text-ink-3">
                          No approved templates yet — submit one on the Templates page.
                        </p>
                      ) : (
                        approvedTemplates.map((t) => (
                          <button
                            key={t._id}
                            type="button"
                            className="flex flex-col gap-0.5 px-3 py-2 text-left hover:bg-line-soft"
                            onClick={() => void onSendTemplate(t._id)}
                          >
                            <span className="truncate text-sm font-medium text-ink">{t.name}</span>
                            <span className="line-clamp-2 text-xs text-ink-4">{t.body}</span>
                          </button>
                        ))
                      )}
                    </Picker>
                  ) : null}

                  {quickOpen ? (
                    <Picker onClose={() => setQuickOpen(false)} title="Saved replies">
                      {!(quickRepliesQ.data ?? []).length ? (
                        <p className="px-3 py-2.5 text-sm text-ink-3">
                          No saved replies yet — add them in Automation.
                        </p>
                      ) : (
                        (quickRepliesQ.data ?? []).map((q) => (
                          <button
                            key={q._id}
                            type="button"
                            className="flex flex-col gap-0.5 px-3 py-2 text-left hover:bg-line-soft"
                            onClick={() => {
                              // Inserted rather than sent: the agent almost always wants
                              // to personalise the opening line first.
                              setDraft((d) => (d.trim() ? `${d.trimEnd()}\n${q.body}` : q.body));
                              setUsedQuickReplyId(q._id);
                              setQuickOpen(false);
                              textareaRef.current?.focus();
                            }}
                          >
                            <span className="truncate text-sm font-medium text-ink">
                              {q.title}
                              {q.shortcut ? (
                                <span className="ml-1.5 font-mono text-2xs text-ink-4">
                                  /{q.shortcut}
                                </span>
                              ) : null}
                            </span>
                            <span className="line-clamp-2 text-xs text-ink-4">{q.body}</span>
                          </button>
                        ))
                      )}
                    </Picker>
                  ) : null}

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
          <LeadDetailsPanel chat={openChat} detail={detailQ.data ?? null} />
        </aside>
      ) : null}
      {/* Closing a lead is a pipeline outcome, not a dismissal, so it asks which one —
          "won" and "lost" are what the reports and the round-robin load depend on. */}
      {closeOpen ? (
        <div className="dc-scrim" onClick={() => setCloseOpen(false)}>
          <div className="dc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dc-card-head">
              <h2 className="dc-card-title">Close this lead</h2>
              <button
                type="button"
                className="ml-auto rounded-control p-1.5 text-ink-4 hover:bg-line-soft"
                onClick={() => setCloseOpen(false)}
                aria-label="Close"
              >
                <IconClose className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-3.5 p-4">
              <p className="text-base text-ink-3">
                It stops counting against {openChat?.assignedTo === userId ? 'your' : 'the agent’s'}{' '}
                open leads. The conversation stays in the inbox.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="dc-btn dc-btn-primary flex-1"
                  disabled={updateStatus.isPending}
                  onClick={() => void onCloseChat('won')}
                >
                  Won
                </button>
                <button
                  type="button"
                  className="dc-btn dc-btn-danger flex-1"
                  disabled={updateStatus.isPending}
                  onClick={() => void onCloseChat('lost')}
                >
                  Lost
                </button>
              </div>
            </div>
          </div>
        </div>
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
            <LeadDetailsPanel chat={openChat} detail={detailQ.data ?? null} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
