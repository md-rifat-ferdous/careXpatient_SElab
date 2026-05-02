const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request<T>(
  method: string,
  path: string,
  body?: FormData | Record<string, any>,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const isFormData = body instanceof FormData;
  if (!isFormData && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.errors?.[0]?.message || 'Something went wrong');
  }
  return data;
}

export const api = {
  post: <T>(path: string, body?: Record<string, any>, token?: string) =>
    request<T>('POST', path, body, token),
  postForm: <T>(path: string, body: FormData, token?: string) =>
    request<T>('POST', path, body, token),
  get: <T>(path: string, token?: string) =>
    request<T>('GET', path, undefined, token),
};

// ===== Auth API =====
export interface SignupPayload {
  phone: string;
  email?: string;
  password: string;
  fullName: string;
  role: 'Patient' | 'Doctor' | 'Lab';
  nidNumber?: string;
  profilePhotoUrl?: string;
  // Patient
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  allergies?: string;
  medicalHistory?: string;
  // Doctor
  bmdcNumber?: string;
  qualification?: string;
  experienceYears?: number;
  fee?: number;
  about?: string;
  // Lab
  labName?: string;
  labAddress?: string;
  labPhone?: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      phone: string;
      email?: string;
      fullName?: string;
      role: 'Patient' | 'Doctor' | 'Lab';
      profilePhotoUrl?: string;
    };
    token: string;
  };
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    api.post<AuthResponse>('/api/auth/signup', payload),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/api/auth/login', payload),

  sendOtp: (phone: string) =>
    api.post('/api/auth/send-otp', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    api.post('/api/auth/verify-otp', { phone, otp }),
};
