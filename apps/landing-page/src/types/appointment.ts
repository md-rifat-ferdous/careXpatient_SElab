// ─── Appointment ─────────────────────────────────────────────────────────────
export interface AppointmentPayload {
  doctorId: string;
  patientName: string;
  patientPhone: string;
  notes?: string;
  consultationType: 'Online' | 'In-person';
  date: string;          // ISO date string e.g. "2026-05-02"
  timeSlot: string;      // e.g. "10:00 AM"
}

export interface AppointmentResult {
  id: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  consultationType: 'Online' | 'In-person';
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
