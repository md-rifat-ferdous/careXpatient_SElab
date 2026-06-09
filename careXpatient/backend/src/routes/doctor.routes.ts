import { Router } from 'express';
import prisma from '../config/prisma';
import {
  getDoctorAppointments,
  getDoctorStats,
  getDoctorPatients,
  getDoctorPatientDetail,
} from '../controllers/doctor.controller';

const router = Router();

// ─── Doctor Listing & Discovery ───────────────────────────────────────────────

// GET /api/doctors — Fetch all doctors with optional filters
router.get('/', async (req, res) => {
  try {
    const { specialty, experience, feeMax, ratingMin, sortBy } = req.query;

    const where: any = { deletedAt: null };

    if (experience) {
      where.experienceYears = { gte: parseInt(experience as string, 10) };
    }

    if (feeMax) {
      where.fee = { lte: parseFloat(feeMax as string) };
    }

    if (ratingMin) {
      where.rating = { gte: parseFloat(ratingMin as string) };
    }

    if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
      where.specialties = {
        some: { specialty: { name: specialty as string } },
      };
    }

    let orderBy: any = {};
    if (sortBy === 'rating')      orderBy = { rating: 'desc' };
    else if (sortBy === 'fee_asc') orderBy = { fee: 'asc' };
    else if (sortBy === 'experience') orderBy = { experienceYears: 'desc' };
    else orderBy = { createdAt: 'desc' };

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: { select: { fullName: true, profilePhotoUrl: true } },
        specialties: { include: { specialty: true } },
      },
      orderBy,
    });

    const serialized = JSON.parse(JSON.stringify(doctors, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(serialized);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/doctors/specialties — Fetch all available specialties
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await prisma.specialty.findMany();
    res.json(specialties);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Doctor Portal — Appointment Management ───────────────────────────────────

// GET /api/doctors/:userId/appointments — Fetch appointments for the logged-in doctor
router.get('/:userId/appointments', getDoctorAppointments);

// GET /api/doctors/:userId/stats — Fetch appointment status counts for the dashboard
router.get('/:userId/stats', getDoctorStats);

// GET /api/doctors/:userId/patients — List distinct patients who have had appointments with this doctor
router.get('/:userId/patients', getDoctorPatients);

// GET /api/doctors/:userId/patients/:patientId — Fetch patient profile + shared appointment history
router.get('/:userId/patients/:patientId', getDoctorPatientDetail);

export default router;
