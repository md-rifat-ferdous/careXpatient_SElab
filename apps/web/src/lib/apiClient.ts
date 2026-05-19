import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Handle Unauthorized
      console.error('Unauthorized access - redirecting to login');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // window.location.href = '/login';
      }
    }

    if (status === 403) {
      console.error('Forbidden access');
    }

    if (status >= 500) {
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);
