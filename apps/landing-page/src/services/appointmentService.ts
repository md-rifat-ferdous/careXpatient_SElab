import { AppointmentPayload, AppointmentResult } from '../types/appointment';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory store (replaced by POST /api/appointments when backend is ready)
// ─────────────────────────────────────────────────────────────────────────────
const appointmentStore: AppointmentResult[] = [];

export async function createAppointment(
  payload: AppointmentPayload
): Promise<AppointmentResult> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 400));

  const appointment: AppointmentResult = {
    id: `appt-${Date.now()}`,
    doctorId: payload.doctorId,
    patientName: payload.patientName,
    patientPhone: payload.patientPhone,
    consultationType: payload.consultationType,
    date: payload.date,
    timeSlot: payload.timeSlot,
    notes: payload.notes,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  appointmentStore.push(appointment);

  // TODO: replace body with:
  // const res = await fetch('/api/appointments', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return res.json();

  return appointment;
}

export async function getAppointments(): Promise<AppointmentResult[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...appointmentStore];
}
