import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
