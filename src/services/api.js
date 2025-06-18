import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Auth APIs
export const registerAPI = (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
};

export const loginAPI = (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data);
};

export const changePasswordAPI = (oldPassword, newPassword) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, { oldPassword, newPassword });
};

export const logoutAPI = () => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
};

export const refreshTokenAPI = (refreshToken) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
};

// Class APIs
export const createClassAPI = (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.CLASSES.CREATE, data);
};

export const updateClassAPI = (id, data) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.CLASSES.UPDATE(id), data);
};

export const getAllClassesAPI = () => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_ALL);
};

export const getClassByIdAPI = (id) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_BY_ID(id));
};

export const enrollStudentAPI = (classId, studentId, discountPercent) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.CLASSES.ENROLL_STUDENT(classId), { studentId, discountPercent });
};

export const getStudentsInClassAPI = (classId, limit = 4, page = 1) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_STUDENTS(classId), { params: { limit, page } });
};

export const removeStudentFromClassAPI = (classId, studentId) => {
    return axiosInstance.delete(API_CONFIG.ENDPOINTS.CLASSES.REMOVE_STUDENT(classId), { data: { studentId } });
};

export const assignTeacherAPI = (classId, teacherId) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.CLASSES.ASSIGN_TEACHER(classId), { teacherId });
};

export const unassignTeacherAPI = (classId) => {
    return axiosInstance.delete(API_CONFIG.ENDPOINTS.CLASSES.UNASSIGN_TEACHER(classId));
};

// Student APIs
export const getAllStudentsAPI = () => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_ALL);
};

export const getStudentByIdAPI = (id) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_BY_ID(id));
};

export const createStudentAPI = (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.STUDENTS.CREATE, data);
};

export const updateStudentAPI = (id, data) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE(id), data);
};

export const deleteStudentAPI = (id) => {
    return axiosInstance.delete(API_CONFIG.ENDPOINTS.STUDENTS.DELETE(id));
};

export const getStudentScheduleAPI = (id) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_SCHEDULE(id));
};

export const getStudentAttendanceAPI = (id) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_ATTENDANCE(id));
};

// Teacher APIs
export const getAllTeachersAPI = () => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_ALL);
};

export const getTeacherByIdAPI = (id) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_BY_ID(id));
};

export const createTeacherAPI = (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.TEACHERS.CREATE, data);
};

export const updateTeacherAPI = (id, data) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE(id), data);
};

export const deleteTeacherAPI = (id) => {
    return axiosInstance.delete(API_CONFIG.ENDPOINTS.TEACHERS.DELETE(id));
};

// Parent APIs
export const createParentAPI = (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.PARENTS.CREATE, data);
};

export const getAllParentsAPI = (limit = 3, page = 1) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_ALL, { params: { limit, page } });
};

export const getParentByIdAPI = (id) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_BY_ID(id));
};

export const updateParentAPI = (id, data) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.PARENTS.UPDATE(id), data);
};

export const deleteParentAPI = (id) => {
    return axiosInstance.delete(API_CONFIG.ENDPOINTS.PARENTS.DELETE(id));
};

export const addChildAPI = (studentId, parentId) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.PARENTS.ADD_CHILD, { studentId, parentId });
};

export const removeChildAPI = (studentId, parentId) => {
    return axiosInstance.delete(API_CONFIG.ENDPOINTS.PARENTS.REMOVE_CHILD, { data: { studentId, parentId } });
};

export const payTuitionAPI = (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.PARENTS.PAY_TUITION, data);
};

// Attendance APIs
export const getTodayAttendanceAPI = (classId) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_TODAY(classId));
};

export const getAttendanceListAPI = (classId, limit = 2, page = 1, sortBy = "date") => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_LIST, { params: { classId, limit, page, sortBy } });
};

export const updateAttendanceAPI = (id, data) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.ATTENDANCES.UPDATE(id), data);
};

export const getAttendanceByIdAPI = (id) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_BY_ID(id));
};

// Payment APIs
export const getPaymentsAPI = (params) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, { params });
};

export const getTeacherPaymentsAPI = () => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TEACHER_PAYMENTS);
};
