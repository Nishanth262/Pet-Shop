# PawShop — Pet Shop Mobile App

## Overview
A fully-featured React Native (Expo) pet shop app built with Expo Router, Zustand state management, and Zod form validation.

## Architecture

### Tech Stack
- **Framework**: Expo (SDK 54) with Expo Router for file-based navigation
- **State Management**: Zustand with AsyncStorage persistence (cart + pet listings)
- **Form Validation**: Zod for schema-based validation
- **Networking**: React Query (@tanstack/react-query) + expo/fetch
- **UI**: React Native with Inter font, @expo/vector-icons, expo-haptics
- **Image Upload**: expo-image-picker (camera + gallery)

### Project Structure
```
app/
  _layout.tsx          — Root layout (providers, fonts, splash screen)
  (tabs)/
    _layout.tsx        — 3-tab layout: Shop, Add Pet, Cart (NativeTabs with liquid glass)
    index.tsx          — Shop/listing screen (2-column pet grid + random dog feature)
    add.tsx            — Add pet form with image picker + Zod validation
    cart.tsx           — Shopping cart with total + checkout

store/
  cartStore.ts         — Zustand cart store (add, remove, clear, persist)
  petStore.ts          — Zustand pet store (listing, pre-seeded with 6 samples, persist)

context/
  ToastContext.tsx     — Animated toast notification system

components/
  ErrorBoundary.tsx    — Error boundary
  ErrorFallback.tsx    — Error fallback UI
  KeyboardAwareScrollViewCompat.tsx — Cross-platform keyboard scroll

constants/
  colors.ts            — Warm amber/cream color palette (light + dark mode)

server/
  index.ts             — Express server (port 5000)
  routes.ts            — API routes
```

## APIs Used
- **POST https://reqres.in/api/users** — Mock API for pet form submission
- **GET https://dog.ceo/api/breeds/image/random** — Random dog image fetcher

## Features
1. **Pet Listing** — 2-column card grid with pet images, names, breeds, prices
2. **Featured Pet** — Random dog image pulled from dog.ceo API with refresh
3. **Add Pet Form** — Camera/gallery picker, random dog image, Zod validation, API submission
4. **Cart** — Add/remove items, quantity tracking, total price, checkout
5. **Global Cart State** — Zustand + AsyncStorage, badge count on tab icon
6. **Toast Notifications** — Animated overlay for success/error/info states
7. **Dark Mode** — Full dark mode support

## Workflows
- **Start Backend**: `npm run server:dev` (Express server on port 5000)
- **Start Frontend**: `npm run expo:dev` (Expo dev server on port 8081)
