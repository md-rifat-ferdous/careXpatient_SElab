import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Automatic recovery: clear stale auth state and redirect
      console.warn('[API] Unauthorized access detected. Clearing session.');
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Mock authApi to satisfy the LoginForm OTP flow and prevent build errors
export const authApi = {
  sendOtp: async (phone: string) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },
  verifyOtp: async (phone: string, otp: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456') resolve({ success: true, token: 'mock-token' });
        else reject(new Error('Invalid OTP'));
      }, 1000);
    });
  },
  login: async (data: any) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },
  // Real signup implementation – sends payload (including password) to backend
  signup: async (payload: any) => {
    // Use the generic fetchApi wrapper to POST to /auth/register
    const response = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  },
};
