// HubSpot API service for OAuth integration

/**
 * 🔒 PRODUCTION LOCK
 * Always uses Railway backend directly
 * No ENV variables
 * No proxy logic
 * 
 * 🚀 START SERVER: https://web-production-07092.up.railway.app
 * 🔗 HUBSPOT CONNECT: https://web-production-07092.up.railway.app/api/hubspot/connect
 * 🔗 HUBSPOT STATUS:  https://web-production-07092.up.railway.app/api/hubspot/status
 * 🔗 HUBSPOT DISCONNECT: https://web-production-07092.up.railway.app/api/hubspot/disconnect
 */

export interface HubSpotConnectionStatus {
  connected: boolean;
  portal_name?: string;
  portal_id?: string;
}

/**
 * Get HubSpot OAuth authorization URL
 */
export async function getHubSpotConnectUrl(userId: string): Promise<string> {
  const apiUrl = `https://web-production-07092.up.railway.app/api/hubspot/connect?user_id=${userId}`;
  console.log('[HubSpot] Connecting to:', apiUrl);

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
  const apiUrl = `https://web-production-07092.up.railway.app/api/hubspot/status?user_id=${userId}`;

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
 * Disconnect HubSpot
 */
export async function disconnectHubSpot(userId: string): Promise<void> {
  const apiUrl = `https://web-production-07092.up.railway.app/api/hubspot/disconnect`;

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
