import { getRecallaiBaseUrl } from './transcriptionApi';

/**
 * Sends the signed-in user's access token with every request to recall-server.
 *
 * recall-server used to take the caller's word for who they were: most calls
 * sent only a `userId`, and a user id is not a secret. It is moving to
 * requiring a validated token, so every call has to carry one. Doing that here,
 * once, rather than at each of the ~40 call sites means no path can be missed
 * and none added later can forget — the lesson from two export dialogs that
 * drifted apart.
 *
 * Only requests to recall-server's own base URL are touched, and only when
 * they don't already set Authorization (the export calls do). The token comes
 * from AuthContext's ensureFreshAccessToken, so refreshing still goes through
 * its single-flight logic. Signed out, nothing is added.
 */

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;
let installed = false;

export function setRecallTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

export function installRecallAuthFetch(): void {
  if (installed || typeof window === 'undefined') return;
  const baseUrl = getRecallaiBaseUrl();
  if (!baseUrl) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!tokenProvider || !requestUrl(input).startsWith(`${baseUrl}/`)) {
      return originalFetch(input, init);
    }
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    if (!headers.has('Authorization')) {
      const token = await tokenProvider().catch(() => null);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return originalFetch(input, { ...init, headers });
  };
}
