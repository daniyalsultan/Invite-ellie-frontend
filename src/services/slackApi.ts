// Slack API service for OAuth integration

import { getApiBaseUrl } from '../utils/apiBaseUrl';

// Get unified backend API base URL using the utility function
// This ensures we use the /api proxy path to avoid CORS issues
function getSlackApiBaseUrl(): string {
  const baseUrl = getApiBaseUrl() || 'https://web-production-07092.up.railway.app';
  return baseUrl.trim().replace(/\/$/, '');
}

function buildSlackApiUrl(path: string): string {
  const baseUrl = getSlackApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export interface SlackConnectionStatus {
  connected: boolean;
  team_name?: string;
  user_name?: string;
  team_id?: string;
}

/**
 * Get Slack OAuth authorization URL
 */
export async function getSlackConnectUrl(userId: string): Promise<string> {
  const apiUrl = buildSlackApiUrl('/api/slack/connect');

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
    return data.auth_url;
  } catch (error) {
    console.error('Error getting Slack connect URL:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get Slack connect URL');
  }
}

/**
 * Check if user is connected to Slack
 */
export async function getSlackStatus(userId: string): Promise<SlackConnectionStatus> {
  const apiUrl = buildSlackApiUrl('/api/slack/status');

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
      team_name: data.team_name,
      user_name: data.user_name,
      team_id: data.team_id,
    };
  } catch (error) {
    console.error('Error checking Slack status:', error);
    // Return disconnected status on error
    return { connected: false };
  }
}

/**
 * Disconnect from Slack
 */
export async function disconnectSlack(userId: string): Promise<void> {
  const apiUrl = buildSlackApiUrl('/api/slack/disconnect');

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
    console.error('Error disconnecting from Slack:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to disconnect from Slack');
  }
}

