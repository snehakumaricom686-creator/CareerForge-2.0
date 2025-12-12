import api from './api';

const adminAPI = {
    // Get dashboard stats
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Get all users with pagination and search
    getUsers: async (page = 1, limit = 20, search = '') => {
        const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    },

    // Get single user details
    getUser: async (userId) => {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    },

    // Update user (make admin, change name, etc.)
    updateUser: async (userId, data) => {
        const response = await api.put(`/admin/users/${userId}`, data);
        return response.data;
    },

    // Delete user
    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    // Make current user admin (first-time setup)
    makeAdmin: async (secretKey) => {
        const response = await api.post('/admin/make-admin', { secretKey });
        return response.data;
    }
};

export default adminAPI;
