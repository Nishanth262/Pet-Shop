import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  breed: string;
  age: number;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (pet: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (pet) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === pet.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === pet.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...pet, quantity: 1 }] };
        }),
      removeFromCart: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'pawshop-cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
