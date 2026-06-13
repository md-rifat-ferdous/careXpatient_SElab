import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../../config/prisma';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|png|jpg|jpeg|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, ext);
  },
});

router.post('/upload', upload.single('reportFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, fileUrl, filename: req.file.originalname });
  } catch (error: any) {
    console.error('POST /api/lab/reports/upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { orderId, fileUrl, resultSummary, uploadedBy } = req.body;
    if (!orderId || !fileUrl) {
      return res.status(400).json({ error: 'orderId and fileUrl are required' });
    }

    const id = BigInt(orderId);
    const order = await prisma.labOrder.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await prisma.$transaction([
      prisma.labResult.upsert({
        where: { labOrderId: id },
        update: { fileUrl, resultSummary, uploadedBy },
        create: { labOrderId: id, fileUrl, resultSummary, uploadedBy },
      }),
      prisma.labOrder.update({
        where: { id },
        data: { status: 'Reported', demoStep: 9 },
      }),
    ]);

    res.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/lab/reports/verify error:', error);
    res.status(500).json({ error: 'Failed to verify report' });
  }
});

router.post('/send', async (req: Request, res: Response) => {
  try {
    const { orderId, sentTo, channel } = req.body;
    if (!orderId || !sentTo || !channel) {
      return res.status(400).json({ error: 'orderId, sentTo, and channel are required' });
    }

    await prisma.reportDispatchLog.create({
      data: {
        labOrderId: BigInt(orderId),
        sentTo,
        channel,
        status: 'Sent',
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/lab/reports/send error:', error);
    res.status(500).json({ error: 'Failed to send report' });
  }
});

router.get('/dispatch-logs/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = BigInt(req.params.orderId);
    const logs = await prisma.reportDispatchLog.findMany({
      where: { labOrderId: orderId },
      orderBy: { sentAt: 'desc' },
    });

    res.json(logs.map(l => ({
      id: l.id.toString(),
      sentTo: l.sentTo,
      channel: l.channel,
      sentAt: l.sentAt,
      status: l.status,
    })));
  } catch (error: any) {
    console.error('GET /api/lab/reports/dispatch-logs/:orderId error:', error);
    res.status(500).json({ error: 'Failed to load dispatch logs' });
  }
});

export default router;
