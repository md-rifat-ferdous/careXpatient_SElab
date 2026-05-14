
# careXpatient - Prescription Management System

This branch contains the full implementation of the Prescription Management System, including real-time filtering, professional UI density, and PDF generation.

## 🚀 Features

### 1. Advanced Real-Time Filtering
- **Smart Search**: Instantly filter prescriptions by ID (with RX- prefix support), Diagnosis, Medicine Name, or Title.
- **Doctor Filter**: Dedicated dropdown to filter records by specific healthcare professionals.
- **Precision Date Filter**: Strict day-level filtering with UTC range handling to ensure accuracy across all timezones.

### 2. Professional Healthcare UI
- **High-Density Layout**: Optimized table spacing and row height for a professional dashboard look.
- **Compact Actions**: View, Download, and Print actions consolidated for efficient workflow.
- **Mobile Responsive**: Fully responsive design that maintains density and readability on all screen sizes.

### 3. PDF Generation System
- **Server-Side Generation**: Uses Puppeteer to generate high-quality, pixel-perfect A4 PDFs.
- **Dedicated Print View**: A clean, dedicated route (`/prescriptions/[id]/print`) ensures PDFs are generated without UI clutter (sidebars, navbars, buttons).
- **One-Click Download**: Seamless integration into the UI for instant document retrieval.

## 📁 Technical Architecture

### Frontend (`apps/landing-page/`)
- `src/app/prescriptions/page.tsx`: Main logic and state coordination.
- `src/components/prescriptions/`: Modular components (List, Filters, Detail View).
- `src/app/prescriptions/[id]/print/page.tsx`: The "Clean" view for the PDF engine.

### Backend (`apps/backend/`)
- `src/routes/prescriptions.ts`: API endpoint definitions.
- `src/controllers/prescriptions.ts`: PDF generation logic and request handling.
- `src/services/prescriptions.ts`: Optimized Prisma queries for complex filtering.

### Database (`packages/prisma/`)
- `schema.prisma`: Relational mapping for Doctors, Patients, and Prescriptions.
- `seed.ts`: Updated sample data generator (Target: 2026).

## 🛠️ Setup & Usage

1. **Install Dependencies**: `npm install`
2. **Database Setup**: `npx prisma generate` and `npx prisma db seed`
3. **Run Dev Servers**: 
   - Backend: `npm run dev:backend` (runs on :5000)
   - Frontend: `npm run dev:landing` (runs on :3000)

---
*Maintained by the careXpatient Development Team (May 2026)*
