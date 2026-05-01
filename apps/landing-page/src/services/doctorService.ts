import { Doctor, DoctorFilters } from '../types/doctor';
import { doctors } from '../data/doctors';

// ─────────────────────────────────────────────────────────────────────────────
// getDoctors
// Filters + sorts the local data. Signature is identical to what a real API
// call will look like, so swapping the body with fetch('/api/doctors') later
// requires zero changes in the UI layer.
// ─────────────────────────────────────────────────────────────────────────────
export async function getDoctors(filters: DoctorFilters = {}): Promise<Doctor[]> {
  // Simulate slight network latency so loading states work correctly in dev
  await new Promise((r) => setTimeout(r, 300));

  let result = [...doctors];

  // --- search ---
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)
    );
  }

  // --- specialty ---
  if (filters.specialty && filters.specialty !== 'All Specialties') {
    result = result.filter((d) => d.specialty === filters.specialty);
  }

  // --- district ---
  if (filters.district && filters.district !== 'All Districts') {
    result = result.filter((d) => d.district === filters.district);
  }

  // --- available today ---
  if (filters.availableToday) {
    result = result.filter((d) => d.availableToday);
  }

  // --- fee range ---
  if (filters.feeMin !== undefined) {
    result = result.filter((d) => d.fee >= filters.feeMin!);
  }
  if (filters.feeMax !== undefined) {
    result = result.filter((d) => d.fee <= filters.feeMax!);
  }

  // --- experience ---
  if (filters.experienceMin !== undefined && filters.experienceMin > 0) {
    result = result.filter((d) => d.experience >= filters.experienceMin!);
  }

  // --- rating ---
  if (filters.ratingMin !== undefined && filters.ratingMin > 0) {
    result = result.filter((d) => d.rating >= filters.ratingMin!);
  }

  // --- gender ---
  if (filters.gender && filters.gender !== 'Any') {
    result = result.filter((d) => d.gender === filters.gender);
  }

  // --- specialty checkboxes (from FilterDrawer) ---
  if (filters.specialties && filters.specialties.length > 0) {
    result = result.filter((d) => filters.specialties!.includes(d.specialty));
  }

  // --- sort ---
  switch (filters.sortBy) {
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'fee_asc':
      result.sort((a, b) => a.fee - b.fee);
      break;
    case 'experience':
      result.sort((a, b) => b.experience - a.experience);
      break;
    default:
      break; // 'recommended' — keep default order
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// getDoctorById
// ─────────────────────────────────────────────────────────────────────────────
export async function getDoctorById(id: string): Promise<Doctor | null> {
  await new Promise((r) => setTimeout(r, 150));
  return doctors.find((d) => d.id === id) ?? null;
}
