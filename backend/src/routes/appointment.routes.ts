import { Router } from 'express';
import prisma from '../config/prisma';
import {
  acceptAppointment,
  declineAppointment,
} from '../controllers/doctor.controller';
import { emitStatusChange } from '../services/socket.service';

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

const serialize = (data: unknown) =>
  JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));

// ─── Patient — Create Appointment ─────────────────────────────────────────────

// POST /api/appointments — Book a new appointment (patient-facing)
router.post('/', async (req, res) => {
  try {
    const { doctorId, patientId, type, date, timeSlot, reasonForVisit } = req.body;

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

    // ── Check for double-booking ─────────────────────────────────────────
    const parsedSlot = parseTimeSlot(date, timeSlot);
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: BigInt(doctorId),
        date: new Date(date),
        timeSlot: parsedSlot,
        status: { notIn: ['Cancelled', 'Rejected'] },
      },
    });
    if (existingAppointment) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose another time.' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId:       BigInt(doctorId),
        patientId:      patient.id,
        type:           type === 'Online' ? 'Online' : 'In_person',
        status:         'Pending',
        date:           new Date(date),
        timeSlot:       parsedSlot,
        reasonForVisit: reasonForVisit || null,
      },
    });

    res.status(201).json(serialize(appointment));
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Patient — Get Own Appointments ───────────────────────────────────────────

// GET /api/appointments/patient/:userId — Fetch all appointments for the logged-in patient
router.get('/patient/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        consultation: {
          include: {
            prescription: true,
          },
        },
        doctor: {
          include: {
            user: { select: { fullName: true, profilePhotoUrl: true } },
            specialties: { include: { specialty: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: serialize(appointments) });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── Doctor — Appointment Status Management ───────────────────────────────────

// POST /api/appointments/:id/accept — Doctor approves a pending appointment → Approved
router.post('/:id/accept', acceptAppointment);

// POST /api/appointments/:id/decline — Doctor rejects with a required reason → Rejected
router.post('/:id/decline', declineAppointment);

// ─── Doctor — Complete Appointment ────────────────────────────────────────────

// POST /api/appointments/:id/complete — Doctor marks a Confirmed/In_consultation appointment as Completed
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: { consultation: true },
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    if (appointment.status !== 'Confirmed' && appointment.status !== 'In_consultation') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete an appointment with status '${appointment.status}'. Only Confirmed or In-consultation appointments can be completed.`,
      });
    }

    const now = new Date();
    const consultationStart = appointment.consultationStartedAt || appointment.consultation?.startTime || now;
    const durationMinutes = Math.round((now.getTime() - new Date(consultationStart).getTime()) / 60000);

    const consultationUpdate = appointment.consultation && !appointment.consultation.endTime
      ? { endTime: now }
      : {};

    const [updated] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id: BigInt(id) },
        data: {
          status: 'Completed',
          consultationEndedAt: now,
          consultationDuration: durationMinutes,
        },
      }),
      ...(Object.keys(consultationUpdate).length > 0
        ? [prisma.consultation.update({
            where: { id: appointment.consultation!.id },
            data: consultationUpdate,
          })]
        : []),
    ]);

    emitStatusChange(id, 'Completed', { duration: durationMinutes });

    res.json({
      success: true,
      message: 'Appointment completed successfully.',
      data: serialize(updated),
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── Doctor — Start Consultation ──────────────────────────────────────────────

// POST /api/appointments/:id/start-consultation — Start consultation for a Confirmed appointment
router.post('/:id/start-consultation', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: { consultation: true },
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    if (appointment.status !== 'Confirmed' && appointment.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot start consultation for an appointment with status '${appointment.status}'.`,
      });
    }
    if (appointment.consultation?.startTime && !appointment.consultation?.endTime) {
      return res.status(400).json({ success: false, message: 'Consultation already in progress.' });
    }

    const consultation = await prisma.consultation.upsert({
      where: { appointmentId: appointment.id },
      create: {
        appointmentId: appointment.id,
        startTime: new Date(),
      },
      update: {
        startTime: new Date(),
        endTime: null,
      },
    });

    emitStatusChange(id, 'In_consultation');

    res.status(201).json({
      success: true,
      message: 'Consultation started.',
      data: serialize(consultation),
    });
  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── Doctor — Create Prescription ─────────────────────────────────────────────

// POST /api/appointments/:id/prescription — Doctor creates a prescription for a consultation
router.post('/:id/prescription', async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, medicinesText, adviceText, notes } = req.body;

    if (!diagnosis && !medicinesText) {
      return res.status(400).json({ success: false, message: 'At least diagnosis or medicinesText is required.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: { consultation: true },
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    if (!appointment.consultation) {
      return res.status(400).json({ success: false, message: 'Consultation not started. Call start-consultation first.' });
    }

    // Update consultation notes if provided
    if (notes) {
      await prisma.consultation.update({
        where: { id: appointment.consultation.id },
        data: { notes },
      });
    }

    const existing = await prisma.prescription.findUnique({
      where: { consultationId: appointment.consultation.id },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Prescription already exists for this consultation.' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        consultationId: appointment.consultation.id,
        diagnosis: diagnosis || null,
        medicinesText: medicinesText || null,
        adviceText: adviceText || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created.',
      data: serialize(prescription),
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── Patient — Cancel Own Appointment ─────────────────────────────────────────

// POST /api/appointments/:id/cancel — Patient cancels their own appointment
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { patientUserId, reason } = req.body;

    if (!patientUserId) {
      return res.status(400).json({ success: false, message: 'patientUserId is required.' });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: BigInt(patientUserId) },
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    if (appointment.patientId.toString() !== patient.id.toString()) {
      return res.status(403).json({ success: false, message: 'This appointment does not belong to you.' });
    }
    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an appointment with status '${appointment.status}'.`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: BigInt(id) },
      data: {
        status: 'Cancelled',
        cancellationReason: reason || 'Cancelled by patient',
        cancelledBy: BigInt(patientUserId),
      },
    });

    emitStatusChange(id, 'Cancelled');

    res.json({
      success: true,
      message: 'Appointment cancelled.',
      data: serialize(updated),
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── Doctor — Reschedule Appointment ──────────────────────────────────────────

// POST /api/appointments/:id/reschedule — Doctor reschedules an appointment
router.post('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTimeSlot, reason } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({ success: false, message: 'newDate and newTimeSlot are required.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    if (appointment.status !== 'Pending' && appointment.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule an appointment with status '${appointment.status}'.`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: BigInt(id) },
      data: {
        date: new Date(newDate),
        timeSlot: parseTimeSlot(newDate, newTimeSlot),
        status: 'Rescheduled',
        cancellationReason: reason || null,
      },
    });

    emitStatusChange(id, 'Rescheduled');

    res.json({
      success: true,
      message: 'Appointment rescheduled.',
      data: serialize(updated),
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
