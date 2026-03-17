import axios from 'axios';

// ✅ FINAL BACKEND URL (your Render link)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://amu-portal-2.onrender.com/api',
});

// ✅ Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;