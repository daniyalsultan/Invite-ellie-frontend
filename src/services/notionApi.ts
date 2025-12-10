// Notion API service for OAuth integration

import { getApiBaseUrl } from '../utils/apiBaseUrl';

// Get unified backend API base URL using the utility function
// This ensures we use the /api proxy path to avoid CORS issues
function getNotionApiBaseUrl(): string {
  const baseUrl = getApiBaseUrl() || 'https://web-production-07092.up.railway.app';
  return baseUrl.trim().replace(/\/$/, '');
}

function buildNotionApiUrl(path: string): string {
  const baseUrl = getNotionApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export interface NotionConnectionStatus {
  connected: boolean;
  workspace_name?: string;
  integration_name?: string;
  connection_type?: string;
}

/**
 * Get Notion OAuth authorization URL
 */
export async function getNotionConnectUrl(userId: string): Promise<string> {
  const apiUrl = buildNotionApiUrl('/api/notion/connect');

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
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error getting Notion connect URL:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get Notion connect URL');
  }
}

/**
 * Check if user is connected to Notion
 */
export async function getNotionStatus(userId: string): Promise<NotionConnectionStatus> {
  const apiUrl = buildNotionApiUrl('/api/notion/status');

  try {
    const url = `${apiUrl}?user_id=${userId}`;
    console.log('Checking Notion status at:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Notion status API error:', errorData, 'Status:', response.status);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Notion status API response data:', data);
    return {
      connected: data.connected || false,
      workspace_name: data.workspace_name,
      integration_name: data.integration_name,
      connection_type: data.connection_type,
    };
  } catch (error) {
    console.error('Error checking Notion status:', error);
    // Return disconnected status on error
    return { connected: false };
  }
}

/**
 * Disconnect from Notion
 */
export async function disconnectNotion(userId: string): Promise<void> {
  const apiUrl = buildNotionApiUrl('/api/notion/disconnect');

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
    console.error('Error disconnecting from Notion:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to disconnect from Notion');
  }
}

