import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { resolveLabId } from './labHelper';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const reportedOrders = await prisma.labOrder.findMany({
      where: { labId, status: 'Reported' },
      include: { tests: { include: { labTest: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyEarnings = reportedOrders
      .filter(o => o.createdAt >= todayStart)
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const weeklyEarnings = reportedOrders
      .filter(o => o.createdAt >= weekAgo)
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const monthlyEarnings = reportedOrders
      .filter(o => o.createdAt >= monthStart)
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const testRevenueMap: Record<string, number> = {};
    reportedOrders.forEach(order => {
      order.tests.forEach(t => {
        const name = t.labTest.name;
        testRevenueMap[name] = (testRevenueMap[name] || 0) + Number(t.labTest.price || 0);
      });
    });
    const testRevenue = Object.entries(testRevenueMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      return date;
    }).reverse();

    const dailyAnalytics = last7Days.map(date => {
      const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const dayOrders = reportedOrders.filter(o => o.createdAt >= date && o.createdAt < dayEnd);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
        tests: dayOrders.reduce((sum, o) => sum + o.tests.length, 0),
      };
    });

    const transactions = reportedOrders.slice(0, 20).map(order => ({
      id: order.id.toString(),
      patientName: 'Patient',
      tests: order.tests.map(t => t.labTest.name).join(', '),
      amount: Number(order.totalAmount || 0),
      date: order.createdAt,
      status: order.status,
    }));

    res.json({
      daily: dailyEarnings,
      weekly: weeklyEarnings,
      monthly: monthlyEarnings,
      total: reportedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
      totalOrders: reportedOrders.length,
      testRevenue,
      dailyAnalytics,
      transactions,
    });
  } catch (error: any) {
    console.error('GET /api/lab/earnings error:', error);
    res.status(500).json({ error: 'Failed to load earnings' });
  }
});

export default router;
