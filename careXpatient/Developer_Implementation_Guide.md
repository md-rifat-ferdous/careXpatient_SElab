# Developer Implementation Guide: careXpatient

> **Version**: 2.0 — Updated May 2025  
> **Status**: Active — reflects current monorepo structure

---

## 1. Tech Stack Overview

| Layer | Technology | Status |
| :--- | :--- | :---: |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 | ✅ Active |
| **Backend** | Express.js 4, TypeScript 5 | ✅ Active |
| **Database** | PostgreSQL 15+ (via Prisma ORM 6) | ✅ Active |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | ✅ Foundation built |
| **Validation** | Zod | ✅ Installed |
| **Build System** | Turborepo 2.x (npm workspaces) | ✅ Active |
| **Design System** | Shared `@carexpatient/ui` React component library | ✅ Active |

---

## 2. Project Architecture

```
careXpatient/
├── apps/
│   ├── landing-page/           # Next.js – Patient-facing landing page
│   │   ├── src/app/
│   │   │   ├── page.tsx        # Main landing page
│   │   │   ├── layout.tsx      # Root layout (fonts, metadata)
│   │   │   └── globals.css     # Global styles
│   │   └── package.json
│   ├── web/                    # Next.js – Dashboards (planned)
│   │   └── src/
│   └── mobile/                 # React Native (Expo) – Mobile app
│       └── package.json
├── backend/                    # Express.js + TypeScript API
│   ├── src/
│   │   ├── config/             # App configuration
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/
│   │   │   └── auth.ts         # ✅ JWT auth + RBAC middleware
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic
│   │   ├── types/              # TypeScript types
│   │   ├── utils/
│   │   │   └── auth.ts         # ✅ JWT token utilities
│   │   └── server.ts           # ✅ Express entry point
│   ├── tsconfig.json
│   └── package.json
├── packages/
│   ├── prisma/                 # Database schema & client
│   │   ├── schema.prisma       # ✅ 16 models, all relations
│   │   └── package.json
│   ├── ui/                     # Shared component library
│   │   └── src/components/     # ✅ 11 reusable components
│   ├── config-tailwind/        # Shared Tailwind config
│   ├── config-typescript/      # Shared TS configs (base, nextjs, node, react-library)
│   └── eslint-config/          # Shared ESLint rules
├── docs/                       # Architecture documentation
├── .env.example                # Environment variable template
├── database.sql                # Raw SQL schema (reference)
├── turbo.json                  # Turborepo task configuration
└── package.json                # Root workspace config
```

---

## 3. Database Schema

The database is managed via **Prisma ORM**. The schema is defined in `packages/prisma/schema.prisma`.

### Models (16 total)

| Model | Description | Key Fields |
| :--- | :--- | :--- |
| `User` | Base account | phone (unique), email, role, isVerified |
| `Patient` | Patient profile | userId → User, DOB, bloodGroup, allergies, medicalHistory |
| `Doctor` | Doctor profile | userId → User, bmdcNumber (unique), qualification, fee, rating |
| `Specialty` | Medical specialties | name (unique) |
| `DoctorSpecialty` | Doctor ↔ Specialty (M:N) | doctorId, specialtyId |
| `Clinic` | Hospital/clinic info | name, address, phone |
| `DoctorClinic` | Doctor ↔ Clinic (M:N) | doctorId, clinicId |
| `Appointment` | Patient-doctor booking | patientId, doctorId, type, status, date, timeSlot |
| `Consultation` | Consultation session | appointmentId, notes, videoRoomId |
| `Prescription` | Digital prescription | consultationId, medicinesText, diagnosis, fileUrl |
| `LabTest` | Test catalog | name, price, sampleType |
| `Lab` | Diagnostic centers | name, address, phone |
| `LabOrder` | Patient lab orders | patientId, labId, status, homeCollection |
| `LabOrderTest` | LabOrder ↔ LabTest (M:N) | labOrderId, labTestId |
| `LabResult` | Test result uploads | labOrderId, resultSummary, fileUrl |
| `Payment` | Payment records | orderType, orderId, amount, gateway, status |

### Enums

| Enum | Values |
| :--- | :--- |
| `UserRole` | Patient, Doctor, LabTech, Nurse, Admin |
| `AppointmentType` | In-person, Online |
| `AppointmentStatus` | Pending, Confirmed, Completed, Cancelled, NoShow |
| `PaymentGateway` | bKash, Nagad, SSLCommerz |
| `OrderType` | Appointment, LabOrder |
| `LabOrderStatus` | Requested, AcceptedByLab, SampleCollected, Processing, Reported, Cancelled |
| `PaymentStatus` | Pending, Paid, Failed, Refunded |

---

## 4. Key Implementation Workflows

### A. User Onboarding

1. **Phone Verification:** User enters phone → Server sends OTP → Verified.
2. **Identity Verification:** Parse user's name and age from NID or document.
3. **Role Assignment:** User selects "Patient" or "Doctor."
4. **Profile Creation:** System creates corresponding Patient or Doctor record linked to the User.

### B. Doctor Search & Appointment Loop

1. **Search:** Query doctors by specialty, location, availability, and ratings.
2. **Slot Booking:**
   - System checks `Appointment` table for existing bookings.
   - Prevents double-booking using a database transaction.
3. **Payment Integration:**
   - App calls `/create-payment` endpoint.
   - Redirects to SSLCommerz/bKash/Nagad.
   - Webhook updates appointment status to Confirmed/Paid.

### C. Lab Test Workflow

1. **Browse & Select:** Patient selects tests from `LabTest` catalog.
2. **Place Order:** Creates a `LabOrder` with optional home collection details.
3. **Track Status:** Order moves through: Requested → AcceptedByLab → SampleCollected → Processing → Reported.
4. **View Results:** `LabResult` with PDF report accessible to patient.

### D. Secure Medical Vault

1. **Upload:** Doctor/Lab Admin uploads a PDF.
2. **Encryption:** Server encrypts the file using AES-256.
3. **Storage:** Store in AWS S3 or Google Cloud Storage.
4. **Access:** Only the `patient_id` and associated `doctor_id` can generate a signed (temporary) URL to view the file.

---

## 5. Authentication & Authorization

### Current Implementation

**JWT Utilities** (`backend/src/utils/auth.ts`):
- `generateToken(payload)` — Creates a JWT with userId and role, expires in 7 days.
- `verifyToken(token)` — Validates and decodes a JWT.

**Auth Middleware** (`backend/src/middleware/auth.ts`):
- `authenticate` — Extracts and verifies the Bearer token from the Authorization header.
- `authorize(roles[])` — Checks if the authenticated user's role is in the allowed list.

### Usage Example
```typescript
import { authenticate, authorize } from './middleware/auth';

// Protect a route — any authenticated user
app.get('/api/profile', authenticate, getProfile);

// Protect a route — doctors only
app.post('/api/prescriptions', authenticate, authorize(['Doctor']), createPrescription);

// Protect a route — admins only
app.get('/api/admin/users', authenticate, authorize(['Admin']), listUsers);
```

---

## 6. Available Scripts

Run from the **root directory**:

| Script | Command | Description |
| :--- | :--- | :--- |
| Landing Page | `npm run dev:landing` | Starts on http://localhost:3000 |
| Web App | `npm run dev:web` | Starts the main app (when ready) |
| Mobile App | `npm run start` (in `apps/mobile`) | Starts Expo development server |
| Backend API | `npm run dev:backend` | Starts on http://localhost:5000 |
| Build All | `npm run build` | Production builds for all workspaces |
| Lint | `npm run lint` | Lints all workspaces |
| Type Check | `npm run type-check` | TypeScript checking across all workspaces |
| Prisma Generate | `npm run prisma:generate` | Generates the Prisma client |

---

## 7. Environment Variables

Copy `.env.example` to `.env` in the root and in `packages/prisma/`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/carexpatient?schema=public"
JWT_SECRET="your_secret_key_here"
PORT=5000
```

> **Important**: Never commit `.env` files. They are excluded via `.gitignore`.

---

## 8. Performance & SEO

- **Server-Side Rendering (SSR):** Doctor profile pages should be server-rendered in Next.js.
  - URL Structure: `carexpatient.com/doctor/[specialty]/[name]-[id]`
- **Asset Optimization:** Use Next/Image for optimized image loading.
- **Mixed-Language Support:** Plan for i18next to manage English and Bengali strings.

---

## 9. Security & Compliance

- **Data Privacy:** No medical data should be accessible via a public URL. All file access must be gated by JWT authentication.
- **Audit Logs:** Every time a medical record is viewed, log the timestamp, user_id, and file_id.
- **Encryption:** All sensitive data (prescriptions, medical records) must be encrypted at rest.
- **RBAC:** Role-based access control is enforced at the middleware level.

---

## 10. Code Organization & Loose Coupling (Workflow Guide)

To maintain a clean, scalable, and loosely coupled architecture, all team members must follow these strict rules when adding new code:

### Rule 1: Separation of Concerns
Never write database logic (Prisma) or complex business logic directly in the UI components (Next.js or React Native).
- **Backend (`backend/src/`)**: This is the **only** place where business logic and direct database queries should live.
- **Frontend (`apps/`)**: These apps should only handle UI rendering, state management, and making API calls to the backend.

### Rule 2: Where does my code go?

**1. Building a New UI Component (e.g., A new Doctor Card, a Custom Button)?**
- **Go to**: `packages/ui/src/components/`
- **Why**: Making it a shared component ensures both `landing-page`, `web`, and potentially `mobile` (if using React Native Web or separate shared RN UI package) have a consistent design.

**2. Building a New Page/Screen (e.g., Patient Dashboard)?**
- **Go to**: `apps/web/src/app/` (for Next.js) OR `apps/mobile/` (for Expo).
- **Why**: Pages are app-specific. They compose the shared UI components and fetch data from the backend.

**3. Writing Database Queries or Changing Schema?**
- **Schema changes**: `packages/prisma/schema.prisma`. Run `npx prisma db push` afterward.
- **Queries**: Create a service in `backend/src/services/` (e.g., `doctor.service.ts`) to handle the Prisma logic.

**4. Adding a New API Endpoint (e.g., Fetching Labs)?**
- **Controller**: `backend/src/controllers/lab.controller.ts` (Handles `req`/`res`).
- **Route**: `backend/src/routes/lab.routes.ts` (Defines the URL path and attaches middleware).
- **Service**: `backend/src/services/lab.service.ts` (Does the actual work).

### Rule 3: Do not bypass the API
Frontend apps (`apps/landing-page`, `apps/web`, `apps/mobile`) must **never** import `@prisma/client` directly. They must make HTTP requests (e.g., using `fetch` or `axios`) to the `backend` server running on port 5000.

---

## 11. Next Steps for Developers

1. **Implement User Registration & Login** — Create `/api/auth/register` and `/api/auth/login` endpoints with password hashing (bcryptjs).
2. **Build Doctor Search API** — Create `/api/doctors` with filtering by specialty, location, and availability.
3. **Appointment Booking** — Implement slot checking and booking with payment integration.
4. **Lab Order Flow** — Build endpoints for test browsing, ordering, and result retrieval.
5. **Dashboard UIs** — Implement Patient and Doctor dashboards in `apps/web`.

---

*Start by understanding the Prisma schema, then build API endpoints in `backend/src/controllers/` and `backend/src/routes/`. The auth middleware is ready to protect your routes immediately.*
