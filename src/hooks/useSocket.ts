import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ?? 'http://localhost:3001';

export const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(WS_URL, {
      auth: { token: `Bearer ${token}` },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('[WS] Connected');
    });

    newSocket.on('disconnect', () => {
      console.log('[WS] Disconnected');
    });

    newSocket.on('connect_error', (err: Error) => {
      console.warn('[WS] Connection error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token]);

  return socket;
};
