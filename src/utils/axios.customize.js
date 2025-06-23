import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://eng-center-management.onrender.com/api/v1',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData requests
        // Let the browser set it automatically with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            // Xử lý lỗi từ server
            if (error.response.status === 401) {
                // Token hết hạn hoặc không hợp lệ
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default instance;
