import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { resolveLabId } from './labHelper';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    if (!labId) {
      return res.status(400).json({ error: 'labId or userId query param is required' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todaysTests, pendingTests, completedTests, totalRevenue, allOrders, recentOrders] = await Promise.all([
      prisma.labOrder.count({ where: { labId, createdAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.labOrder.count({ where: { labId, status: { in: ['Requested', 'AcceptedByLab', 'SampleCollected', 'Processing'] } } }),
      prisma.labOrder.count({ where: { labId, status: 'Reported' } }),
      prisma.labOrder.aggregate({ where: { labId, status: 'Reported' }, _sum: { totalAmount: true } }),
      prisma.labOrder.findMany({ where: { labId }, select: { status: true } }),
      prisma.labOrder.findMany({
        where: { labId },
        include: { tests: { include: { labTest: true } }, patient: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const statusCounts = {
      Requested: allOrders.filter(o => o.status === 'Requested').length,
      AcceptedByLab: allOrders.filter(o => o.status === 'AcceptedByLab').length,
      SampleCollected: allOrders.filter(o => o.status === 'SampleCollected').length,
      Processing: allOrders.filter(o => o.status === 'Processing').length,
      Reported: allOrders.filter(o => o.status === 'Reported').length,
      Cancelled: allOrders.filter(o => o.status === 'Cancelled').length,
    };

    const recentActivities = recentOrders.map(order => ({
      id: order.id.toString(),
      patientName: order.patient.user.fullName || 'Unknown',
      tests: order.tests.map(t => t.labTest.name).join(', '),
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.json({
      todaysTests,
      pendingTests,
      completedTests,
      totalRevenue: totalRevenue._sum.totalAmount ? Number(totalRevenue._sum.totalAmount) : 0,
      statusCounts,
      recentActivities,
    });
  } catch (error: any) {
    console.error('GET /api/lab/dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;
