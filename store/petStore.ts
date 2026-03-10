import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  price: number;
  image: string;
}

const SAMPLE_PETS: Pet[] = [
  {
    id: 'sample-1',
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 2,
    price: 1200,
    image: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg',
  },
  {
    id: 'sample-2',
    name: 'Luna',
    breed: 'Siberian Husky',
    age: 1,
    price: 1500,
    image: 'https://images.dog.ceo/breeds/husky/n02110185_10047.jpg',
  },
  {
    id: 'sample-3',
    name: 'Max',
    breed: 'Beagle',
    age: 3,
    price: 800,
    image: 'https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg',
  },
  {
    id: 'sample-4',
    name: 'Bella',
    breed: 'Standard Poodle',
    age: 1,
    price: 1800,
    image: 'https://images.dog.ceo/breeds/poodle-standard/n02113799_2280.jpg',
  },
  {
    id: 'sample-5',
    name: 'Charlie',
    breed: 'Labrador Retriever',
    age: 2,
    price: 1100,
    image: 'https://images.dog.ceo/breeds/labrador/n02099712_4323.jpg',
  },
  {
    id: 'sample-6',
    name: 'Zara',
    breed: 'Afghan Hound',
    age: 4,
    price: 2200,
    image: 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg',
  },
];

interface PetStore {
  pets: Pet[];
  addPet: (pet: Pet) => void;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set) => ({
      pets: SAMPLE_PETS,
      addPet: (pet) =>
        set((state) => ({ pets: [pet, ...state.pets] })),
    }),
    {
      name: 'pawshop-pets',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted: unknown, current: PetStore): PetStore => {
        const stored = persisted as Partial<PetStore>;
        return {
          ...current,
          pets:
            stored?.pets && stored.pets.length > 0
              ? stored.pets
              : SAMPLE_PETS,
        };
      },
    },
  ),
);
