# Project Briefing: careXpatient

Welcome to the **careXpatient** development team. This document provides an overview of the project, module assignments, workflow, and remaining tasks to ensure a smooth transition and collaborative environment.

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

## 2. Module Assignments & Architecture
The project follows a **Monorepo** structure managed by **Turborepo** for scalability and code sharing.

- **`apps/landing-page`**:
  - **Framework**: Next.js (App Router).
  - **Purpose**: Main portal for patients, including the landing page, search functionality, and patient-facing workflows.
- **`packages/ui`**:
  - **Framework**: React + Tailwind CSS.
  - **Purpose**: Shared design system and UI component library. Ensures visual consistency across all modules.
- **`packages/config-tailwind`**: Shared Tailwind CSS configuration.
- **`packages/config-typescript`**: Shared TypeScript configuration.
- **`database.sql`**: PostgreSQL schema definition for the entire platform.

## 3. Local Setup & Development
To get started with the codebase locally:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/md-rifat-ferdous/careXpatient_SElab.git
    cd careXpatient_SElab
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *This will start all applications (landing-page) and watch for changes in packages (ui).*
4.  **Database Setup**:
    - Ensure PostgreSQL is running.
    - Execute `database.sql` to initialize the schema.
    - (Future) Prisma integration will handle migrations.

## 4. Development Workflow
- **Branching Strategy**: Use descriptive feature branches.
  - `feat/feature-name`
  - `fix/bug-description`
  - `chore/task-name`
- **Linting & Formatting**: Automated via Turbo. Run `npm run lint` before committing.
- **Component Development**: Add new components to `packages/ui` to make them reusable.

## 5. Remaining Tasks & Roadmap
We are currently in the early implementation phase. The following modules are prioritized:
- [ ] **Authentication**: Implement JWT/NextAuth for secure login.
- [ ] **Dashboard Implementation**: Build dashboards for Patients and Doctors.
- [ ] **Booking Flow**: Finalize the appointment scheduling logic.
- [ ] **Lab Integration**: Connect the UI with Lab Order workflows.
- [ ] **Payment Integration**: Integrate SSLCommerz and local MFS (bKash/Nagad).

## 6. Code Push Procedure
1.  Check out a new branch: `git checkout -b <branch-name>`
2.  Stage changes: `git add .`
3.  Commit changes: `git commit -m "type: description"`
4.  Push to origin: `git push origin <branch-name>`
5.  Open a Pull Request (PR) on GitHub for review.

---
**Note**: AI-related metadata and internal tool configurations have been excluded from the repository via `.gitignore` to maintain a clean codebase.
