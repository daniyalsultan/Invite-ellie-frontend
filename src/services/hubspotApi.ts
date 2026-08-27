// HubSpot API service for OAuth integration
//
// Talks to recall-server (VITE_RECALLAI_BASE_URL), which owns the HubSpot
// OAuth flow and export logic alongside the calendar integrations.

function getHubSpotApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_RECALLAI_BASE_URL;
  if (!baseUrl || typeof baseUrl !== 'string' || !baseUrl.trim()) {
    throw new Error('VITE_RECALLAI_BASE_URL is not configured');
  }
  return baseUrl.trim().replace(/\/$/, '');
}

export interface HubSpotConnectionStatus {
  connected: boolean;
  portal_name?: string;
  portal_id?: string;
}

/**
 * Get HubSpot OAuth authorization URL
 */
export async function getHubSpotConnectUrl(userId: string, returnTo?: string): Promise<string> {
  const params = new URLSearchParams({ user_id: userId });
  if (returnTo) params.append('returnTo', returnTo);
  const apiUrl = `${getHubSpotApiBaseUrl()}/api/hubspot/connect?${params.toString()}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }
      throw new Error(
        errorData.error || `HTTP error ${response.status}`
      );
    }

    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error getting HubSpot connect URL:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to get HubSpot connect URL');
  }
}

/**
 * Check HubSpot connection status
 */
export async function getHubSpotStatus(
  userId: string
): Promise<HubSpotConnectionStatus> {
  const apiUrl = `${getHubSpotApiBaseUrl()}/api/hubspot/status?user_id=${userId}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(
        errorData.error || `HTTP error ${response.status}`
      );
    }

    const data = await response.json();
    return {
      connected: Boolean(data.connected),
      portal_name: data.portal_name,
      portal_id: data.portal_id,
    };
  } catch (error) {
    console.error('Error checking HubSpot status:', error);
    return { connected: false };
  }
}

/**
 * Export a meeting note to HubSpot, attached to contacts matching the
 * meeting's calendar attendees. `eventId` is required for that matching —
 * meetings without a calendar event (e.g. started from a pasted link) have
 * no attendees and will return a clear error.
 */
export async function hubspotExport(
  userId: string,
  transcriptionId: string,
  meetingTitle: string,
  summary: string,
  actionItems: any[],
  eventId: string | null | undefined,
  force = false,
  // Required — see slackApi.slackExport. An export writes a meeting's contents
  // into a third-party workspace, so it has to prove who is asking.
  token: string,
): Promise<{ success: boolean; message?: string; error?: string; duplicate?: boolean }> {
  const apiUrl = `${getHubSpotApiBaseUrl()}/api/hubspot/export`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        transcription_id: transcriptionId,
        meeting_title: meetingTitle,
        summary,
        action_items: actionItems,
        event_id: eventId ?? null,
        force,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        duplicate: response.status === 409 || Boolean(data?.duplicate),
        error: data?.error || data?.message || `HTTP error ${response.status}`,
      };
    }

    return { success: Boolean(data?.success), message: data?.message, error: data?.error };
  } catch (error) {
    console.error('Error exporting to HubSpot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export to HubSpot',
    };
  }
}

/**
 * Disconnect HubSpot
 */
export async function disconnectHubSpot(userId: string): Promise<void> {
  const apiUrl = `${getHubSpotApiBaseUrl()}/api/hubspot/disconnect`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(
        errorData.error || `HTTP error ${response.status}`
      );
    }
  } catch (error) {
    console.error('Error disconnecting from HubSpot:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to disconnect from HubSpot');
  }
}
