const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LabPatient {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string | null;
  profilePhotoUrl: string | null;
  bloodGroup: string | null;
  dateOfBirth: string | null;
  address: string | null;
  ordersCount: number;
  lastOrderDate: string | null;
  lastOrderTests: string | null;
}

export interface LabPatientsResponse {
  data: LabPatient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientOrderResult {
  id: string;
  resultSummary: string | null;
  fileUrl: string | null;
  uploadedAt: string;
  uploadedBy: string | null;
}

export interface PatientOrderTest {
  id: string;
  name: string;
  category: string;
}

export interface PatientOrder {
  id: string;
  status: string;
  createdAt: string;
  tests: PatientOrderTest[];
  labResults: PatientOrderResult[];
  hasReport: boolean;
}

export interface PatientHistoryResponse {
  patient: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    profilePhotoUrl: string | null;
    bloodGroup: string | null;
    dateOfBirth: string | null;
    address: string | null;
  };
  orders: PatientOrder[];
}

export interface PendingUploadOrder {
  id: string;
  status: string;
  createdAt: string;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    profilePhotoUrl: string | null;
  };
  tests: { name: string; category: string }[];
  hasReport: boolean;
}

export interface PendingUploadsResponse {
  data: PendingUploadOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface UploadReportPayload {
  labOrderId: string;
  summary: string;
  findings: string;
  impression: string;
  recommendations: string;
  file?: File | null;
}

export interface UploadReportResponse {
  success: boolean;
  message: string;
  labResultId: string;
  hasFile: boolean;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function getLabPatients(
  token: string,
  page = 1,
  search = '',
  limit = 10,
): Promise<LabPatientsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
  });
  return get<LabPatientsResponse>(`/api/lab/patients?${params}`, token);
}

export async function getPatientHistory(
  token: string,
  patientId: string,
): Promise<PatientHistoryResponse> {
  return get<PatientHistoryResponse>(`/api/lab/patients/${patientId}/history`, token);
}

export async function getPendingUploads(
  token: string,
  page = 1,
  limit = 20,
): Promise<PendingUploadsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return get<PendingUploadsResponse>(`/api/lab/pending-uploads?${params}`, token);
}

export async function uploadReport(
  token: string,
  payload: UploadReportPayload,
): Promise<UploadReportResponse> {
  const formData = new FormData();
  formData.append('labOrderId',       payload.labOrderId);
  formData.append('summary',          payload.summary);
  formData.append('findings',         payload.findings);
  formData.append('impression',       payload.impression);
  formData.append('recommendations',  payload.recommendations);
  if (payload.file) {
    formData.append('file', payload.file);
  }

  const res = await fetch(`${BASE_URL}/api/lab/upload-report`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Upload failed');
  return data as UploadReportResponse;
}
