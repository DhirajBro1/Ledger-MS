# Ledger-MS

Ledger-MS is an offline-first customer ledger app built with Expo (React Native) and an Express + MongoDB backend.

## What this repository contains

- **Mobile app** (`/`) using Expo Router and React Native
- **Backend API** (`/backend`) using Express, Mongoose, JWT auth

## Features

- User registration and login
- Customer management
- Per-customer ledger entries (credit/debit)
- Running due balance calculation
- Local-first storage with AsyncStorage
- Background sync to cloud backend when authenticated
- Light/Dark/System theme support

## Tech stack

### Frontend
- Expo + React Native
- Expo Router
- TypeScript
- AsyncStorage

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas (or compatible MongoDB instance)

## Setup

### 1) Install frontend dependencies

```bash
cd /home/runner/work/Ledger-MS/Ledger-MS/DhirajBro1/Ledger-MS
npm install
```

### 2) Install backend dependencies

```bash
cd /home/runner/work/Ledger-MS/Ledger-MS/DhirajBro1/Ledger-MS/backend
npm install
```

### 3) Configure backend environment

Set these env vars before starting backend:

- `MONGODB_URI` (MongoDB connection string)
- `JWT_SECRET` (long random secret)
- `PORT` (optional, defaults to `5000`)

### 4) Run backend

```bash
cd /home/runner/work/Ledger-MS/Ledger-MS/DhirajBro1/Ledger-MS/backend
npm start
```

Backend health endpoints:
- `GET /health`
- `GET /api/health`

### 5) Configure frontend API URL

Set `EXPO_PUBLIC_API_URL` to your backend URL when running Expo.

Example:

```bash
cd /home/runner/work/Ledger-MS/Ledger-MS/DhirajBro1/Ledger-MS
EXPO_PUBLIC_API_URL=http://localhost:5000 npx expo start
```

### 6) Run frontend

```bash
cd /home/runner/work/Ledger-MS/Ledger-MS/DhirajBro1/Ledger-MS
npm run start
```

Other app scripts:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Backend API summary

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Customers (requires Authorization bearer token)
- `POST /api/customers` (create/update by `clientId`)
- `GET /api/customers`
- `DELETE /api/customers/:clientId`

## Deploying backend on Render

This repository includes `/render.yaml` for Render Blueprint deploy.

Render service config in this repo:
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Required environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`

After deployment, set app `EXPO_PUBLIC_API_URL` to the Render backend URL.

## Notes

- The app stores customer data locally first, then syncs with backend when authenticated.
- If `EXPO_PUBLIC_API_URL` is not set, some screens use local fallback URLs intended for development only.
