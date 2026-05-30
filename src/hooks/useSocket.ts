import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.ts';

function socketOrigin(): string {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.length > 0) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5173';
}

export function useSocket(onEvent: (event: string, payload: unknown) => void) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const companyId = useAuthStore((s) => s.companyId);
  const userId = useAuthStore((s) => s.user?.id);
  const socketRef = useRef<Socket | null>(null);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!accessToken || !companyId) return;
    const socket = io(socketOrigin(), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token: accessToken, companyId, userId },
    });
    socketRef.current = socket;
    const route = (event: string) => (payload: unknown) => handlerRef.current(event, payload);
    socket.on('message:new', route('message:new'));
    socket.on('typing', route('typing'));
    socket.on('presence:online', route('presence:online'));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, companyId, userId]);

  const emitTyping = (chatId: string, typing: boolean) => {
    socketRef.current?.emit('typing', { chatId, typing });
  };

  const pingPresence = () => {
    socketRef.current?.emit('presence:ping');
  };

  return { emitTyping, pingPresence };
}
