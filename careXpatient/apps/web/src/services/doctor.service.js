

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Existing Patient-facing Functions ────────────────────────────────────────

export async function getDoctors(filters = {}) {
  const query = new URLSearchParams();
  if (filters.specialty && filters.specialty !== 'All Specialties') query.append('specialty', filters.specialty);
  if (filters?.experience) query.append('experience', filters.experience.toString());
  if (filters?.feeMax) query.append('feeMax', filters.feeMax.toString());
  if (filters?.gender && filters.gender !== 'Any') query.append('gender', filters.gender);
  if (filters?.ratingMin) query.append('ratingMin', filters.ratingMin.toString());
  if (filters?.district && filters.district !== 'All') query.append('district', filters.district);
  if (filters?.sortBy) query.append('sortBy', filters.sortBy);

  const response = await fetch(`${API_URL}/doctors?${query.toString()}`, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Failed to fetch doctors');
  return response.json();
}

export async function getSpecialties() {
  const response = await fetch(`${API_URL}/doctors/specialties`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch specialties');
  return response.json();
}

export async function bookAppointment(data)





{
  const response = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to book appointment');
  }
  return response.json();
}

// ─── Doctor Portal Types ───────────────────────────────────────────────────────


























// ─── Doctor Portal Service Functions ──────────────────────────────────────────

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

/**
 * Fetches all appointments for the logged-in doctor, optionally filtered by status.
 */
export const fetchDoctorAppointments = async (
userId,
token,
status) =>
{
  const url = new URL(`${API_URL}/doctors/${userId}/appointments`);
  if (status) url.searchParams.set('status', status);

  const res = await fetch(url.toString(), { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch appointments.');

  const json = await res.json();
  return json.data;
};

/**
 * Fetches appointment status counts for the doctor's dashboard stats.
 */
export const fetchDoctorStats = async (
userId,
token) =>
{
  const res = await fetch(`${API_URL}/doctors/${userId}/stats`, {
    headers: authHeaders(token)
  });
  if (!res.ok) throw new Error('Failed to fetch stats.');

  const json = await res.json();
  return json.data;
};

/**
 * Accepts a pending appointment — transitions status to Confirmed.
 */
export const acceptAppointment = async (
appointmentId,
token) =>
{
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/accept`, {
    method: 'POST',
    headers: authHeaders(token)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Failed to accept appointment.');
  }
};

/**
 * Declines an appointment with a mandatory reason — transitions status to Cancelled.
 */
export const declineAppointment = async (
appointmentId,
reason,
cancelledByUserId,
token) =>
{
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/decline`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason, cancelledByUserId })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Failed to decline appointment.');
  }
};

// ─── My Patients Types ─────────────────────────────────────────────────────────







































// ─── My Patients Service Functions ────────────────────────────────────────────

/**
 * Fetches all patients who have had at least one appointment with this doctor.
 * Optionally filters by a search query (name or phone).
 */
export const fetchDoctorPatients = async (
userId,
token,
search) =>
{
  const url = new URL(`${API_URL}/doctors/${userId}/patients`);
  if (search && search.trim()) url.searchParams.set('search', search.trim());

  const res = await fetch(url.toString(), { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch patients.');

  const json = await res.json();
  return json.data;
};

/**
 * Fetches patient profile info + shared appointment history for a specific patient.
 */
export const fetchPatientDetail = async (
userId,
patientId,
token) =>
{
  const res = await fetch(`${API_URL}/doctors/${userId}/patients/${patientId}`, {
    headers: authHeaders(token)
  });
  if (!res.ok) throw new Error('Failed to fetch patient details.');

  const json = await res.json();
  return json.data;
};