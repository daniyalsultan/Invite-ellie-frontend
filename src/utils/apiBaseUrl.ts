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
 * In production, uses a proxy path (/api) which is handled by:
 *   - Vercel: Uses Vercel rewrite rules (vercel.json)
 *   - EC2/Other: Uses reverse proxy (Nginx/Apache) configured on the server
 * 
 * This approach avoids CORS issues by making API requests appear same-origin.
 */
export function getApiBaseUrl(): string | null {
  // Use proxy path in both development and production to avoid CORS issues
  // - In development: Vite proxy handles /api -> backend
  // - In production: Vercel rewrite handles /api -> backend
  if (typeof window !== 'undefined') {
    const currentHostname = window.location.hostname;
    
    // In development (localhost), use proxy path
    if (import.meta.env.DEV && LOOPBACK_HOSTS.has(currentHostname)) {
      return '/api';
    }
    
    // In production (Vercel or other hosting), use proxy path to avoid CORS
    // Vercel will rewrite /api/* to the backend URL
    if (!import.meta.env.DEV) {
      return '/api';
    }
  }

  // Fallback: if window is not available (SSR) or other cases, use env variable
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

