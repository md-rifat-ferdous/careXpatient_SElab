-- =============================================
-- careXpatient Database Schema (Revised)
-- PostgreSQL + Prisma-ready
-- =============================================

-- Enums
CREATE TYPE "UserRole" AS ENUM (
  'Patient', 'Doctor', 'LabTech', 'Nurse', 'Admin'
);

CREATE TYPE "AppointmentType" AS ENUM (
  'In-person', 'Online'
);

CREATE TYPE "AppointmentStatus" AS ENUM (
  'Pending', 'Confirmed', 'Completed', 'Cancelled', 'NoShow'
);

CREATE TYPE "PaymentGateway" AS ENUM (
  'bKash', 'Nagad', 'SSLCommerz'
);

CREATE TYPE "OrderType" AS ENUM (
  'Appointment', 'LabOrder'
);

CREATE TYPE "LabOrderStatus" AS ENUM (
  'Requested', 'AcceptedByLab', 'SampleCollected', 
  'Processing', 'Reported', 'Cancelled'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'Pending', 'Paid', 'Failed', 'Refunded'
);

-- Tables
CREATE TABLE "User" (
  "id" BIGSERIAL PRIMARY KEY,
  "phone" VARCHAR(15) UNIQUE NOT NULL,
  "email" VARCHAR(255),
  "full_name" VARCHAR(255),
  "role" "UserRole" NOT NULL,
  "is_verified" BOOLEAN DEFAULT FALSE,
  "nid_number" VARCHAR(20),
  "profile_photo_url" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "Patient" (
  "id" BIGSERIAL PRIMARY KEY,
  "user_id" BIGINT UNIQUE NOT NULL,
  "date_of_birth" DATE,
  "blood_group" VARCHAR(10),
  "address" TEXT,
  "allergies" TEXT,
  "medical_history" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "Doctor" (
  "id" BIGSERIAL PRIMARY KEY,
  "user_id" BIGINT UNIQUE NOT NULL,
  "bmdc_number" VARCHAR(50) UNIQUE,
  "qualification" TEXT,
  "experience_years" INT,
  "fee" NUMERIC(10,2),
  "about" TEXT,
  "rating" NUMERIC(3,2) DEFAULT 0,
  "review_count" INT DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "Specialty" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE "DoctorSpecialty" (
  "doctor_id" BIGINT NOT NULL,
  "specialty_id" INT NOT NULL,
  PRIMARY KEY ("doctor_id", "specialty_id")
);

CREATE TABLE "Clinic" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "address" TEXT,
  "phone" VARCHAR(15),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "DoctorClinic" (
  "doctor_id" BIGINT NOT NULL,
  "clinic_id" BIGINT NOT NULL,
  PRIMARY KEY ("doctor_id", "clinic_id")
);

CREATE TABLE "Appointment" (
  "id" BIGSERIAL PRIMARY KEY,
  "patient_id" BIGINT NOT NULL,
  "doctor_id" BIGINT NOT NULL,
  "clinic_id" BIGINT,
  "type" "AppointmentType" NOT NULL,
  "status" "AppointmentStatus" DEFAULT 'Pending',
  "date" DATE NOT NULL,
  "time_slot" TIME NOT NULL,
  "duration_minutes" INT DEFAULT 30,
  "reason_for_visit" TEXT,
  "cancellation_reason" TEXT,
  "cancelled_by" BIGINT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "Consultation" (
  "id" BIGSERIAL PRIMARY KEY,
  "appointment_id" BIGINT UNIQUE NOT NULL,
  "start_time" TIMESTAMPTZ,
  "end_time" TIMESTAMPTZ,
  "notes" TEXT,                    --Doctors consultation notes (may suggest labs)
  "video_room_id" VARCHAR(100),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "Prescription" (
  "id" BIGSERIAL PRIMARY KEY,
  "consultation_id" BIGINT UNIQUE NOT NULL,
  "medicines_text" TEXT,
  "advice_text" TEXT,
  "diagnosis" TEXT,
  "file_url" TEXT,                 -- Signed PDF/image (use signed temporary URLs)
  "digital_signature" TEXT,
  "issued_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "LabTest" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "price" NUMERIC(10,2),
  "sample_type" VARCHAR(100)
);

CREATE TABLE "Lab" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "address" TEXT,
  "phone" VARCHAR(15),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "LabOrder" (
  "id" BIGSERIAL PRIMARY KEY,
  "patient_id" BIGINT NOT NULL,
  "lab_id" BIGINT NOT NULL,
  "status" "LabOrderStatus" DEFAULT 'Requested',
  "total_amount" NUMERIC(10,2),
  "home_collection" BOOLEAN DEFAULT FALSE,
  "collection_address" TEXT,
  "collection_slot" TIME,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "LabOrderTest" (
  "lab_order_id" BIGINT NOT NULL,
  "lab_test_id" BIGINT NOT NULL,
  PRIMARY KEY ("lab_order_id", "lab_test_id")
);

CREATE TABLE "LabResult" (
  "id" BIGSERIAL PRIMARY KEY,
  "lab_order_id" BIGINT NOT NULL,
  "result_summary" TEXT,
  "file_url" TEXT,                 -- Main digital PDF report
  "uploaded_at" TIMESTAMPTZ DEFAULT NOW(),
  "uploaded_by" VARCHAR(100)       -- e.g. "Lab staff" or "Patient uploaded"
);

CREATE TABLE "Payment" (
  "id" BIGSERIAL PRIMARY KEY,
  "order_type" "OrderType" NOT NULL,
  "order_id" BIGINT NOT NULL,
  "amount" NUMERIC(10,2) NOT NULL,
  "gateway" "PaymentGateway",
  "transaction_id" VARCHAR(100),
  "status" "PaymentStatus" DEFAULT 'Pending',
  "paid_at" TIMESTAMPTZ,
  "refund_reason" TEXT
);

-- Comments (for documentation & Prisma)
COMMENT ON COLUMN "User"."role" IS 'Patient, Doctor, LabTech, Nurse, Admin';
COMMENT ON COLUMN "Doctor"."bmdc_number" IS 'Bangladesh Medical & Dental Council registration number';
COMMENT ON COLUMN "Doctor"."fee" IS 'Consultation fee in BDT';
COMMENT ON COLUMN "Consultation"."notes" IS 'Doctor''s consultation notes – can include suggested lab tests';
COMMENT ON COLUMN "Consultation"."video_room_id" IS 'For online consultations';
COMMENT ON COLUMN "Prescription"."advice_text" IS 'Advice & instructions – frequently used to suggest lab tests e.g. "Please do CBC, RBS, Lipid Profile"';
COMMENT ON COLUMN "Prescription"."diagnosis" IS 'Doctor''s diagnosis';
COMMENT ON COLUMN "Prescription"."file_url" IS 'URL to signed PDF/image of prescription (use signed temporary URLs)';
COMMENT ON COLUMN "LabTest"."price" IS 'Reference/approximate price – shown to patient';
COMMENT ON COLUMN "LabOrder"."status" IS 'Requested, AcceptedByLab, SampleCollected, Processing, Reported, Cancelled';
COMMENT ON COLUMN "LabOrder"."total_amount" IS 'Estimated amount shown to patient – actual billing by lab';
COMMENT ON COLUMN "LabResult"."file_url" IS 'Digital PDF report provided by the lab – main storage point';
COMMENT ON COLUMN "LabResult"."uploaded_by" IS 'e.g. "Lab staff" or "Patient uploaded" – for pilot tracking';
COMMENT ON COLUMN "Payment"."amount" IS 'Platform service fee – lab/doctor handles own billing';
COMMENT ON COLUMN "Payment"."status" IS 'Pending, Paid, Failed, Refunded';

-- Foreign Keys
ALTER TABLE "Patient" ADD CONSTRAINT fk_patient_user FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Doctor" ADD CONSTRAINT fk_doctor_user FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Appointment" ADD CONSTRAINT fk_appointment_patient FOREIGN KEY ("patient_id") REFERENCES "Patient"("id");
ALTER TABLE "Appointment" ADD CONSTRAINT fk_appointment_doctor FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id");
ALTER TABLE "Appointment" ADD CONSTRAINT fk_appointment_clinic FOREIGN KEY ("clinic_id") REFERENCES "Clinic"("id");

ALTER TABLE "Consultation" ADD CONSTRAINT fk_consultation_appointment FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE;

ALTER TABLE "Prescription" ADD CONSTRAINT fk_prescription_consultation FOREIGN KEY ("consultation_id") REFERENCES "Consultation"("id") ON DELETE CASCADE;

ALTER TABLE "LabOrder" ADD CONSTRAINT fk_laborder_patient FOREIGN KEY ("patient_id") REFERENCES "Patient"("id");
ALTER TABLE "LabOrder" ADD CONSTRAINT fk_laborder_lab FOREIGN KEY ("lab_id") REFERENCES "Lab"("id");

ALTER TABLE "LabResult" ADD CONSTRAINT fk_labresult_laborder FOREIGN KEY ("lab_order_id") REFERENCES "LabOrder"("id") ON DELETE CASCADE;

ALTER TABLE "DoctorSpecialty" ADD CONSTRAINT fk_ds_doctor FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE;
ALTER TABLE "DoctorSpecialty" ADD CONSTRAINT fk_ds_specialty FOREIGN KEY ("specialty_id") REFERENCES "Specialty"("id") ON DELETE CASCADE;

ALTER TABLE "DoctorClinic" ADD CONSTRAINT fk_dc_doctor FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE;
ALTER TABLE "DoctorClinic" ADD CONSTRAINT fk_dc_clinic FOREIGN KEY ("clinic_id") REFERENCES "Clinic"("id") ON DELETE CASCADE;

ALTER TABLE "LabOrderTest" ADD CONSTRAINT fk_lot_laborder FOREIGN KEY ("lab_order_id") REFERENCES "LabOrder"("id") ON DELETE CASCADE;
ALTER TABLE "LabOrderTest" ADD CONSTRAINT fk_lot_labtest FOREIGN KEY ("lab_test_id") REFERENCES "LabTest"("id") ON DELETE CASCADE;

-- Useful Indexes
CREATE INDEX idx_appointment_date_doctor ON "Appointment"("date", "doctor_id");
CREATE INDEX idx_appointment_patient ON "Appointment"("patient_id");
CREATE INDEX idx_doctor_bmdc ON "Doctor"("bmdc_number");
CREATE INDEX idx_user_phone ON "User"("phone");
CREATE INDEX idx_laborder_patient ON "LabOrder"("patient_id");

-- Optional: Updated_at trigger (example for one table; replicate as needed)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Add similar triggers for other tables with updated_at