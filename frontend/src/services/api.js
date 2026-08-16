import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smarttransit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If expired token on protected endpoint, clear local storage
      const isAuthRequest = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('smarttransit_token');
        localStorage.removeItem('smarttransit_user');
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints Services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const busService = {
  getAll: (params) => api.get('/buses', { params }),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  updateStatus: (id, status) => api.put(`/buses/${id}/status`, { status }),
  delete: (id) => api.delete(`/buses/${id}`),
};

export const routeService = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
};

export const incidentService = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  report: (data) => api.post('/incidents', data),
  updateStatus: (id, status) => api.put(`/incidents/${id}/status`, { status }),
  assignStaff: (id, staff_id, notes) => api.post(`/incidents/${id}/assign-staff`, { staff_id, notes }),
  assignReplacement: (id, replacement_bus_id) => api.post(`/incidents/${id}/replace-bus`, { replacement_bus_id }),
};

export const trackingService = {
  updateLocation: (data) => api.post('/bus-locations', data),
  getBusLocation: (busId) => api.get(`/bus-locations/${busId}`),
  getLiveFleetLocations: () => api.get('/bus-locations/live'),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  broadcast: (data) => api.post('/notifications/broadcast', data),
};

export const analyticsService = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
};

export const mlService = {
  classifyComplaint: (text) => api.post('/ml/classify-complaint', { text }),
  predictDelay: (features) => api.post('/ml/predict-delay', features),
};

export default api;
