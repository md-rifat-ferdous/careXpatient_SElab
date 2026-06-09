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

// ─── Patient — Get My Appointments ────────────────────────────────────────────

// GET /api/appointments/my?patientId=xxx — Fetch all appointments for a patient
router.get('/my', async (req, res) => {
  try {
    const { patientId, status, page = '1', limit = '10' } = req.query as Record<string, string>;
    
    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const where: any = { patientId: BigInt(patientId) };
    if (status && status !== 'All') where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: {
            include: {
              user: true,
              specialties: { include: { specialty: true } }
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.appointment.count({ where }),
    ]);

    const serialized = JSON.parse(JSON.stringify(appointments, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({ data: serialized, total, page: parseInt(page), totalPages: Math.ceil(total / take) });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/appointments/:id — Get single appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: {
        doctor: { include: { user: true, specialties: { include: { specialty: true } } } },
        patient: { include: { user: true } },
        consultation: { include: { prescription: true } },
      }
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    const serialized = JSON.parse(JSON.stringify(appointment, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    res.json(serialized);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Doctor — Appointment Status Management ───────────────────────────────────

// POST /api/appointments/:id/accept — Doctor accepts a pending appointment
router.post('/:id/accept', acceptAppointment);

// POST /api/appointments/:id/decline — Doctor declines with a required reason
router.post('/:id/decline', declineAppointment);

export default router;
