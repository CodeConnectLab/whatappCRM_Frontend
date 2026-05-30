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
import { IconPaperclip, IconSmile } from '../components/Icons.tsx';
import { WaOutboundTicks } from '../components/WaOutboundTicks.tsx';
import { NeedsCompanyBanner } from '../components/NeedsCompanyBanner.tsx';
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

function initialsFromLabel(label: string): string {
  const p = label.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) {
    const a = p[0]?.[0];
    const b = p[1]?.[0];
    if (a != null && b != null) return (a + b).toUpperCase();
  }
  const sole = p[0];
  if (p.length === 1 && sole && sole.length >= 2) return sole.slice(0, 2).toUpperCase();
  return (label.replace(/\D/g, '').slice(-2) || label.slice(0, 2) || '?').toUpperCase();
}

function formatMsgTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

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
    const next = Math.min(160, Math.max(48, ta.scrollHeight));
    ta.style.height = `${next}px`;
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

  const chatCount = chatsQ.data?.length ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3">
      <NeedsCompanyBanner />

      {!companyId ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a workspace to view chats.</p>
      ) : (
        <>
          {sendErr && !chatId ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{sendErr}</p>
          ) : null}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-card ring-1 ring-zinc-950/[0.03] dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:ring-white/[0.04] md:flex-row">
          <aside className="hidden w-80 shrink-0 flex-col border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-950/50 md:flex md:border-b-0 md:border-r">
            <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3.5 dark:border-zinc-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Inbox</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Conversations
                  {chatCount > 0 ? (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
                      {chatCount}
                    </span>
                  ) : null}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewChatOpen((v) => !v)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                {newChatOpen ? 'Close' : 'New chat'}
              </button>
            </div>
            {newChatOpen ? (
              <div className="border-b border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <input
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search contact by name or phone…"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
                <div className="mt-2 max-h-48 overflow-y-auto">
                  {contactsQ.isLoading ? (
                    <p className="py-2 text-xs text-zinc-500">Loading contacts…</p>
                  ) : (contactsQ.data?.data ?? []).length === 0 ? (
                    <p className="py-2 text-xs text-zinc-500">
                      No contacts found. Add contacts first, then start a chat.
                    </p>
                  ) : (
                    (contactsQ.data?.data ?? []).map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        disabled={startChat.isPending}
                        onClick={() => void onStartChat(c._id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {c.name || c.phone}
                        </span>
                        {c.name ? (
                          <span className="font-mono text-xs text-zinc-500">{c.phone}</span>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
            <div className="flex-1 overflow-y-auto">
              {chatsQ.isLoading ? (
                <div className="p-4 text-sm text-zinc-500">Loading…</div>
              ) : chatsQ.isError ? (
                <div className="p-4 text-sm text-red-600 dark:text-red-400">Failed to load chats.</div>
              ) : chatCount === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No conversations yet. Click <strong>New chat</strong> to message a contact, or wait for
                  inbound WhatsApp messages.
                </div>
              ) : (
                (chatsQ.data ?? []).map((c) => {
                  const title = c.contactId?.name || c.contactId?.phone || 'Contact';
                  const active = c._id === chatId;
                  const ini = initialsFromLabel(title);
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setChatId(c._id)}
                      className={`flex w-full gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors dark:border-zinc-800/80 ${
                        active
                          ? 'bg-emerald-50 dark:bg-emerald-950/35'
                          : 'hover:bg-white dark:hover:bg-zinc-900/60'
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                          active
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                            : 'border border-zinc-200/80 bg-white text-emerald-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-emerald-300'
                        }`}
                      >
                        {ini}
                      </span>
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-semibold text-zinc-900 dark:text-white">{title}</span>
                        </div>
                        <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {c.lastMessagePreview ?? 'No preview'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#e5ddd5] dark:bg-[#0b141a]">
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 0l32 32-32 32L0 32z' fill='%23000' fill-opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: '64px 64px',
              }}
              aria-hidden
            />

            <div className="relative z-10 flex shrink-0 items-center gap-2 border-b border-black/10 bg-white/95 px-3 py-3 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95 md:hidden">
              <button
                type="button"
                onClick={() => setNewChatOpen((v) => !v)}
                className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
              >
                New
              </button>
              <label className="flex min-w-0 flex-1 flex-col text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Thread
                <select
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="">Select conversation…</option>
                  {(chatsQ.data ?? []).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.contactId?.name || c.contactId?.phone || c._id.slice(-6)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {newChatOpen ? (
              <div className="relative z-10 border-b border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
                <input
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search contact…"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {(contactsQ.data?.data ?? []).map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      disabled={startChat.isPending}
                      onClick={() => void onStartChat(c._id)}
                      className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      {c.name || c.phone}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {!chatId ? (
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                <div className="rounded-2xl border border-zinc-200/80 bg-white/90 px-8 py-10 shadow-lg dark:border-zinc-700 dark:bg-zinc-900/90">
                  <p className="text-base font-semibold text-zinc-900 dark:text-white">Pick a conversation</p>
                  <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
                    Choose a contact on the left (or from the menu on mobile) to read and reply.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  ref={scrollRef}
                  className="relative z-10 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-3 py-4 md:px-6 md:py-5"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div ref={loadMoreRef} className="h-1 w-full shrink-0" />
                  {isFetchingNextPage ? (
                    <p className="text-center text-xs font-medium text-zinc-600 dark:text-zinc-400">Loading older…</p>
                  ) : null}
                  {msgQ.isLoading ? (
                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">Loading messages…</p>
                  ) : msgQ.isError ? (
                    <p className="text-center text-sm text-red-600 dark:text-red-400">Could not load messages.</p>
                  ) : flatMessages.length === 0 ? (
                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">No messages yet — say hello.</p>
                  ) : (
                    flatMessages.map((m) => {
                      const out = m.direction === 'outbound';
                      return (
                        <div key={m._id} className={`flex ${out ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[min(92%,28rem)] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-md ring-1 ring-black/5 dark:ring-white/10 ${
                              out
                                ? 'rounded-br-md bg-[#d9fdd3] text-zinc-900 dark:bg-emerald-900/55 dark:text-emerald-50'
                                : 'rounded-bl-md bg-white text-zinc-900 dark:bg-[#202c33] dark:text-zinc-100'
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{m.body}</div>
                            <div
                              className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-normal normal-case tracking-normal ${out ? 'justify-end text-emerald-900/75 dark:text-emerald-200/80' : 'justify-start text-zinc-500 dark:text-zinc-400'}`}
                            >
                              <span className="tabular-nums opacity-90">{formatMsgTime(m.createdAt)}</span>
                              {out ? <WaOutboundTicks status={m.status} statusDetail={m.statusDetail} /> : null}
                            </div>
                            {out && m.status === 'failed' && m.statusDetail ? (
                              <p className="mt-1 text-[10px] leading-snug text-red-700/90 dark:text-red-300/90">
                                {m.statusDetail}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {typingHint ? (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md bg-white/95 px-4 py-2.5 text-xs italic text-zinc-500 shadow-md ring-1 ring-black/5 dark:bg-zinc-800/95 dark:text-zinc-400 dark:ring-white/10">
                        Someone is typing…
                      </div>
                    </div>
                  ) : null}
                </div>

                {pickerFiles.length ? (
                  <div className="relative z-10 mx-3 mb-1 flex flex-wrap gap-2 rounded-xl border border-dashed border-zinc-400/50 bg-white/90 px-3 py-2.5 text-xs dark:border-zinc-500 dark:bg-zinc-900/80">
                    {pickerFiles.map((f) => (
                      <span
                        key={f.name + f.size}
                        className="rounded-lg bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        {f.name} ({Math.round(f.size / 1024)} KB) · preview only
                      </span>
                    ))}
                  </div>
                ) : null}

                <form
                  onSubmit={onSend}
                  className="relative z-10 shrink-0 border-t border-black/10 bg-white/95 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#1f2c33]/98 md:px-5 md:py-4"
                  style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
                >
                  <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-zinc-200/90 bg-white p-2 shadow-inner dark:border-zinc-600/50 dark:bg-zinc-950/80 md:p-2.5">
                    <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-transparent text-zinc-500 transition-colors hover:border-zinc-200 hover:bg-zinc-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-emerald-400">
                      <span className="sr-only">Attach media</span>
                      <IconPaperclip className="h-5 w-5" aria-hidden />
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          setPickerFiles(files);
                          e.target.value = '';
                        }}
                      />
                    </label>

                    <div className="relative min-w-0 flex-1">
                      <textarea
                        ref={textareaRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write a message…"
                        rows={1}
                        className="max-h-40 min-h-[48px] w-full resize-none border-0 bg-transparent px-2 py-3 text-[15px] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
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
                            onEmojiClick={(ev) => {
                              setDraft((d) => d + ev.emoji);
                            }}
                          />
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-zinc-500 transition-colors hover:border-zinc-200 hover:bg-zinc-50 hover:text-amber-600 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-amber-400"
                      onClick={() => setEmojiOpen((v) => !v)}
                      aria-label="Emoji"
                    >
                      <IconSmile className="h-5 w-5" />
                    </button>

                    <button
                      type="submit"
                      disabled={sendM.isPending || !draft.trim()}
                      className="h-11 shrink-0 rounded-xl bg-gradient-to-r from-[#00a884] to-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition enabled:hover:from-emerald-500 enabled:hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {sendM.isPending ? '…' : 'Send'}
                    </button>
                  </div>
                  {sendErr ? (
                    <p className="mx-auto mt-2 max-w-4xl text-xs font-medium text-red-600 dark:text-red-400">{sendErr}</p>
                  ) : null}
                </form>
              </>
            )}
          </section>
        </div>
        </>
      )}
    </div>
  );
}
