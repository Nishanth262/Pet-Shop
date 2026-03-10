# PawShop — Pet Shop Mobile App

A production-ready mobile pet shop application built with **React Native (Expo)**, featuring a full-featured pet listing, image upload, form validation, cart management, and external API integrations. Built as a technical assessment demonstrating React Native fundamentals, state management, API handling, and clean architecture.

---

## Table of Contents

- [Overview](#overview)
- [Screenshots & Features](#features)
- [Architecture](#architecture)
- [Tech Stack & Libraries](#tech-stack--libraries)
- [Project Structure](#project-structure)
- [Environment Variables (.env)](#environment-variables-env)
- [Getting Started](#getting-started)
- [API Integrations](#api-integrations)
- [State Management](#state-management)
- [Form Validation](#form-validation)
- [Backend Server](#backend-server)
- [Platform Support](#platform-support)

---

## Overview

PawShop is a cross-platform mobile application (iOS, Android, and Web) that allows users to:

- Browse a listing of available pets in a beautiful card grid
- Fetch a random pet-of-the-day image from the Dog CEO API
- Upload a pet listing via form (camera, gallery, or random dog image)
- Validate all form inputs using Zod schema validation
- Submit pet data to a REST mock API (reqres.in)
- Manage a persistent shopping cart with Zustand global state
- Receive animated toast notifications for all key actions

---

## Features

| Feature | Description |
|---|---|
| Pet Listing Screen | 2-column card grid with image, name, breed, age badge, price |
| Featured Pet Section | Random dog image from `dog.ceo` API with refresh button |
| Add Pet Form | Image picker (camera/gallery/random) + Zod-validated form |
| API Submission | POST to `reqres.in/api/users` with loading, success, error states |
| Cart Screen | Add/remove items, quantity tracking, total price, checkout |
| Global Cart State | Zustand store persisted to AsyncStorage (survives app restarts) |
| Toast Notifications | Animated slide-in/slide-out toasts (success / error / info) |
| Dark Mode | Full dark mode support using `useColorScheme` |
| Native Tab Bar | Liquid glass tab bar on iOS 26+, BlurView fallback on older iOS |
| Haptic Feedback | Native haptic feedback on key interactions (iOS/Android) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT                            │
│                   (Expo React Native App)                        │
│                      Port: 8081                                  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  Shop    │  │ Add Pet  │  │  Cart    │  ← Expo Router Tabs   │
│  │ (index)  │  │  (add)   │  │  (cart)  │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │   Zustand Stores    │  │   React Query        │              │
│  │  cartStore.ts       │  │  (external APIs)     │              │
│  │  petStore.ts        │  └─────────────────────┘              │
│  └─────────────────────┘                                        │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │  AsyncStorage       │  ← Persistent local state              │
│  │  (cart + pets)      │                                        │
│  └─────────────────────┘                                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
   ┌──────────────────┐  ┌───────────┐  ┌──────────────────┐
   │  Express Backend │  │ reqres.in │  │   dog.ceo API    │
   │  (Port 5000)     │  │ Mock API  │  │  Random Images   │
   │  TypeScript      │  └───────────┘  └──────────────────┘
   └──────────────────┘
```

### Data Flow

1. **Pet Store** — Pre-seeded with 6 sample pets. New pets added via form are prepended to the list. Persisted to AsyncStorage via Zustand middleware.
2. **Cart Store** — Items are added from the pet listing. Quantity increments if pet already in cart. Persisted to AsyncStorage.
3. **External APIs** — `dog.ceo` is queried via React Query (cache = 0, always fresh). `reqres.in` receives POST via native `fetch` on form submit.
4. **Toast System** — Global context provider wrapping the root layout. Components call `useToast().showToast()` — no prop drilling.

---

## Tech Stack & Libraries

### Frontend (React Native / Expo)

| Library | Version | Purpose |
|---|---|---|
| `expo` | ~54.0.27 | Core Expo SDK |
| `expo-router` | ~6.0.17 | File-based navigation (like Next.js for mobile) |
| `react-native` | 0.81.5 | Core React Native framework |
| `zustand` | ^5.0.11 | Global state management (cart, pets) |
| `@tanstack/react-query` | ^5.83.0 | Server state caching and fetching |
| `zod` | ^3.24.2 | Schema-based form validation |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistent local storage |
| `expo-image-picker` | ~17.0.9 | Camera and gallery image selection |
| `expo-haptics` | ~15.0.8 | Native haptic feedback |
| `expo-blur` | ~15.0.8 | BlurView for iOS tab bar background |
| `expo-glass-effect` | ~0.1.4 | Liquid glass tab bar detection (iOS 26+) |
| `expo-linear-gradient` | ~15.0.8 | Gradient backgrounds |
| `react-native-reanimated` | ~4.1.1 | High-performance animations |
| `react-native-gesture-handler` | ~2.28.0 | Native gesture handling |
| `react-native-safe-area-context` | ~5.6.0 | Safe area insets (notch, Dynamic Island) |
| `react-native-keyboard-controller` | ^1.20.6 | Cross-platform keyboard handling |
| `@expo/vector-icons` | ^15.0.3 | Icon library (Ionicons, MaterialIcons, etc.) |
| `@expo-google-fonts/inter` | ^0.4.0 | Inter font family |

### Backend (Express.js)

| Library | Version | Purpose |
|---|---|---|
| `express` | ^5.0.1 | HTTP server framework |
| `tsx` | ^4.20.6 | TypeScript execution for Node.js |
| `drizzle-orm` | ^0.39.3 | Type-safe ORM (PostgreSQL ready) |
| `drizzle-zod` | ^0.7.0 | Zod schema generation from Drizzle models |
| `pg` | ^8.16.3 | PostgreSQL client |
| `typescript` | ~5.9.2 | Static typing |

### Why These Libraries?

- **Zustand over Redux** — Minimal boilerplate, no provider needed, works perfectly with Zustand's `persist` middleware + AsyncStorage for zero-config persistence.
- **Zod over Yup** — Better TypeScript inference, faster validation, schema reuse between frontend/backend.
- **React Query** — Handles caching, background refetch, and loading/error states for external APIs without manual `useState` management.
- **Expo Router** — File-based routing mirrors Next.js patterns, making the codebase intuitive for web developers.

---

## Project Structure

```
pawshop/
├── app/                          # Expo Router screens (each file = a route)
│   ├── _layout.tsx               # Root layout: providers, fonts, splash screen
│   └── (tabs)/
│       ├── _layout.tsx           # Tab bar configuration (NativeTabs + Classic fallback)
│       ├── index.tsx             # Shop screen — pet listing + featured dog
│       ├── add.tsx               # Add pet form — image picker + validation + API submit
│       └── cart.tsx              # Cart screen — items, total, checkout
│
├── store/
│   ├── cartStore.ts              # Zustand cart store (add/remove/clear, AsyncStorage persist)
│   └── petStore.ts               # Zustand pet store (listing, pre-seeded, AsyncStorage persist)
│
├── context/
│   └── ToastContext.tsx          # Global toast notification system
│
├── components/
│   ├── ErrorBoundary.tsx         # React class error boundary
│   ├── ErrorFallback.tsx         # Error fallback UI with reload
│   └── KeyboardAwareScrollViewCompat.tsx  # Cross-platform keyboard scroll
│
├── constants/
│   └── colors.ts                 # Design system — warm amber palette (light + dark)
│
├── lib/
│   └── query-client.ts           # React Query client + apiRequest helper + getApiUrl()
│
├── server/
│   ├── index.ts                  # Express app setup (CORS, body parsing, static files)
│   ├── routes.ts                 # API route registration (prefix all routes with /api)
│   ├── storage.ts                # Data access layer
│   └── templates/
│       └── landing-page.html     # Landing page served on root URL
│
├── shared/
│   └── schema.ts                 # Drizzle ORM table definitions + Zod types (shared FE/BE)
│
├── assets/images/                # App icon, splash screen, adaptive Android icons
├── app.json                      # Expo app configuration
├── package.json                  # Dependencies and npm scripts
├── tsconfig.json                 # TypeScript configuration
└── drizzle.config.ts             # Drizzle ORM + PostgreSQL connection config
```

---

## Environment Variables (.env)

This project runs on the **Replit platform**, which injects environment variables automatically. When running locally (outside Replit), you need to provide these manually.

### How Environment Variables Work in This Stack

The stack has **two separate processes**:

1. **Express Backend** (Node.js, port 5000) — uses standard `process.env`
2. **Expo Frontend** (React Native, port 8081) — only sees variables prefixed with `EXPO_PUBLIC_`

> **Security Rule**: Variables prefixed `EXPO_PUBLIC_` are bundled into the client app and visible to end users. Never put secrets (API keys, passwords) in `EXPO_PUBLIC_` variables.

---

### Required Environment Variables

#### `EXPO_PUBLIC_DOMAIN`

| Property | Value |
|---|---|
| **Used in** | `lib/query-client.ts` |
| **Process** | Expo frontend (client-side) |
| **Purpose** | Base URL of the Express backend API |
| **Example** | `your-replit-dev-domain.replit.dev:5000` |
| **Format** | `hostname:port` (no `https://`, the code prepends it) |

**Why it exists:** The Expo app needs to know where to send API requests. In Replit, the backend domain changes per session, so it's injected dynamically. The `getApiUrl()` function in `lib/query-client.ts` reads this and constructs the full HTTPS URL.

**How it's set in development (Replit):**
The `npm run expo:dev` script automatically sets it:
```bash
EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN:5000 npx expo start --localhost
```

**How to set it locally:**
```bash
# .env.local (for local development outside Replit)
EXPO_PUBLIC_DOMAIN=localhost:5000
```

---

#### `PORT`

| Property | Value |
|---|---|
| **Used in** | `server/index.ts` |
| **Process** | Express backend |
| **Purpose** | Port the Express server listens on |
| **Default** | `5000` |
| **Example** | `5000` |

**Why it exists:** Allows the platform (Replit, Docker, etc.) to assign a custom port. Falls back to 5000 if not set.

```bash
PORT=5000
```

---

#### `SESSION_SECRET`

| Property | Value |
|---|---|
| **Used in** | Express session middleware (when session is configured) |
| **Process** | Express backend |
| **Purpose** | Secret key for signing session cookies |
| **Required** | Yes (for auth-enabled backends) |
| **Format** | A long, random string (min 32 characters recommended) |

**Why it exists:** Session cookies are signed with this secret to prevent tampering. If not set, sessions can be forged, creating a security vulnerability.

**How to generate a strong secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

```bash
SESSION_SECRET=your_very_long_random_secret_key_at_least_32_chars
```

---

#### `DATABASE_URL`

| Property | Value |
|---|---|
| **Used in** | `drizzle.config.ts`, `server/storage.ts` |
| **Process** | Express backend only |
| **Purpose** | PostgreSQL connection string |
| **Required** | Only if using the database features |
| **Format** | PostgreSQL connection URI |

**Why it exists:** Drizzle ORM uses this to connect to the PostgreSQL database. The current app uses AsyncStorage for client-side persistence, but the backend is ready for database integration.

**Format breakdown:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Examples:**
```bash
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/pawshop

# Neon (serverless PostgreSQL — recommended for Replit)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/pawshopdb?sslmode=require

# Supabase
DATABASE_URL=postgresql://postgres:password@db.xxxxxxxxxxxx.supabase.co:5432/postgres

# Replit PostgreSQL (auto-set when you add a Replit DB integration)
DATABASE_URL=postgresql://user:pass@replit-pg-host:5432/dbname
```

---

#### Replit-Injected Variables (Auto-set by Replit — do not set manually)

These are automatically provided when running on Replit. You don't configure them — but understanding them helps debug CORS and routing issues.

| Variable | Purpose |
|---|---|
| `REPLIT_DEV_DOMAIN` | The public dev hostname for this Repl (e.g., `abc123.user.replit.dev`) |
| `REPLIT_DOMAINS` | Comma-separated list of all domains allowed for this Repl |
| `REPLIT_INTERNAL_APP_DOMAIN` | Internal hostname used for build scripts |

**How they're used in the backend (`server/index.ts`):**
```typescript
// CORS whitelist — only these origins can make API requests
if (process.env.REPLIT_DEV_DOMAIN) {
  origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}
if (process.env.REPLIT_DOMAINS) {
  process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
    origins.add(`https://${d.trim()}`);
  });
}
```

---

### Full `.env` File Template

Create a `.env` file in the project root for **local development** (outside Replit):

```env
# ============================================================
# PawShop — Environment Variables
# ============================================================
# Copy this file to .env and fill in your values.
# NEVER commit .env to version control.
# ============================================================


# ------------------------------------------------------------
# EXPO FRONTEND (visible to client — no secrets here!)
# ------------------------------------------------------------

# Backend API base domain (hostname:port, no https://)
# Local development:
EXPO_PUBLIC_DOMAIN=localhost:5000

# If running backend on a different machine or ngrok tunnel:
# EXPO_PUBLIC_DOMAIN=abc123.ngrok.io


# ------------------------------------------------------------
# EXPRESS BACKEND (server-side only — safe for secrets)
# ------------------------------------------------------------

# Server port (default: 5000)
PORT=5000

# Node environment
NODE_ENV=development

# Session signing secret — generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=replace_this_with_a_long_random_string_minimum_32_characters

# PostgreSQL connection string (required only if using DB features)
# Format: postgresql://user:password@host:port/dbname
DATABASE_URL=postgresql://postgres:password@localhost:5432/pawshop
```

> **Note:** For **Replit deployment**, set secrets via the Replit Secrets panel (padlock icon in the sidebar). They are injected as environment variables at runtime — you do not need a `.env` file on Replit.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or bun
- Expo Go app on your physical device (iOS or Android) — [Install from App Store / Play Store](https://expo.dev/go)
- (Optional) PostgreSQL database if using backend DB features

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pawshop.git
cd pawshop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your values (see Environment Variables section above)
```

### 4. Start the Backend Server

```bash
npm run server:dev
# Express server starts on http://localhost:5000
```

### 5. Start the Expo Frontend

```bash
npm run expo:dev
# Metro bundler starts on http://localhost:8081
# Scan the QR code with Expo Go on your device
```

### 6. (Optional) Set Up the Database

If you want to use the PostgreSQL backend:

```bash
# Set DATABASE_URL in your .env first, then run:
npm run db:push
# This creates/updates the database schema using Drizzle
```

### Running on Specific Platforms

```bash
# Web browser
npx expo start --web

# Android emulator (requires Android Studio)
npx expo start --android

# iOS simulator (requires Xcode on macOS)
npx expo start --ios
```

---

## API Integrations

### 1. Dog CEO API — Random Pet Image

**Endpoint:** `GET https://dog.ceo/api/breeds/image/random`

**Used in:**
- `app/(tabs)/index.tsx` — Featured Pet section (using React Query)
- `app/(tabs)/add.tsx` — "Random" button in Add Pet form

**Response Format:**
```json
{
  "message": "https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg",
  "status": "success"
}
```

**Implementation:**
```typescript
// React Query (index.tsx — featured pet)
const { data: dogUrl, refetch } = useQuery({
  queryKey: ['randomDog'],
  queryFn: async () => {
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await res.json();
    return data.message as string;
  },
  staleTime: 0, // always fetch fresh image
});

// Direct fetch (add.tsx — form image button)
const res = await fetch('https://dog.ceo/api/breeds/image/random');
const data = await res.json();
if (data.status === 'success') setImage(data.message);
```

**No API key required.** This is a public, free API.

---

### 2. ReqRes Mock API — Pet Submission

**Endpoint:** `POST https://reqres.in/api/users`

**Used in:** `app/(tabs)/add.tsx` — form submission

**Request Body:**
```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 2,
  "price": 1200
}
```

**Response (201 Created):**
```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 2,
  "price": 1200,
  "id": "407",
  "createdAt": "2026-03-10T12:34:56.789Z"
}
```

**Implementation:**
```typescript
const response = await fetch('https://reqres.in/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, breed, age, price }),
});
const data = await response.json();
// data.id is used as the pet's unique ID
```

**No API key required.** ReqRes is a public mock API. Note: it has a rate limit — handle 429 responses gracefully.

---

### 3. Internal Express Backend

**Base URL:** Configured via `EXPO_PUBLIC_DOMAIN` environment variable

**Accessed via:** `apiRequest()` from `lib/query-client.ts`

```typescript
// lib/query-client.ts
export function getApiUrl(): string {
  const host = process.env.EXPO_PUBLIC_DOMAIN;
  return new URL(`https://${host}`).href;
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown,
): Promise<Response> {
  const url = new URL(route, getApiUrl());
  return fetch(url.toString(), {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // sends session cookies
  });
}
```

---

## State Management

All global state uses **Zustand** with the `persist` middleware for AsyncStorage-based persistence.

### Cart Store (`store/cartStore.ts`)

```typescript
interface CartItem {
  id: string;
  name: string;
  breed: string;
  age: number;
  price: number;
  image: string;
  quantity: number;
}

// Usage anywhere in the app (no Provider needed):
const addToCart = useCartStore((s) => s.addToCart);
const items = useCartStore((s) => s.items);
const total = useCartStore((s) => s.getTotal());
const count = useCartStore((s) => s.getCount());
const removeFromCart = useCartStore((s) => s.removeFromCart);
const clearCart = useCartStore((s) => s.clearCart);
```

**Persistence:** Cart is saved to AsyncStorage under the key `pawshop-cart`. It survives app restarts and background kills.

### Pet Store (`store/petStore.ts`)

```typescript
// Pre-seeded with 6 sample pets on first install
const pets = usePetStore((s) => s.pets);
const addPet = usePetStore((s) => s.addPet);
```

**Persistence:** Pet list saved under `pawshop-pets`. New pets added via form are prepended to the list.

### Toast Context (`context/ToastContext.tsx`)

```typescript
// Usage in any component:
const { showToast } = useToast();

showToast('Pet added successfully!', 'success');
showToast('Something went wrong', 'error');
showToast('Item removed from cart', 'info');
```

Toast types: `'success'` (green) | `'error'` (red) | `'info'` (blue)

---

## Form Validation

The Add Pet form uses **Zod** for schema-based validation.

### Schema Definition

```typescript
const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z
    .string()
    .min(1, 'Age is required')
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0 && Number(v) <= 30,
      'Age must be between 1 and 30',
    ),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      'Price must be a positive number',
    ),
});
```

### Validation Flow

```typescript
const validate = (): boolean => {
  const result = petSchema.safeParse(form);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof PetFormData, string>> = {};
    result.error.errors.forEach((err) => {
      const field = err.path[0] as keyof PetFormData;
      if (!fieldErrors[field]) fieldErrors[field] = err.message;
    });
    setErrors(fieldErrors);
    return false;
  }
  setErrors({});
  return true;
};
```

Errors appear inline below each field. Image selection is separately validated — the form won't submit without a photo.

---

## Backend Server

The Express backend (`server/`) is a TypeScript server using `tsx` for execution. While the current mobile app primarily uses client-side state, the backend is production-ready for extension.

### Key Files

| File | Purpose |
|---|---|
| `server/index.ts` | App setup: CORS, body parsing, request logging, static file serving |
| `server/routes.ts` | Route registration — add all `/api/*` routes here |
| `server/storage.ts` | Data access layer — abstracts database operations |
| `shared/schema.ts` | Drizzle table schemas shared between frontend and backend |

### CORS Configuration

The server uses a dynamic CORS whitelist. It automatically allows:

- `https://${REPLIT_DEV_DOMAIN}` — Replit dev domain
- `https://${REPLIT_DOMAINS}` — All Replit production domains
- `http://localhost:*` — Any localhost port (for local dev)

To add your own domain, add it to `REPLIT_DOMAINS` or extend the CORS logic in `server/index.ts`.

### Adding New API Routes

```typescript
// server/routes.ts
export async function registerRoutes(app: Express): Promise<Server> {
  // Example: Pet listing endpoint
  app.get('/api/pets', async (req, res) => {
    const pets = await storage.getPets();
    res.json(pets);
  });

  // Example: Submit pet
  app.post('/api/pets', async (req, res) => {
    const pet = await storage.createPet(req.body);
    res.status(201).json(pet);
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

### Database Setup (Drizzle ORM)

```bash
# 1. Set DATABASE_URL in your .env
# 2. Push schema to database:
npm run db:push

# 3. (Optional) Run migrations:
npx drizzle-kit generate
npx drizzle-kit migrate
```

The `shared/schema.ts` file defines Drizzle table models that can be extended for pets, users, orders, etc.

---

## Platform Support

| Platform | Status | Notes |
|---|---|---|
| iOS (Expo Go) | Full support | Liquid glass tab bar on iOS 26+, haptics, camera |
| Android (Expo Go) | Full support | Material 3 tab bar, haptics, camera |
| Web | Full support | Solid background tab bar, no haptics, web-safe insets |

### Platform-Specific Notes

- **Camera / Image Picker** — Requires permission on iOS and Android. Web uses file picker fallback.
- **Haptic Feedback** — iOS and Android only. Wrapped in `Platform.OS !== 'web'` guards.
- **Safe Area Insets** — Handled via `useSafeAreaInsets()`. Web uses fixed top (67px) and bottom (34px) insets.
- **Tab Bar** — iOS 26+: Liquid glass via `NativeTabs`. Older iOS: `BlurView`. Android: Solid material. Web: Solid with border.

---

## Scripts Reference

```bash
# Development
npm run server:dev        # Start Express backend (port 5000) with hot reload
npm run expo:dev          # Start Expo dev server (port 8081) + Metro bundler

# Production Build
npm run server:build      # Bundle Express server to server_dist/
npm run server:prod       # Run production server
npm run expo:static:build # Build Expo web static files

# Database
npm run db:push           # Push Drizzle schema to PostgreSQL

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix          # Auto-fix lint issues
```

---

## Security Checklist for Backend Engineers

- **Never expose secrets in `EXPO_PUBLIC_*` variables** — they're bundled into the client app
- **`SESSION_SECRET` must be a long random string** — min 32 characters, ideally 64+
- **`DATABASE_URL` contains credentials** — never commit to version control
- **CORS is strict** — only whitelisted Replit domains and localhost are allowed
- **`.env` is gitignored** — never commit it; use Replit Secrets or a secrets manager in production
- **`NODE_ENV=production`** disables dev-mode warnings and enables performance optimizations
- **Rate limiting** — consider adding `express-rate-limit` before production deployment
- **Input validation** — all user inputs should be validated server-side with Zod even if validated client-side

---

## License

MIT — see [LICENSE](LICENSE) for details.
