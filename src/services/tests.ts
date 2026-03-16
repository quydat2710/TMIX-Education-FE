// Test Management Service
// Handles CRUD operations for tests

import axiosInstance from '../utils/axios.customize';
import { ApiParams } from './api';
import {
    TestFormData,
    TestsListResponse,
    TestResponse,
    StudentTestItem,
} from '../types/test';

// ============================================
// Teacher APIs - Test Management
// ============================================

/**
 * Create a new test
 */
export const createTest = async (testData: Partial<TestFormData>): Promise<TestResponse> => {
    const response = await axiosInstance.post('/tests', testData);
    return response.data;
};

/**
 * Get all tests created by logged-in teacher
 * @param params - Pagination and filter parameters
 */
export const getTeacherTests = async (params?: ApiParams): Promise<TestsListResponse> => {
    const response = await axiosInstance.get('/tests/teacher/me', { params });
    return response.data;
};

/**
 * Get test by ID
 */
export const getTestById = async (id: string): Promise<TestResponse> => {
    const response = await axiosInstance.get(`/tests/${id}`);
    return response.data;
};

/**
 * Update test
 */
export const updateTest = async (
    id: string,
    testData: Partial<TestFormData>
): Promise<TestResponse> => {
    const response = await axiosInstance.put(`/tests/${id}`, testData);
    return response.data;
};

/**
 * Delete test
 */
export const deleteTest = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/tests/${id}`);
    return response.data;
};

/**
 * Publish a test (change status from draft to published)
 */
export const publishTest = async (id: string): Promise<TestResponse> => {
    const response = await axiosInstance.patch(`/tests/${id}/publish`);
    return response.data;
};

/**
 * Unpublish a test
 */
export const unpublishTest = async (id: string): Promise<TestResponse> => {
    const response = await axiosInstance.patch(`/tests/${id}/unpublish`);
    return response.data;
};

/**
 * Archive a test
 */
export const archiveTest = async (id: string): Promise<TestResponse> => {
    const response = await axiosInstance.patch(`/tests/${id}/archive`);
    return response.data;
};

/**
 * Duplicate a test (optionally for a different class)
 */
export const duplicateTest = async (
    id: string,
    newClassId?: string
): Promise<TestResponse> => {
    const response = await axiosInstance.post(`/tests/${id}/duplicate`, {
        classId: newClassId,
    });
    return response.data;
};

// ============================================
// Student APIs - Test Taking
// ============================================

/**
 * Get all available tests for logged-in student
 * (published tests from student's classes)
 */
export const getStudentAvailableTests = async (
    params?: ApiParams
): Promise<{ data: StudentTestItem[] }> => {
    const response = await axiosInstance.get('/tests/student/available', { params });
    return response.data;
};

/**
 * Get test details for student (without answers)
 * Used when student starts taking a test
 */
export const getStudentTestById = async (id: string): Promise<TestResponse> => {
    const response = await axiosInstance.get(`/tests/student/${id}`);
    return response.data;
};

/**
 * Get all test attempts by logged-in student
 */
export const getStudentAttempts = async (params?: ApiParams) => {
    const response = await axiosInstance.get('/tests/student/attempts', { params });
    return response.data;
};

/**
 * Get a specific test attempt by ID
 */
export const getAttemptById = async (attemptId: string) => {
    const response = await axiosInstance.get(`/tests/attempts/${attemptId}`);
    return response.data;
};

// ============================================
// Statistics & Results
// ============================================

/**
 * Get test statistics (for teachers)
 */
export const getTestStatistics = async (testId: string) => {
    const response = await axiosInstance.get(`/tests/${testId}/statistics`);
    return response.data;
};

/**
 * Get all student attempts for a specific test (for teachers)
 */
export const getTestAttempts = async (testId: string, params?: ApiParams) => {
    const response = await axiosInstance.get(`/tests/${testId}/attempts`, { params });
    return response.data;
};

/**
 * Export test results to Excel/CSV
 */
export const exportTestResults = async (testId: string) => {
    const response = await axiosInstance.get(`/tests/${testId}/export`, {
        responseType: 'blob',
    });
    return response.data;
};

/**
 * Teacher review: override attempt score/feedback
 */
export const reviewAttempt = async (
    attemptId: string,
    data: { score?: number; percentage?: number; passed?: boolean; teacherFeedback?: string },
) => {
    const response = await axiosInstance.patch(`/tests/attempts/${attemptId}/review`, data);
    return response.data;
};
