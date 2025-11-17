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
  pageSize?: number;
  search?: string;
  ordering?: string;
  workspaceId?: string;
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

export async function listWorkspaces(
  token: string,
  params?: ListWorkspaceParams,
): Promise<PaginatedResponse<WorkspaceRecord>> {
  const baseUrl = ensureApiBaseUrl();
  const url = new URL(`${baseUrl}/workspaces/`);

  if (params?.page) {
    url.searchParams.set('page', String(params.page));
  }
  if (params?.pageSize) {
    url.searchParams.set('page_size', String(params.pageSize));
  }
  if (params?.search) {
    url.searchParams.set('search', params.search);
  }
  if (params?.ordering) {
    url.searchParams.set('ordering', params.ordering);
  }
  if (params?.name) {
    url.searchParams.set('name', params.name);
  }
  if (params?.createdAt) {
    url.searchParams.set('created_at', params.createdAt);
  }

  const response = await fetch(url.toString(), {
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
  const url = new URL(`${baseUrl}/folders/`);

  if (params?.page) {
    url.searchParams.set('page', String(params.page));
  }
  if (params?.pageSize) {
    url.searchParams.set('page_size', String(params.pageSize));
  }
  if (params?.search) {
    url.searchParams.set('search', params.search);
  }
  if (params?.ordering) {
    url.searchParams.set('ordering', params.ordering);
  }
  if (params?.workspaceId) {
    url.searchParams.set('workspace', params.workspaceId);
  }

  const response = await fetch(url.toString(), {
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
  const response = await fetch(`${baseUrl}/folders/`, {
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
  const response = await fetch(`${baseUrl}/folders/${folderId}/`, {
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
  const response = await fetch(`${baseUrl}/folders/${folderId}/`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parseResponse<null>(response);
}

export async function pinFolder(token: string, folderId: string): Promise<FolderRecord> {
  const baseUrl = ensureApiBaseUrl();
  const response = await fetch(`${baseUrl}/folders/${folderId}/pin/`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return parseResponse<FolderRecord>(response);
}

export async function unpinFolder(token: string, folderId: string): Promise<FolderRecord> {
  const baseUrl = ensureApiBaseUrl();
  const response = await fetch(`${baseUrl}/folders/${folderId}/unpin/`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return parseResponse<FolderRecord>(response);
}

export async function createWorkspace(
  token: string,
  payload: WorkspaceMutationPayload,
): Promise<WorkspaceRecord> {
  const baseUrl = ensureApiBaseUrl();
  const response = await fetch(`${baseUrl}/workspaces/`, {
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
  const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/`, {
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
  const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/`, {
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
  const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/`, {
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
  const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/`, {
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


