import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

// GET /api/doctors - Fetch doctors with filters
router.get('/', async (req, res) => {
  try {
    const { specialty, experience, feeMax, gender, ratingMin, district, sortBy } = req.query;

    const where: any = {
      deletedAt: null,
    };

    if (experience) {
      where.experienceYears = {
        gte: parseInt(experience as string, 10),
      };
    }

    if (feeMax) {
      where.fee = {
        lte: parseFloat(feeMax as string),
      };
    }

    if (ratingMin) {
      where.rating = {
        gte: parseFloat(ratingMin as string),
      };
    }

    // Specialty filter
    if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
      where.specialties = {
        some: {
          specialty: {
            name: specialty as string,
          },
        },
      };
    }

    // Gender and District are not yet in the Prisma schema as separate fields,
    // so we'll simulate them if needed or just return.
    // For now, let's keep it simple.

    // Handle Sorting
    let orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'fee_asc') {
      orderBy = { fee: 'asc' };
    } else if (sortBy === 'experience') {
      orderBy = { experienceYears: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            profilePhotoUrl: true,
          },
        },
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
      orderBy,
    });

    // Handle BigInt serialization
    const serializedDoctors = JSON.parse(JSON.stringify(doctors, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(serializedDoctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/doctors/specialties - Fetch available specialties
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await prisma.specialty.findMany();
    res.json(specialties);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
