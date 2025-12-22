// Notion API service for OAuth integration

/**
 * 🔒 PRODUCTION LOCK
 * Always uses Railway backend directly
 * No ENV variables
 * No proxy logic
 */

const NOTION_API_BASE_URL = 'https://web-production-07092.up.railway.app';

function buildNotionApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${NOTION_API_BASE_URL}${cleanPath}`;
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
    const response = await fetch(`${apiUrl}?user_id=${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(
        errorData.error ||
          errorData.message ||
          `HTTP error ${response.status}`
      );
    }

    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error getting Notion connect URL:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to get Notion connect URL');
  }
}

/**
 * Check Notion connection status
 */
export async function getNotionStatus(
  userId: string
): Promise<NotionConnectionStatus> {
  const apiUrl = buildNotionApiUrl('/api/notion/status');

  try {
    const response = await fetch(`${apiUrl}?user_id=${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
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
      workspace_name: data.workspace_name,
      integration_name: data.integration_name,
      connection_type: data.connection_type,
    };
  } catch (error) {
    console.error('Error checking Notion status:', error);
    return { connected: false };
  }
}

/**
 * Disconnect Notion
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
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(
        errorData.error || `HTTP error ${response.status}`
      );
    }
  } catch (error) {
    console.error('Error disconnecting from Notion:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to disconnect from Notion');
  }
}
