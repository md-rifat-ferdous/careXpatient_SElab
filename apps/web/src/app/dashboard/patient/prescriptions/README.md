
# Prescription Management Feature

This module provides a comprehensive system for patients to view, filter, and download their digital prescriptions.

## 📁 Folder Structure

- `page.tsx`: Main page component handling state and API coordination.
- `[id]/print/page.tsx`: Specialized view for PDF generation.
- `components/`:
  - `PrescriptionList.tsx`: High-density table view.
  - `PrescriptionFilters.tsx`: Search, Doctor, and Date filtering UI.
  - `PrescriptionDetailView.tsx`: Full prescription layout with Print/Download actions.

## 🛠️ Key Features

1. **Real-time Filters**:
   - Search by ID, Diagnosis, or Medicine.
   - Filter by Doctor.
   - Precision Date Range filtering (UTC synchronized).

2. **PDF Generation**:
   - Integrated with backend Puppeteer service.
   - Generates A4-ready medical documents.

3. **High-Density UI**:
   - Optimized for healthcare dashboards to show maximum information with minimum scrolling.

## 🔌 API Dependencies

- `GET /api/prescriptions`: List all prescriptions with pagination and filters.
- `GET /api/prescriptions/:id`: Get full details for a single record.
- `GET /api/prescriptions/:id/pdf`: Download the prescription as a PDF.
- `GET /api/prescriptions/doctors`: List doctors for the filter dropdown.
