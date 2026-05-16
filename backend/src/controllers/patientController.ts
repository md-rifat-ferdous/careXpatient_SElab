import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const doctorId = req.doctor?.id;
    if (!doctorId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let whereClause: any = { doctorId };

    if (search) {
      whereClause.AND = [
        { doctorId },
        {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { phone: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } }
          ]
        }
      ];
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    // Hardcoded Realistic Dates for Demo
    const demoDates = [
      'May 15, 2024',
      'May 12, 2024',
      'Apr 28, 2024',
      'Apr 22, 2024',
      'Apr 10, 2024',
      'Mar 25, 2024',
      'Mar 08, 2024'
    ];

    const formattedPatients = patients.map((p, index) => {
      // Assign a realistic date from the demo pool
      const lastVisitStr = demoDates[index % demoDates.length];

      return {
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        email: p.email,
        lastVisit: lastVisitStr
      };
    });

    res.json(formattedPatients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id },
      include: {
        reports: { orderBy: { date: 'desc' } },
        prescriptions: { orderBy: { date: 'desc' } }
      }
    });

    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.doctor?.id;
    const { name, age, gender, phone, email } = req.body;

    if (!doctorId) {
      res.status(401).json({ message: 'Unauthorized: Doctor record missing' });
      return;
    }

    const patient = await prisma.patient.create({
      data: {
        doctorId,
        name,
        age,
        gender,
        phone,
        email,
        lastVisit: new Date()
      }
    });

    res.status(201).json(patient);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
