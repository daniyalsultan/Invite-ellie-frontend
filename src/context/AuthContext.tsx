import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession as clearStoredSession,
  loadSession,
  saveSession,
  SessionStorageType,
  StoredSession,
} from '../utils/authStorage';

type Session = StoredSession;

type SessionWithStorage = Session & { storage: SessionStorageType };

type AuthContextValue = {
  session: SessionWithStorage | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  establishSession: (session: Session, options?: { rememberMe?: boolean }) => void;
  login: (payload: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  logout: () => void;
  ensureFreshAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [session, setSession] = useState<SessionWithStorage | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const persistSession = useCallback((nextSession: Session, storage: SessionStorageType = 'local') => {
    setSession({ ...nextSession, storage });
    saveSession(nextSession, storage);
  }, []);

  const clearSessionState = useCallback(() => {
    setSession(null);
    clearStoredSession();
  }, []);

  const refreshSession = useCallback(async () => {
    if (!apiBaseUrl || !session?.refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/accounts/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: session.refreshToken,
        }),
      });

      if (!response.ok) {
        clearSessionState();
        return null;
      }

      const data = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
      };

      if (!data.access_token) {
        clearSessionState();
        return null;
      }

      const expiresAt = data.expires_in ? Date.now() + data.expires_in * 1000 : session.expiresAt;

      const nextSession: Session = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? session.refreshToken,
        userId: session.userId,
        expiresAt,
      };

      persistSession(nextSession, session.storage);
      return data.access_token;
    } catch {
      clearSessionState();
      return null;
    }
  }, [apiBaseUrl, clearSessionState, persistSession, session]);

  const ensureFreshAccessToken = useCallback(async () => {
    if (!session?.accessToken) {
      return null;
    }

    if (!session.expiresAt) {
      return session.accessToken;
    }

    const safetyWindowMs = 60 * 1000;
    const now = Date.now();

    if (session.expiresAt - safetyWindowMs > now) {
      return session.accessToken;
    }

    return refreshSession();
  }, [refreshSession, session]);

  const establishSession = useCallback(
    (nextSession: Session, options?: { rememberMe?: boolean }) => {
      const storage: SessionStorageType = options?.rememberMe === false ? 'session' : 'local';
      persistSession(nextSession, storage);
    },
    [persistSession],
  );

  const login = useCallback(
    async ({ email, password, rememberMe }: { email: string; password: string; rememberMe: boolean }) => {
      if (!apiBaseUrl) {
        throw new Error('API base URL is not configured.');
      }

      const response = await fetch(`${apiBaseUrl}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Unable to login. Please check your credentials.';
        throw new Error(errorMessage);
      }

      if (!data.access_token) {
        throw new Error('Login succeeded but no access token was returned.');
      }

      const expiresAt = data.expires_in ? Date.now() + data.expires_in * 1000 : null;

      establishSession(
        {
          accessToken: data.access_token,
          refreshToken: data.refresh_token ?? null,
          userId: data.user_id ?? null,
          expiresAt,
        },
        { rememberMe },
      );
    },
    [apiBaseUrl, establishSession],
  );

  const logout = useCallback(() => {
    clearSessionState();
  }, [clearSessionState]);

  useEffect(() => {
    const storedSession = loadSession();
    if (storedSession) {
      setSession(storedSession);
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.expiresAt && session.expiresAt <= Date.now()) {
      void refreshSession();
    }
  }, [refreshSession, session]);

  const isAuthenticated = useMemo(() => {
    if (!session?.accessToken) {
      return false;
    }

    if (!session.expiresAt) {
      return true;
    }

    return session.expiresAt > Date.now();
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated,
      isInitializing,
      establishSession,
      login,
      logout,
      ensureFreshAccessToken,
    }),
    [ensureFreshAccessToken, establishSession, isAuthenticated, isInitializing, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

