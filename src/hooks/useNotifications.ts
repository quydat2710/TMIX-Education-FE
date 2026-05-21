import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Notification,
  getNotificationsAPI,
  getUnreadCountAPI,
  markAsReadAPI,
  markAllAsReadAPI,
} from '../services/notifications';
import { API_CONFIG } from '../config/api';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  latestNotification: Notification | null;
  fetchNotifications: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch notifications (paginated)
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await getNotificationsAPI(pageNum, 10);
      const data = res.data?.data || res.data;

      if (pageNum === 1) {
        setNotifications(data.result || []);
      } else {
        setNotifications((prev) => [...prev, ...(data.result || [])]);
      }

      setPage(pageNum);
      setHasMore(pageNum < (data.meta?.totalPages || 1));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more (next page)
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCountAPI();
      const data = res.data?.data || res.data;
      setUnreadCount(data.count ?? 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Mark single as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markAsReadAPI(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadAPI();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // Connect to SSE stream
  const connectSSE = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Build SSE URL through the same origin (Vite proxy in dev, same server in prod)
    const streamUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.STREAM}?token=${token}`;

    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    // Listen for typed 'notification' events (standard SSE)
    eventSource.addEventListener('notification', (event: MessageEvent) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        setLatestNotification(notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch (err) {
        console.error('[SSE] Failed to parse notification:', err);
      }
    });

    // Fallback: listen for generic 'message' events
    // NestJS SSE through Vite proxy wraps data as: {"data": "JSON_STRING", "type": "notification"}
    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const wrapper = JSON.parse(event.data);

        // Skip heartbeats
        if (wrapper.type === 'heartbeat') return;

        // Handle notification events (wrapped format)
        if (wrapper.type === 'notification' && wrapper.data) {
          const notification: Notification = typeof wrapper.data === 'string'
            ? JSON.parse(wrapper.data)
            : wrapper.data;

          setLatestNotification(notification);
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          return;
        }

        // Direct notification format (no wrapper)
        if (wrapper.id && wrapper.title) {
          const notification = wrapper as Notification;
          setLatestNotification(notification);
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      } catch {
        // Not JSON, ignore
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;

      // Auto-reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSSE();
      }, 5000);
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetchNotifications(1);
    refreshUnreadCount();
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchNotifications, refreshUnreadCount, connectSSE]);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    latestNotification,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  };
};
