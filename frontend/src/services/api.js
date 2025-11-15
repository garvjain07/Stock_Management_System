import axios from 'axios'
import Cookies from 'js-cookie'

// Detect environment and set base URL
const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://backend-1ngqh4l8s-garv-jains-projects-23e7fcf5.vercel.app';
  }
  return 'http://localhost:5000';
};

// Create axios instance
const api = axios.create({
  baseURL: `${getBaseURL()}/api`,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token')
      Cookies.remove('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api