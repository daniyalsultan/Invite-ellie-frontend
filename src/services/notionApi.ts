// Notion API service for OAuth integration

// Get Notion API base URL from environment variable
// Default to localhost:5002 for development
function getNotionApiBaseUrl(): string | null {
  const baseUrl = import.meta.env.VITE_NOTION_API_URL || 'http://localhost:5002';
  if (!baseUrl) {
    console.warn('VITE_NOTION_API_URL is not configured');
    return null;
  }
  return baseUrl.trim().replace(/\/$/, '');
}

function buildNotionApiUrl(path: string): string | null {
  const baseUrl = getNotionApiBaseUrl();
  if (!baseUrl) {
    return null;
  }
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
  if (!apiUrl) {
    throw new Error('Notion API URL is not configured. Set VITE_NOTION_API_URL in your .env file.');
  }

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
  if (!apiUrl) {
    throw new Error('Notion API URL is not configured. Set VITE_NOTION_API_URL in your .env file.');
  }

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
  if (!apiUrl) {
    throw new Error('Notion API URL is not configured. Set VITE_NOTION_API_URL in your .env file.');
  }

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

