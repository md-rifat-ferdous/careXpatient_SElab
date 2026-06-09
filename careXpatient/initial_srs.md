# Software Requirements Specification (SRS): careXpatient

> **Version**: 1.1 — Updated May 2025  
> **Status**: Initial SRS with implementation progress notes

---

## 0. Introduction

**careXpatient** is a comprehensive, patient-centric healthcare platform designed for Bangladesh. Built with the **PERN stack** (PostgreSQL, Express.js, React, Node.js) for web, the platform prioritizes convenience, security, and continuity of care. This version delivers a focused yet comprehensive set of features for routine healthcare needs.

### 0.1 Purpose

This SRS document provides a clear, detailed description of the functional and non-functional requirements of careXpatient. It serves as a steady reference for the development team, testers, and stakeholders to ensure the system is built with empathy, reliability, and user peace of mind.

### 0.2 Problem Statement

**Problem Background**

Patients often struggle to find the right doctor quickly, manage appointments, arrange tests (especially with mobility challenges), handle payments, receive prescriptions, and keep track of their medical history. Fragmented tools make the process stressful and disjointed.

**Problem Description**

Existing platforms offer pieces of the solution but rarely combine doctor discovery, seamless bookings, at-home testing, payments, e-prescriptions, and secure digital records in one gentle platform.

**Problem Reasoning**

- Difficulty locating doctors by location or specialty
- Complicated appointment and test processes
- Manual or lost prescriptions and medical documents
- Lack of centralized, accessible patient records
- Extra stress for mobility-limited or busy users

**careXpatient** gently removes these barriers by offering an integrated, transparent experience.

---

## 1. Goal

The primary goal is to make everyday healthcare simple, accessible, and less stressful by connecting patients with trusted doctors and services while ensuring continuity through digital records and prescriptions.

**Specific Goals:**

- Fast discovery of nearby doctors and specialists
- Seamless booking of video or in-person appointments
- Convenient lab test booking with at-home sample collection
- Secure payment processing
- Generation and management of e-prescriptions
- Secure storage and access to digital medical records
- A clean, modern, reassuring user experience across web and mobile

### 1.1 Scope

**In Scope (This Version):**

- User registration and role-based access (Patient, Doctor, LabTech, Nurse, Admin)
- Doctor search by specialty, location (nearby via GPS), availability, and ratings
- Appointment booking (video or in-person) with calendar and reminders
- Lab test booking with optional at-home sample collection and tracking
- Secure payment processing for appointments and tests
- **E-Prescription module:** Doctors can create, sign, and share digital prescriptions; patients can view, download, and track them
- **Digital Medical Records:** Secure storage of patient history, consultation notes, prescriptions, test reports, and other documents
- Notifications (email, SMS, push) for bookings, reminders, prescriptions, and record updates
- Clean, responsive web (Next.js/React) interface
- PostgreSQL database with Prisma ORM

**Out of Scope (Future Phases):**

- Emergency ambulance or hospital bed management
- IoT/sensor integration
- Pharmacy medicine delivery (beyond e-prescription sharing)
- Insurance claims processing
- Advanced AI symptom checker

### 1.2 Definitions & Acronyms

- **PERN:** PostgreSQL, Express.js, React, Node.js
- **E-Prescription:** Electronically generated and signed medication prescription
- **EMR/Digital Medical Records:** Secure electronic storage of patient health information
- **RBAC:** Role-Based Access Control
- **ORM:** Object-Relational Mapping (Prisma)
- **JWT:** JSON Web Token (used for authentication)

### 1.3 Software Development Life Cycle (SDLC)

**Iterative/Agile** approach with short sprints is recommended. Core features (doctor search + appointments) can be delivered first, followed by test booking, payments, e-prescriptions, and digital records. This allows early user feedback and steady refinement.

---

## 2. Current Implementation Status

> This section tracks what has been built so far against the requirements.

| Requirement | Status | Notes |
| :--- | :---: | :--- |
| Monorepo structure (Turborepo) | ✅ | Fully configured with npm workspaces |
| Database schema (16 tables) | ✅ | PostgreSQL via Prisma ORM — all tables synced |
| Landing page | ✅ | Next.js 16 with responsive design |
| Shared UI component library | ✅ | 11 components in `packages/ui` |
| Backend server (Express) | ✅ | Running on port 5000 with health check |
| JWT authentication utilities | ✅ | Token generation and verification |
| Auth middleware (RBAC) | ✅ | Role-based route protection |
| User registration & login | 🚧 | Endpoints to be implemented |
| Patient/Doctor dashboards | 🚧 | Planned for `apps/web` |
| Appointment booking flow | 🚧 | Database models ready, logic pending |
| Lab order integration | 🚧 | Database models ready, logic pending |
| Payment integration | 🚧 | Database models ready, gateway pending |
| Video consultation | 🚧 | Planned for future sprint |

---

## 3. Functional Requirements

### FR-1: User Management
- Registration, login, and profile management for Patients, Doctors, LabTechs, Nurses, and Admins
- Secure authentication (JWT) and role-based access

### FR-2: Doctor Discovery
- Search and filter doctors by specialty, nearby location, availability, ratings, and fees
- Detailed doctor profiles with qualifications and patient reviews

### FR-3: Appointment Management
- Book video or in-person appointments with real-time availability
- Automatic confirmations, rescheduling, cancellation, and reminders

### FR-4: Test Booking & At-Home Collection
- Browse and book lab tests
- Option for at-home sample collection with address, time slot, and tracking (sample collected → processing → report ready)

### FR-5: Payment Processing
- Secure payments for appointments, tests, and related services
- Payment history and digital receipts

### FR-6: E-Prescription Module
- Doctors can create, review, digitally sign, and issue e-prescriptions during or after consultations
- Patients can view, download, print, or share prescriptions securely
- Prescriptions linked automatically to the patient's digital record
- Option to send prescription directly to the patient via notification or in-app
- Basic medication instructions and refill reminders (where applicable)

### FR-7: Digital Medical Records Module
- Secure storage of patient health information including consultation notes, prescriptions, lab/test reports, allergies, and medical history
- Patients can view, upload (e.g., previous reports), and manage their own records
- Authorized doctors can access relevant records during consultations (with patient consent)
- Version history and audit trail for changes
- Easy sharing of records with other healthcare providers when needed
- Search and filter within personal records

### FR-8: Notification System
- Timely alerts for appointments, test status, prescription issuance, record updates, and payments

### FR-9: Admin Features
- Oversight of users, doctors, basic content (tests list), and high-level reports on usage

---

## 4. Non-Functional Requirements

### NFR-1: Performance
- Page load times under 2 seconds
- API response times under 500ms for standard queries

### NFR-2: Scalability
- Monorepo architecture supports independent scaling of frontend and backend

### NFR-3: Security (Enhanced)
- Strong encryption for sensitive data (prescriptions and medical records)
- Role-based access control with patient consent for record sharing
- Audit logs for all access and modifications to records/prescriptions
- Compliance with basic privacy standards relevant to Bangladesh telemedicine guidelines

### NFR-4: Usability
- Intuitive flows so patients can easily view their records or prescriptions without confusion
- Calm, minimal interface with clear icons and soft teal/blue tones

### NFR-5: Data Integrity & Backup
- Reliable storage and regular backups of medical records and prescriptions
- Mechanisms to prevent data loss or unauthorized changes

---

## 5. External Interface Requirements

- **User Interface:** Reassuring, airy design that makes viewing records or prescriptions feel safe and simple
- **Software Interfaces:** Secure API endpoints for prescription generation and record access
- **Communication:** Notifications and secure document sharing (PDF downloads, in-app viewing)

---

## 6. Validation & Traceability

Requirements will be tested through:
- Functional testing of e-prescription creation/sharing and record access
- Security and privacy testing (especially for health data)
- User acceptance testing with patients and doctors to ensure the experience feels supportive and transparent

---

## Conclusion & Future Work

With the addition of e-prescriptions and digital medical records, careXpatient now offers a more complete, continuous care experience — from finding a doctor to receiving treatment and keeping everything safely documented in one place.

This keeps the platform focused, achievable, and truly helpful while building a strong foundation. Future phases can add deeper analytics, hospital links, or advanced features based on user feedback.
