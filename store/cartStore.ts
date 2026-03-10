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
total: number;
count: number;
addToCart: (pet: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void; // +1 or -1
  clearCart: () => void;
}

function computeDerived(items: CartItem[]) {
  return {
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    count: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      count: 0,

      addToCart: (pet) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === pet.id);
          const newItems = existing
            ? state.items.map((i) =>
                i.id === pet.id ? { ...i, quantity: i.quantity + 1 } : i,
)
: [...state.items, { ...pet, quantity: 1 }];
return { items: newItems, ...computeDerived(newItems) };
        }),

      // Increase (+1) or decrease (-1) quantity.
      // If quantity reaches 0, the item is removed automatically.
      updateQuantity: (id, delta) =>
        set((state) => {
          const newItems = state.items
            .map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + delta } : i,
)
.filter((i) => i.quantity > 0); // auto-remove when qty hits 0
          return { items: newItems, ...computeDerived(newItems) };
        }),

      removeFromCart: (id) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          return { items: newItems, ...computeDerived(newItems) };
        }),

      clearCart: () => set({ items: [], total: 0, count: 0 }),
    }),
    {
      name: 'pawshop-cart',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const derived = computeDerived(state.items);
          state.total = derived.total;
          state.count = derived.count;
        }
      },
    },
  ),
);