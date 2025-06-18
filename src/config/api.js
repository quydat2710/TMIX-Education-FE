export const API_CONFIG = {
  BASE_URL: 'https://eng-center-management.onrender.com',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh-token',
    },
    // User endpoints
    USERS: {
      GET_ALL: '/users',
      GET_BY_ID: (id) => `/users/${id}`,
      CREATE: '/users',
      UPDATE: (id) => `/users/${id}`,
      DELETE: (id) => `/users/${id}`,
    },
    // Teacher endpoints
    TEACHERS: {
      GET_ALL: '/teachers',
      GET_BY_ID: (id) => `/teachers/${id}`,
      CREATE: '/teachers',
      UPDATE: (id) => `/teachers/${id}`,
      DELETE: (id) => `/teachers/${id}`,
    },
    // Student endpoints
    STUDENTS: {
      GET_ALL: '/students',
      GET_BY_ID: (id) => `/students/${id}`,
      CREATE: '/students',
      UPDATE: (id) => `/students/${id}`,
      DELETE: (id) => `/students/${id}`,
    },
    // Class endpoints
    CLASSES: {
      GET_ALL: '/classes',
      GET_BY_ID: (id) => `/classes/${id}`,
      CREATE: '/classes',
      UPDATE: (id) => `/classes/${id}`,
      DELETE: (id) => `/classes/${id}`,
    },
  },
}; 