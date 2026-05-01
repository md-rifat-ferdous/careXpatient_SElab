// ─── Time Slot ───────────────────────────────────────────────────────────────
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// ─── Doctor ───────────────────────────────────────────────────────────────────
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  fee: number;
  rating: number;
  reviewCount: number;
  gender: 'Male' | 'Female' | 'Other';
  photo: string;
  qualification: string;
  about: string;
  location: string;
  district: string;
  availableToday: boolean;
  availability: Record<string, TimeSlot[]>;
}

// ─── Doctor Filter Params (matches query params for real API later) ───────────
export interface DoctorFilters {
  search?: string;
  specialty?: string;
  district?: string;
  availableToday?: boolean;
  feeMin?: number;
  feeMax?: number;
  experienceMin?: number;
  ratingMin?: number;
  gender?: string;
  specialties?: string[];
  sortBy?: 'recommended' | 'rating' | 'fee_asc' | 'experience';
}
