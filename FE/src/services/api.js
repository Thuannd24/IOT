import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // URL backend của bạn

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm token vào header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const studentAPI = {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    uploadImage: (id, formData) => api.post(`/students/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const attendanceAPI = {
    getAll: (params) => api.get('/attendance', { params }),
    getByDate: (date) => api.get(`/attendance/date/${date}`),
    mark: (data) => api.post('/attendance', data),
};

export const cameraAPI = {
    getStatus: () => api.get('/camera/status'),
    startRecognition: () => api.post('/camera/start'),
    stopRecognition: () => api.post('/camera/stop'),
};

export default api;