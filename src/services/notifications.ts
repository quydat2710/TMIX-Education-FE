import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  recipientId: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  result: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}

export interface SendNotificationData {
  type?: string;
  title: string;
  message: string;
  link?: string;
  recipientRole?: string;
  recipientId?: string;
  classId?: string;
}

// Get paginated notifications
export const getNotificationsAPI = (page = 1, limit = 10, isRead?: boolean) => {
  let url = `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.GET_ALL}?page=${page}&limit=${limit}`;
  if (isRead !== undefined) {
    url += `&isRead=${isRead}`;
  }
  return axiosInstance.get(url);
};

// Get unread count
export const getUnreadCountAPI = () =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);

// Mark single notification as read
export const markAsReadAPI = (id: string) =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id));

// Mark all notifications as read
export const markAllAsReadAPI = () =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);

// Send notification (admin)
export const sendNotificationAPI = (data: SendNotificationData) =>
  axiosInstance.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.SEND, data);

// Delete notification
export const deleteNotificationAPI = (id: string) =>
  axiosInstance.delete(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(id));

// Get SSE stream URL (used by EventSource)
export const getNotificationStreamURL = (): string => {
  const baseURL = API_CONFIG.BASE_URL;
  return `${baseURL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.STREAM}`;
};
