import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
}));

interface SignupData {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  dob?: string;
  bloodGroup?: string;
  nid?: string;
  allergies?: string;
  chronicConditions?: string;
  bmdcNumber?: string;
  specialty?: string;
  experience?: string;
  fee?: string;
  labName?: string;
  address?: string;
  licenseNo?: string;
}

interface SignupState {
  role: 'Patient' | 'Doctor' | 'Lab' | null;
  data: SignupData;
  setRole: (role: 'Patient' | 'Doctor' | 'Lab') => void;
  updateData: (newData: SignupData) => void;
  reset: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  role: null,
  data: {},
  setRole: (role) => set({ role }),
  updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
  reset: () => set({ role: null, data: {} }),
}));
