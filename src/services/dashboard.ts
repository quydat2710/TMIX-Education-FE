import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

export const getAdminDashboardAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN);
export const getTeacherDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.TEACHER(id));
export const getParentDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.PARENT(id));
export const getStudentDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.STUDENT(id));
export const getMonthlyRevenueAPI = (params?: { year?: number }) =>
    axiosInstance.get('/dashboard/monthly-revenue', { params });

export const getDashboardPaymentsAPI = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => axiosInstance.get('/dashboard/all-payments', { params });
