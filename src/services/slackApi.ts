// Slack API service for OAuth integration

/**
 * 🔒 PRODUCTION LOCK
 * This file ALWAYS uses the Railway backend directly.
 * No ENV variables
 * No /api proxy logic
 * No CORS guessing
 * 
 * 🚀 START SERVER: https://web-production-07092.up.railway.app
 * 🔗 SLACK CONNECT: https://web-production-07092.up.railway.app/api/slack/connect
 * 🔗 SLACK STATUS:  https://web-production-07092.up.railway.app/api/slack/status  
 * 🔗 SLACK DISCONNECT: https://web-production-07092.up.railway.app/api/slack/disconnect
 * 🔗 SLACK EXPORT: https://web-production-07092.up.railway.app/api/slack/export
 */

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
  const apiUrl = `https://web-production-07092.up.railway.app/api/slack/connect?user_id=${userId}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error getting Slack connect URL:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to get Slack connect URL');
  }
}

/**
 * Check Slack connection status
 */
export async function getSlackStatus(
  userId: string
): Promise<SlackConnectionStatus> {
  const apiUrl = `https://web-production-07092.up.railway.app/api/slack/status?user_id=${userId}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return {
      connected: Boolean(data.connected),
      team_name: data.team_name,
      user_name: data.user_name,
      team_id: data.team_id,
    };
  } catch (error) {
    console.error('Error checking Slack status:', error);
    return { connected: false };
  }
}

/**
 * Export transcription to Slack
 */
export async function slackExport(
  userId: string,
  transcriptionId: string,
  meetingTitle: string,
  transcript: string,
  summary: string,
  actionItems: any[],
  channel: string = '#general'
): Promise<{ success: boolean; message?: string; error?: string }> {
  const apiUrl = `https://web-production-07092.up.railway.app/api/slack/export`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        transcription_id: transcriptionId,
        meeting_title: meetingTitle,
        transcript,
        summary,
        action_items: actionItems,
        channel,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    console.error('Error exporting to Slack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export to Slack',
    };
  }
}

/**
 * Disconnect Slack
 */
export async function disconnectSlack(userId: string): Promise<void> {
  const apiUrl = `https://web-production-07092.up.railway.app/api/slack/disconnect`;

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
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
  } catch (error) {
    console.error('Error disconnecting from Slack:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to disconnect from Slack');
  }
}
