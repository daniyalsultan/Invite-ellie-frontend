export type StoredSession = {
  accessToken: string;
  refreshToken: string | null;
  userId: string | null;
  expiresAt: number | null;
};

export type SessionStorageType = 'local' | 'session';

export type PersistedSession = StoredSession & {
  storage: SessionStorageType;
};

const LEGACY_KEYS = {
  accessToken: 'ellie_access_token',
  refreshToken: 'ellie_refresh_token',
  userId: 'ellie_user_id',
  expiresAt: 'ellie_access_token_expires_at',
};

const STORAGE_KEY = 'ellie_session';
const STORAGE_SOURCE_KEY = 'ellie_session_source';

export function saveSession(session: StoredSession, storage: SessionStorageType = 'local'): void {
  try {
    const payload = JSON.stringify(session);
    const targetStorage = storage === 'local' ? localStorage : sessionStorage;
    targetStorage.setItem(STORAGE_KEY, payload);

    if (storage === 'local') {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    localStorage.setItem(STORAGE_SOURCE_KEY, storage);
    clearLegacyKeys();
  } catch {
    /* noop */
  }
}

export function loadSession(): PersistedSession | null {
  try {
    const preferredSource = localStorage.getItem(STORAGE_SOURCE_KEY) as SessionStorageType | null;
    const storagesToCheck: SessionStorageType[] =
      preferredSource === 'session'
        ? ['session', 'local']
        : preferredSource === 'local'
          ? ['local', 'session']
          : ['local', 'session'];

    for (const storage of storagesToCheck) {
      const raw =
        storage === 'local' ? localStorage.getItem(STORAGE_KEY) : sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSession;
        return {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken ?? null,
          userId: parsed.userId ?? null,
          expiresAt: parsed.expiresAt ?? null,
          storage,
        };
      }
    }

    const legacyAccessToken = localStorage.getItem(LEGACY_KEYS.accessToken);
    if (legacyAccessToken) {
      const legacySession: StoredSession = {
        accessToken: legacyAccessToken,
        refreshToken: localStorage.getItem(LEGACY_KEYS.refreshToken),
        userId: localStorage.getItem(LEGACY_KEYS.userId),
        expiresAt: parseNumber(localStorage.getItem(LEGACY_KEYS.expiresAt)),
      };
      saveSession(legacySession, 'local');
      clearLegacyKeys();
      return { ...legacySession, storage: 'local' };
    }

    localStorage.removeItem(STORAGE_SOURCE_KEY);
    return null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SOURCE_KEY);
    clearLegacyKeys();
  } catch {
    /* noop */
  }
}

function clearLegacyKeys(): void {
  try {
    localStorage.removeItem(LEGACY_KEYS.accessToken);
    localStorage.removeItem(LEGACY_KEYS.refreshToken);
    localStorage.removeItem(LEGACY_KEYS.userId);
    localStorage.removeItem(LEGACY_KEYS.expiresAt);
  } catch {
    /* noop */
  }
}

const PKCE_VERIFIER_KEY = 'ellie_sso_pkce_verifier';

// Held client-side rather than relying on the backend's session cookie:
// frontend and backend are on different domains, so that cookie is
// third-party from the browser's POV and gets blocked unpredictably by
// Safari ITP / Chrome's third-party-cookie rollout, causing intermittent
// "PKCE verifier missing" failures on SSO login.
export function savePkceVerifier(verifier: string): void {
  try {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  } catch {
    /* noop */
  }
}

export function takePkceVerifier(): string | null {
  try {
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    return verifier;
  } catch {
    return null;
  }
}

function parseNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

