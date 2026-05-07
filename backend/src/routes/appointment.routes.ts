import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

// POST /api/appointments - Create a new appointment
router.post('/', async (req, res) => {
  try {
    const { doctorId, patientId, type, date, timeSlot } = req.body;

    // Validate inputs
    if (!doctorId || !patientId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real app, date and timeSlot would need strict parsing/validation
    const appointmentDate = new Date(date);
    const appointmentTime = new Date(timeSlot);

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: BigInt(doctorId),
        patientId: BigInt(patientId),
        type: type === 'Online' ? 'Online' : 'In_person',
        status: 'Pending',
        date: appointmentDate,
        timeSlot: appointmentTime,
      },
    });

    // Handle BigInt serialization
    const serializedAppointment = JSON.parse(JSON.stringify(appointment, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.status(201).json(serializedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
