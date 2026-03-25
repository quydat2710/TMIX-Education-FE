// Materials Service
// Handles API calls for learning materials management

import axiosInstance from '../utils/axios.customize';

export interface Material {
    id: string;
    title: string;
    description?: string;
    category: string;
    fileUrl: string;
    fileType: string;
    originalFileName: string;
    fileSize: number;
    classId: string;
    uploadedById: string;
    createdAt: string;
}

/**
 * Construct accessible file URL for both dev (Vite proxy) and production.
 * Stored fileUrl is route-relative: /materials/files/{classId}/{filename}
 */
export const getFileAccessUrl = (material: Material): string => {
    if (!material.fileUrl) return '';
    if (material.fileUrl.startsWith('http')) return material.fileUrl; // Already absolute URL
    const baseUrl = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://103.199.18.103:8080/api/v1');
    return `${baseUrl}${material.fileUrl}`;
};

export interface MaterialsListResponse {
    data: {
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
        result: Material[];
    };
}

/**
 * Upload a new material
 */
export const uploadMaterial = async (formData: FormData) => {
    const response = await axiosInstance.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

/**
 * Get materials by class with optional category filter
 */
export const getMaterialsByClass = async (
    classId: string,
    params?: { category?: string; page?: number; limit?: number }
) => {
    const response = await axiosInstance.get('/materials', {
        params: { classId, ...params },
    });
    return response.data;
};

/**
 * Get a single material by ID
 */
export const getMaterialById = async (id: string) => {
    const response = await axiosInstance.get(`/materials/${id}`);
    return response.data;
};

/**
 * Delete a material
 */
export const deleteMaterial = async (id: string) => {
    const response = await axiosInstance.delete(`/materials/${id}`);
    return response.data;
};
