import { Doctor, DoctorFilters } from '../types/doctor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch doctors');
  }
  return response.json();
}

export async function getSpecialties(): Promise<{ id: number; name: string }[]> {
  const response = await fetch(`${API_URL}/doctors/specialties`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch specialties');
  }
  return response.json();
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to book appointment');
  }

  return response.json();
}
