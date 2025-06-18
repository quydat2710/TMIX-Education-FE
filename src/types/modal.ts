// Common interfaces
export interface IBackendRes<T> {
    error?: string;
    message?: string;
    data?: T;
}

// Auth interfaces
export interface IRegister {
    name: string;
    email: string;
    password: string;
    role: string;
    gender: string;
    phone: string;
    dayOfBirth: string;
}

export interface ILogin {
    email: string;
    password: string;
}

export interface ILoginResponse {
    user: IUser;
    access_token: string;
    refresh_token: string;
}

// User interfaces
export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    gender: string;
    phone: string;
    dayOfBirth: string;
    address?: string;
    avatar?: string;
}

export interface IUpdateProfile {
    name?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    gender?: 'male' | 'female';
    dayOfBirth?: string;
}

export interface IChangePassword {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Class interfaces
export interface IClass {
    _id: string;
    name: string;
    grade: string;
    section: string;
    year: number;
    status: 'active' | 'closed' | 'upcoming';
    feePerLesson: number;
    maxStudents: number;
    description: string;
    room: string;
    schedule: {
        startDate: string;
        endDate: string;
        dayOfWeeks: number[];
        timeSlots: {
            startTime: string;
            endTime: string;
        };
    };
    teacher?: IUser;
    students?: IStudentInClass[];
}

export interface IStudentInClass {
    student: IStudent;
    discountPercent: number;
    status: 'active' | 'inactive';
}

// Student interfaces
export interface IStudent {
    _id: string;
    userData: IUser;
    studentData: {
        classes: {
            classId: string;
            discountPercent: number;
            status: 'active' | 'inactive';
        }[];
    };
}

// Teacher interfaces
export interface ITeacher {
    _id: string;
    userData: IUser;
    teacherData: {
        salaryPerLesson: number;
        qualifications: string[];
        specialization: string[];
        description: string;
        isActive: boolean;
    };
}

// Parent interfaces
export interface IParent {
    _id: string;
    userData: IUser;
    parentData: {
        canSeeTeacherInfo: boolean;
        studentIds: string[];
    };
}

// Attendance interfaces
export interface IAttendance {
    _id: string;
    classId: string;
    date: string;
    students: {
        studentId: string;
        status: 'present' | 'absent' | 'late';
        note?: string;
    }[];
}

// Payment interfaces
export interface IPayment {
    _id: string;
    studentId: string;
    classId: string;
    amount: number;
    status: 'pending' | 'paid' | 'cancelled';
    method: string;
    note?: string;
    createdAt: string;
}

export interface ITeacherPayment {
    _id: string;
    teacherId: string;
    classId: string;
    amount: number;
    status: 'pending' | 'paid';
    month: number;
    year: number;
    createdAt: string;
}

// Pagination interfaces
export interface IPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Response interfaces
export interface IClassesResponse {
    data: IClass[];
    pagination: IPagination;
}

export interface IStudentsResponse {
    data: IStudent[];
    pagination: IPagination;
}

export interface ITeachersResponse {
    data: ITeacher[];
    pagination: IPagination;
}

export interface IParentsResponse {
    data: IParent[];
    pagination: IPagination;
}

export interface IAttendancesResponse {
    data: IAttendance[];
    pagination: IPagination;
}

export interface IPaymentsResponse {
    data: IPayment[];
    pagination: IPagination;
}

export interface ITeacherPaymentsResponse {
    data: ITeacherPayment[];
    pagination: IPagination;
}
