// Time Slot interface for UI
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// Doctor interface matching the Backend response
export interface Doctor {
  id: string;
  experienceYears: number;
  fee: string;
  rating: string;
  reviewCount: number;
  qualification: string;
  about: string;
  user: {
    fullName: string;
    profilePhotoUrl: string;
    gender?: 'Male' | 'Female';
    district?: string;
  };
  specialties: {
    specialty: {
      id: number;
      name: string;
    };
  }[];
  clinics?: {
    shift?: string;
    clinic: {
      id: number;
      name: string;
      address?: string;
    };
  }[];
}

export interface DoctorFilters {
  specialty?: string;
  experience?: number;
  feeMax?: number;
  gender?: string;
  ratingMin?: number;
  district?: string;
  sortBy?: 'recommended' | 'rating' | 'fee_asc' | 'experience';
}
