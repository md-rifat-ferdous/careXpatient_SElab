# careXpatient — Healthcare Platform 🏥

A full-stack, production-ready healthcare web application built with **Next.js (App Router)**, **Tailwind CSS**, **Prisma**, and **SQLite**. Designed pixel-accurately from the Google Stitch Design System (`ID: 16198765292045359504`).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database & Seed Data
```bash
npx prisma db push
node prisma/seed.js
```
This creates a local SQLite database and seeds it with:
- 4 Diagnostic Labs
- 8 Lab Tests (Blood, Imaging, Cardiac, Full Body Checkup)
- 1 Demo User (`phone: 01700000000`, `password: password123`)

### 3. Start the Dev Server
```bash
npm run dev
```

Open → `http://localhost:3000`

---

## 🗂️ Pages

| Route | Description |
|---|---|
| `/` | Landing page (Hero, Steps, Services, Doctors, Testimonials) |
| `/dashboard/lab-tests` | Interactive Lab Test booking dashboard |

---

## 📡 API Endpoints

### `GET /api/lab-tests`
Fetch all tests. Supports filtering and search.
- `?category=Blood` — filter by category (`Blood`, `Imaging`, `Cardiac`, `Full Body Checkup`, `All`)
- `?search=CBC` — search by name or description

### `POST /api/auth/register`
Register a new user.
```json
{ "fullName": "Jane Doe", "phone": "01722222222", "password": "securepassword" }
```

### `POST /api/auth/login`
Login and receive a JWT.
```json
{ "phone": "01700000000", "password": "password123" }
```

### `POST /api/orders` _(Protected — requires Bearer token)_
Place an order.
```json
{
  "items": [{ "testId": "...", "price": 1200 }],
  "subtotal": 1200, "vat": 180,
  "homeCollectionFee": 200, "totalAmount": 1580,
  "homeCollection": true
}
```

---

## 🗄️ Database Schema (Prisma / SQLite → PostgreSQL-ready)

| Table | Description |
|---|---|
| `User` | Patient accounts with JWT auth |
| `Lab` | Diagnostic center info |
| `LabTest` | Tests with category, pricing, delivery info |
| `Order` | Patient orders with subtotal, VAT, home collection |
| `OrderItem` | Junction table linking orders to tests |

### Switching to PostgreSQL for Production
Edit `prisma/schema.prisma`:
```diff
datasource db {
- provider = "sqlite"
- url      = "file:./dev.db"
+ provider = "postgresql"
+ url      = env("DATABASE_URL")
}
```
Then run: `npx prisma migrate dev --name init`

---

## 🎨 Design System (from Stitch ID: 16198765292045359504)

| Token | Value |
|---|---|
| Primary Teal | `#14B8A6` / `#006b5f` |
| Background | `#F8FAFC` |
| Text | `#111c2d` |
| Font | Inter |
| Border Radius | 8px (cards: 16–24px) |

---

## 🧩 Component Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/route.ts     # JWT login
│   │   ├── auth/register/route.ts  # User registration
│   │   ├── lab-tests/route.ts      # Fetch tests (filter + search)
│   │   └── orders/route.ts         # Place order (protected)
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar layout
│   │   └── lab-tests/page.tsx      # Dashboard page (API-connected)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Landing page
├── components/
│   └── lab-tests/
│       ├── LabTestCard.tsx         # Test card component
│       ├── LabTestModal.tsx        # Detail modal
│       ├── OrderSummary.tsx        # Real-time cart panel (Zustand)
│       ├── PriceSlider.tsx         # Price range filter
│       └── Sidebar.tsx             # Dashboard nav sidebar
└── store/
    └── cartStore.ts                # Zustand cart state (persisted)
```
