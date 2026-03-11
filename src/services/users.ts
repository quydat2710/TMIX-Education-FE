import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';
import type { UserUpdateData } from './api';

// Upload avatar - gửi JSON thay vì form-urlencoded
export const uploadAvatarAPI = (data: { imageUrl: string; publicId: string }) => {
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR, data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const getUserByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id));

export const updateUserAPI = (userId: string, data: UserUpdateData) => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPDATE(userId), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
