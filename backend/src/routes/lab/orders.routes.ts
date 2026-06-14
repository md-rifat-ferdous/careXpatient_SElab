import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { resolveLabId } from './labHelper';
import { emitLabOrderStatusChange } from '../../services/socket.service';

const router = Router();

const STEP_RANGES: Record<string, { min: number; max: number }> = {
  testqueue: { min: 0, max: 2 },
  samplecollection: { min: 3, max: 6 },
  uploadreports: { min: 7, max: 9 },
};

const STATUS_FROM_STEP: Record<number, string> = {
  0: 'Requested',
  1: 'Requested',
  2: 'AcceptedByLab',
  3: 'SampleCollected',
  4: 'SampleCollected',
  5: 'Processing',
  6: 'Processing',
  7: 'Processing',
  8: 'Reported',
  9: 'Reported',
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    const module = (req.query.module as string) || '';
    const statusFilter = (req.query.status as string) || '';
    const search = (req.query.search as string) || '';
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const where: any = { labId };
    if (module && STEP_RANGES[module]) {
      const range = STEP_RANGES[module];
      where.demoStep = { gte: range.min, lte: range.max };
    }
    if (statusFilter && statusFilter !== 'All' && statusFilter !== 'all') {
      where.status = statusFilter;
    }
    if (search) {
      where.OR = [
        { patient: { user: { fullName: { contains: search, mode: 'insensitive' } } } },
        { patient: { user: { phone: { contains: search } } } },
      ];
    }

    const orders = await prisma.labOrder.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        tests: { include: { labTest: true } },
        labResults: true,
        rejection: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = orders.map(order => ({
      id: order.id.toString(),
      patientId: order.patient.user.id.toString(),
      patientName: order.patient.user.fullName || 'Unknown',
      patientPhone: order.patient.user.phone,
      status: order.status,
      demoStep: order.demoStep ?? 0,
      assignedStaff: order.assignedStaff,
      tests: order.tests.map(t => ({
        id: t.labTest.id.toString(),
        name: t.labTest.name,
        price: t.labTest.price ? Number(t.labTest.price) : 0,
      })),
      subtotal: order.subtotal ? Number(order.subtotal) : 0,
      vat: order.vat ? Number(order.vat) : 0,
      homeCollectionFee: order.homeCollectionFee ? Number(order.homeCollectionFee) : 0,
      totalAmount: order.totalAmount ? Number(order.totalAmount) : 0,
      homeCollection: order.homeCollection,
      collectionAddress: order.collectionAddress,
      collectionSlot: order.collectionSlot,
      hasResult: order.labResults.length > 0,
      rejection: order.rejection ? { reason: order.rejection.reason, note: order.rejection.note } : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('GET /api/lab/orders error:', error);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

router.patch('/:id/advance', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const order = await prisma.labOrder.findUnique({ where: { id }, select: { demoStep: true } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const nextStep = (order.demoStep ?? 0) + 1;
    const nextStatus = STATUS_FROM_STEP[nextStep] || 'Reported';

    const updated = await prisma.labOrder.update({
      where: { id },
      data: { demoStep: nextStep, status: nextStatus as any },
    });

    emitLabOrderStatusChange(req.params.id, updated.status);

    res.json({ success: true, demoStep: updated.demoStep, status: updated.status });
  } catch (error: any) {
    console.error('PATCH /api/lab/orders/:id/advance error:', error);
    res.status(500).json({ error: 'Failed to advance order' });
  }
});

router.patch('/:id/assign', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const { staffName } = req.body;
    if (!staffName) return res.status(400).json({ error: 'staffName is required' });

    const order = await prisma.labOrder.findUnique({ where: { id }, select: { demoStep: true } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let newStep = order.demoStep ?? 0;
    if (newStep < 3) newStep = 3;

    const updated = await prisma.labOrder.update({
      where: { id },
      data: { assignedStaff: staffName, demoStep: newStep, status: STATUS_FROM_STEP[newStep] as any },
    });

    emitLabOrderStatusChange(req.params.id, updated.status);

    res.json({ success: true, demoStep: updated.demoStep, status: updated.status, assignedStaff: updated.assignedStaff });
  } catch (error: any) {
    console.error('PATCH /api/lab/orders/:id/assign error:', error);
    res.status(500).json({ error: 'Failed to assign staff' });
  }
});

router.patch('/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const { reason, note } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });

    await prisma.$transaction([
      prisma.labOrder.update({ where: { id }, data: { status: 'Cancelled', demoStep: 0 } }),
      prisma.orderRejection.upsert({
        where: { labOrderId: id },
        update: { reason, note },
        create: { labOrderId: id, reason, note },
      }),
    ]);

    emitLabOrderStatusChange(req.params.id, 'Cancelled', { reason, note });

    res.json({ success: true });
  } catch (error: any) {
    console.error('PATCH /api/lab/orders/:id/reject error:', error);
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

router.patch('/:id/restore', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    await prisma.$transaction([
      prisma.orderRejection.delete({ where: { labOrderId: id } }),
      prisma.labOrder.update({ where: { id }, data: { status: 'Requested', demoStep: 1 } }),
    ]);

    emitLabOrderStatusChange(req.params.id, 'Requested');
    res.json({ success: true });
  } catch (error: any) {
    console.error('PATCH /api/lab/orders/:id/restore error:', error);
    res.status(500).json({ error: 'Failed to restore order' });
  }
});

router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const { status, demoStep } = req.body;
    const data: any = {};
    if (status) data.status = status;
    if (demoStep !== undefined) data.demoStep = demoStep;

    const updated = await prisma.labOrder.update({ where: { id }, data });
    res.json({ success: true, status: updated.status, demoStep: updated.demoStep });
  } catch (error: any) {
    console.error('PUT /api/lab/orders/:id/status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/rejections', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const rejections = await prisma.orderRejection.findMany({
      where: { labOrder: { labId } },
      include: { labOrder: { include: { patient: { include: { user: true } } } } },
      orderBy: { rejectedAt: 'desc' },
    });

    res.json(rejections.map(r => ({
      orderId: r.labOrderId.toString(),
      patientName: r.labOrder.patient.user.fullName || 'Unknown',
      reason: r.reason,
      note: r.note,
      rejectedAt: r.rejectedAt,
    })));
  } catch (error: any) {
    console.error('GET /api/lab/orders/rejections error:', error);
    res.status(500).json({ error: 'Failed to load rejections' });
  }
});

router.post('/manual-entry', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const { patientName, phone, testIds } = req.body;
    if (!patientName || !phone || !testIds?.length) {
      return res.status(400).json({ error: 'patientName, phone, and testIds are required' });
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, fullName: patientName, role: 'Patient', password: 'manual-entry' },
      });
    }

    let patient = await prisma.patient.findUnique({ where: { userId: user.id } });
    if (!patient) {
      patient = await prisma.patient.create({ data: { userId: user.id } });
    }

    const testRecords = await prisma.labTest.findMany({ where: { id: { in: testIds.map((id: string) => BigInt(id)) } } });
    const subtotal = testRecords.reduce((sum, t) => sum + Number(t.price || 0), 0);
    const vat = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + vat;

    const order = await prisma.labOrder.create({
      data: {
        patientId: patient.id,
        labId,
        status: 'AcceptedByLab',
        demoStep: 2,
        subtotal,
        vat,
        totalAmount,
        tests: { create: testRecords.map(t => ({ labTestId: t.id })) },
      },
    });

    res.status(201).json({ success: true, orderId: order.id.toString() });
  } catch (error: any) {
    console.error('POST /api/lab/orders/manual-entry error:', error);
    res.status(500).json({ error: 'Failed to create manual entry' });
  }
});

export default router;
