# File Documentation: careXpatient

This document provides a summary of the purpose, theme, and features of each significant file in the careXpatient repository.

## Root Directory
| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `package.json` | Monorepo root configuration. | Defines workspaces (`apps/*`, `backend`, `packages/*`) and Turborepo scripts. |
| `turbo.json` | Turborepo task config. | Orchestrates builds, dev servers, linting, and type-checking across the monorepo. |
| `database.sql` | Raw PostgreSQL schema. | Reference DDL for users, doctors, appointments, labs, payments (16 tables). |
| `.env.example` | Environment template. | Template for team members to configure their local database and JWT secret. |
| `BRIEFING.md` | Project Onboarding. | Complete overview of architecture, setup instructions, tech stack, and roadmap. |
| `.gitignore` | Git exclusion rules. | Prevents committing `node_modules`, `.env` secrets, build artifacts, and AI metadata. |

---

## Backend: `backend/`
Express.js + TypeScript REST API server.

| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `package.json` | Backend dependencies. | Express, Prisma Client, JWT, bcryptjs, Zod, and TypeScript dev tooling. |
| `tsconfig.json` | TypeScript config. | Extends shared Node.js config with path aliases (`@/*` → `src/*`). |
| `src/server.ts` | Server entry point. | Initializes Express, CORS, JSON parsing, and health check endpoint on port 5000. |
| `src/utils/auth.ts` | JWT utilities. | `generateToken()` and `verifyToken()` functions for session management. |
| `src/middleware/auth.ts` | Auth middleware. | `authenticate` (JWT verification) and `authorize` (role-based access control). |

### Backend Directory Structure
```
backend/src/
├── config/         # Environment and app configuration (to be implemented)
├── controllers/    # Route handler logic (to be implemented)
├── middleware/
│   └── auth.ts     # ✅ JWT authentication & RBAC middleware
├── routes/         # Express route definitions (to be implemented)
├── services/       # Business logic layer (to be implemented)
├── types/          # TypeScript type definitions (to be implemented)
├── utils/
│   └── auth.ts     # ✅ JWT token generation & verification
└── server.ts       # ✅ Express server entry point
```

---

## Apps: `apps/landing-page`
Main patient-facing web application built with Next.js.

| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `src/app/page.tsx` | Main Landing Page. | Hero section, search bar, services, and doctor highlights. |
| `src/app/layout.tsx` | App Layout. | Root structure, font loading (Inter), and global providers. |
| `src/app/globals.css` | Global Styles. | Tailwind directives and base styles for the application. |
| `package.json` | App dependencies. | Next.js 16, React 19, and local `@carexpatient/ui` dependency. |

## Apps: `apps/web` *(Planned)*
Main web application for dashboards (Patient, Doctor, Admin). Structure created, implementation pending.

---

## Apps: `apps/mobile`
React Native application using Expo.

| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `App.tsx` (planned) | Main Entry Point. | Mobile navigation and root layout. |
| `package.json` | App dependencies. | Expo, React Native, TypeScript. |

---

## Packages: `packages/prisma`
Database ORM layer — single source of truth for database schema.

| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `schema.prisma` | Prisma schema. | 16 models with full relations, enums, indexes, and PostgreSQL type mappings. |
| `package.json` | Package config. | Prisma CLI scripts (`generate`, `validate`) and `@prisma/client` dependency. |

### Database Models (16 total)
| Model | Description |
| :--- | :--- |
| `User` | Base user with phone, email, role (Patient/Doctor/LabTech/Nurse/Admin). |
| `Patient` | Patient profile linked to User (DOB, blood group, allergies, medical history). |
| `Doctor` | Doctor profile (BMDC number, qualifications, fee, rating). |
| `Specialty` | Medical specialties (Cardiology, Dermatology, etc.). |
| `DoctorSpecialty` | Many-to-many: Doctor ↔ Specialty. |
| `Clinic` | Clinic/hospital locations. |
| `DoctorClinic` | Many-to-many: Doctor ↔ Clinic. |
| `Appointment` | Patient-Doctor appointments (date, time, type, status). |
| `Consultation` | Consultation notes and video room info (linked to Appointment). |
| `Prescription` | Digital prescriptions with medicines, advice, diagnosis, signed PDF. |
| `LabTest` | Lab test catalog (name, price, sample type). |
| `Lab` | Lab/diagnostic center information. |
| `LabOrder` | Patient lab orders with home collection support. |
| `LabOrderTest` | Many-to-many: LabOrder ↔ LabTest. |
| `LabResult` | Lab result reports (PDF upload, summary). |
| `Payment` | Payment records (bKash, Nagad, SSLCommerz). |

---

## Packages: `packages/ui`
Shared Design System and Component Library.

| File | Purpose | Feature/Theme |
| :--- | :--- | :--- |
| `src/components/Avatar.tsx` | User Profile Image. | Displays patient/doctor avatars with fallback support. |
| `src/components/Badge.tsx` | Status Indicators. | Used for "Verified", "Pending", or specialty labels. |
| `src/components/Button.tsx` | Primary Interaction. | Custom buttons with multiple variants (primary, ghost, icon). |
| `src/components/Card.tsx` | Content Wrapper. | Generic container for doctor profiles and service info. |
| `src/components/Checkbox.tsx` | Multi-select Input. | Accessible checkbox for forms and filters. |
| `src/components/Input.tsx` | Text Input. | Standardized text fields with label and error support. |
| `src/components/Layout.tsx` | Shared Layouts. | Wrappers for consistent page spacing and sections. |
| `src/components/Radio.tsx` | Single-select Input. | Radio buttons for mutually exclusive options. |
| `src/components/Select.tsx` | Dropdown Menu. | Custom select component for categories and locations. |
| `src/components/Toggle.tsx` | Switch Component. | Interactive toggle for preferences or status. |
| `src/components/Typography.tsx` | Text System. | Standardized Heading (h1-h4) and Body text styles. |
| `src/styles/globals.css` | Component Styles. | Base styles specifically for the UI library components. |

---

## Packages: Configuration
Standardized configs shared across all apps and packages.

| Path | File | Purpose |
| :--- | :--- | :--- |
| `packages/config-tailwind` | `tailwind.config.js` | Shared theme (colors, fonts, spacing) for the design system. |
| `packages/config-typescript` | `base.json` | Shared base TypeScript compiler options. |
| `packages/config-typescript` | `nextjs.json` | Specialized TS config for Next.js applications. |
| `packages/config-typescript` | `react-library.json` | Specialized TS config for React component libraries. |
| `packages/config-typescript` | `node.json` | Specialized TS config for Node.js/backend services. |
| `packages/eslint-config` | *(planned)* | Shared ESLint rules for consistent code style. |

---

## Documentation: `docs/`

| File | Purpose |
| :--- | :--- |
| `architecture.md` | High-level architecture documentation (to be expanded). |
| `database-schema.md` | Database schema documentation (to be expanded). |

---
**Note**: This documentation is intended for team members to quickly navigate the codebase and understand the architectural role of each file.
