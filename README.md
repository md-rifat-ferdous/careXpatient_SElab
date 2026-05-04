# careXpatient — Reports Feature Integration

## Overview

This branch (`feature/integrate-reports`) integrates a fully functional, dynamic **Medical Reports Dashboard** into the careXpatient patient portal. The dashboard replaces the previous static HTML prototype with a production-ready Next.js page backed by an Express + PostgreSQL API.

---

## ✨ Features Implemented

### 🔬 Lab Test Data Integration
- Extended the `LabTest` Prisma model with rich metadata fields: `category`, `tag`, `tagColor`, `description`, `prerequisites`, `deliveryTime`
- Seeded **40+ real-world lab test orders** (CBC, Lipid Profile, HbA1c, LFT, Thyroid, Vitamin D, Echocardiogram, Chest X-Ray) across multiple labs

### 🗂️ Dynamic Reports Dashboard (`/reports`)
- Converted `report_dashboard.html` → `apps/landing-page/src/app/reports/page.tsx` (Next.js App Router)
- Fetches live data from the Express backend via Next.js API rewrites (no CORS issues)
- Displays reports split into **Recent** (last 7 days) and **Older** sections

### 🔍 Advanced Filtering
| Filter | Description |
|--------|-------------|
| **Search** | Filter by test name or report ID |
| **By Lab** | careX Lab, Metro Diagnostics, Labaid, Popular, Ibn Sina |
| **By Date** | Last 30 Days, All Time, Last 6 Months, 2025 Reports |
| **By Test Type** | Blood Work, Imaging, Cardiac, Full Body Checkup |

All filters work **together** and automatically reset pagination to page 1.

### 📄 Server-Side Pagination
- Backend `/api/reports` supports `page` and `limit` query params
- Uses Prisma `skip`/`take` for efficient DB-level slicing
- Returns `{ data, total, page, limit }` paginated response
- Frontend renders dynamic page number buttons with Prev/Next controls
- Buttons auto-disable at boundaries (first/last page)

---

## 🏗️ Architecture

```
careXpatient (Turborepo Monorepo)
├── apps/
│   └── landing-page/          # Next.js 16 (Patient Portal)
│       ├── src/app/reports/
│       │   └── page.tsx       # ✅ Dynamic Reports Dashboard
│       └── next.config.ts     # ✅ API proxy → Express :5000
├── backend/                   # Express.js REST API
│   └── src/
│       ├── routes/reports.ts  # ✅ /api/reports with pagination + filters
│       ├── utils/prisma.ts    # ✅ Prisma client singleton
│       └── server.ts          # ✅ Entry point (port 5000)
└── packages/
    └── prisma/
        ├── schema.prisma      # ✅ Enhanced LabTest model
        └── seed.ts            # ✅ 40+ seeded lab orders
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)

### 1. Clone & Install
```bash
git clone https://github.com/md-rifat-ferdous/careXpatient_SElab.git
cd careXpatient_SElab
npm install
```

### 2. Environment Setup
Create a `.env` file in `backend/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/carexpatient"
JWT_SECRET="your-secret-key"
PORT=5000
```

### 3. Database Setup
```bash
# Push schema to database
cd packages/prisma
npx prisma db push

# Seed with sample data (40+ lab orders)
cd ../../
npx tsx packages/prisma/seed.ts
```

### 4. Run Development Servers
```bash
# Start all apps (frontend + backend) together
npx turbo dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 5. View Reports Dashboard
Navigate to: **http://localhost:3000/reports**

---

## 📡 API Reference

### `GET /api/reports`

Returns paginated lab reports for the authenticated patient.

**Query Parameters:**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `5` | Records per page |
| `search` | `""` | Filter by test name or report ID |
| `lab` | `"All Laboratories"` | Filter by lab name |
| `date` | `"Last 30 Days"` | Date range filter |
| `type` | `"All Types"` | Filter by test category |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Complete Blood Count (CBC)",
      "labName": "Popular Diagnostic Center",
      "date": "May 02, 2026",
      "status": "Reported",
      "fileUrl": "https://..."
    }
  ],
  "total": 40,
  "page": 1,
  "limit": 5
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Monorepo | Turborepo |

---

## 👥 Team

- **afia-jahin** — arafiu2330256@bscse.uiu.ac.bd  
- **md-rifat-ferdous** — (repository owner)
