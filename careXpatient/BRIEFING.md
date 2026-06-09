# Project Briefing: careXpatient

Welcome to the **careXpatient** development team. This document provides an overview of the project, architecture, local setup, and remaining tasks.

## 1. Project Requirements & Vision
**careXpatient** is a comprehensive patient-centric healthcare platform designed to bridge the gap between patients, doctors, and lab services.
- **Core Goal**: Provide a seamless, empathetic, and efficient healthcare experience in Bangladesh.
- **Key Features**:
  - Patient Appointment Booking (Online/In-person).
  - Doctor Consultations with Video Integration.
  - Digital Prescription Management.
  - Lab Test Ordering & Home Sample Collection.
  - Integrated Payment Gateways (bKash, Nagad, SSLCommerz).
  - Role-based Dashboards (Patient, Doctor, LabTech, Nurse, Admin).

## 2. Architecture & Module Overview
The project follows a **Monorepo** structure managed by **Turborepo**.

```
careXpatient/
├── apps/
│   ├── landing-page/       # Next.js – Patient-facing landing page
│   ├── web/                # Next.js – Main web application (dashboards, etc.)
│   └── mobile/             # React Native (Expo) – Patient mobile application
├── backend/                # Express.js + TypeScript – REST API server
│   └── src/
│       ├── config/         # Environment and app configuration
│       ├── controllers/    # Route handler logic
│       ├── middleware/      # Auth, validation, error handling
│       ├── routes/         # Express route definitions
│       ├── services/       # Business logic layer
│       ├── utils/          # Shared utilities (JWT, hashing, etc.)
│       ├── types/          # TypeScript type definitions
│       └── server.ts       # Express server entry point
├── packages/
│   ├── prisma/             # Prisma ORM schema & client
│   ├── ui/                 # Shared React component library
│   ├── config-tailwind/    # Shared Tailwind CSS configuration
│   ├── config-typescript/  # Shared TypeScript configurations
│   └── eslint-config/      # Shared ESLint configuration
├── docs/                   # Architecture & schema documentation
├── database.sql            # Raw PostgreSQL schema (reference)
├── turbo.json              # Turborepo task configuration
└── package.json            # Root workspace configuration
```

### Key Modules

| Module | Tech Stack | Purpose |
| :--- | :--- | :--- |
| `apps/landing-page` | Next.js 16, React 19, Tailwind CSS | Public-facing landing page |
| `apps/web` | Next.js (planned) | Patient/Doctor/Admin dashboards |
| `apps/mobile` | React Native (Expo), TypeScript | Mobile app for patients |
| `backend` | Express.js, TypeScript, Prisma | REST API, authentication, business logic |
| `packages/prisma` | Prisma ORM, PostgreSQL | Database schema, migrations, and client |
| `packages/ui` | React, Tailwind CSS | Shared design system components |

## 3. Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Express.js 4, TypeScript 5 |
| Database | PostgreSQL (via Prisma ORM 6) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Build System | Turborepo 2.x |
| Package Manager | npm (workspaces) |

## 4. Database
The database schema is defined in two places:
- **`database.sql`** — Raw PostgreSQL DDL (reference/documentation).
- **`packages/prisma/schema.prisma`** — Prisma schema (source of truth for the app).

**16 tables** are defined: User, Patient, Doctor, Specialty, DoctorSpecialty, Clinic, DoctorClinic, Appointment, Consultation, Prescription, LabTest, Lab, LabOrder, LabOrderTest, LabResult, Payment.

## 5. Local Setup & Development

### Prerequisites
- **Node.js** v18+ 
- **PostgreSQL** 15+ running locally
- **npm** 10+

### Step-by-Step

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/md-rifat-ferdous/careXpatient_SElab.git
    cd careXpatient_SElab
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Configure Environment Variables**:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in your PostgreSQL credentials and a JWT secret:
    ```env
    DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/carexpatient?schema=public"
    JWT_SECRET="pick_a_strong_secret"
    PORT=5000
    ```
    > **Important**: Also copy `.env` to `packages/prisma/.env` (Prisma reads from its own directory).

4. **Create the Database**:
    ```bash
    # In psql or pgAdmin, create the database:
    CREATE DATABASE carexpatient;
    ```

5. **Push Schema to Database**:
    ```bash
    cd packages/prisma
    npx prisma db push
    ```
    This creates all 16 tables and generates the Prisma Client.

6. **Run Development Servers**:
    ```bash
    # From root directory:
    npm run dev:landing    # Landing page → http://localhost:3000
    npm run dev:backend    # Backend API  → http://localhost:5000
    npm run dev:web        # Web app (when ready)
    ```

7. **Verify**:
    - Landing Page: Open [http://localhost:3000](http://localhost:3000)
    - Backend Health Check: Open [http://localhost:5000](http://localhost:5000) — should return JSON with `"status": "healthy"`.
    - Prisma Studio (DB browser): `cd packages/prisma && npx prisma studio` → [http://localhost:5555](http://localhost:5555)

## 6. What's Already Built

### ✅ Completed
- [x] **Monorepo structure** — Turborepo with npm workspaces.
- [x] **Landing Page** — Responsive Next.js page with hero, search, services, and doctor highlights.
- [x] **Shared UI Library** — Components: Avatar, Badge, Button, Card, Checkbox, Input, Layout, Radio, Select, Toggle, Typography.
- [x] **Database Schema** — Full PostgreSQL schema with Prisma ORM integration (16 tables, all relations, indexes).
- [x] **Backend Foundation** — Express server with health check endpoint.
- [x] **Authentication Foundation** — JWT token generation/verification utilities + auth middleware with role-based access control (RBAC).
- [x] **TypeScript Configs** — Shared base, Next.js, React library, and Node.js configurations.

### 🚧 Remaining Tasks
- [ ] **User Registration & Login** — Implement signup/signin endpoints with password hashing.
- [ ] **Dashboard Implementation** — Build dashboards for Patient, Doctor, and Admin roles.
- [ ] **Appointment Booking Flow** — Full scheduling logic with time slots.
- [ ] **Lab Integration** — Lab order creation, status tracking, result uploads.
- [ ] **Payment Integration** — SSLCommerz, bKash, and Nagad gateways.
- [ ] **Video Consultation** — WebRTC or third-party integration for online appointments.

## 7. Development Workflow & Loose Coupling

To ensure a smooth workflow and avoid tangled code (tight coupling), follow this structured approach:

### 🎯 Where does my code belong?

- **Shared UI Components** (Buttons, Cards, Inputs) ➔ `packages/ui/src/components/`
- **Frontend Pages/Screens** (Dashboards, Views) ➔ `apps/web/` or `apps/mobile/`
- **API Endpoints & Business Logic** ➔ `backend/src/` (Controllers, Routes, Services)
- **Database Schema Updates** ➔ `packages/prisma/schema.prisma`

### 🛡️ Golden Rules for Loose Coupling
1. **Frontend Apps NEVER talk to the Database directly**: `apps/web` and `apps/mobile` must communicate with the database exclusively by making HTTP API calls to the `backend`. Never import Prisma in the frontend apps.
2. **Keep UI Dumb, Backend Smart**: Do not put complex data processing in React components. Let the Express backend handle calculations, validation, and data formatting.
3. **Use Shared Packages**: Instead of duplicating a button in `landing-page` and `web`, build it once in `packages/ui` and import it.

### Git Branching
- **Branch Naming**: Use descriptive prefixes like `feat/dashboard`, `fix/login-bug`, or `docs/readme`.
- **Linting & Formatting**: Run `npm run lint` before committing.

## 8. Code Push Procedure
1. Check out a new branch: `git checkout -b <branch-name>`
2. Stage changes: `git add .`
3. Commit changes: `git commit -m "type: description"`
4. Push to origin: `git push origin <branch-name>`
5. Open a Pull Request (PR) on GitHub for review.

## 9. Available Scripts (Root)

| Script | Command | Description |
| :--- | :--- | :--- |
| Landing Page Dev | `npm run dev:landing` | Starts the landing page on port 3000 |
| Web App Dev | `npm run dev:web` | Starts the web app (when ready) |
| Backend Dev | `npm run dev:backend` | Starts the Express API on port 5000 |
| Build All | `npm run build` | Builds all apps and packages |
| Lint All | `npm run lint` | Lints all workspaces |
| Type Check | `npm run type-check` | Runs TypeScript checks across all workspaces |
| Prisma Generate | `npm run prisma:generate` | Generates the Prisma client |

---
**Note**: AI-related metadata and internal tool configurations have been excluded from the repository via `.gitignore` to maintain a clean codebase.
