const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

const removeTrailingSlash = (value: string): string => {
  if (value.endsWith('/')) {
    return value.slice(0, -1);
  }
  return value;
};

/**
 * Returns the API base URL while making sure we stay on the same loopback host as
 * the current frontend origin. This keeps Django's session cookies (where the PKCE
 * verifier lives) tied to the same site, just as /api/accounts/sso/providers/{provider}/
 * and /api/accounts/sso/callback/ expect.
 * 
 * In development, uses the Vite proxy (/api) to ensure cookies are shared properly.
 */
export function getApiBaseUrl(): string | null {
  // In development, use the proxy path to ensure cookies are shared
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const currentHostname = window.location.hostname;
    if (LOOPBACK_HOSTS.has(currentHostname)) {
      // Use proxy path in development for same-origin cookies
      return '/api';
    }
  }

  const raw = import.meta.env.VITE_API_BASE_URL;
  // Debug: log the raw value to help troubleshoot
  if (import.meta.env.DEV) {
    console.log('VITE_API_BASE_URL raw value:', raw, 'Type:', typeof raw);
  }
  if (typeof raw !== 'string') {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (typeof window !== 'undefined') {
      const currentHostname = window.location.hostname;
      if (
        LOOPBACK_HOSTS.has(currentHostname) &&
        LOOPBACK_HOSTS.has(url.hostname) &&
        currentHostname !== url.hostname
      ) {
        url.hostname = currentHostname;
      }
    }

    return removeTrailingSlash(url.toString());
  } catch {
    return removeTrailingSlash(trimmed);
  }
}

