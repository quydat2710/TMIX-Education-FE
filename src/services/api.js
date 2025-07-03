import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Auth APIs
export const registerAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
export const registerAdminAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
export const loginAPI = (data) => {
  const formData = new URLSearchParams();
  formData.append('email', data.email);
  formData.append('password', data.password);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const changePasswordAPI = (oldPassword, newPassword) => {
  const formData = new URLSearchParams();
  formData.append('oldPassword', oldPassword);
  formData.append('newPassword', newPassword);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const logoutAPI = (refreshToken) => {
  const formData = new URLSearchParams();
  formData.append('refreshToken', refreshToken);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const forgotPasswordAPI = (email) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const verifyCodeAPI = (code, email) => {
  const formData = new URLSearchParams();
  formData.append('code', code);
  formData.append('email', email);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const resetPasswordAPI = (email, code, password) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('code', code);
  formData.append('password', password);

  console.log('resetPasswordAPI debug:', {
    email,
    code,
    password,
    formDataString: formData.toString()
  });

  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

// User APIs
export const uploadAvatarAPI = (formData) => axiosInstance.post(API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR, formData);
export const getUserByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id));

// Class APIs
export const createClassAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.CLASSES.CREATE, data);
export const updateClassAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.UPDATE(id), data);
export const getAllClassesAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_ALL, { params });
export const getClassByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_BY_ID(id));
export const enrollStudentAPI = (classId, students) => axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.ENROLL_STUDENT(classId), students);
export const getStudentsInClassAPI = (classId, params) => axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_STUDENTS(classId), { params });
export const removeStudentFromClassAPI = (classId, studentId) => axiosInstance.delete(API_CONFIG.ENDPOINTS.CLASSES.REMOVE_STUDENT(classId), { data: { studentId } });
export const assignTeacherAPI = (classId, teacherId) => {
  const formData = new URLSearchParams();
  formData.append('teacherId', teacherId);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.ASSIGN_TEACHER(classId), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const unassignTeacherAPI = (classId) => axiosInstance.delete(API_CONFIG.ENDPOINTS.CLASSES.UNASSIGN_TEACHER(classId));

// Student APIs
export const createStudentAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.STUDENTS.CREATE, data);
export const getAllStudentsAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_ALL, { params });
export const getStudentByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_BY_ID(id));
export const updateStudentAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE(id), data);
export const deleteStudentAPI = (id) => axiosInstance.delete(API_CONFIG.ENDPOINTS.STUDENTS.DELETE(id));
export const getStudentScheduleAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.SCHEDULE(id));
export const getStudentAttendanceAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.ATTENDANCE(id));
export const getMonthlyStudentChangeAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.MONTHLY_CHANGES, { params });

// Teacher APIs
export const createTeacherAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.TEACHERS.CREATE, data);
export const getAllTeachersAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_ALL, { params });
export const getTeacherByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_BY_ID(id));
export const updateTeacherAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE(id), data);
export const deleteTeacherAPI = (id) => axiosInstance.delete(API_CONFIG.ENDPOINTS.TEACHERS.DELETE(id));
export const getMyClassesAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_MY_CLASSES);
export const getTeacherScheduleAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_SCHEDULE(id));

// Parent APIs
export const createParentAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.PARENTS.CREATE, data);
export const getAllParentsAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_ALL, { params });
export const getParentByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_BY_ID(id));
export const updateParentAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.UPDATE(id), data);
export const deleteParentAPI = (id) => axiosInstance.delete(API_CONFIG.ENDPOINTS.PARENTS.DELETE(id));
export const addChildAPI = (studentId, parentId) => {
  const formData = new URLSearchParams();
  formData.append('studentId', studentId);
  formData.append('parentId', parentId);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.ADD_CHILD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const removeChildAPI = (studentId, parentId) => {
  const formData = new URLSearchParams();
  formData.append('studentId', studentId);
  formData.append('parentId', parentId);
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.PARENTS.REMOVE_CHILD, {
    data: formData,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const payTuitionAPI = (data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.PAY_TUITION, data);

// Attendance APIs
export const getTodayAttendanceAPI = (classId) => axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_TODAY(classId));
export const getAttendanceListAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_LIST, { params });
export const updateAttendanceAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.ATTENDANCES.UPDATE(id), data);
export const getAttendanceByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_BY_ID(id));

// Payment APIs
export const getPaymentsAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, { params });
export const getPaymentsByStudentAPI = (studentId, params) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_BY_STUDENT(studentId), { params });
export const getTotalPaymentsAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TOTAL);
export const getTeacherPaymentsAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TEACHER_PAYMENTS, { params });
export const payTeacherAPI = (id, data, params = {}) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(Number(data.amount)));
  if (data.method) formData.append('method', data.method);
  if (data.note) formData.append('note', data.note);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.PAYMENTS.PAY_TEACHER(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params
  });
};
export const getTeacherPaymentByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TEACHER_PAYMENT_BY_ID(id));

// Schedule APIs
export const getLoggedInStudentSchedule = () => axiosInstance.get(API_CONFIG.ENDPOINTS.SCHEDULES.GET_STUDENT_SCHEDULE);

// Announcement APIs (Quản lý quảng cáo)
export const createAnnouncementAPI = (data) =>
  axiosInstance.post(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.CREATE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getAllAnnouncementsAPI = (params) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_ALL, { params });

export const getAnnouncementByIdAPI = (id) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_BY_ID(id));

export const updateAnnouncementAPI = (id, data) =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.UPDATE(id), data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteAnnouncementAPI = (id) =>
  axiosInstance.delete(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.DELETE(id));

// Refresh token
export const refreshTokenAPI = (refreshToken) => {
  const formData = new URLSearchParams();
  formData.append('refreshToken', refreshToken);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

// Gửi email xác thực
export const sendVerificationEmailAPI = () =>
  axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL);

// Xác thực email
export const verifyEmailAPI = (token) =>
  axiosInstance.post(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);

// Update user (PATCH)
export const updateUserAPI = (userId, data) => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPDATE(userId), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

// Dashboard APIs
export const getAdminDashboardAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN);
export const getTeacherDashboardAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.TEACHER(id));
export const getParentDashboardAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.PARENT(id));
export const getStudentDashboardAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.STUDENT(id));
