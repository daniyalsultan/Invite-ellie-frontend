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
  calendar_id: string;
  bot_id: string;
  assemblyai_transcript_id: string;
  meeting_title: string;
  meeting_url: string | null;
  start_time: string | null;
  end_time: string | null;
  platform: string;
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
 * Get all transcriptions for meetings from connected calendars
 */
export async function getTranscriptions(userId: string): Promise<Transcription[]> {
  const recallaiUrl = buildRecallaiUrl(`/api/transcriptions?userId=${userId}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  console.log('Fetching transcriptions from:', recallaiUrl);
  
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
  return data;
}

