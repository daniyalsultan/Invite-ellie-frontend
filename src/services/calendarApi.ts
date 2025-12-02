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
 * Should be set to your ngrok public URL (e.g., https://xxxx-xx-xx-xx-xx.ngrok.io)
 */
function getRecallaiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_RECALLAI_BASE_URL;
  if (typeof raw !== 'string' || !raw.trim()) {
    console.warn(
      'VITE_RECALLAI_BASE_URL is not configured. Please set it in your .env file to your ngrok public URL (e.g., https://xxxx-xx-xx-xx-xx.ngrok.io)'
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
  token: string,
  userId?: string
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
        response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          // Don't include credentials to avoid CORS issues
          // credentials: 'include',
        });
        console.log('✅ GET request completed! Status:', response.status, response.statusText);
        console.log('Calendar API response URL:', response.url);
      } catch (fetchError) {
        console.error('Fetch error (network/CORS issue):', fetchError);
        throw new Error(
          `Failed to fetch calendars. This might be a CORS issue. Check browser console and ensure VITE_RECALLAI_BASE_URL is set to your ngrok URL. Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
        );
      }
      
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

      if (response.ok) {
        // Check if response is actually JSON
        if (contentType.includes('application/json')) {
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
      'VITE_RECALLAI_BASE_URL is not configured. Please set it in your .env file to your ngrok public URL.'
    );
  }

  // Fallback: Try main API (if it has calendar endpoints)
  const apiBaseUrl = getApiBaseUrl();
  if (apiBaseUrl) {
    try {
      const response = await fetch(`${apiBaseUrl}/calendars/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
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
  token: string,
  userId: string
): Promise<{ googleCalendar: string; microsoftOutlook: string }> {
  const recallaiUrl = buildRecallaiUrl('/api/calendar/connect-urls');
  if (!recallaiUrl) {
    throw new Error(
      'Recallai backend URL is not configured. Set VITE_RECALLAI_BASE_URL in your .env file to your ngrok public URL (e.g., https://xxxx-xx-xx-xx-xx.ngrok.io)'
    );
  }

  try {
    const url = `${recallaiUrl}?userId=${userId}`;
    console.log('Fetching connect URLs from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
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
  token: string,
  calendarId: string
): Promise<CalendarDetails> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar/${calendarId}`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
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
  token: string,
  calendarId: string,
  preferences: {
    autoRecordExternalEvents: boolean;
    autoRecordOnlyConfirmedEvents: boolean;
  }
): Promise<void> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar/${calendarId}/update`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
  token: string,
  calendarId: string
): Promise<{ success: boolean; message: string; upserted: number; deleted: number }> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar/${calendarId}/sync`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
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
  token: string,
  eventId: string,
  manualRecord: boolean | null
): Promise<void> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar-event/${eventId}/set-manual-record`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
export async function disconnectCalendar(token: string, calendarId: string): Promise<void> {
  const recallaiUrl = buildRecallaiUrl(`/api/calendar/${calendarId}/delete`);
  if (!recallaiUrl) {
    throw new Error('Recallai backend URL is not configured.');
  }

  const response = await fetch(recallaiUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to disconnect calendar: ${errorText}`);
  }
}

