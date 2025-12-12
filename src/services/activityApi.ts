import { getApiBaseUrl } from '../utils/apiBaseUrl';

export type ActivityType = 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'PROFILE_UPDATE' | 'PASSWORD_CHANGED';

export interface ActivityRecord {
  id: number;
  activity_type: ActivityType;
  activity_type_display: string;
  timestamp: string;
  description: string;
  meta_data: string;
}

export interface PaginatedActivityResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ActivityRecord[];
}

export interface ListActivityParams {
  activity_type?: ActivityType;
  ordering?: string;
  page?: number;
  search?: string;
  timestamp_after?: string;
  timestamp_before?: string;
}

function ensureApiBaseUrl(): string {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('API base URL is not configured.');
  }
  return baseUrl;
}

function buildApiUrl(baseUrl: string, path: string): string {
  // If baseUrl is a relative path (starts with /), construct absolute URL from current origin
  if (baseUrl.startsWith('/')) {
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${fullPath}`;
  }
  
  // If baseUrl is absolute, use it directly
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${fullPath}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  let body: unknown = null;

  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    try {
      const text = await response.text();
      body = text || null;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(body) ?? `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return body as T;
}

function extractErrorMessage(body: unknown): string | null {
  if (!body) {
    return null;
  }

  if (typeof body === 'string') {
    return body;
  }

  if (typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.error === 'string') {
      return record.error;
    }
    if (typeof record.detail === 'string') {
      return record.detail;
    }
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        return `${key}: ${value}`;
      }
      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        return `${key}: ${value.join(', ')}`;
      }
    }
  }

  return null;
}

function authHeaders(token: string, extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function buildUrl(baseUrl: string, path: string, params?: Record<string, string | number | undefined>): string {
  // Build the base URL with path
  const fullPath = buildApiUrl(baseUrl, path);
  
  // If baseUrl is a relative path, use current origin
  if (baseUrl.startsWith('/')) {
    const url = new URL(fullPath, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }
  
  // If baseUrl is absolute, use URL constructor
  const url = new URL(fullPath);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function listActivities(
  token: string,
  params?: ListActivityParams,
): Promise<PaginatedActivityResponse> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildUrl(baseUrl, '/accounts/activity/', {
    activity_type: params?.activity_type,
    ordering: params?.ordering,
    page: params?.page,
    search: params?.search,
    timestamp_after: params?.timestamp_after,
    timestamp_before: params?.timestamp_before,
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return parseResponse<PaginatedActivityResponse>(response);
}

export async function getActivity(token: string, activityId: number): Promise<ActivityRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/accounts/activity/${activityId}/`);
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return parseResponse<ActivityRecord>(response);
}

