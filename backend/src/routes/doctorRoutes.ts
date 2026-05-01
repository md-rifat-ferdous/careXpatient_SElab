import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// GET /api/doctors - Fetch doctors with filters
router.get('/', async (req, res) => {
  try {
    const { specialty, experience, feeMax } = req.query;

    const filters: any = {
      deletedAt: null,
    };

    if (experience) {
      filters.experienceYears = {
        gte: parseInt(experience as string, 10),
      };
    }

    if (feeMax) {
      filters.fee = {
        lte: parseFloat(feeMax as string),
      };
    }

    // Prepare specialty filter
    const specialtyFilter = specialty && specialty !== 'All Specialties' 
      ? { specialties: { some: { specialty: { name: specialty as string } } } } 
      : {};

    const doctors = await prisma.doctor.findMany({
      where: {
        ...filters,
        ...specialtyFilter,
      },
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
    });

    res.json(doctors);
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
