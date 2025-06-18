export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  CLASSES: {
    BASE: '/classes',
    BY_ID: (id) => `/classes/${id}`,
    STUDENTS: (id) => `/classes/${id}/students`,
    ATTENDANCE: (id) => `/classes/${id}/attendance`,
    SCHEDULE: (id) => `/classes/${id}/schedule`
  },
  TEACHERS: {
    BASE: '/teachers',
    BY_ID: (id) => `/teachers/${id}`,
    CLASSES: (id) => `/teachers/${id}/classes`,
    SCHEDULE: (id) => `/teachers/${id}/schedule`
  },
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id) => `/students/${id}`,
    ATTENDANCE: (id) => `/students/${id}/attendance`,
    FEES: (id) => `/students/${id}/fees`
  },
  PARENTS: {
    BASE: '/parents',
    BY_ID: (id) => `/parents/${id}`,
    CHILDREN: (id) => `/parents/${id}/children`
  },
  ATTENDANCE: {
    BASE: '/attendance',
    BY_CLASS: (classId) => `/attendance/class/${classId}`,
    BY_STUDENT: (studentId) => `/attendance/student/${studentId}`,
    MARK: '/attendance/mark'
  },
  FEES: {
    BASE: '/fees',
    BY_STUDENT: (studentId) => `/fees/student/${studentId}`,
    PAYMENT: '/fees/payment',
    STATISTICS: '/fees/statistics'
  },
  ANNOUNCEMENTS: {
    BASE: '/announcements',
    BY_ID: (id) => `/announcements/${id}`,
    PUBLIC: '/announcements/public'
  },
  STATISTICS: {
    OVERVIEW: '/statistics/overview',
    REVENUE: '/statistics/revenue',
    ENROLLMENT: '/statistics/enrollment',
    ATTENDANCE: '/statistics/attendance'
  }
};
