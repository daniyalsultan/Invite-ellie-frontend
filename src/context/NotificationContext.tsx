import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useProfile } from './ProfileContext';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, type Notification as NotificationType } from '../services/notificationApi';

export interface Notification {
  id: string;
  type: 'unresolved_meeting_notification';
  meeting_id: string | null;
  meeting_title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const { profile } = useProfile();
  const { ensureFreshAccessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) {
      console.log('[NotificationContext] No profile ID, skipping fetch');
      return;
    }

    try {
      console.log('[NotificationContext] Fetching notifications for user:', profile.id);
      const token = await ensureFreshAccessToken();
      if (!token) {
        console.warn('[NotificationContext] No access token available');
        return;
      }

      const data = await getNotifications(profile.id, token);
      console.log('[NotificationContext] Fetched notifications:', data.results.length);
      
      // Map API response to Notification format
      const mappedNotifications: Notification[] = data.results.map((n: NotificationType) => ({
        id: n.id,
        type: n.type as 'unresolved_meeting_notification',
        meeting_id: n.meeting_id,
        meeting_title: n.meeting_title,
        message: n.message,
        timestamp: n.timestamp || n.created_at,
        read: n.read,
      }));

      setNotifications(mappedNotifications);
      console.log('[NotificationContext] Set notifications in state:', mappedNotifications.length);
    } catch (error) {
      console.error('[NotificationContext] Error fetching notifications:', error);
      // Don't silently fail - show error in console
      if (error instanceof Error) {
        console.error('[NotificationContext] Error details:', error.message, error.stack);
      }
    }
  }, [profile?.id, ensureFreshAccessToken]);

  // Fetch notifications on mount and when profile changes
  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'> & { id?: string }) => {
    // When notification comes from WebSocket, it should have an ID from the database
    setNotifications((prev) => {
      // Check if notification already exists by ID or meeting_id (prevent duplicates)
      const exists = prev.some((n) => {
        if (notification.id && n.id === notification.id) {
          return true;
        }
        if (notification.meeting_id && n.meeting_id === notification.meeting_id && !n.read) {
          return true;
        }
        return false;
      });
      if (exists) {
        return prev;
      }
      // Use the ID from WebSocket if available, otherwise create temporary one
      const newNotification: Notification = {
        ...notification,
        id: notification.id || `${notification.meeting_id || 'unknown'}-${Date.now()}`,
        read: false,
      };
      return [newNotification, ...prev];
    });
    
    // Refresh from DB to get the actual notification with ID (if ID was not provided)
    if (!notification.id) {
      setTimeout(() => {
        void fetchNotifications();
      }, 500);
    }
  }, [fetchNotifications]);

  const connectWebSocket = useCallback(() => {
    if (!profile?.id) {
      return;
    }

    // Get WebSocket URL from environment
    const baseUrl = import.meta.env.VITE_RECALLAI_BASE_URL;
    if (!baseUrl || typeof baseUrl !== 'string' || !baseUrl.trim()) {
      console.warn('[NotificationContext] VITE_RECALLAI_BASE_URL not set, WebSocket notifications disabled');
      return;
    }

    // Convert http/https to ws/wss
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = baseUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsBaseUrl}/ws/notifications?userId=${profile.id}`;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      console.log('[NotificationContext] Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[NotificationContext] WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[NotificationContext] WebSocket message received:', data);
          
          if (data.type === 'notification' && data.data) {
            const notificationData = data.data;
            if (notificationData.type === 'unresolved_meeting_notification') {
              console.log('[NotificationContext] Adding notification from WebSocket:', notificationData);
              // Use the ID from the database (should be included in WebSocket message)
              addNotification({
                id: notificationData.id,
                type: notificationData.type,
                meeting_id: notificationData.meeting_id,
                meeting_title: notificationData.meeting_title,
                message: notificationData.message,
                timestamp: notificationData.timestamp,
              });
              // Refresh from DB to ensure we have the latest data
              setTimeout(() => {
                void fetchNotifications();
              }, 1000);
            }
          } else if (data.type === 'pong') {
            // Keepalive response
            console.log('[NotificationContext] WebSocket pong received');
          }
        } catch (error) {
          console.error('[NotificationContext] Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[NotificationContext] WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('[NotificationContext] WebSocket disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if not a clean close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Exponential backoff, max 30s
          console.log(`[NotificationContext] Attempting to reconnect in ${delay / 1000} seconds...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[NotificationContext] Error creating WebSocket:', error);
      setIsConnected(false);
    }
  }, [profile?.id, addNotification, fetchNotifications]);

  // Connect WebSocket when profile is available
  useEffect(() => {
    if (profile?.id) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [profile?.id, connectWebSocket]);

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected || !wsRef.current) {
      return;
    }

    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!profile?.id) return;

    try {
      const token = await ensureFreshAccessToken();
      if (!token) return;

      // Delete notification from DB (marking as read removes it)
      await deleteNotification(notificationId, profile.id, token);
      
      // Remove from local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('[NotificationContext] Error deleting notification:', error);
      // Fallback: try to mark as read instead
      try {
        const token = await ensureFreshAccessToken();
        if (token) {
          await markNotificationAsRead(notificationId, profile.id, token);
          // Remove from local state
          setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        }
      } catch (fallbackError) {
        console.error('[NotificationContext] Error marking notification as read (fallback):', fallbackError);
        // Still update UI optimistically
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    }
  }, [profile?.id, ensureFreshAccessToken]);

  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const token = await ensureFreshAccessToken();
      if (!token) return;

      // Call API to mark all as read
      await markAllNotificationsAsRead(profile.id, token);
      
      // Remove all unread notifications from local state
      setNotifications((prev) => prev.filter((n) => n.read));
    } catch (error) {
      console.error('[NotificationContext] Error marking all notifications as read:', error);
      // Still update UI optimistically
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [profile?.id, ensureFreshAccessToken]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

