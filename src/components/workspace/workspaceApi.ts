import { getApiBaseUrl } from '../../utils/apiBaseUrl';

export type WorkspaceCategory = 'PROJECT' | 'OFFICE' | 'TEAM' | 'OTHER';

export const WORKSPACE_CATEGORY_LABELS: Record<WorkspaceCategory, string> = {
  PROJECT: 'Project',
  OFFICE: 'Office',
  TEAM: 'Team',
  OTHER: 'Other',
};

export const WORKSPACE_CATEGORY_OPTIONS = Object.entries(WORKSPACE_CATEGORY_LABELS).map(
  ([value, label]) => ({
    value: value as WorkspaceCategory,
    label,
  }),
);

export type MeetingStatus = 'PENDING' | 'TRANSCRIBING' | 'SUMMARIZING' | 'COMPLETED' | 'FAILED';

export interface MeetingRecord {
  id: string;
  folder: string;
  title: string;
  platform: string;
  duration: string | null;
  paticipants: number | null;
  status: MeetingStatus;
  audio_url: string | null;
  transcript: string | null;
  summary: string | null;
  highlights: string[] | null;
  action_items: string[] | null;
  held_at: string | null;
  created_at?: string;
  updated_at: string;
}

export interface FolderRecord {
  id: string;
  workspace: string;
  name: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  meetings?: MeetingRecord[];
}

export interface WorkspaceRecord {
  id: string;
  owner?: string;
  name: string;
  category: WorkspaceCategory | null;
  created_at: string;
  updated_at: string;
  folders?: FolderRecord[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListWorkspaceParams {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  name?: string;
  createdAt?: string;
}

export interface ListFolderParams {
  page?: number;
  pageSize?: number; // Note: Not in API spec, kept for backward compatibility
  search?: string;
  ordering?: string;
  workspace?: string; // Changed from workspaceId to match API spec
  created_at?: string; // Added to match API spec
  name?: string; // Added to match API spec
}

export interface WorkspaceMutationPayload {
  name: string;
  category?: WorkspaceCategory | null;
}

export interface FolderMutationPayload {
  name: string;
  workspace: string;
  is_pinned?: boolean;
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

export async function listWorkspaces(
  token: string,
  params?: ListWorkspaceParams,
): Promise<PaginatedResponse<WorkspaceRecord>> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildUrl(baseUrl, '/workspaces/', {
    page: params?.page,
    page_size: params?.pageSize,
    search: params?.search,
    ordering: params?.ordering,
    name: params?.name,
    created_at: params?.createdAt,
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return parseResponse<PaginatedResponse<WorkspaceRecord>>(response);
}

export async function listFolders(
  token: string,
  params?: ListFolderParams,
): Promise<PaginatedResponse<FolderRecord>> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildUrl(baseUrl, '/folders/', {
    page: params?.page,
    page_size: params?.pageSize,
    search: params?.search,
    ordering: params?.ordering,
    workspace: params?.workspace,
    created_at: params?.created_at,
    name: params?.name,
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return parseResponse<PaginatedResponse<FolderRecord>>(response);
}

export async function createFolder(
  token: string,
  payload: FolderMutationPayload,
): Promise<FolderRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, '/folders/');
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
  return parseResponse<FolderRecord>(response);
}

export async function patchFolder(
  token: string,
  folderId: string,
  payload: Partial<FolderMutationPayload>,
): Promise<FolderRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/folders/${folderId}/`);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
  return parseResponse<FolderRecord>(response);
}

export async function deleteFolder(token: string, folderId: string): Promise<void> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/folders/${folderId}/`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parseResponse<null>(response);
}

export async function getFolder(token: string, folderId: string): Promise<FolderRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/folders/${folderId}/`);
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return parseResponse<FolderRecord>(response);
}

export async function updateFolder(
  token: string,
  folderId: string,
  payload: FolderMutationPayload,
): Promise<FolderRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/folders/${folderId}/`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: authHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
  return parseResponse<FolderRecord>(response);
}

export async function createWorkspace(
  token: string,
  payload: WorkspaceMutationPayload,
): Promise<WorkspaceRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, '/workspaces/');
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
  return parseResponse<WorkspaceRecord>(response);
}

export async function getWorkspace(token: string, workspaceId: string): Promise<WorkspaceRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/workspaces/${workspaceId}/`);
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return parseResponse<WorkspaceRecord>(response);
}

export async function updateWorkspace(
  token: string,
  workspaceId: string,
  payload: WorkspaceMutationPayload,
): Promise<WorkspaceRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/workspaces/${workspaceId}/`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: authHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
  return parseResponse<WorkspaceRecord>(response);
}

export async function patchWorkspace(
  token: string,
  workspaceId: string,
  payload: Partial<WorkspaceMutationPayload>,
): Promise<WorkspaceRecord> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/workspaces/${workspaceId}/`);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
  return parseResponse<WorkspaceRecord>(response);
}

export async function deleteWorkspace(token: string, workspaceId: string): Promise<void> {
  const baseUrl = ensureApiBaseUrl();
  const url = buildApiUrl(baseUrl, `/workspaces/${workspaceId}/`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parseResponse<null>(response);
}

export function getWorkspaceCategoryLabel(category: WorkspaceCategory | null | undefined): string {
  if (!category) {
    return 'Uncategorized';
  }
  return WORKSPACE_CATEGORY_LABELS[category] ?? category;
}


