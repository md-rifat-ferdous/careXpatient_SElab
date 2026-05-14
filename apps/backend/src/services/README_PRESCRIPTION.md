
# Prescription Backend Service

This service handles the business logic, database queries, and PDF generation for the Prescription system.

## 🚀 Components

### 1. Routes (`src/routes/prescriptions.ts`)
- Defines the RESTful interface for the prescription system.
- Handles ID-based routing for PDF generation.

### 2. Controllers (`src/controllers/prescriptions.ts`)
- Manages request/response cycles.
- **PDF Generation**: Orchestrates Puppeteer to visit the frontend print-view and return a streamable PDF buffer.

### 3. Services (`src/services/prescriptions.ts`)
- Executes optimized Prisma queries.
- **Filtering Logic**: 
  - Handles numeric and prefixed (RX-) ID searches.
  - Implements strict day-range filtering for dates.
  - Case-insensitive searching across multiple fields.

## 🛠️ Requirements
- Requires `puppeteer-core` and a local browser instance (Edge/Chrome) for PDF generation.
- Dependent on the `Appointment` and `Prescription` models in the Prisma schema.
