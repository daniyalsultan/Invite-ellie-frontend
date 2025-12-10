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

function buildRecallaiUrl(path: string): string | null {
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
  status: string;
  language: string | null;
  duration: number | null;
  utterances: any[] | null;
  words: any[] | null;
  created_at: string | null;
  updated_at: string | null;
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

  return await response.json();
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
  
  // Map the response to match the Transcription interface
  return data.map((item: any) => ({
    id: item.id,
    event_id: item.event_id,
    calendar_id: item.calendar_id || null,
    calendar_email: item.calendar_email || null,
    calendar_platform: item.calendar_platform || null,
    calendar_status: item.calendar_status || 'connected',
    bot_id: item.bot_id,
    assemblyai_transcript_id: item.assemblyai_transcript_id || '',
    meeting_title: item.meeting_title || 'Untitled Meeting',
    meeting_url: item.meeting_url,
    start_time: item.start_time,
    end_time: item.end_time,
    platform: item.platform || null,
    transcript_text: item.transcript_text || '',
    summary: item.summary || '',
    action_items: item.action_items || [],
    status: item.status || 'unknown',
    language: item.language || 'en',
    duration: item.duration,
    utterances: item.utterances || [],
    words: item.words || [],
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

