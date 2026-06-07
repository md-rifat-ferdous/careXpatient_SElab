import { Router } from 'express';
import prisma from '../config/prisma';
import {
  acceptAppointment,
  declineAppointment,
} from '../controllers/doctor.controller';

const router = Router();

// ─── Patient — Create Appointment ─────────────────────────────────────────────

// POST /api/appointments — Book a new appointment (patient-facing)
router.post('/', async (req, res) => {
  try {
    const { doctorId, patientId, type, date, timeSlot } = req.body;

    if (!doctorId || !patientId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields: doctorId, patientId, date, timeSlot.' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId:  BigInt(doctorId),
        patientId: BigInt(patientId),
        type:      type === 'Online' ? 'Online' : 'In_person',
        status:    'Pending',
        date:      new Date(date),
        timeSlot:  new Date(timeSlot),
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
