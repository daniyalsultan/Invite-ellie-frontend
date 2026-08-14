/**
 * API service for fetching contextual nudges from previous meetings
 * with matching participants to the current live meeting
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

function buildRecallaiUrl(path: string): string | null {
  const baseUrl = getRecallaiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export interface ContextualNudge {
  id: string;
  text: string;
  type: string;
  timestamp?: string;
  speaker?: string;
  explanation?: string;
  meeting_context: {
    meeting_id: string;
    meeting_title: string;
    meeting_date: string;
    participants: string[];
  };
}

export interface ContextualNudgesResponse {
  success: boolean;
  has_live_meeting: boolean;
  live_meeting_bot_id?: string | null;
  live_meeting_id?: string | null;
  live_meeting_workspace_id?: string | null;
  current_participants: string[];
  nudges: ContextualNudge[];
  total_nudges: number;
  message?: string;
  error?: string;
}

export async function getContextualNudges(
  userId: string,
  botId?: string,
  workspaceId?: string
): Promise<ContextualNudgesResponse> {
  const recallaiUrl = buildRecallaiUrl('/api/contextual-nudges');
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const params = new URLSearchParams();
  params.append('userId', userId);
  if (botId) {
    params.append('botId', botId);
  }
  if (workspaceId) {
    params.append('workspaceId', workspaceId);
  }

  const url = `${recallaiUrl}?${params.toString()}`;

  console.log('Fetching contextual nudges from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch contextual nudges: ${errorText}`);
  }

  return await response.json();
}

