import axios from 'axios';

// Use relative API path for same-origin deployment, fallback to env var for development
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (_refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    googleAuth: (data) => api.post('/auth/google', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/password', data),
    uploadProfilePicture: (formData) => api.post('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteAccount: () => api.delete('/users/account'),
};

// Resume API
export const resumeAPI = {
    getAll: () => api.get('/resumes'),
    getOne: (id) => api.get(`/resumes/${id}`),
    create: (data) => api.post('/resumes', data),
    update: (id, data) => api.put(`/resumes/${id}`, data),
    delete: (id) => api.delete(`/resumes/${id}`),
    upload: (formData) => api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    downloadPDF: (id) => api.get(`/resumes/${id}/pdf`, { responseType: 'blob' }),
    downloadDOCX: (id) => api.get(`/resumes/${id}/docx`, { responseType: 'blob' }),
    updateTemplate: (id, template) => api.put(`/resumes/${id}/template`, { template }),
    generateShareLink: (id) => api.post(`/resumes/${id}/share`),
    getShared: (token) => api.get(`/resumes/shared/${token}`),
};

// Share API
export const shareAPI = {
    getLinks: (resumeId) => api.get(`/share/${resumeId}/links`),
    disableSharing: (resumeId) => api.delete(`/share/${resumeId}`),
};

export default api;
