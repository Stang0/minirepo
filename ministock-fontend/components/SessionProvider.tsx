"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import type { AuthSession, SessionUser } from '@/lib/types';

interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const STORAGE_KEY = 'ministock-session';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoading(false);
        return;
      }

      try {
        const session = JSON.parse(raw) as AuthSession;
        if (!session?.token) {
          throw new Error('Invalid session');
        }

        const response = await api.get('/auth/session', {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        });

        setUser(response.data);
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            token: session.token,
            user: response.data
          } satisfies AuthSession)
        );
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const session = response.data as AuthSession;
    setUser(session.user);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    router.push('/');
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
    router.push('/login');
  };

  return (
    <SessionContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
