import axios from 'axios';

// Base URL for the API - adjust based on your environment (e.g. 10.0.2.2 for Android emulator)
const BASE_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  signup: async (data: any) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  sendOtp: async (phone: string) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },
  verifyOtp: async (phone: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    return response.data;
  },
};

export const appointmentApi = {
  getPatientAppointments: async (userId: string, token: string) => {
    const response = await api.get(`/appointments/patient/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  getDoctorAppointments: async (userId: string, token: string, status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get(`/doctors/${userId}/appointments`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export const consultationApi = {
  startConsultation: async (appointmentId: string, token: string) => {
    const response = await api.post(`/consultations/${appointmentId}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  joinConsultation: async (appointmentId: string, token: string) => {
    const response = await api.post(`/consultations/${appointmentId}/join`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  endConsultation: async (appointmentId: string, token: string) => {
    const response = await api.post(`/consultations/${appointmentId}/end`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  sendChatMessage: async (appointmentId: string, message: string, token: string) => {
    const response = await api.post(`/consultations/${appointmentId}/chat`, { message }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  getChatHistory: async (appointmentId: string, token: string) => {
    const response = await api.get(`/consultations/${appointmentId}/chat`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  uploadFile: async (appointmentId: string, file: any, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/consultations/${appointmentId}/upload`, formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getFiles: async (appointmentId: string, token: string) => {
    const response = await api.get(`/consultations/${appointmentId}/files`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default api;
