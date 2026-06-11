import { Doctor, DoctorFilters, TimeSlot } from '../types/doctor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Existing Patient-facing Functions ────────────────────────────────────────

export async function getDoctors(filters: DoctorFilters = {}): Promise<Doctor[]> {
  const query = new URLSearchParams();
  if (filters.specialty && filters.specialty !== 'All Specialties') query.append('specialty', filters.specialty);
  if (filters?.experience) query.append('experience', filters.experience.toString());
  if (filters?.feeMax) query.append('feeMax', filters.feeMax.toString());
  if (filters?.gender && filters.gender !== 'Any') query.append('gender', filters.gender);
  if (filters?.ratingMin) query.append('ratingMin', filters.ratingMin.toString());
  if (filters?.district && filters.district !== 'All') query.append('district', filters.district);
  if (filters?.sortBy) query.append('sortBy', filters.sortBy);

  const response = await fetch(`${API_URL}/doctors?${query.toString()}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch doctors');
  return response.json();
}

export async function getSpecialties(): Promise<{ id: number; name: string }[]> {
  const response = await fetch(`${API_URL}/doctors/specialties`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch specialties');
  return response.json();
}

export interface SlotResponse {
  success: boolean;
  data: TimeSlot[];
}

export async function getDoctorSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
  const response = await fetch(`${API_URL}/doctors/${doctorId}/slots?date=${date}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch available slots');
  const json: SlotResponse = await response.json();
  return json.data;
}

export async function bookAppointment(data: {
  doctorId: string;
  patientId: string;
  type: string;
  date: string;
  timeSlot: string;
}): Promise<any> {
  const response = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to book appointment');
  }
  return response.json();
}

export interface PatientAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'Online' | 'In_person';
  status: AppointmentStatus;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  cancellationReason: string | null;
  agoraChannelName: string | null;
  consultationStartedAt: string | null;
  consultationEndedAt: string | null;
  consultationDuration: number | null;
  consultation: {
    id: string;
    startTime: string | null;
    endTime: string | null;
    notes: string | null;
    prescription: {
      id: string;
      diagnosis: string | null;
      medicinesText: string | null;
      adviceText: string | null;
    } | null;
  } | null;
  doctor: {
    user: { fullName: string; profilePhotoUrl: string | null };
    specialties: { specialty: { name: string } }[];
  };
}

export async function fetchPatientAppointments(userId: string): Promise<PatientAppointment[]> {
  const response = await fetch(`${API_URL}/appointments/patient/${userId}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch appointments');
  const json = await response.json();
  return json.data as PatientAppointment[];
}

// ─── Doctor Portal Types ───────────────────────────────────────────────────────

export type AppointmentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Rescheduled' | 'Confirmed' | 'Waiting_for_call' | 'In_consultation' | 'Completed' | 'Cancelled' | 'NoShow';
export type AppointmentType = 'In_person' | 'Online';

export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAvatarUrl: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  reasonForVisit: string | null;
  cancellationReason: string | null;
  clinicName: string | null;
}

export interface DoctorStats {
  pending: number;
  confirmed: number;
  inConsultation: number;
  completed: number;
  cancelled: number;
}

// ─── Doctor Portal Service Functions ──────────────────────────────────────────

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

/**
 * Fetches all appointments for the logged-in doctor, optionally filtered by status.
 */
export const fetchDoctorAppointments = async (
  userId: string,
  token: string,
  status?: AppointmentStatus
): Promise<DoctorAppointment[]> => {
  const url = new URL(`${API_URL}/doctors/${userId}/appointments`);
  if (status) url.searchParams.set('status', status);

  const res = await fetch(url.toString(), { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch appointments.');

  const json = await res.json();
  return json.data as DoctorAppointment[];
};

/**
 * Fetches appointment status counts for the doctor's dashboard stats.
 */
export const fetchDoctorStats = async (
  userId: string,
  token: string
): Promise<DoctorStats> => {
  const res = await fetch(`${API_URL}/doctors/${userId}/stats`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch stats.');

  const json = await res.json();
  return json.data as DoctorStats;
};

/**
 * Accepts a pending appointment — transitions status to Confirmed.
 */
export const acceptAppointment = async (
  appointmentId: string,
  token: string
): Promise<void> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/accept`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message ?? 'Failed to accept appointment.');
  }
};

/**
 * Declines an appointment with a mandatory reason — transitions status to Rejected.
 */
export const declineAppointment = async (
  appointmentId: string,
  reason: string,
  cancelledByUserId: string,
  token: string
): Promise<void> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/decline`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason, cancelledByUserId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message ?? 'Failed to decline appointment.');
  }
};

/**
 * Completes a confirmed appointment — transitions status to Completed.
 */
export const completeAppointment = async (
  appointmentId: string,
  token: string
): Promise<void> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/complete`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message ?? 'Failed to complete appointment.');
  }
};

/**
 * Starts a consultation for an approved/confirmed appointment.
 */
export const startConsultation = async (
  appointmentId: string,
  token: string
): Promise<void> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/start-consultation`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message ?? 'Failed to start consultation.');
  }
};

/**
 * Creates a prescription for an appointment's consultation.
 */
export const createPrescription = async (
  appointmentId: string,
  data: { diagnosis?: string; medicinesText?: string; adviceText?: string; notes?: string },
  token: string
): Promise<void> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/prescription`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message ?? 'Failed to create prescription.');
  }
};

/**
 * Patient cancels their own appointment.
 */
export const cancelAppointment = async (
  appointmentId: string,
  patientUserId: string,
  reason?: string,
  token?: string
): Promise<void> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/cancel`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ patientUserId, reason }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message ?? 'Failed to cancel appointment.');
  }
};

// ─── My Patients Types ─────────────────────────────────────────────────────────

export interface DoctorPatient {
  patientId: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
  bloodGroup: string | null;
  lastVisit: string;
  totalAppointments: number;
}

export interface PatientAppointmentEntry {
  id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  reasonForVisit: string | null;
  cancellationReason: string | null;
  clinicName: string | null;
}

export interface DoctorPatientDetail {
  patientId: string;
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  bloodGroup: string | null;
  address: string | null;
  dateOfBirth: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  appointments: PatientAppointmentEntry[];
  totalAppointments: number;
  lastVisit: string | null;
}

// ─── My Patients Service Functions ────────────────────────────────────────────

/**
 * Fetches all patients who have had at least one appointment with this doctor.
 * Optionally filters by a search query (name or phone).
 */
export const fetchDoctorPatients = async (
  userId: string,
  token: string,
  search?: string
): Promise<DoctorPatient[]> => {
  const url = new URL(`${API_URL}/doctors/${userId}/patients`);
  if (search && search.trim()) url.searchParams.set('search', search.trim());

  const res = await fetch(url.toString(), { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch patients.');

  const json = await res.json();
  return json.data as DoctorPatient[];
};

/**
 * Fetches patient profile info + shared appointment history for a specific patient.
 */
export const fetchPatientDetail = async (
  userId: string,
  patientId: string,
  token: string
): Promise<DoctorPatientDetail> => {
  const res = await fetch(`${API_URL}/doctors/${userId}/patients/${patientId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch patient details.');

  const json = await res.json();
  return json.data as DoctorPatientDetail;
};
