import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface UseNotificationSocketReturn {
  /** Whether the WebSocket is connected */
  isConnected: boolean;
  /** Current unread notification count */
  unreadCount: number;
  /** Latest notification received via WebSocket */
  latestNotification: Notification | null;
  /** Mark a specific notification as read */
  markAsRead: (notificationId: string) => void;
  /** Mark all notifications as read */
  markAllAsRead: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080';

/**
 * Hook to connect to the real-time notification WebSocket.
 * Automatically connects when user is authenticated and disconnects on logout.
 * 
 * @example
 * ```tsx
 * const { isConnected, unreadCount, latestNotification, markAsRead } = useNotificationSocket();
 * ```
 */
export function useNotificationSocket(): UseNotificationSocketReturn {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const accessToken = token || localStorage.getItem('access_token');

    if (!user || !accessToken) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to WebSocket
    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('🔌 Notification socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Notification socket disconnected');
      setIsConnected(false);
    });

    socket.on('unread-count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    socket.on('new-notification', (notification: Notification) => {
      setLatestNotification(notification);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('connect_error', (error) => {
      console.warn('Notification socket error:', error.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  const markAsRead = useCallback((notificationId: string) => {
    socketRef.current?.emit('mark-read', { notificationId });
  }, []);

  const markAllAsRead = useCallback(() => {
    socketRef.current?.emit('mark-all-read');
  }, []);

  return {
    isConnected,
    unreadCount,
    latestNotification,
    markAsRead,
    markAllAsRead,
  };
}
