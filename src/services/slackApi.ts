// Slack API service for OAuth integration
//
// Talks to recall-server (VITE_RECALLAI_BASE_URL), which owns the Slack
// OAuth flow and export logic alongside the calendar integrations.

function getSlackApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_RECALLAI_BASE_URL;
  if (!baseUrl || typeof baseUrl !== 'string' || !baseUrl.trim()) {
    throw new Error('VITE_RECALLAI_BASE_URL is not configured');
  }
  return baseUrl.trim().replace(/\/$/, '');
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
export async function getSlackConnectUrl(userId: string, returnTo?: string): Promise<string> {
  const params = new URLSearchParams({ user_id: userId });
  if (returnTo) params.append('returnTo', returnTo);
  const apiUrl = `${getSlackApiBaseUrl()}/api/slack/connect?${params.toString()}`;

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
  const apiUrl = `${getSlackApiBaseUrl()}/api/slack/status?user_id=${userId}`;

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
  // Required. This defaulted to '#general', so any caller that forgot to pass
  // a channel silently posted a customer's meeting summary to whatever
  // #general happened to be.
  channel: string,
  force = false
): Promise<{ success: boolean; message?: string; error?: string; duplicate?: boolean }> {
  const apiUrl = `${getSlackApiBaseUrl()}/api/slack/export`;

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
        force,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      // A repeat export is a question for the user, not a failure, so it comes
      // back as a result rather than an exception.
      return {
        success: false,
        duplicate: response.status === 409 || Boolean(errorData.duplicate),
        error: errorData.error || `HTTP error ${response.status}`,
      };
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
  const apiUrl = `${getSlackApiBaseUrl()}/api/slack/disconnect`;

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

export type SlackChannel = { id: string; name: string; is_member: boolean };

/** Public channels this workspace exposes. Ellie can post to any of them
 *  without joining first, so everything returned here is reachable. */
export async function getSlackChannels(
  userId: string,
): Promise<{ connected: boolean; team_name?: string; channels: SlackChannel[]; error?: string }> {
  const apiUrl = `${getSlackApiBaseUrl()}/api/slack/channels?user_id=${encodeURIComponent(userId)}`;
  try {
    const response = await fetch(apiUrl, { method: 'GET', headers: { Accept: 'application/json' } });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      return { connected: false, channels: [], error: 'Could not load Slack channels' };
    }
    return { connected: Boolean(data.connected), team_name: data.team_name, channels: data.channels || [], error: data.error };
  } catch (error) {
    console.error('Failed to load Slack channels:', error);
    return { connected: false, channels: [], error: 'Could not load Slack channels' };
  }
}
