/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */

export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URLS: {
    DEVELOPMENT: 'http://192.168.1.2:8000',
    PRODUCTION: 'https://api.scheduleapp.com',
    LOCALHOST: 'http://127.0.0.1:8000',
    LOCAL_IP: 'http://192.168.1.2:8000', // Your machine's local IP
  },

  // Current base URL based on environment
  get BASE_URL() {
    return __DEV__ 
      ? this.BASE_URLS.LOCAL_IP  // Use machine's IP for development
      : this.BASE_URLS.PRODUCTION;
  },

  // API endpoints
  ENDPOINTS: {
    WELCOME_SCREEN: '/api/v1/welcome-screen',
    PROFESSIONS: '/api/v1/professions',
    AUTH: {
      LOGIN: '/api/v1/auth/login',
      REGISTER: '/api/v1/auth/register',
      LOGOUT: '/api/v1/auth/logout',
      FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    },
    USER: {
      PROFILE: '/api/v1/user/profile',
      UPDATE: '/api/v1/user/update',
    },
  },

  // Storage URL for images and files
  get STORAGE_URL() {
    return `${this.BASE_URL}/storage`;
  },

  // Helper function to get full image URL
  getImageUrl: (imagePath: string): string => {
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Construct full URL from relative path
    return `${API_CONFIG.STORAGE_URL}/${imagePath}`;
  },

  // Helper function to get full API URL
  getApiUrl: (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  },
};

export default API_CONFIG;