import axios from 'axios';

// Detect environment and set base URL accordingly
const getBaseURL = () => {
  // In production, use the environment variable or default to the backend URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-backend.vercel.app';
  }
  // In development, use localhost
  return 'http://localhost:5000';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and user info
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add current user information for backend validation
    if (userData) {
      try {
        const user = JSON.parse(userData);
        config.headers['x-user-username'] = user.username;
        config.headers['x-user-id'] = user.id;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;