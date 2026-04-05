/**
 * API service for fetching transcriptions and summaries
 */

function getRecallaiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_RECALLAI_BASE_URL;
  if (typeof raw !== 'string' || !raw.trim()) {
    console.warn(
      'VITE_RECALLAI_BASE_URL is not configured. Please set it in your .env file to your backend server URL (e.g., http://16.16.183.96:3003)'
    );
    return null;
  }
  const url = raw.trim().replace(/\/$/, ''); // Remove trailing slash
  return url;
}

export function buildRecallaiUrl(path: string): string | null {
  const baseUrl = getRecallaiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  return `${baseUrl}${path}`;
}

export interface ActionItem {
  text: string;
  start?: number;
  end?: number;
  speaker?: string;
  /** Execution clarity (from Groq) */
  owner?: string | null;
  deadline?: string | null;
  clarity?: 'clear' | 'vague';
  blockers?: string | null;
}

export interface ContextualNudge {
  text: string;
  type: string;
  timestamp?: string;
  speaker?: string;
  explanation?: string;
}

export interface Transcription {
  id: string;
  event_id: string;
  calendar_id: string | null;
  calendar_email?: string | null;
  calendar_platform?: string | null;
  calendar_status?: 'connected' | 'disconnected' | string;
  bot_id: string;
  assemblyai_transcript_id: string;
  meeting_title: string;
  meeting_url: string | null;
  start_time: string | null;
  end_time: string | null;
  platform: string | null;
  transcript_text: string | null;
  summary: string | null;
  action_items: ActionItem[] | null;
  contextual_nudges?: ContextualNudge[] | null;
  key_outcomes_signals?: string[] | null;
  meeting_gaps?: string[] | null;
  open_questions?: string[] | null;
  impact_score?: number | null;
  impact_breakdown?: {
    decision_making?: number;
    action_clarity?: number;
    stakeholder_engagement?: number;
    productivity?: number;
  } | null;
  status: string;
  language: string | null;
  duration: number | null;
  utterances: any[] | null;
    words: any[] | null;
    workspace_id: string | null;
    folder_id: string | null;
    created_at: string | null;
    updated_at: string | null;
}

/** Parse action_items if the API returns a JSON string (some exports / DB drivers). */
export function normalizeActionItems(value: unknown): ActionItem[] | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    return value as ActionItem[];
  }
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const p = JSON.parse(value) as unknown;
      return Array.isArray(p) ? (p as ActionItem[]) : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Coerce API values to string[] (handles JSONField double-encoded as a JSON string). */
export function normalizeStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((s) => s.trim());
  }
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return [];
    if (t.startsWith('[')) {
      try {
        const parsed = JSON.parse(t) as unknown;
        if (Array.isArray(parsed)) {
          return parsed
            .filter((x): x is string => typeof x === 'string')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } catch {
        return [t];
      }
    }
    return [t];
  }
  return [];
}

function normalizeTranscriptionPayload(item: Record<string, unknown>): Transcription {
  const rawNudges = item.contextual_nudges;
  let contextual_nudges: ContextualNudge[] | null = null;
  if (Array.isArray(rawNudges)) {
    contextual_nudges = rawNudges as ContextualNudge[];
  } else if (typeof rawNudges === 'string' && rawNudges.trim().startsWith('[')) {
    try {
      const p = JSON.parse(rawNudges) as unknown;
      contextual_nudges = Array.isArray(p) ? (p as ContextualNudge[]) : [];
    } catch {
      contextual_nudges = [];
    }
  }

  const actionItems = normalizeActionItems(item.action_items);
  return {
    ...(item as unknown as Transcription),
    action_items: actionItems ?? (item.action_items as ActionItem[] | null),
    key_outcomes_signals: normalizeStringArray(item.key_outcomes_signals),
    meeting_gaps: normalizeStringArray(item.meeting_gaps),
    open_questions: normalizeStringArray(item.open_questions),
    contextual_nudges: contextual_nudges ?? (item.contextual_nudges as ContextualNudge[] | undefined) ?? [],
  };
}

/**
 * Get a specific transcription by ID
 */
export async function getTranscription(transcriptionId: string, userId: string): Promise<Transcription> {
  const recallaiUrl = buildRecallaiUrl(`/api/transcriptions/${transcriptionId}?userId=${userId}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch transcription: ${errorText}`);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return normalizeTranscriptionPayload(raw);
}

/**
 * Get all transcriptions for the logged-in user (from both connected and disconnected calendars)
 * Uses the new user API endpoint that shows all transcriptions regardless of calendar status
 */
export async function getTranscriptions(userId: string): Promise<Transcription[]> {
  // Use the new user endpoint that shows all transcriptions regardless of calendar status
  const recallaiUrl = buildRecallaiUrl(`/api/user/transcriptions?userId=${userId}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  console.log('Fetching all user transcriptions from:', recallaiUrl);
  
  const response = await fetch(recallaiUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
  });

  console.log('Transcriptions API response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Transcriptions API error:', errorText);
    throw new Error(`Failed to fetch transcriptions: ${errorText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Server returned non-JSON response:', text.substring(0, 500));
    throw new Error(`Server returned HTML instead of JSON. Check if VITE_RECALLAI_BASE_URL is correct.`);
  }

  const data = await response.json();
  console.log('Transcriptions fetched successfully:', data.length, 'items');
  
  return data.map((item: Record<string, unknown>) => normalizeTranscriptionPayload(item));
}

export type FolderMeetingsOverviewActionItem = {
  text: string;
  meeting_title?: string;
};

export type FolderMeetingsOverviewResponse = {
  summary: string;
  action_items: FolderMeetingsOverviewActionItem[];
  meetings_count?: number;
  cached?: boolean;
  source_signature?: string;
};

/**
 * AI-synthesized single summary + merged action items for all meetings in a folder (Recall / Groq).
 */
export async function getFolderMeetingsOverview(
  folderId: string,
  userId: string,
  options?: { refresh?: boolean },
): Promise<FolderMeetingsOverviewResponse> {
  const refresh = options?.refresh ? '&refresh=1' : '';
  const recallaiUrl = buildRecallaiUrl(
    `/api/folders/${encodeURIComponent(folderId)}/meetings-overview?userId=${encodeURIComponent(userId)}${refresh}`,
  );
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  const contentType = response.headers.get('content-type') || '';
  let body: unknown = null;
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const errObj = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
    const msg =
      (errObj && typeof errObj.error === 'string' && errObj.error) ||
      `Failed to load folder overview (${response.status})`;
    throw new Error(msg);
  }

  const data = body as Record<string, unknown>;
  return {
    summary: typeof data.summary === 'string' ? data.summary : '',
    action_items: Array.isArray(data.action_items) ? (data.action_items as FolderMeetingsOverviewActionItem[]) : [],
    meetings_count: typeof data.meetings_count === 'number' ? data.meetings_count : undefined,
    cached: typeof data.cached === 'boolean' ? data.cached : undefined,
    source_signature: typeof data.source_signature === 'string' ? data.source_signature : undefined,
  };
}

export type WorkspaceGapLine = { icon: string; text: string; key?: string };

export type WorkspaceActionInsightRow = {
  text: string;
  meeting_id: string;
  meeting_title: string;
  owner: string | null;
  owner_display: string;
  deadline: string | null;
  deadline_display: string;
  blocked_by: string | null;
  flags: string[];
  clarity?: string | null;
};

export type WorkspaceFolderInsightsResponse = {
  status: 'on_track' | 'needs_attention' | 'at_risk';
  status_label: string;
  reasons: string[];
  gaps_across_meetings: WorkspaceGapLine[];
  repeated_issues: string[];
  action_items: WorkspaceActionInsightRow[];
  short_summary_bullets: string[];
  meetings_count: number;
  source_signature?: string;
};

/**
 * Server-computed folder status, aggregated gaps, repeated themes, and action rows.
 */
export async function getFolderWorkspaceInsights(
  folderId: string,
  userId: string,
): Promise<WorkspaceFolderInsightsResponse> {
  const recallaiUrl = buildRecallaiUrl(
    `/api/folders/${encodeURIComponent(folderId)}/workspace-insights?userId=${encodeURIComponent(userId)}`,
  );
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  const contentType = response.headers.get('content-type') || '';
  let body: unknown = null;
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const errObj = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
    const msg =
      (errObj && typeof errObj.error === 'string' && errObj.error) ||
      `Failed to load workspace insights (${response.status})`;
    throw new Error(msg);
  }

  const data = body as Record<string, unknown>;
  const action_items = Array.isArray(data.action_items) ? (data.action_items as WorkspaceActionInsightRow[]) : [];

  return {
    status: data.status === 'needs_attention' || data.status === 'at_risk' ? data.status : 'on_track',
    status_label: typeof data.status_label === 'string' ? data.status_label : '🟢 On Track',
    reasons: Array.isArray(data.reasons) ? (data.reasons as string[]) : [],
    gaps_across_meetings: Array.isArray(data.gaps_across_meetings)
      ? (data.gaps_across_meetings as WorkspaceGapLine[])
      : [],
    repeated_issues: Array.isArray(data.repeated_issues) ? (data.repeated_issues as string[]) : [],
    action_items,
    short_summary_bullets: Array.isArray(data.short_summary_bullets)
      ? (data.short_summary_bullets as string[])
      : [],
    meetings_count: typeof data.meetings_count === 'number' ? data.meetings_count : 0,
    source_signature: typeof data.source_signature === 'string' ? data.source_signature : undefined,
  };
}

