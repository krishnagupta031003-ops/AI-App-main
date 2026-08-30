'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const GUEST_MESSAGE_LIMIT = 5;
const STORAGE_KEY = 'chatarea_guest_usage';

export const UiShellContext = createContext(null);

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readGuestUsage() {
  if (typeof window === 'undefined') {
    return { date: getTodayKey(), count: 0 };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { date: getTodayKey(), count: 0 };
    }

    const parsed = JSON.parse(raw);
    const today = getTodayKey();

    if (parsed?.date !== today) {
      return { date: today, count: 0 };
    }

    return {
      date: today,
      count: Number.isFinite(parsed?.count) ? parsed.count : 0,
    };
  } catch {
    return { date: getTodayKey(), count: 0 };
  }
}

export function UiShellProvider({ children }) {
  const { user } = useAuth();
  const [authModalMode, setAuthModalMode] = useState(null);
  const [guestUsage, setGuestUsage] = useState({ date: getTodayKey(), count: 0 });
  const [guestUsageHydrated, setGuestUsageHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = window.setTimeout(() => {
      setGuestUsage(readGuestUsage());
      setGuestUsageHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !guestUsageHydrated) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUsage));
  }, [guestUsage, guestUsageHydrated]);

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalMode(null);
  }, []);

  const recordGuestMessage = useCallback(() => {
    if (user) return;

    setGuestUsage((current) => {
      const today = getTodayKey();
      const base = current.date === today ? current : { date: today, count: 0 };
      return {
        date: today,
        count: base.count + 1,
      };
    });
  }, [user]);

  const value = {
    authModalMode,
    openAuthModal,
    closeAuthModal,
    guestUsage,
    guestMessageLimit: GUEST_MESSAGE_LIMIT,
    guestMessagesLeft: Math.max(0, GUEST_MESSAGE_LIMIT - guestUsage.count),
    guestLimitReached: guestUsageHydrated && !user && guestUsage.count >= GUEST_MESSAGE_LIMIT,
    isGuest: !user,
    recordGuestMessage,
    currentUser: user,
  };

  return <UiShellContext.Provider value={value}>{children}</UiShellContext.Provider>;
}
