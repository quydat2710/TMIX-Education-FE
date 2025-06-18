import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
  refreshToken: () => apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN),
  getProfile: () => apiClient.get(API_ENDPOINTS.AUTH.PROFILE),
};

// Class Services
export const classService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.CLASSES.BASE, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.CLASSES.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.CLASSES.BASE, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.CLASSES.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.CLASSES.BY_ID(id)),
  getStudents: (id) => apiClient.get(API_ENDPOINTS.CLASSES.STUDENTS(id)),
  getAttendance: (id, params) => apiClient.get(API_ENDPOINTS.CLASSES.ATTENDANCE(id), { params }),
  getSchedule: (id) => apiClient.get(API_ENDPOINTS.CLASSES.SCHEDULE(id)),
};

// Teacher Services
export const teacherService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.TEACHERS.BASE, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.TEACHERS.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.TEACHERS.BASE, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.TEACHERS.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.TEACHERS.BY_ID(id)),
  getClasses: (id) => apiClient.get(API_ENDPOINTS.TEACHERS.CLASSES(id)),
  getSchedule: (id) => apiClient.get(API_ENDPOINTS.TEACHERS.SCHEDULE(id)),
};

// Student Services
export const studentService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.STUDENTS.BASE, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.STUDENTS.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.STUDENTS.BASE, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.STUDENTS.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.STUDENTS.BY_ID(id)),
  getAttendance: (id, params) => apiClient.get(API_ENDPOINTS.STUDENTS.ATTENDANCE(id), { params }),
  getFees: (id) => apiClient.get(API_ENDPOINTS.STUDENTS.FEES(id)),
};

// Parent Services
export const parentService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.PARENTS.BASE, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.PARENTS.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.PARENTS.BASE, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.PARENTS.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.PARENTS.BY_ID(id)),
  getChildren: (id) => apiClient.get(API_ENDPOINTS.PARENTS.CHILDREN(id)),
};

// Attendance Services
export const attendanceService = {
  markAttendance: (data) => apiClient.post(API_ENDPOINTS.ATTENDANCE.MARK, data),
  getByClass: (classId, params) => apiClient.get(API_ENDPOINTS.ATTENDANCE.BY_CLASS(classId), { params }),
  getByStudent: (studentId, params) => apiClient.get(API_ENDPOINTS.ATTENDANCE.BY_STUDENT(studentId), { params }),
};

// Fee Services
export const feeService = {
  getByStudent: (studentId) => apiClient.get(API_ENDPOINTS.FEES.BY_STUDENT(studentId)),
  makePayment: (data) => apiClient.post(API_ENDPOINTS.FEES.PAYMENT, data),
  getStatistics: (params) => apiClient.get(API_ENDPOINTS.FEES.STATISTICS, { params }),
};

// Announcement Services
export const announcementService = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.BASE, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.ANNOUNCEMENTS.BASE, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id)),
  getPublic: () => apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.PUBLIC),
};

// Statistics Services
export const statisticsService = {
  getOverview: () => apiClient.get(API_ENDPOINTS.STATISTICS.OVERVIEW),
  getRevenue: (params) => apiClient.get(API_ENDPOINTS.STATISTICS.REVENUE, { params }),
  getEnrollment: (params) => apiClient.get(API_ENDPOINTS.STATISTICS.ENROLLMENT, { params }),
  getAttendance: (params) => apiClient.get(API_ENDPOINTS.STATISTICS.ATTENDANCE, { params }),
};

export default apiClient;
