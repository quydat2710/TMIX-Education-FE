import axiosInstance from '../utils/axios.customize';
import {
    IBackendRes,
    IRegister,
    ILogin,
    IClass,
    IStudent,
    ITeacher,
    IParent,
    IAttendance,
    IPayment,
    ITeacherPayment,
    IClassesResponse,
    IStudentsResponse,
    ITeachersResponse,
    IParentsResponse,
    IAttendancesResponse,
    IPaymentsResponse,
    ITeacherPaymentsResponse
} from "../types/modal";
import { API_CONFIG } from '../config/api';

// Auth APIs
export const registerAPI = (data: IRegister) => {
    return axiosInstance.post<IBackendRes<ILogin>>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
};

export const loginAPI = (data: ILogin) => {
    return axiosInstance.post<IBackendRes<ILogin>>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data);
};

export const changePasswordAPI = (oldPassword: string, newPassword: string) => {
    return axiosInstance.post<IBackendRes<any>>(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, { oldPassword, newPassword });
};

export const logoutAPI = () => {
    return axiosInstance.post<IBackendRes<any>>(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
};

export const refreshTokenAPI = (refreshToken: string) => {
    return axiosInstance.post<IBackendRes<any>>(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
};

// Class APIs
export const createClassAPI = (data: Omit<IClass, '_id'>) => {
    return axiosInstance.post<IBackendRes<IClass>>(API_CONFIG.ENDPOINTS.CLASSES.CREATE, data);
};

export const updateClassAPI = (id: string, data: Partial<IClass>) => {
    return axiosInstance.put<IBackendRes<IClass>>(API_CONFIG.ENDPOINTS.CLASSES.UPDATE(id), data);
};

export const getAllClassesAPI = () => {
    return axiosInstance.get<IBackendRes<IClass[]>>(API_CONFIG.ENDPOINTS.CLASSES.GET_ALL);
};

export const getClassByIdAPI = (id: string) => {
    return axiosInstance.get<IBackendRes<IClass>>(API_CONFIG.ENDPOINTS.CLASSES.GET_BY_ID(id));
};

export const enrollStudentAPI = (classId: string, studentId: string, discountPercent: number) => {
    return axiosInstance.post<IBackendRes<IClass>>(API_CONFIG.ENDPOINTS.CLASSES.ENROLL_STUDENT(classId), { studentId, discountPercent });
};

export const getStudentsInClassAPI = (classId: string, limit: number = 4, page: number = 1) => {
    return axiosInstance.get<IStudentsResponse>(API_CONFIG.ENDPOINTS.CLASSES.GET_STUDENTS(classId), { params: { limit, page } });
};

export const removeStudentFromClassAPI = (classId: string, studentId: string) => {
    return axiosInstance.delete<IBackendRes<IClass>>(API_CONFIG.ENDPOINTS.CLASSES.REMOVE_STUDENT(classId), { data: { studentId } });
};

export const assignTeacherAPI = (classId: string, teacherId: string) => {
    return axiosInstance.post<IBackendRes<IClass>>(API_CONFIG.ENDPOINTS.CLASSES.ASSIGN_TEACHER(classId), { teacherId });
};

export const unassignTeacherAPI = (classId: string) => {
    return axiosInstance.delete<IBackendRes<IClass>>(API_CONFIG.ENDPOINTS.CLASSES.UNASSIGN_TEACHER(classId));
};

// Student APIs
export const getAllStudentsAPI = () => {
    return axiosInstance.get<IBackendRes<IStudent[]>>(API_CONFIG.ENDPOINTS.STUDENTS.GET_ALL);
};

export const getStudentByIdAPI = (id: string) => {
    return axiosInstance.get<IBackendRes<IStudent>>(API_CONFIG.ENDPOINTS.STUDENTS.GET_BY_ID(id));
};

export const createStudentAPI = (data: Omit<IStudent, '_id'>) => {
    return axiosInstance.post<IBackendRes<IStudent>>(API_CONFIG.ENDPOINTS.STUDENTS.CREATE, data);
};

export const updateStudentAPI = (id: string, data: Partial<IStudent>) => {
    return axiosInstance.put<IBackendRes<IStudent>>(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE(id), data);
};

export const deleteStudentAPI = (id: string) => {
    return axiosInstance.delete<IBackendRes<IStudent>>(API_CONFIG.ENDPOINTS.STUDENTS.DELETE(id));
};

export const getStudentScheduleAPI = (id: string) => {
    return axiosInstance.get<IBackendRes<any>>(API_CONFIG.ENDPOINTS.STUDENTS.GET_SCHEDULE(id));
};

export const getStudentAttendanceAPI = (id: string) => {
    return axiosInstance.get<IBackendRes<any>>(API_CONFIG.ENDPOINTS.STUDENTS.GET_ATTENDANCE(id));
};

// Teacher APIs
export const getAllTeachersAPI = () => {
    return axiosInstance.get<IBackendRes<ITeacher[]>>(API_CONFIG.ENDPOINTS.TEACHERS.GET_ALL);
};

export const getTeacherByIdAPI = (id: string) => {
    return axiosInstance.get<IBackendRes<ITeacher>>(API_CONFIG.ENDPOINTS.TEACHERS.GET_BY_ID(id));
};

export const createTeacherAPI = (data: Omit<ITeacher, '_id'>) => {
    return axiosInstance.post<IBackendRes<ITeacher>>(API_CONFIG.ENDPOINTS.TEACHERS.CREATE, data);
};

export const updateTeacherAPI = (id: string, data: Partial<ITeacher>) => {
    return axiosInstance.put<IBackendRes<ITeacher>>(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE(id), data);
};

export const deleteTeacherAPI = (id: string) => {
    return axiosInstance.delete<IBackendRes<ITeacher>>(API_CONFIG.ENDPOINTS.TEACHERS.DELETE(id));
};

// Parent APIs
export const createParentAPI = (data: Omit<IParent, '_id'>) => {
    return axiosInstance.post<IBackendRes<IParent>>(API_CONFIG.ENDPOINTS.PARENTS.CREATE, data);
};

export const getAllParentsAPI = (limit: number = 3, page: number = 1) => {
    return axiosInstance.get<IParentsResponse>(API_CONFIG.ENDPOINTS.PARENTS.GET_ALL, { params: { limit, page } });
};

export const getParentByIdAPI = (id: string) => {
    return axiosInstance.get<IBackendRes<IParent>>(API_CONFIG.ENDPOINTS.PARENTS.GET_BY_ID(id));
};

export const updateParentAPI = (id: string, data: Partial<IParent>) => {
    return axiosInstance.put<IBackendRes<IParent>>(API_CONFIG.ENDPOINTS.PARENTS.UPDATE(id), data);
};

export const deleteParentAPI = (id: string) => {
    return axiosInstance.delete<IBackendRes<IParent>>(API_CONFIG.ENDPOINTS.PARENTS.DELETE(id));
};

export const addChildAPI = (studentId: string, parentId: string) => {
    return axiosInstance.post<IBackendRes<IParent>>(API_CONFIG.ENDPOINTS.PARENTS.ADD_CHILD, { studentId, parentId });
};

export const removeChildAPI = (studentId: string, parentId: string) => {
    return axiosInstance.delete<IBackendRes<IParent>>(API_CONFIG.ENDPOINTS.PARENTS.REMOVE_CHILD, { data: { studentId, parentId } });
};

export const payTuitionAPI = (data: {
    paymentId: string;
    amount: number;
    method: string;
    note?: string;
}) => {
    return axiosInstance.post<IBackendRes<IPayment>>(API_CONFIG.ENDPOINTS.PARENTS.PAY_TUITION, data);
};

// Attendance APIs
export const getTodayAttendanceAPI = (classId: string) => {
    return axiosInstance.get<IBackendRes<IAttendance>>(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_TODAY(classId));
};

export const getAttendanceListAPI = (classId: string, limit: number = 2, page: number = 1, sortBy: string = "date") => {
    return axiosInstance.get<IAttendancesResponse>(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_LIST, { params: { classId, limit, page, sortBy } });
};

export const updateAttendanceAPI = (id: string, data: {
    students: {
        studentId: string;
        status: 'present' | 'absent' | 'late';
        note?: string;
    }[];
}) => {
    return axiosInstance.put<IBackendRes<IAttendance>>(API_CONFIG.ENDPOINTS.ATTENDANCES.UPDATE(id), data);
};

export const getAttendanceByIdAPI = (id: string) => {
    return axiosInstance.get<IBackendRes<IAttendance>>(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_BY_ID(id));
};

// Payment APIs
export const getPaymentsAPI = (params?: {
    studentId?: string;
    classId?: string;
    month?: string;
    year?: string;
    status?: string;
}) => {
    return axiosInstance.get<IPaymentsResponse>(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, { params });
};

export const getTeacherPaymentsAPI = () => {
    return axiosInstance.get<ITeacherPaymentsResponse>(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TEACHER_PAYMENTS);
};
