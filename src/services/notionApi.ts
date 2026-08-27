// Notion API service for OAuth integration
//
// Talks to recall-server (VITE_RECALLAI_BASE_URL), which owns the Notion
// OAuth flow and export logic alongside the calendar integrations.

function getNotionApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_RECALLAI_BASE_URL;
  if (!baseUrl || typeof baseUrl !== 'string' || !baseUrl.trim()) {
    throw new Error('VITE_RECALLAI_BASE_URL is not configured');
  }
  return baseUrl.trim().replace(/\/$/, '');
}

function buildNotionApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getNotionApiBaseUrl()}${cleanPath}`;
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
export async function getNotionConnectUrl(userId: string, returnTo?: string): Promise<string> {
  const apiUrl = buildNotionApiUrl('/api/notion/connect');
  const params = new URLSearchParams({ user_id: userId });
  if (returnTo) params.append('returnTo', returnTo);

  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`, {
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
 * Export a meeting summary to Notion as a page under the connected parent page
 */
export async function notionExport(
  userId: string,
  transcriptionId: string,
  meetingTitle: string,
  summary: string,
  actionItems: any[],
  force = false,
  // Required — see slackApi.slackExport. An export writes a meeting's contents
  // into a third-party workspace, so it has to prove who is asking.
  token: string,
): Promise<{ success: boolean; message?: string; error?: string; duplicate?: boolean }> {
  const apiUrl = buildNotionApiUrl('/api/notion/export');

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
    console.error('Error exporting to Notion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export to Notion',
    };
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
