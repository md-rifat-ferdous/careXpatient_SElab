import { Router, Request, Response } from 'express';
import prisma from '../../config/prisma';
import { resolveLabId } from './labHelper';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const lab = await prisma.lab.findUnique({
      where: { id: labId },
      include: { user: { select: { id: true, email: true, phone: true, fullName: true } } },
    });

    if (!lab) return res.status(404).json({ error: 'Lab not found' });

    res.json({
      id: lab.id.toString(),
      name: lab.name,
      address: lab.address,
      phone: lab.phone,
      email: lab.user.email,
      fullName: lab.user.fullName,
    });
  } catch (error: any) {
    console.error('GET /api/lab/settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.put('/profile', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const { name, address, phone, email, fullName } = req.body;

    const lab = await prisma.lab.findUnique({ where: { id: labId }, select: { userId: true } });
    if (!lab) return res.status(404).json({ error: 'Lab not found' });

    await prisma.$transaction([
      prisma.lab.update({ where: { id: labId }, data: { name, address, phone } }),
      prisma.user.update({ where: { id: lab.userId }, data: { email, fullName } }),
    ]);

    res.json({ success: true });
  } catch (error: any) {
    console.error('PUT /api/lab/settings/profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const labId = await resolveLabId(req.query);
    if (!labId) return res.status(400).json({ error: 'labId or userId query param is required' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    const lab = await prisma.lab.findUnique({ where: { id: labId }, select: { userId: true } });
    if (!lab) return res.status(404).json({ error: 'Lab not found' });

    const user = await prisma.user.findUnique({ where: { id: lab.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    await prisma.user.update({ where: { id: lab.userId }, data: { password: newPassword } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/lab/settings/change-password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
