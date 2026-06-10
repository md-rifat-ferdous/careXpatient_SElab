import { create } from 'zustand';
import { persist } from 'zustand/middleware';
































export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          document.cookie = `userId=${user.id}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'userId=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
        }
        set({ user: null, token: null, isAuthenticated: false });
      }
    }),
    { name: 'carex-auth' }
  )
);

export const useSignupStore = create((set) => ({
  step: 0,
  role: null,
  data: {},
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  setRole: (role) => set({ role, step: 1 }),
  updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
  reset: () => set({ step: 0, role: null, data: {} })
}));