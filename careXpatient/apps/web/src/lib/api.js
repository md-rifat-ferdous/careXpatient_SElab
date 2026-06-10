const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request(
method,
path,
body,
token)
{
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const isFormData = body instanceof FormData;
  if (!isFormData && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.errors?.[0]?.message || 'Something went wrong');
  }
  return data;
}

export const api = {
  post: (path, body, token) =>
  request('POST', path, body, token),
  postForm: (path, body, token) =>
  request('POST', path, body, token),
  get: (path, token) =>
  request('GET', path, undefined, token)
};

// ===== Auth API =====
















































export const authApi = {
  signup: (payload) =>
  api.post('/api/auth/signup', payload),

  login: (payload) =>
  api.post('/api/auth/login', payload),

  sendOtp: (phone) =>
  api.post('/api/auth/send-otp', { phone }),

  verifyOtp: (phone, otp) =>
  api.post('/api/auth/verify-otp', { phone, otp })
};