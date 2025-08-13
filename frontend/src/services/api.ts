import axios from "axios";

// Build and sanitize backend base URL to avoid accidental trailing dots/slashes
function sanitizeBaseURL(url: string): string {
  if (!url) return url;
  // Remove any trailing spaces
  let cleaned = url.trim();
  // Remove any accidental trailing dot before path usage (e.g., .../api.)
  cleaned = cleaned.replace(/[.]+$/g, "");
  // Collapse multiple slashes
  cleaned = cleaned.replace(/([^:])\/+/g, (m, p1) => p1 + "/");
  // Ensure no trailing slash
  cleaned = cleaned.replace(/\/$/, "");
  return cleaned;
}

// Production API configuration
// Use environment variable if available, otherwise fallback to production URL
const rawBase = import.meta.env.VITE_API_BASE_URL || "https://digisol-backend.onrender.com/api";

const baseURL = sanitizeBaseURL(rawBase);

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
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors - only redirect on actual auth failures
    if (error.response?.status === 401) {
      // Check if this is an authentication endpoint failure
      const isAuthEndpoint = error.config?.url?.includes('/accounts/') || 
                           error.config?.url?.includes('/token/') ||
                           error.config?.url?.includes('/login/') ||
                           error.config?.url?.includes('/register/');
      
      // Check if this is an AI service endpoint (don't redirect for these)
      const isAIServiceEndpoint = error.config?.url?.includes('/ai-services/');
      
      // Only redirect to login if it's an authentication-related endpoint
      // or if the error message indicates authentication failure
      const errorMessage = error.response?.data?.detail || '';
      const isAuthError = errorMessage.includes('authentication') || 
                         errorMessage.includes('credentials') ||
                         errorMessage.includes('token') ||
                         errorMessage.includes('login');
      
      if ((isAuthEndpoint || isAuthError) && !isAIServiceEndpoint) {
        // Clear tokens and redirect to login only if not on homepage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Only redirect if we're not already on the homepage or login page
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/signup') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 