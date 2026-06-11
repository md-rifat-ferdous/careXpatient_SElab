import { Router } from 'express';
import prisma from '../config/prisma';
import {
  acceptAppointment,
  declineAppointment,
} from '../controllers/doctor.controller';

const router = Router();

function parseTimeSlot(date: string, time: string): Date {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date(`${date}T${time}`);
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return new Date(`${date}T${String(hours).padStart(2, '0')}:${minutes}:00`);
}

// ─── Patient — Create Appointment ─────────────────────────────────────────────

// POST /api/appointments — Book a new appointment (patient-facing)
router.post('/', async (req, res) => {
  try {
    const { doctorId, patientId, type, date, timeSlot } = req.body;

    if (!doctorId || !patientId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields: doctorId, patientId, date, timeSlot.' });
    }

    // Frontend sends User.id as patientId, but Appointment expects Patient.id
    const patient = await prisma.patient.findUnique({
      where: { userId: BigInt(patientId) },
    });
    if (!patient) {
      return res.status(400).json({ error: 'Patient profile not found.' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId:  BigInt(doctorId),
        patientId: patient.id,
        type:      type === 'Online' ? 'Online' : 'In_person',
        status:    'Pending',
        date:      new Date(date),
        timeSlot:  parseTimeSlot(date, timeSlot),
      },
    });

    const serialized = JSON.parse(JSON.stringify(appointment, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.status(201).json(serialized);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Doctor — Appointment Status Management ───────────────────────────────────

// POST /api/appointments/:id/accept — Doctor accepts a pending appointment
router.post('/:id/accept', acceptAppointment);

// POST /api/appointments/:id/decline — Doctor declines with a required reason
router.post('/:id/decline', declineAppointment);

export default router;
