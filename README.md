# careXpatient

**A Comprehensive Patient-Centric Healthcare Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?style=flat-square&logo=turborepo)](https://turbo.build/repo)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Agora](://img.shields.io/badge/Agora-RTC-099DFD?style=flat-square&logo=agora)](https://www.agora.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup & Run](#setup--run)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Demo Credentials](#demo-credentials)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

careXpatient is a comprehensive, patient-centric healthcare platform designed specifically for Bangladesh. It bridges the gap between patients, doctors, and laboratory services by providing a seamless, end-to-end digital healthcare experience under one roof.

**The Problem:** Patients struggle to find the right doctor quickly, manage appointments, arrange diagnostic tests (especially with mobility challenges), handle payments, receive prescriptions, and maintain their medical history — all through fragmented, disconnected tools that make the process stressful and disjointed.

**The Solution:** careXpatient gently removes these barriers by offering an integrated, transparent platform where you can:

- **Discover** trusted doctors by specialty, location, ratings, and availability
- **Book** video or in-person appointments with real-time time slot selection
- **Order** lab tests with optional at-home sample collection
- **Consult** with doctors via secure video calls with built-in chat and file sharing
- **Receive** digital prescriptions and lab reports instantly
- **Track** all your medical records, appointments, and orders in one place
- **Pay** securely through integrated payment gateways

The platform serves four main user roles — **Patient**, **Doctor**, **Lab Technician**, and **Admin** — each with a dedicated dashboard tailored to their specific needs.

---

## Architecture

careXpatient follows a **Monorepo** architecture managed by **Turborepo**, with a clear separation of concerns between frontend, backend, and shared packages.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │   Next.js 16 Web    │  │  React Native (Expo) Mobile  │  │
│  │  (Landing + Dashboards) │  │  (Patient App)              │  │
│  │  Port: 3000         │  │  Port: 19000                │  │
│  └────────┬────────────┘  └────────┬─────────────────────┘  │
│           │                         │                        │
│           └─────────┬───────────────┘                        │
│                     │ HTTP / WebSocket                       │
├─────────────────────┼───────────────────────────────────────┤
│              Server Layer                                    │
│  ┌──────────────────┴──────────────────────────────────┐    │
│  │           Express.js REST API + Socket.IO           │    │
│  │  • Authentication (JWT + OTP)                       │    │
│  │  • Doctor Discovery & Appointment Management        │    │
│  │  • Lab Order Processing & Report Management         │    │
│  │  • Video Consultation (Agora)                       │    │
│  │  • AI Chatbot (Gemini)                              │    │
│  │  • Prescription & PDF Generation                    │    │
│  │  • Real-time Events via Socket.IO                   │    │
│  │  Port: 5000                                         │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
├─────────────────────────┼───────────────────────────────────┤
│                  Data Layer                                  │
│  ┌──────────────────────┴──────────────────────────────┐    │
│  │           PostgreSQL via Prisma ORM                  │    │
│  │  19 Tables: User, Patient, Doctor, Appointment,     │    │
│  │  Lab, LabOrder, Consultation, Prescription, etc.    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

- **Loose Coupling:** Frontend apps never talk to the database directly — they communicate exclusively via HTTP API calls to the backend
- **Role-Based Access Control (RBAC):** Every API endpoint is protected by authentication middleware that verifies JWT tokens and enforces role permissions
- **Real-Time by Default:** Socket.IO powers live updates for appointments, consultations, and lab orders — no polling required
- **Shared Design System:** UI components live in `packages/ui` and are consumed by all frontend apps, ensuring visual consistency

---

## Key Features

### A. Authentication & User Management

Secure, role-based authentication with multiple verification methods:

- **Multi-Role Signup:** Patients, Doctors, and Lab users each have tailored registration forms with role-specific fields (e.g., BMDC number for doctors, lab name for lab users)
- **JWT-Based Authentication:** Stateless session management with JSON Web Tokens — tokens carry user ID and role for seamless authorization
- **OTP Verification:** Phone-based OTP for login with a demo mode (`1234` for test accounts), enabling rapid development and testing
- **Password Hashing:** bcryptjs with salt rounds for secure credential storage
- **Session Restoration:** The `/api/auth/me` endpoint allows clients to restore sessions on page reload
- **Persistent State:** Zustand store with cookie-backed persistence keeps users logged in across browser sessions

### B. Doctor Discovery & Appointment Booking

A comprehensive system for finding the right doctor and booking appointments with ease:

- **Rich Search & Filtering:** Filter doctors by specialty, experience range, consultation fee, rating, district, and gender — with instant results
- **Detailed Doctor Profiles:** View qualifications, experience years, BMDC registration number, clinic affiliations, specialties, rating, and review count
- **Real-Time Availability Slots:** The system generates 30-minute time slots based on doctor's clinic shifts, accounting for holidays, leaves, and booked appointments — eliminating double-booking
- **Dual Appointment Types:** Book **In-Person** (at a clinic) or **Online** (video consultation) appointments
- **Full Appointment Lifecycle:**
  - `Pending` → Doctor reviews and either accepts or rejects
  - `Confirmed` → Appointment is set; online appointments auto-generate an Agora video channel and token
  - `In Consultation` → Active video call in progress
  - `Completed` → Consultation finished, prescription can be issued
  - `Cancelled` / `NoShow` / `Rescheduled` → Full state coverage
- **Patient Actions:** Cancel appointments with reason; view upcoming/past appointments
- **Doctor Actions:** Accept, decline (with mandatory reason), complete, reschedule, or mark as no-show
- **Double-Booking Prevention:** Server-side validation ensures no two appointments occupy the same doctor + time slot

### C. Video Consultation (Agora Integration)

A fully-featured video consultation system built on Agora's real-time communication platform:

- **Secure Video Calls:** Uses Agora RTC SDK for high-quality, low-latency video/audio communication
- **Dual Token System:** Both RTC (video/audio) and RTM (messaging) tokens are generated for each consultation
- **Waiting Room:** Patients enter a waiting room before the doctor joins — real-time socket notifications inform the doctor when the patient is ready
- **In-Call Text Chat:** Persistent chat messages are stored in the database and streamed in real-time via Socket.IO to both participants
- **File Sharing:** Doctors can upload and share files (PDF, images, documents) during the consultation — all files are stored on disk and served statically
- **Consultation Timer:** Tracks consultation start and end times, calculates total duration, and emits socket events for status transitions
- **Token Refresh:** Long consultations are supported with a token refresh mechanism that generates new Agora tokens on demand
- **Prescription During Call:** Doctors can create, review, and issue digital prescriptions without leaving the video call interface
- **Cross-Platform:** Works seamlessly on both web (Next.js) and mobile (React Native via Expo)

### D. Lab Portal — Complete Laboratory Management

A full-featured lab management dashboard that covers the entire lab workflow from order intake to report dispatch:

- **Dashboard Overview:** At-a-glance metrics — today's tests count, pending orders, completed tests, total revenue, and recent activity timeline
- **Test Queue Management:**
  - View all incoming lab orders with patient details, test names, and status
  - **Accept** orders to begin processing
  - **Reject** orders with a mandatory reason and optional note
  - **Restore** previously rejected orders back to the queue
  - **Manual Entry** for walk-in patients who don't have an online account
- **Sample Collection Workflow:**
  - Assign collection staff to each order
  - Track home collection vs in-lab collection
  - Record collection address and time slot for home visits
  - Advance orders through steps: Requested → Accepted → Sample Collected → Processing → Reported
- **Report Upload Pipeline:**
  - **Upload:** Attach report files (PDF, images) to lab orders
  - **Verify:** Verify uploaded reports — this associates the file with the order and sets the status to `Reported`
  - **Send:** Dispatch verified reports to patients via multiple channels — each send is logged in the dispatch log with timestamp, recipient, and channel
- **Earnings Dashboard:**
  - Aggregate views: Daily, Weekly, and Monthly earnings
  - 7-day earnings trend with bar chart visualization
  - Per-test revenue breakdown (how much each test type has earned)
  - Transaction history with patient names, test details, amounts, and dates
- **Patient Management:**
  - Search patients by name or phone
  - View patient profiles with full order history and status timeline
  - Quick access to place new orders for existing patients
- **Test Management (CRUD):**
  - Create, read, update, and delete lab tests
  - Each test has: name, category, sample type, price, description, prerequisites, delivery time, tag, and tag color
  - Organize tests by categories for easy browsing
- **Settings:** Update lab profile (name, address, phone) and change password
- **Real-Time Updates:** Lab order status changes are broadcast via Socket.IO to the patient portal, so patients see live updates

### E. Patient Portal

A comprehensive patient dashboard for managing all healthcare activities in one place:

- **Dashboard:** Stats cards showing total appointments, lab tests, and reports; next upcoming appointment card with countdown; quick action buttons (book appointment, order lab test); recent activity feed with timestamps
- **My Appointments:** Filter by upcoming/past/all; view appointment details; cancel with reason; join video call directly when the consultation starts; real-time socket updates when doctor accepts/confirms/starts consultation
- **Doctor Discovery & Booking:**
  - Browse available doctors with search, specialty filter, and sort options
  - View full doctor profiles with qualifications, clinics, and ratings
  - Select date and see real-time available time slots
  - Booking drawer with doctor info, appointment type selection, and reason for visit
- **Lab Tests & Orders:**
  - Browse lab test catalog by category (Blood, Urine, Imaging, Cardiac, etc.)
  - Search tests by name; filter by price range with a slider
  - View test details in a modal (description, prerequisites, sample type, delivery time)
  - **Shopping Cart:** Add/remove tests, toggle home collection (+150 BDT fee), apply coupon codes (`CARE10` for 10% off, `LAB50` for 50 BDT off), view subtotal, VAT (5%), and total
  - Multi-lab orders are automatically split into separate orders per lab
  - Real-time order tracking via Socket.IO — see status changes live: Requested → Sample Collected → Processing → Reported
- **Lab Reports:**
  - View all lab reports with search, date range filters, and pagination
  - Detailed report view with test parameters, values, units, and reference ranges
- **Prescriptions:**
  - View all prescriptions with filters by doctor, date range, and text search
  - Expand to see full prescription details: diagnosis, medicines with dosage instructions, and doctor's advice
  - Download prescriptions as PDF (generated server-side via Puppeteer)
- **Settings:** Manage profile information

### F. AI Symptom Chatbot (Gemini Integration)

An intelligent chatbot on the landing page that helps patients find the right doctor based on their symptoms:

- **Natural Language Input:** Patients describe their symptoms in plain English or Bengali
- **AI-Powered Analysis:** Symptom text is sent to the backend, which uses Google Gemini 2.5 Flash API to analyze and recommend the appropriate medical department
- **Rule-Based Fallback:** If the Gemini API is unavailable, a built-in keyword matching system handles common conditions (chest pain → cardiologist, skin rash → dermatologist, etc.)
- **Doctor Recommendations:** Returns a curated list of doctors from the matching specialty
- **Seamless Booking:** Patients can book an appointment with a recommended doctor directly from the chatbot interface
- **Landing Page Integration:** The chatbot is prominently featured on the landing page, serving as the primary entry point for new users

### G. Real-Time Features (Socket.IO)

Real-time communication is woven throughout the application:

- **Appointment Status Updates:** When a doctor accepts, confirms, starts, or completes an appointment, the patient sees the update instantly without refreshing
- **Consultation Notifications:** Socket events fire when a consultation starts or ends, enabling both parties to react immediately
- **Lab Order Status Changes:** Patients see their lab order progress in real-time — from Requested all the way to Reported
- **In-Call Chat:** Messages sent during a video consultation appear instantly on both sides via Socket.IO rooms
- **Waiting Room Presence:** The doctor is notified when the patient joins the waiting room, and vice versa
- **Room-Based Architecture:** Each appointment, order, and waiting area has its own Socket.IO room for targeted, efficient message delivery
- **JWT Authentication on Socket:** Socket connections are authenticated using the same JWT tokens as the REST API

### H. Doctor Schedule Management

A flexible schedule management system for doctors to manage their availability:

- **Clinic Registration:** Doctors can register at multiple clinics with different shifts
- **Custom Slot Creation:** Define custom appointment slots with 30-minute intervals
- **Schedule Overrides:**
  - **Cancel Slot:** Remove a specific time slot
  - **Apply Holiday:** Mark a day as unavailable
  - **Apply Leave:** Mark a date range as unavailable
  - **Reschedule:** Move a slot to a different date/time with optional replacement clinic
  - **Rollback:** Revert any schedule override
- **Conflict Detection:** All schedule modifications check for existing appointments and prevent changes that would conflict with booked slots
- **Reschedule Chain Tracking:** When a slot is rescheduled, the system maintains a chain of modifications (original → modified) for full auditability
- **Weekly Calendar View:** Doctors can see their entire weekly schedule at a glance, with color-coded slots for different statuses

### I. Lab Order & Payment System

A complete lab order management system with financial tracking:

- **Multi-Lab Order Grouping:** When a patient adds tests from different labs, the system automatically creates separate orders grouped by lab
- **Guest User Support:** Walk-in patients can be served via manual order entry without needing an online account — the system auto-creates a minimal user record
- **Home Collection:** Patients can opt for at-home sample collection by providing their address and preferred time slot (additional 150 BDT fee)
- **Coupon System:**
  - `CARE10` — 10% discount on subtotal
  - `LAB50` — 50 BDT flat discount
  - Discounts are applied before VAT calculation
- **VAT Calculation:** 5% VAT is automatically calculated on the discounted amount
- **Full Order Lifecycle:** Requested → Accepted By Lab → Sample Collected → Processing → Reported → Cancelled
- **Order Rejection:** Labs can reject orders with a reason and optional note; rejected orders can be restored
- **Report Dispatch Logging:** Every time a report is sent (via any channel), it's logged with timestamp, recipient, and channel for full auditability
- **Payment Gateway Ready:** Database schema supports bKash, Nagad, and SSLCommerz with full transaction tracking — payment integration is ready for live gateway connection

### J. PDF Generation (Prescriptions)

Digital prescription management with automated PDF generation:

- **Digital Prescriptions:** Doctors can create prescriptions during or after consultations with diagnosis, medicines (name, dosage, duration, instructions), and advice
- **Puppeteer-Powered PDF Generation:** The backend uses Puppeteer with Edge browser to render the prescription print page (a Next.js route) and capture it as a high-quality PDF
- **PDF Download:** Patients can download their prescriptions as PDF files from the patient portal
- **Prescription Filters:** Patients can filter prescriptions by doctor, date range, and search text
- **Prescription Detail View:** Expand any prescription to see the full detail with parsed medicines, diagnosis, and doctor's advice

### K. File Upload System

A secure file upload infrastructure supporting multiple contexts:

- **Consultation Files:** Doctors can upload files (PDF, JPEG, PNG, WebP, DOC, DOCX) during video consultations — files are associated with both the consultation and appointment records
- **Lab Reports:** Lab technicians upload test report files that go through a verification pipeline before being dispatched to patients
- **Type Validation:** Multer middleware validates file types and rejects unsupported formats
- **Size Limits:** Uploads are limited to 10MB per file to prevent abuse
- **Organized Storage:** Files are stored on disk under `uploads/consultations/` with UUID-based filenames to prevent collisions
- **Static Serving:** Uploaded files are served statically via Express at the `/uploads` endpoint

---

## Database Schema

careXpatient uses **PostgreSQL** with **Prisma ORM** as the database layer. The schema defines **19 models** with full relational integrity, enums, indexes, and PostgreSQL-specific type mappings.

### Entity Relationship Overview

```
User ──┬── Patient ──┬── Appointment ──┬── Consultation ──┬── Prescription
       │              │                 │                  │
       │              │                 │                  └── LabOrderTest
       │              │                 ├── ConsultationMessage
       │              │                 └── ConsultationFile
       │              │
       │              └── LabOrder ──┬── LabOrderTest ──┬── LabTest ──┬── Lab
       │                             │                  │             │
       │                             │                  │             └── User
       │                             ├── LabResult
       │                             ├── ReportParameter
       │                             ├── OrderRejection
       │                             └── ReportDispatchLog
       │
       ├── Doctor ──┬── DoctorSpecialty ──┬── Specialty
       │            │
       │            ├── DoctorClinic ──┬── Clinic ──┬── ScheduleModification
       │            │                              │
       │            └── Appointment                 └── Payment
       │
       └── Lab ────── LabTest
```

### Models

| Model | Description | Key Fields | Relationships |
|-------|-------------|------------|---------------|
| **User** | Core user account for all roles | `id`, `phone` (unique), `email`, `password`, `fullName`, `role` (enum), `nidNumber`, `profilePhotoUrl`, `isVerified` | → Patient, Doctor, Lab (1:1 each) |
| **Patient** | Patient-specific profile data | `dateOfBirth`, `bloodGroup`, `address`, `allergies`, `medicalHistory` | → User, Appointment[], LabOrder[] |
| **Doctor** | Doctor professional profile | `bmdcNumber` (unique), `qualification`, `experienceYears`, `fee`, `rating`, `reviewCount` | → User, DoctorSpecialty[], DoctorClinic[], Appointment[], ScheduleModification[] |
| **Lab** | Laboratory profile | `name`, `address`, `phone` | → User, LabOrder[], LabTest[] |
| **Specialty** | Medical specialties catalog | `name` (unique) | → DoctorSpecialty[] |
| **DoctorSpecialty** | Many-to-many: Doctor ↔ Specialty | `doctorId`, `specialtyId` (composite PK) | → Doctor, Specialty |
| **Clinic** | Clinic/hospital locations | `name`, `address`, `phone` | → DoctorClinic[], Appointment[], ScheduleModification[] |
| **DoctorClinic** | Many-to-many: Doctor ↔ Clinic (with shift) | `doctorId`, `clinicId` (composite PK), `shift`, `status` | → Doctor, Clinic |
| **Appointment** | Appointment bookings | `type` (In-person/Online), `status` (10-state enum), `date`, `timeSlot`, `agoraChannelName`, `agoraToken`, duration, cancellation info | → Patient, Doctor, Clinic, Consultation, ConsultationMessage[], ConsultationFile[] |
| **Consultation** | Video consultation sessions | `startTime`, `endTime`, `notes`, `videoRoomId` | → Appointment, Prescription, ConsultationMessage[], ConsultationFile[] |
| **Prescription** | Digital prescriptions | `medicinesText`, `adviceText`, `diagnosis`, `fileUrl`, `digitalSignature`, `issuedAt` | → Consultation |
| **ConsultationMessage** | In-call chat messages | `senderId`, `senderRole`, `message` | → Appointment, Consultation |
| **ConsultationFile** | Files shared during consultation | `fileName`, `fileType`, `fileUrl`, `uploadedBy`, `uploadedByRole` | → Appointment, Consultation |
| **LabTest** | Available lab tests catalog | `name`, `price`, `sampleType`, `category`, `description`, `prerequisites`, `deliveryTime`, `tag`, `tagColor` | → Lab, LabOrderTest[] |
| **LabOrder** | Patient lab test orders | `status` (6-state enum), `demoStep`, `assignedStaff`, `subtotal`, `vat`, `homeCollectionFee`, `totalAmount`, `homeCollection`, `collectionAddress`, `collectionSlot` | → Patient, Lab, LabOrderTest[], LabResult, ReportParameter[], OrderRejection, ReportDispatchLog[] |
| **LabOrderTest** | Many-to-many: LabOrder ↔ LabTest | `labOrderId`, `labTestId` (composite PK) | → LabOrder, LabTest |
| **LabResult** | Lab test results/reports | `resultSummary`, `fileUrl`, `uploadedAt`, `uploadedBy` | → LabOrder |
| **ReportParameter** | Individual test parameters within a report | `parameterName`, `value`, `unit`, `referenceRange` | → LabOrder |
| **OrderRejection** | Lab order rejection records | `reason`, `note`, `rejectedAt` | → LabOrder |
| **ReportDispatchLog** | Report delivery audit trail | `sentTo`, `channel`, `sentAt`, `status` | → LabOrder |
| **Payment** | Payment transactions (polymorphic) | `orderType` (Appointment/LabOrder), `orderId`, `amount`, `gateway` (bKash/Nagad/SSLCommerz), `transactionId`, `status` | (polymorphic via orderType + orderId) |
| **ScheduleModification** | Doctor schedule overrides | `type` (Slot/Cancel/Holiday/Leave/Reschedule), `date`, `status`, self-referencing for reschedule chains | → Clinic (×2), Doctor, ScheduleModification (self) |

**Enums:** `UserRole`, `AppointmentType`, `AppointmentStatus` (10 values), `LabOrderStatus` (6 values), `PaymentGateway`, `PaymentStatus`, `OrderType`

---

## Project Structure

```
careXpatient/
│
├── apps/
│   ├── web/                          # Next.js 16 Web Application
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx          # Landing page (hero, chatbot, features)
│   │       │   ├── reports/          # Public lab reports
│   │       │   ├── (auth)/           # Login, signup (multi-step wizard)
│   │       │   └── dashboard/
│   │       │       ├── patient/      # Patient dashboard (9 pages)
│   │       │       ├── doctor/       # Doctor dashboard (7 pages)
│   │       │       └── lab/          # Lab portal (9 pages)
│   │       ├── components/
│   │       │   ├── auth/             # LoginForm, SignupWizard, RoleSelection
│   │       │   ├── layout/           # Sidebar, DashboardLayout
│   │       │   ├── doctor/           # DoctorDashboardStats, AppointmentHub, etc.
│   │       │   ├── appointments/     # DoctorCard, BookingDrawer, FilterDrawer
│   │       │   ├── consultation/     # WaitingRoom, VideoCall, InCallChat, FileShare
│   │       │   ├── chatbot/          # ChatbotSearch, ChatbotBookingDrawer
│   │       │   ├── lab/              # StatCard, StatusBadge, TestQueueRow, etc.
│   │       │   ├── lab-tests/        # LabTestCard, Cart, CheckoutModal
│   │       │   ├── prescriptions/    # PrescriptionList, Filters, DetailView
│   │       │   └── schedule/         # WeeklyScheduleViewer, OverrideTimeline
│   │       ├── services/             # API service layer (doctor, lab, patient, consultation)
│   │       ├── store/                # Zustand stores (auth, cart, signup)
│   │       ├── lib/                  # API client, socket client, Zod validations
│   │       ├── types/                # TypeScript interfaces (doctor, consultation)
│   │       └── server/               # Server actions (doctor schedule)
│   │
│   └── mobile/                       # React Native (Expo) mobile app
│       └── src/                      # Patient mobile experience
│
├── backend/                          # Express.js REST API
│   └── src/
│       ├── server.ts                 # Entry point — Express + Socket.IO
│       ├── config/                   # App configuration
│       ├── controllers/              # Route handlers (auth, doctor, appointment, etc.)
│       ├── routes/
│       │   ├── auth.routes.ts        # POST /signup, /login, /send-otp, /verify-otp, GET /me
│       │   ├── doctor.routes.ts      # GET /doctors, /specialties, /profile, /slots
│       │   ├── appointment.routes.ts # POST /appointments, accept/decline/complete/cancel
│       │   ├── consultation.routes.ts# start/join/end consultation, chat, file upload
│       │   ├── labTest.routes.ts     # CRUD for lab tests
│       │   ├── labOrder.routes.ts    # Create/fetch lab orders
│       │   ├── reports.routes.ts     # Public report listing
│       │   ├── prescription.routes.ts# Prescription listing + PDF download
│       │   ├── chatbot.routes.ts     # POST /recommend-doctor
│       │   ├── patient.routes.ts     # Patient dashboard data
│       │   └── lab/                  # Lab portal routes (8 modules)
│       │       ├── dashboard.routes.ts
│       │       ├── orders.routes.ts
│       │       ├── patients.routes.ts
│       │       ├── reports.routes.ts
│       │       ├── earnings.routes.ts
│       │       └── settings.routes.ts
│       ├── services/                 # Business logic
│       │   ├── auth.service.ts       # Signup/login with bcrypt + JWT
│       │   ├── otp.service.ts        # OTP generation/verification
│       │   ├── gemini.service.ts     # Google Gemini AI integration
│       │   ├── agora.service.ts      # Agora token generation
│       │   ├── socket.service.ts     # Socket.IO server setup + room management
│       │   └── prescription.service.ts # Prescription queries
│       ├── middleware/
│       │   ├── auth.ts               # authenticate() + authorize() RBAC
│       │   └── upload.ts             # Multer file upload config
│       └── utils/
│           └── auth.ts               # JWT generate/verify helpers
│
├── packages/
│   ├── prisma/                       # Prisma ORM
│   │   ├── schema.prisma             # Database schema (source of truth)
│   │   ├── migrations/               # Database migrations
│   │   └── package.json              # Prisma CLI scripts
│   ├── ui/                           # Shared React component library
│   │   └── src/components/           # Avatar, Badge, Button, Card, Checkbox, Input, etc.
│   ├── config-tailwind/              # Shared Tailwind CSS configuration
│   └── config-typescript/            # Shared TypeScript configurations
│
├── tests/
│   └── selenium/                     # Selenium E2E tests
│       ├── conftest.py               # Pytest fixtures (WebDriver setup)
│       ├── test_appointment_flow.py  # Appointment booking E2E test
│       └── requirements.txt          # Python dependencies
│
├── docs/                             # Documentation
│   ├── architecture.md               # Architecture documentation
│   └── database-schema.md            # Database schema documentation
│
├── database.sql                      # Raw PostgreSQL schema (reference)
├── turbo.json                        # Turborepo task orchestration
├── .env.example                      # Environment variable template
├── BRIEFING.md                       # Project onboarding document
├── FILE_DOCUMENTATION.md             # Per-file documentation
├── initial_srs.md                    # Software Requirements Specification
└── package.json                      # Monorepo root
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (Web)** | Next.js 16, React 19, Tailwind CSS 4 | Landing page + role-based dashboards (Patient, Doctor, Lab) |
| **Frontend (Mobile)** | React Native 0.81 (Expo 54) | Patient mobile application |
| **Backend** | Express.js 4, TypeScript 5 | REST API server with business logic |
| **Database** | PostgreSQL 15+, Prisma ORM 6 | Data persistence with type-safe queries |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | Stateless auth with role-based access control |
| **Validation** | Zod 3/4 | Schema validation for API requests and forms |
| **Real-Time** | Socket.IO 4 (server + client) | Live updates for appointments, consultations, lab orders, and chat |
| **Video** | Agora RTC SDK 4 + RTM SDK | Real-time video/audio consultations |
| **AI** | Google Gemini 2.5 Flash | Symptom-based doctor recommendation chatbot |
| **PDF** | Puppeteer (Edge browser) | Server-side prescription PDF generation |
| **File Upload** | Multer | Multipart file upload with type validation |
| **Build System** | Turborepo 2.x + npm workspaces | Monorepo task orchestration |
| **State Management** | Zustand 5 | Lightweight client-side state management |
| **Animation** | Framer Motion 12 | UI transitions and animations |
| **Icons** | Lucide React | Consistent iconography |
| **Date Handling** | date-fns 4 | Date manipulation and formatting |
| **Testing** | Selenium + pytest | End-to-end browser testing |

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** 18+ (with npm 10+)
- **PostgreSQL** 15+ running locally
- **Git** for version control
- **(Optional)** Agora SDK account — for video consultation features
- **(Optional)** Google Gemini API key — for AI chatbot features

---

## Setup & Run

### Step 1: Clone the Repository

```bash
git clone https://github.com/md-rifat-ferdous/careXpatient_SElab.git
cd careXpatient_SElab
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (web app, backend, mobile app, and all packages) using npm workspaces.

### Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/carexpatient?schema=public"

# JWT Secret for Authentication (change this in production!)
JWT_SECRET="your_strong_secret_key_here"

# Backend Server Port
PORT=5000

# Agora Video SDK (optional — for video consultations)
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_app_certificate"

# Google Gemini API (optional — for AI chatbot)
GEMINI_API_KEY="your_gemini_api_key"
```

**Important:** Also copy the `.env` file to Prisma's directory — Prisma reads from its own location:

```bash
cp .env packages/prisma/.env
```

### Step 4: Create the Database

Connect to PostgreSQL and create the database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE carexpatient;
\q

# Or using pgAdmin — create a new database named "carexpatient"
```

### Step 5: Push Schema to Database

```bash
# From the packages/prisma directory:
cd packages/prisma
npx prisma db push

# Or from the root using Turborepo:
cd ../..
npm run prisma:push
```

This creates all 19 tables in your PostgreSQL database and generates the Prisma Client.

To view your database visually:

```bash
npm run prisma:studio
# Opens Prisma Studio at http://localhost:5555
```

### Step 6: Seed the Database (Optional)

Seed data creates demo accounts, doctors, lab tests, and sample orders for development:

```bash
# From the backend directory:
cd backend

# Run individual seed scripts:
node create_test_accounts.js     # Creates demo users (patient, doctor, lab)
node seed_doctors.js             # Seeds doctor profiles
node seed_lab_tests.js           # Seeds lab test catalog
node seed_demo_orders.js         # Creates sample lab orders

# Or run all seed scripts at once:
npm run seed:all
```

### Step 7: Start Development Servers

```bash
# Run both web + backend concurrently (from root):
npm run dev

# Or run them individually:
npm run dev:web                  # Next.js app → http://localhost:3000
npm run dev:backend              # Express API  → http://localhost:5000
```

### Step 8: Verify

- **Landing Page:** Open [http://localhost:3000](http://localhost:3000) — you should see the careXpatient landing page with hero section, AI chatbot, and feature highlights
- **Backend Health:** Visit [http://localhost:5000](http://localhost:5000) — should return a JSON response with `{ "status": "healthy" }`
- **Prisma Studio:** [http://localhost:5555](http://localhost:5555) — visual database browser

---

## Available Scripts

### Root Scripts (via Turborepo)

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `turbo run dev` | Starts web app + backend concurrently |
| `npm run dev:web` | `turbo run dev --filter=web` | Starts Next.js dev server on port 3000 |
| `npm run dev:backend` | `turbo run dev --filter=@carexpatient/backend` | Starts Express API on port 5000 |
| `npm run build` | `turbo run build` | Builds all apps and packages |
| `npm run lint` | `turbo run lint` | Lints all workspaces |
| `npm run type-check` | `turbo run type-check` | Runs TypeScript checks across all workspaces |
| `npm run prisma:generate` | `turbo run generate --filter=@carexpatient/prisma` | Generates Prisma Client |
| `npm run prisma:push` | `turbo run push --filter=@carexpatient/prisma` | Pushes schema to database |
| `npm run prisma:studio` | `turbo run studio --filter=@carexpatient/prisma` | Opens Prisma Studio |

### Backend Scripts

| Script | Description |
|--------|-------------|
| `npm run seed:all` | Runs all seed scripts (doctors, lab tests, demo orders, test accounts) |
| `prisma:migrate` | Creates a new Prisma migration |
| `prisma:studio` | Opens Prisma Studio from backend context |

### Web App Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |

---

## API Overview

The backend exposes a RESTful API at `http://localhost:5000/api`. Here are the main endpoint groups:

| Group | Base Path | Description |
|-------|-----------|-------------|
| **Auth** | `/api/auth` | Signup, login, OTP verification, session restoration |
| **Doctors** | `/api/doctors` | List doctors, specialties, profiles, availability slots |
| **Appointments** | `/api/appointments` | Book, accept, decline, complete, cancel, reschedule |
| **Consultations** | `/api/consultations` | Start/join/end video calls, chat, file upload |
| **Lab Tests** | `/api/lab-tests` | CRUD for lab test catalog |
| **Lab Orders** | `/api/orders` | Create and fetch lab orders |
| **Reports** | `/api/reports` | Public lab report listing and details |
| **Prescriptions** | `/api/prescriptions` | List, filter, detail, PDF download |
| **Chatbot** | `/api/chatbot` | AI symptom-based doctor recommendation |
| **Patients** | `/api/patients` | Patient dashboard data |
| **Lab Portal** | `/api/lab/*` | Dashboard, orders, patients, reports, earnings, settings |

All authenticated endpoints require a `Bearer` token in the `Authorization` header. Role-based access is enforced at the middleware level.

---

## Demo Credentials

After running the seed scripts, you can log in with these demo accounts:

| Role | Phone | OTP | Description |
|------|-------|-----|-------------|
| **Patient** | `01700000001` | `1234` | Full patient portal access |
| **Doctor** | `01700000002` | `1234` | Doctor dashboard with appointments |
| **Lab** | `01700000003` | `1234` | Lab portal with test queue and earnings |

All demo accounts use OTP `1234` for quick development access.

---

## Testing

### Selenium End-to-End Tests

The `tests/selenium/` directory contains automated browser tests for critical user flows:

```bash
cd tests/selenium
pip install -r requirements.txt
pytest test_appointment_flow.py -v
```

The test suite covers:
- User login flow
- Doctor discovery and filtering
- Appointment booking with time slot selection
- Appointment status lifecycle

### Linting & Type Checking

```bash
npm run lint          # Lint all workspaces
npm run type-check    # TypeScript type checking across all workspaces
```

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** and create your feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the project's coding conventions:
   - Use descriptive branch names with prefixes like `feat/`, `fix/`, `docs/`
   - Keep UI components dumb and backend smart — no complex logic in React components
   - Shared components go in `packages/ui`, not in individual apps
   - Frontend apps communicate with the database exclusively via the backend API — never import Prisma in frontend code

3. **Run lint and type-check** before committing:
   ```bash
   npm run lint
   npm run type-check
   ```

4. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add description of your feature"
   ```

5. **Push to your fork** and open a Pull Request on GitHub.

---

## License

This project is licensed under the MIT License — see the LICENSE file for details.

---

<div align="center">
  <p>Built with ❤️ for better healthcare in Bangladesh</p>
  <p>
    <a href="https://github.com/md-rifat-ferdous/careXpatient_SElab">GitHub</a> •
    <a href="#table-of-contents">Back to Top</a>
  </p>
</div>
