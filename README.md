# 🐾 PawShop — Pet Shop Mobile App

A fully-featured React Native (Expo) pet shop application built for the **FYN Mobile App Challenge**. Users can browse pets, upload new ones with real image capture, manage a shopping cart, and enjoy a smooth UI with dark mode, animations, and haptic feedback.

---

## 📱 Screenshots & Features

| Shop | Add Pet | Cart |
|------|---------|------|
| 2-column pet grid | Camera/Gallery picker | Add, remove, total |
| Featured pet of the day | Zod form validation | Checkout with toast |
| Random dog API | Image preview | Quantity tracking |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- OR an Android/iOS simulator


### 🔑 Environment Variables

Before running the application, create a .env file in the root directory of the project.

Step 1: Create .env

In the project root folder create a file named:

.env
Step 2: Add the following variables

```bash

DATABASE_URL=postgresql://postgres:nishanth@localhost:5432/pawshop
PORT=5000

```
Explanation

PORT → Port number where the Express backend server will run.

DATABASE_URL → PostgreSQL connection string used by the backend.

Make sure PostgreSQL is installed and running locally with a database named pawshop.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/pawshop.git

# 2. Install dependencies
npm install

# 3. Start the Expo dev server
npm run server:dev


# 5. Star app 
npx expo start --tunnel -c

```

### Running on Device

```
› Scan the QR code with Expo Go (Android)
› Scan the QR code with Camera app (iOS)
› Press 'a' to open Android emulator
› Press 'i' to open iOS simulator
› Press 'w' to open in browser
```

### Environment (Optional — Backend)

The app works fully without a backend. If you want to run the Express server:

```bash
# Terminal 1 — Backend (port 5000)
npm run server:dev

# Terminal 2 — Frontend
npm run expo:dev
```

---

## 🧱 Platform Details

| Platform | Status |
|----------|--------|
| Android | ✅ Fully supported |
| iOS | ✅ Fully supported (Liquid Glass tab bar on iOS 26+) |
| Web | ✅ Supported via Expo Web |

---

## 📦 Libraries Used

| Library | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0 | Core framework |
| `expo-router` | ~6.0 | File-based navigation |
| `zustand` | ^5.0 | Global state management |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persisting cart & pet data |
| `zod` | ^3.24 | Form validation schema |
| `@tanstack/react-query` | ^5.83 | Server state & API fetching |
| `expo-image-picker` | ~17.0 | Camera & gallery image upload |
| `expo-haptics` | ~15.0 | Haptic feedback |
| `expo-blur` | ~15.0 | Frosted glass tab bar on iOS |
| `expo-glass-effect` | ~0.1 | Liquid Glass tab bar detection |
| `@expo-google-fonts/inter` | ^0.4 | Inter font (400/500/600/700) |
| `@expo/vector-icons` | ^15.0 | Ionicons icon set |
| `react-native-safe-area-context` | ~5.6 | Safe area padding |
| `react-native-gesture-handler` | ~2.28 | Gesture support |
| `react-native-reanimated` | ~4.1 | Animations |
| `react-native-keyboard-controller` | ^1.20 | Keyboard-aware scrolling |
| `express` | ^5.0 | Backend server (optional) |
| `drizzle-orm` | ^0.39 | ORM schema (scaffolded) |
| `typescript` | ~5.9 | Type safety throughout |

---

## 🏗️ Architecture Overview

```
pawshop/
├── app/
│   ├── _layout.tsx              ← Root layout: fonts, providers, splash screen
│   └── (tabs)/
│       ├── _layout.tsx          ← Tab bar (Shop / Add Pet / Cart)
│       ├── index.tsx            ← Shop screen — pet grid + featured dog
│       ├── add.tsx              ← Add pet form — image upload + validation
│       └── cart.tsx             ← Cart — items, total, checkout
│
├── store/
│   ├── petStore.ts              ← Zustand store for pet listings (persisted)
│   └── cartStore.ts             ← Zustand store for cart (persisted)
│
├── context/
│   └── ToastContext.tsx         ← Animated toast notification system
│
├── components/
│   ├── ErrorBoundary.tsx        ← App-level React error boundary
│   └── ErrorFallback.tsx        ← Error UI with dev stack trace modal
│
├── constants/
│   └── colors.ts                ← Warm amber/cream palette (light + dark)
│
├── lib/
│   └── query-client.ts          ← React Query client configuration
│
└── server/
    ├── index.ts                 ← Express server (port 5000)
    └── routes.ts                ← API route registration
```

### State Flow

```
┌──────────────┐     addPet()      ┌─────────────┐
│  add.tsx     │ ─────────────────▶│  petStore   │──▶ AsyncStorage
│  (Add Form)  │                   │  (Zustand)  │
└──────────────┘                   └─────────────┘
                                          │
┌──────────────┐                          ▼
│  index.tsx   │◀──────── pets[] ─────── pets
│  (Shop Grid) │
│              │  addToCart()   ┌──────────────┐
│   PetCard    │ ──────────────▶│  cartStore   │──▶ AsyncStorage
└──────────────┘                │  (Zustand)   │
                                └──────────────┘
                                       │
┌──────────────┐                       ▼
│  cart.tsx    │◀────── items[], total()
│  (Cart)      │
└──────────────┘
```

---

## 🌐 APIs Used

### 1. `POST https://reqres.in/api/users`
**Purpose:** Mock API for pet form submission.  
**Why:** The assignment requires submitting form data to a real HTTP endpoint. `reqres.in` is a free public mock REST API that accepts any POST body and returns a valid response with an auto-generated `id`. This `id` is used to create the local pet record. In a production app, this would point to a real backend.

**Request body:**
```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 2,
  "price": 1200
}
```

**Response:**
```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "id": "740",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### 2. `GET https://dog.ceo/api/breeds/image/random`
**Purpose:** Fetches a random dog image URL.  
**Why:** Used in two places — the "Featured Pet of the Day" card on the shop screen (auto-fetched via React Query), and the "Random" image button on the Add Pet form. The Dog CEO API is a free, open, rate-limit-free public API with a large dataset of real dog breed photos, making it ideal for populating pet images realistically.

**Response:**
```json
{
  "message": "https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg",
  "status": "success"
}
```

---

## ✅ Assignment Requirements Checklist

### Core Requirements

| Requirement | Implemented | Details |
|-------------|-------------|---------|
| **Pet Image Upload** | ✅ | Camera + Gallery via `expo-image-picker` |
| **Image Preview** | ✅ | Full preview before submission in `add.tsx` |
| **Pet Name** (required) | ✅ | Zod validation with inline error |
| **Breed** (required) | ✅ | Zod validation with inline error |
| **Age** (required, 1–30) | ✅ | Zod + numeric range validation |
| **Price** (required, positive) | ✅ | Zod + positive number validation |
| **POST `reqres.in/api/users`** | ✅ | With loading, error, and success states |
| **GET `dog.ceo` random image** | ✅ | On shop screen + add form "Random" button |
| **Pet Listing Screen** | ✅ | 2-column card grid with image, name, breed, price |
| **Add to Cart button** | ✅ | On each pet card, turns green when added |
| **View Cart** | ✅ | Dedicated cart tab |
| **Remove from Cart** | ✅ | Trash button per item |
| **Display Total Price** | ✅ | Live total in cart footer |
| **Loading Indicators** | ✅ | Spinner on submit button + image fetch |
| **API Error Handling** | ✅ | Error toasts + caught exceptions |
| **Form Validation Errors** | ✅ | Inline field-level errors via Zod |
| **Global Cart State (Zustand)** | ✅ | `cartStore` persisted to AsyncStorage |

### Bonus Requirements

| Bonus | Implemented | Details |
|-------|-------------|---------|
| **TypeScript** | ✅ | Strict types throughout, `interface Pet`, `CartItem`, etc. |
| **Reusable Components** | ✅ | `FormField`, `PetCard`, `CartItemRow`, `FeaturedDog`, `ErrorBoundary` |
| **Toast Notifications** | ✅ | Animated slide-in toasts (success / error / info) |

### Extra (Beyond Requirements)

- ✅ **Dark Mode** — full dark/light theme with warm amber/cream palette
- ✅ **Haptic Feedback** — add to cart, form submit, cart clear
- ✅ **Persistent State** — cart and pet listings survive app restarts
- ✅ **Image Error Fallback** — paw icon shown when image fails to load
- ✅ **Adaptive Tab Bar** — Liquid Glass on iOS 26+, classic BlurView on older iOS, standard on Android/Web
- ✅ **Pre-seeded Pets** — 6 sample pets from real dog breed images on first launch
- ✅ **Quantity Tracking** — cart increments quantity for duplicate additions
- ✅ **Pull-to-Refresh** — on shop screen

---

## 🗂️ Key Design Decisions

**Why Zustand over Redux?**  
Zustand has minimal boilerplate, built-in `persist` middleware for AsyncStorage, and is the recommended lightweight option for React Native apps of this scale. No reducers, actions, or selectors needed.

**Why Zod over Yup?**  
Zod is TypeScript-first and produces inferred types directly from the schema (`z.infer<typeof petSchema>`), eliminating type duplication. It also integrates cleanly with the existing TypeScript codebase.

**Why React Query?**  
Used for the random dog image fetch on the shop screen — it handles caching, loading/error states, and manual `refetch()` for the refresh button in a single hook, without any boilerplate.

**Why `expo-router`?**  
File-based routing means navigation structure is visible at a glance in the folder tree. Tab navigation is configured in `app/(tabs)/_layout.tsx` — no separate navigator setup needed.

---
