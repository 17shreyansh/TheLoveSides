import axios from 'axios';

// Vite env variables start with VITE_
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies (refresh tokens) if cross-origin
});

// Removed localStorage request interceptor as backend uses cookies

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response.data, // Strip axios envelope, return the response JSON
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., refresh token expired)
        // Dispatch event to clear user state
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
