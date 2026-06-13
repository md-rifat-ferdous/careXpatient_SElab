import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { resolveLabId } from './labHelper';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    const search = (req.query.search as string) || '';
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const patients = await prisma.patient.findMany({
      where: {
        labOrders: { some: { labId } },
        ...(search ? { user: { fullName: { contains: search, mode: 'insensitive' } } } : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true, profilePhotoUrl: true } },
        labOrders: { where: { labId }, orderBy: { createdAt: 'desc' }, take: 1, select: { id: true, createdAt: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = patients.map(p => ({
      id: p.user.id.toString(),
      fullName: p.user.fullName || 'Unknown',
      phone: p.user.phone,
      email: p.user.email,
      profilePhotoUrl: p.user.profilePhotoUrl,
      dateOfBirth: p.dateOfBirth,
      bloodGroup: p.bloodGroup,
      address: p.address,
      totalOrders: p.labOrders.length,
      lastOrder: p.labOrders[0] || null,
    }));

    res.json(result);
  } catch (error: any) {
    console.error('GET /api/lab/patients error:', error);
    res.status(500).json({ error: 'Failed to load patients' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    const userId = BigInt(req.params.id);
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true, profilePhotoUrl: true } },
        labOrders: {
          where: { labId },
          include: {
            tests: { include: { labTest: true } },
            labResults: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    res.json({
      id: patient.user.id.toString(),
      fullName: patient.user.fullName || 'Unknown',
      phone: patient.user.phone,
      email: patient.user.email,
      profilePhotoUrl: patient.user.profilePhotoUrl,
      dateOfBirth: patient.dateOfBirth,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      orders: patient.labOrders.map(o => ({
        id: o.id.toString(),
        status: o.status,
        tests: o.tests.map(t => t.labTest.name),
        totalAmount: o.totalAmount ? Number(o.totalAmount) : 0,
        createdAt: o.createdAt,
        hasResult: o.labResults.length > 0,
      })),
    });
  } catch (error: any) {
    console.error('GET /api/lab/patients/:id error:', error);
    res.status(500).json({ error: 'Failed to load patient profile' });
  }
});

export default router;
