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
import { useSocket } from '../hooks/useSocket.ts';
import {
  useChatMessagesInfiniteQuery,
  useChatsQuery,
  useContactsQuery,
  useSendChatMessageMutation,
  useStartChatMutation,
} from '../hooks/apiHooks.ts';
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

type ListFilter = 'all' | 'unread';

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

  const chatsQ = useChatsQuery();
  const msgQ = useChatMessagesInfiniteQuery(chatId || null);
  const sendM = useSendChatMessageMutation();
  const startChat = useStartChatMutation();

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const contactsQ = useContactsQuery(1, contactSearch);

  const [listQuery, setListQuery] = useState('');
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [listOpenMobile, setListOpenMobile] = useState(false);

  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pickerFiles, setPickerFiles] = useState<File[]>([]);
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
      if (event === 'message:status') {
        const p = payload as { chatId: string };
        void queryClient.invalidateQueries({ queryKey: ['messages', companyId, p.chatId] });
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

  const submitMessage = useCallback(async () => {
    setSendErr(null);
    if (!chatId || !draft.trim()) return;
    try {
      await sendM.mutateAsync({ chatId, body: draft.trim() });
      setDraft('');
      setPickerFiles([]);
      setEmojiOpen(false);
    } catch (er) {
      setSendErr(apiErrorMessage(er));
    }
  }, [chatId, draft, sendM]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    await submitMessage();
  }

  const allChats = useMemo(() => chatsQ.data ?? [], [chatsQ.data]);
  const unreadTotal = allChats.reduce((n, c) => n + (c.unreadCount ?? 0), 0);

  const visibleChats = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return allChats.filter((c) => {
      if (listFilter === 'unread' && !(c.unreadCount ?? 0)) return false;
      if (!q) return true;
      const hay = `${c.contactId?.name ?? ''} ${c.contactId?.phone ?? ''} ${c.lastMessagePreview ?? ''}`;
      return hay.toLowerCase().includes(q);
    });
  }, [allChats, listFilter, listQuery]);

  const openChat = allChats.find((c) => c._id === chatId);
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
                        <span className="whitespace-pre-wrap break-words text-base leading-relaxed text-ink">
                          {m.body}
                        </span>
                        <span
                          className={`flex items-center gap-1.5 self-end text-2xs ${
                            out ? 'text-brand-ink/75' : 'text-ink-4'
                          }`}
                        >
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

            {pickerFiles.length ? (
              <div className="mx-4 mb-1 flex flex-wrap gap-1.5 rounded-control border border-dashed border-line bg-surface px-3 py-2 text-sm">
                {pickerFiles.map((f) => (
                  <span key={f.name + f.size} className="dc-badge">
                    {f.name} ({Math.round(f.size / 1024)} KB) · preview only
                  </span>
                ))}
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
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        setPickerFiles(e.target.files ? Array.from(e.target.files) : []);
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
                    disabled={sendM.isPending || !draft.trim()}
                    className="dc-btn dc-btn-xs dc-btn-primary ml-auto px-4 font-medium"
                  >
                    {sendM.isPending ? '…' : 'Send'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </section>

      {/* Contact details */}
      {chatId && detailsOpen ? (
        <aside className="hidden w-[252px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-surface p-4 lg:flex">
          <div className="flex flex-col items-center gap-2">
            <Avatar name={openName} className="h-[52px] w-[52px] text-lg" plain />
            <span className="text-md font-semibold text-ink">{openName}</span>
            <span className="dc-badge dc-badge-brand rounded-full px-2.5">WhatsApp</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-ink-4">Phone</span>
            <span className="text-base tabular-nums text-ink">{openPhone || '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-ink-4">Last message</span>
            <span className="text-base text-ink">
              {openChat?.lastMessageAt ? new Date(openChat.lastMessageAt).toLocaleString() : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-line-soft pt-3.5">
            <span className="text-xs text-ink-4">Unread</span>
            <span className="text-base tabular-nums text-ink">{openChat?.unreadCount ?? 0}</span>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
