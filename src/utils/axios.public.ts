import axios from 'axios';
import { API_CONFIG } from '../config/api';

/**
 * Public axios instance — NO auth interceptors.
 * Dùng cho các API công khai: teachers/typical, feedback, classes/public…
 * Các trang public (homepage, /giao-vien, /danh-gia…) nên dùng instance này
 * để tránh 401 khi user chưa đăng nhập.
 */
const publicAxios = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT || 60000),
    headers: {
        'Content-Type': 'application/json',
    },
});

export default publicAxios;
