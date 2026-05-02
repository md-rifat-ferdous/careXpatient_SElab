import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique cart item id
  testId: string;
  name: string;
  labName: string;
  price: number;
}

interface CartState {
  items: CartItem[];
  homeCollection: boolean;
  couponCode: string | null;
  discount: number; // calculated discount amount

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  toggleHomeCollection: () => void;
  clearCart: () => void;
  
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  getSubtotal: () => number;
  getHomeCollectionFee: () => number;
  getVat: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      homeCollection: false,
      couponCode: null,
      discount: 0,

      addItem: (item) => set((state) => {
        if (state.items.some(i => i.testId === item.testId)) return state;
        return { items: [...state.items, item] };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),

      toggleHomeCollection: () => set((state) => ({
        homeCollection: !state.homeCollection
      })),

      clearCart: () => set({ items: [], homeCollection: false, couponCode: null, discount: 0 }),

      applyCoupon: (code) => {
        const subtotal = get().getSubtotal();
        let discount = 0;
        let success = false;
        let message = "";

        if (code === 'CARE10') {
          discount = Math.round(subtotal * 0.1);
          success = true;
          message = "10% discount applied!";
        } else if (code === 'LAB50') {
          discount = 50;
          success = true;
          message = "৳50 discount applied!";
        } else {
          message = "Invalid or expired coupon";
        }

        if (success) {
          set({ couponCode: code, discount });
        }
        return { success, message };
      },

      removeCoupon: () => set({ couponCode: null, discount: 0 }),

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.price, 0);
      },

      getHomeCollectionFee: () => {
        const state = get();
        if (!state.homeCollection) return 0;
        const labs = new Set(state.items.map(i => i.labName));
        return labs.size * 150; // Using 150 BDT per lab
      },

      getVat: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        // VAT applied after discount as per usual practice
        return Math.round((subtotal - discount) * 0.05); 
      },

      getTotal: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const discount = state.discount;
        const fee = state.getHomeCollectionFee();
        const vat = state.getVat();
        return (subtotal - discount) + fee + vat;
      }
    }),
    {
      name: 'carex-cart-storage',
    }
  )
);
