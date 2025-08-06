import axios from "axios";

// Use direct backend URL for now
const baseURL = import.meta.env.VITE_BACKEND_URL || "https://digisol-backend.onrender.com/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authentication interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors - only redirect on actual auth failures
    if (error.response?.status === 401) {
      // Check if this is an authentication endpoint failure
      const isAuthEndpoint = error.config?.url?.includes('/accounts/') || 
                           error.config?.url?.includes('/token/') ||
                           error.config?.url?.includes('/login/') ||
                           error.config?.url?.includes('/register/');
      
      // Only redirect to login if it's an authentication-related endpoint
      // or if the error message indicates authentication failure
      const errorMessage = error.response?.data?.detail || '';
      const isAuthError = errorMessage.includes('authentication') || 
                         errorMessage.includes('credentials') ||
                         errorMessage.includes('token') ||
                         errorMessage.includes('login');
      
      if (isAuthEndpoint || isAuthError) {
        console.log('Authentication error detected, redirecting to login');
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      } else {
        console.log('401 error on non-auth endpoint, not redirecting:', error.config?.url);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 