import { buildRecallaiUrl } from './transcriptionApi';

export interface Notification {
  id: string;
  type: string;
  meeting_id: string | null;
  meeting_title: string;
  message: string;
  read: boolean;
  read_at: string | null;
  timestamp: string;
  created_at: string;
}

export interface NotificationsResponse {
  results: Notification[];
  count: number;
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(
  _userId: string,
  token: string,
  options?: { unread_only?: boolean; read_only?: boolean }
): Promise<NotificationsResponse> {
  const recallaiUrl = buildRecallaiUrl('/api/notifications');
  if (!recallaiUrl) {
    throw new Error('Recall server URL is not configured');
  }

  const params = new URLSearchParams();
  if (options?.unread_only) {
    params.append('unread_only', 'true');
  }
  if (options?.read_only) {
    params.append('read_only', 'true');
  }

  const url = `${recallaiUrl}?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch notifications: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  _userId: string,
  token: string
): Promise<void> {
  const recallaiUrl = buildRecallaiUrl(`/api/notifications/${notificationId}/read`);
  if (!recallaiUrl) {
    throw new Error('Recall server URL is not configured');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to mark notification as read: ${errorText || response.statusText}`);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
  _userId: string,
  token: string
): Promise<{ count: number }> {
  const recallaiUrl = buildRecallaiUrl('/api/notifications/read-all');
  if (!recallaiUrl) {
    throw new Error('Recall server URL is not configured');
  }

  const response = await fetch(recallaiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to mark all notifications as read: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  _userId: string,
  token: string
): Promise<void> {
  const recallaiUrl = buildRecallaiUrl(`/api/notifications/${notificationId}`);
  if (!recallaiUrl) {
    throw new Error('Recall server URL is not configured');
  }

  const response = await fetch(recallaiUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete notification: ${errorText || response.statusText}`);
  }
}

