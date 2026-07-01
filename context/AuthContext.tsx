"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthState {
  participantId: string | null;
  token: string | null;
  studyPhase: string | null;
  participantLabel: string | null;
}

interface AuthContextType extends AuthState {
  isLoggedIn: boolean;
  mounted: boolean;
  login: (data: { participantId: string; token: string; studyPhase: string; participantLabel?: string | null }) => void;
  logout: () => void;
  notificationPermission: NotificationPermission | "unsupported";
  requestNotificationPermission: () => Promise<void>;
}

const STORAGE_KEY = "mrrs_auth";
const COOKIE_NAME = "mrrs_token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

function setCookie(value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function deleteCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

const AuthContext = createContext<AuthContextType>({
  participantId: null,
  token: null,
  studyPhase: null,
  participantLabel: null,
  isLoggedIn: false,
  mounted: false,
  login: () => {},
  logout: () => {},
  notificationPermission: "default",
  requestNotificationPermission: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    participantId: null,
    token: null,
    studyPhase: null,
    participantLabel: null,
  });
  const [mounted, setMounted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    // Restore session from localStorage and re-set the cookie
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState;
        if (parsed.token && parsed.participantId) {
          setAuth(parsed);
          setCookie(parsed.token); // keep cookie in sync after page reload
        }
      }
    } catch {}

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission("unsupported");
    }

    setMounted(true);
  }, []);

  const login = useCallback(({ participantId, token, studyPhase, participantLabel }: {
    participantId: string;
    token: string;
    studyPhase: string;
    participantLabel?: string | null;
  }) => {
    const state: AuthState = {
      participantId,
      token,
      studyPhase,
      participantLabel: participantLabel ?? null,
    };
    setAuth(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setCookie(token);
  }, []);

  const logout = useCallback(() => {
    setAuth({ participantId: null, token: null, studyPhase: null, participantLabel: null });
    localStorage.removeItem(STORAGE_KEY);
    deleteCookie();
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      ...auth,
      isLoggedIn: !!auth.token && !!auth.participantId,
      mounted,
      login,
      logout,
      notificationPermission,
      requestNotificationPermission,
    }),
    [auth, mounted, login, logout, notificationPermission, requestNotificationPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
