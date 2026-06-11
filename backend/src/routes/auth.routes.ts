import { Router, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        role: true,
        profilePhotoUrl: true,
        patient: {
          select: {
            id: true,
            bloodGroup: true,
            address: true,
          }
        },
        doctor: {
          select: {
            id: true,
            qualification: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const serialized = JSON.parse(JSON.stringify(user, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error('Error fetching /me:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
