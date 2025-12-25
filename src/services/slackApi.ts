// // Slack API service for OAuth integration

// /**
//  * 🔒 PRODUCTION LOCK
//  * This file ALWAYS uses the Railway backend directly.
//  * No ENV variables
//  * No /api proxy logic
//  * No CORS guessing
//  */

// const SLACK_API_BASE_URL = 'https://web-production-07092.up.railway.app';

// function buildSlackApiUrl(path: string): string {
//   const cleanPath = path.startsWith('/') ? path : `/${path}`;
//   return `${SLACK_API_BASE_URL}${cleanPath}`;
// }

// export interface SlackConnectionStatus {
//   connected: boolean;
//   team_name?: string;
//   user_name?: string;
//   team_id?: string;
// }

// /**
//  * Get Slack OAuth authorization URL
//  */
// export async function getSlackConnectUrl(userId: string): Promise<string> {
//   const apiUrl = buildSlackApiUrl('/api/slack/connect');

//   try {
//     const response = await fetch(`${apiUrl}?user_id=${userId}`, {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({
//         error: 'Unknown error',
//       }));
//       throw new Error(errorData.error || `HTTP error ${response.status}`);
//     }

//     const data = await response.json();
//     return data.auth_url;
//   } catch (error) {
//     console.error('Error getting Slack connect URL:', error);
//     throw error instanceof Error
//       ? error
//       : new Error('Failed to get Slack connect URL');
//   }
// }

// /**
//  * Check Slack connection status
//  */
// export async function getSlackStatus(
//   userId: string
// ): Promise<SlackConnectionStatus> {
//   const apiUrl = buildSlackApiUrl('/api/slack/status');

//   try {
//     const response = await fetch(`${apiUrl}?user_id=${userId}`, {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({
//         error: 'Unknown error',
//       }));
//       throw new Error(errorData.error || `HTTP error ${response.status}`);
//     }

//     const data = await response.json();
//     return {
//       connected: Boolean(data.connected),
//       team_name: data.team_name,
//       user_name: data.user_name,
//       team_id: data.team_id,
//     };
//   } catch (error) {
//     console.error('Error checking Slack status:', error);
//     return { connected: false };
//   }
// }

// /**
//  * Disconnect Slack
//  */
// export async function disconnectSlack(userId: string): Promise<void> {
//   const apiUrl = buildSlackApiUrl('/api/slack/disconnect');

//   try {
//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//       },
//       body: JSON.stringify({ user_id: userId }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({
//         error: 'Unknown error',
//       }));
//       throw new Error(errorData.error || `HTTP error ${response.status}`);
//     }
//   } catch (error) {
//     console.error('Error disconnecting from Slack:', error);
//     throw error instanceof Error
//       ? error
//       : new Error('Failed to disconnect from Slack');
//   }
// }
// Slack API service for OAuth integration

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
