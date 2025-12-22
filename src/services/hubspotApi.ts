// HubSpot API service for OAuth integration

import { getApiBaseUrl } from '../utils/apiBaseUrl';

// Get unified backend API base URL using the utility function
// This ensures we use the /api proxy path to avoid CORS issues
function getHubSpotApiBaseUrl(): string {
  const baseUrl = getApiBaseUrl() || 'https://web-production-07092.up.railway.app';
  return baseUrl.trim().replace(/\/$/, '');
}

function buildHubSpotApiUrl(path: string): string {
  const baseUrl = getHubSpotApiBaseUrl();
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If baseUrl is a relative path (/api), remove /api prefix from path if present
  // If baseUrl is a full URL, ensure path has /api prefix
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    // Full URL - ensure path has /api prefix
    if (!cleanPath.startsWith('/api/')) {
      cleanPath = `/api${cleanPath}`;
    }
    return `${baseUrl}${cleanPath}`;
  } else {
    // Relative path (/api) - remove /api prefix from path if present to avoid double /api
    if (cleanPath.startsWith('/api/')) {
      cleanPath = cleanPath.replace(/^\/api/, '');
    }
    return `${baseUrl}${cleanPath}`;
  }
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
    const url = `${apiUrl}?user_id=${userId}`;
    console.log('[HubSpot] Full URL:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[HubSpot] Response error:', response.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error getting HubSpot connect URL:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get HubSpot connect URL');
  }
}

/**
 * Check if user is connected to HubSpot
 */
export async function getHubSpotStatus(userId: string): Promise<HubSpotConnectionStatus> {
  const apiUrl = buildHubSpotApiUrl('/api/hubspot/status');

  try {
    const url = `${apiUrl}?user_id=${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      connected: data.connected || false,
      portal_name: data.portal_name,
      portal_id: data.portal_id,
    };
  } catch (error) {
    console.error('Error checking HubSpot status:', error);
    // Return disconnected status on error
    return { connected: false };
  }
}

/**
 * Disconnect from HubSpot
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
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error disconnecting from HubSpot:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to disconnect from HubSpot');
  }
}

