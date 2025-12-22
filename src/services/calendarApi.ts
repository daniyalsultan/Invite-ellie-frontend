import { getApiBaseUrl } from '../utils/apiBaseUrl';

export interface CalendarConnection {
  id: string;
  platform: 'google_calendar' | 'microsoft_outlook';
  email?: string;
  status?: string;
  connected: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  meeting_url?: string;
  should_record_manual: boolean | null;
  bots?: Array<{
    bot_id: string;
    join_at: string;
    created_at: string;
    status: string;
  }>;
}

export interface CalendarWebhook {
  id: string;
  event: string;
  received_at: string;
}

export interface CalendarDetails {
  id: string;
  platform: 'google_calendar' | 'microsoft_outlook';
  email?: string;
  status?: string;
  auto_record_external_events: boolean;
  auto_record_only_confirmed_events: boolean;
  events: CalendarEvent[];
  webhooks: CalendarWebhook[];
}

/**
 * Get the recallai backend base URL from environment variable
 * Should be set to your backend server URL (e.g., http://16.16.183.96:3003)
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
  console.log('Using RecallAI backend URL:', url);
  return url;
}

/**
 * Build API URL for recallai backend
 */
function buildRecallaiUrl(path: string): string | null {
  const baseUrl = getRecallaiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get list of connected calendars for the current user
 * Checks both main API and recallai backend
 */
export async function getConnectedCalendars(
  userId: string
): Promise<CalendarConnection[]> {
  // Check recallai backend first (primary source for calendar data)
  const recallaiUrl = buildRecallaiUrl('/api/calendars');
  if (recallaiUrl) {
    try {
      // Build URL with userId if provided
      const url = userId ? `${recallaiUrl}?userId=${userId}` : recallaiUrl;
      
      console.log('Fetching calendars from recallai backend:', url);
      console.log('Using userId:', userId || 'none (will try to get from token)');
      console.log('About to make GET request after OPTIONS preflight...');
      
      let response: Response;
      try {
        console.log('Making fetch request now...');
        
        // Create abort controller for timeout (more compatible than AbortSignal.timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
            },
            // Don't include credentials to avoid CORS issues
            // credentials: 'include',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          console.log('✅ GET request completed! Status:', response.status, response.statusText);
          console.log('Calendar API response URL:', response.url);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (fetchError) {
        // Check if it's an abort/timeout error
        if (fetchError instanceof Error && (fetchError.name === 'AbortError' || fetchError.message.includes('aborted'))) {
          console.error('Fetch timeout - request took too long');
          // Return empty array for timeout instead of throwing
          // This prevents breaking the UI when network is slow
          console.warn('Request timed out, returning empty array');
          return [];
        }
        // Check if it's a network error (ERR_SOCKET_NOT_CONNECTED, Failed to fetch, etc.)
        if (
          fetchError instanceof TypeError && 
          (fetchError.message.includes('Failed to fetch') || 
           fetchError.message.includes('ERR_SOCKET_NOT_CONNECTED') ||
           fetchError.message.includes('NetworkError'))
        ) {
          console.error('Fetch error (network issue):', fetchError);
          // Don't throw for network errors - return empty array instead
          // This prevents breaking the UI when network is temporarily unavailable
          console.warn('Network error fetching calendars, returning empty array');
          return [];
        }
        console.error('Fetch error (network/CORS issue):', fetchError);
        throw new Error(
          `Failed to fetch calendars. This might be a CORS issue. Check browser console and ensure VITE_RECALLAI_BASE_URL is set to your backend server URL. Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
        );
      }
      
      const contentType = response.headers.get('content-type') || '';
      console.log('Response content-type:', contentType);

      // Check if response is HTML (error page)
      if (contentType.includes('text/html')) {
        const text = await response.text();
        console.error('Server returned HTML instead of JSON. Response:', text.substring(0, 500));
        console.error('Request URL was:', url);
        console.error('Response URL was:', response.url);
        
        // Check if it's ngrok's interstitial page (legacy support)
        if (text.includes('ngrok') && (text.includes('Visit Site') || text.includes('Continue'))) {
          throw new Error(
            `Ngrok interstitial page detected. You need to visit the URL in your browser first to bypass the warning page, or add the ngrok-skip-browser-warning header.\n\nURL: ${url}\n\nTo fix: Visit ${getRecallaiBaseUrl()} in your browser and click "Visit Site", then try again.`
          );
        }
        
        // Check if it's a redirect to a login page or error page
        if (text.includes('sign-in') || text.includes('login') || text.includes('Sign In')) {
          throw new Error(
            'Authentication failed. Please check your access token. The server redirected to a login page.'
          );
        }
        
        // Check if it's a 404 page
        if (text.includes('404') || text.includes('Not Found')) {
          throw new Error(
            `API endpoint not found. Check if the URL is correct: ${url}. Make sure VITE_RECALLAI_BASE_URL is set to your backend server URL (e.g., http://16.16.183.96:3003)`
          );
        }
        
        throw new Error(
          `Server returned HTML instead of JSON. Status: ${response.status}. This usually means:\n1. VITE_RECALLAI_BASE_URL is incorrect\n2. The API endpoint path is wrong\n3. Authentication failed and server redirected to a login page\n4. Server returned an error page\n\nRequest URL: ${url}\nResponse URL: ${response.url}\n\nCheck your .env file and ensure VITE_RECALLAI_BASE_URL is set to your backend server URL (e.g., http://16.16.183.96:3003).`
        );
      }

      if (response.ok) {
        // Check if response is actually JSON
        if (contentType.includes('application/json')) {
          const data = await response.json();
          // Handle both array and object response formats
          let calendarsArray: any[] = [];
          if (Array.isArray(data)) {
            calendarsArray = data;
          } else if (data && data.calendars && Array.isArray(data.calendars)) {
            calendarsArray = data.calendars;
          } else {
            console.warn('Unexpected response format:', data);
            return [];
          }
          
          return calendarsArray.map((cal: any) => ({
            id: cal.id,
            platform: cal.platform === 'google_calendar' ? 'google_calendar' : 'microsoft_outlook',
            email: cal.email,
            status: cal.status,
            connected: cal.connected !== undefined ? cal.connected : cal.status === 'connected',
          }));
        } else {
          // Response is not JSON, probably HTML error page
          const text = await response.text();
          console.error('Expected JSON but got:', text.substring(0, 200));
          throw new Error('Server returned non-JSON response');
        }
      } else {
        // Try to parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, try to get text
          try {
            const errorText = await response.text();
            if (errorText && !errorText.includes('<!DOCTYPE')) {
              errorMessage = errorText.substring(0, 200);
            }
          } catch {
            // Ignore
          }
        }
        console.warn('Error fetching calendars from recallai:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching calendars from recallai:', error);
      // Re-throw if it's our error, otherwise wrap it
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch calendars from recallai backend');
    }
  } else {
    console.warn(
      'VITE_RECALLAI_BASE_URL is not configured. Please set it in your .env file to your backend server URL.'
    );
  }

  // Fallback: Try main API (if it has calendar endpoints)
  // Note: This fallback is not used since we removed authentication
  // Keeping it for potential future use
  const apiBaseUrl = getApiBaseUrl();
  if (apiBaseUrl) {
    try {
      const response = await fetch(`${apiBaseUrl}/calendars/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data.map((cal: any) => ({
            id: cal.id,
            platform: cal.platform === 'google_calendar' ? 'google_calendar' : 'microsoft_outlook',
            email: cal.email,
            status: cal.status,
            connected: true,
          }));
        }
      }
      // Silently ignore 404 - main API might not have calendar endpoints
    } catch (error) {
      // Silently ignore errors from main API calendar endpoint
      // This is expected if the endpoint doesn't exist
    }
  }

  return [];
}

/**
 * Get OAuth authorization URLs for both calendars - simple like root_view
 * Returns both URLs at once
 */
export async function getCalendarConnectUrls(
  userId: string
): Promise<{ googleCalendar: string; microsoftOutlook: string }> {
  const recallaiUrl = buildRecallaiUrl('/api/calendar/connect-urls');
  if (!recallaiUrl) {
    throw new Error(
      'Recallai backend URL is not configured. Set VITE_RECALLAI_BASE_URL in your .env file to your backend server URL (e.g., http://16.16.183.96:3003)'
    );
  }

  try {
    const url = `${recallaiUrl}?userId=${userId}`;
    console.log('Fetching connect URLs from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
      },
    });

    console.log('Connect URLs API response status:', response.status, response.statusText);
    console.log('Connect URLs API response URL:', response.url);
    
    const contentType = response.headers.get('content-type') || '';
    console.log('Response content-type:', contentType);

    // Check if response is HTML (error page)
    if (contentType.includes('text/html')) {
      const text = await response.text();
      console.error('Server returned HTML instead of JSON. Response:', text.substring(0, 500));
      throw new Error(
        `Server returned HTML (likely an error page). Status: ${response.status}. Check if VITE_RECALLAI_BASE_URL is configured correctly.`
      );
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          if (errorText && !errorText.includes('<!DOCTYPE')) {
            errorMessage = errorText.substring(0, 200);
          }
        } catch {
          // Ignore
        }
      }
      throw new Error(`Failed to get calendar connect URLs: ${errorMessage}`);
    }

    // Check if response is actually JSON
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return {
        googleCalendar: data.googleCalendar || '',
        microsoftOutlook: data.microsoftOutlook || '',
      };
    } else {
      // Response is not JSON, probably HTML error page
      const text = await response.text();
      console.error('Expected JSON but got:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response');
    }
  } catch (error) {
    console.error('Error getting calendar connect URLs:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get calendar connect URLs');
  }
}

/**
 * Get calendar details with events and webhooks
 */
export async function getCalendarDetails(
  calendarId: string,
  userId?: string
): Promise<CalendarDetails> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar/${calendarId}${userId ? `?userId=${userId}` : ''}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get calendar details: ${errorText}`);
  }

  return await response.json();
}

/**
 * Update calendar preferences
 */
export async function updateCalendarPreferences(
  calendarId: string,
  preferences: {
    autoRecordExternalEvents: boolean;
    autoRecordOnlyConfirmedEvents: boolean;
  },
  userId?: string
): Promise<void> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar/${calendarId}/update${userId ? `?userId=${userId}` : ''}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update calendar preferences: ${errorText}`);
  }
}

/**
 * Sync calendar events
 */
export async function syncCalendarEvents(
  calendarId: string,
  userId?: string
): Promise<{ success: boolean; message: string; upserted: number; deleted: number }> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar/${calendarId}/sync${userId ? `?userId=${userId}` : ''}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to sync calendar events: ${errorText}`);
  }

  return await response.json();
}

/**
 * Set manual record preference for an event
 */
export async function setEventManualRecord(
  eventId: string,
  manualRecord: boolean | null,
  userId?: string
): Promise<void> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar-event/${eventId}/set-manual-record${userId ? `?userId=${userId}` : ''}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
    body: JSON.stringify({ manualRecord: manualRecord }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to set manual record: ${errorText}`);
  }
}

/**
 * Disconnect a calendar
 */
export async function disconnectCalendar(calendarId: string, userId?: string): Promise<void> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar/${calendarId}/delete${userId ? `?userId=${userId}` : ''}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to disconnect calendar: ${errorText}`);
  }
}

/**
 * Create a bot for a calendar event (for previous meetings)
 */
export async function createBotForEvent(
  eventId: string,
  userId?: string
): Promise<{ success: boolean; message: string; bot_id?: string; join_at?: string; error?: string }> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar-event/${eventId}/create-bot${userId ? `?userId=${userId}` : ''}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to create bot' }));
    throw new Error(errorData.error || 'Failed to create bot');
  }

  return await response.json();
}

/**
 * Delete a scheduled bot for a calendar event
 * This can only be done on scheduled bots that have not yet joined a call.
 */
export async function deleteBotForEvent(
  eventId: string,
  botId: string,
  userId?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar-event/${eventId}/bot/${botId}${userId ? `?userId=${userId}` : ''}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete bot' }));
    throw new Error(errorData.error || 'Failed to delete bot');
  }

  return await response.json();
}

/**
 * Get all meetings for the authenticated user (from both connected and disconnected calendars)
 */
export async function getAllUserMeetings(userId: string): Promise<Array<{
  id: string;
  calendar_id: string;
  calendar_email: string | null;
  calendar_platform: string;
  calendar_status: 'connected' | 'disconnected';
  title: string;
  start_time: string | null;
  end_time: string | null;
  meeting_url: string | null;
  platform: string;
  should_record_manual: boolean | null;
  bots: Array<{
    bot_id: string;
    join_at: string;
    created_at: string;
    status: string;
  }>;
  has_transcription: boolean;
  has_summary: boolean;
  has_action_items: boolean;
  created_at: string | null;
  updated_at: string | null;
}>> {
  const recallaiUrl = buildRecallaiUrl(`/api/user/meetings${userId ? `?userId=${userId}` : ''}`);
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
    throw new Error(`Failed to get user meetings: ${errorText}`);
  }

  return await response.json();
}

/**
 * Get all transcriptions for the authenticated user (from both connected and disconnected calendars)
 */
export async function getAllUserTranscriptions(userId: string): Promise<Array<{
  id: string;
  event_id: string;
  calendar_id: string | null;
  calendar_email: string | null;
  calendar_platform: string | null;
  calendar_status: string;
  bot_id: string;
  assemblyai_transcript_id: string;
  meeting_title: string;
  meeting_url: string | null;
  start_time: string | null;
  end_time: string | null;
  platform: string | null;
  transcript_text: string;
  summary: string;
  action_items: Array<any>;
  status: string;
  language: string;
  duration: number | null;
  utterances: Array<any>;
  words: Array<any>;
  created_at: string | null;
  updated_at: string | null;
}>> {
  const recallaiUrl = buildRecallaiUrl(`/api/user/transcriptions${userId ? `?userId=${userId}` : ''}`);
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
    throw new Error(`Failed to get user transcriptions: ${errorText}`);
  }

  return await response.json();
}

