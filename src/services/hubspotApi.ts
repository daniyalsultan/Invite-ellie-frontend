// HubSpot API service for OAuth integration

/**
 * 🔒 PRODUCTION LOCK
 * Always uses Railway backend directly
 * No ENV variables
 * No proxy logic
 */

const HUBSPOT_API_BASE_URL = 'https://web-production-07092.up.railway.app';

function buildHubSpotApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${HUBSPOT_API_BASE_URL}${cleanPath}`;
}

export interface HubSpotConnectionStatus {
  connected: boolean;
  portal_name?: string;
  portal_id?: string;
}

/**
 * Get HubSpot OAuth authorization URL
 */
export async function getHubSpotConnectUrl(userId: string): Promise<string> {
  const apiUrl = buildHubSpotApiUrl('/api/hubspot/connect');
  console.log('[HubSpot] Connecting to:', apiUrl);

  try {
    const response = await fetch(`${apiUrl}?user_id=${userId}`, {
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
  const apiUrl = buildHubSpotApiUrl('/api/hubspot/status');

  try {
    const response = await fetch(`${apiUrl}?user_id=${userId}`, {
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
 * Disconnect HubSpot
 */
export async function disconnectHubSpot(userId: string): Promise<void> {
  const apiUrl = buildHubSpotApiUrl('/api/hubspot/disconnect');

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

