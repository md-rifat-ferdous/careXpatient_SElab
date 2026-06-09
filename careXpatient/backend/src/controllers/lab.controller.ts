import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import multer from 'multer';

// ── Multer — store files in memory, convert to base64 data URI ────────────────
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  },
});

// ── Helper: resolve Lab record from authenticated user ────────────────────────
async function getLabForUser(userId: string) {
  const lab = await prisma.lab.findFirst({
    where: { userId: BigInt(userId) },
  });
  if (!lab) throw new Error('Lab profile not found for this user');
  return lab;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/lab/patients
//  - Paginated list of patients who have orders with this lab
//  - Query: page, limit, search (by patient name or phone)
// ─────────────────────────────────────────────────────────────────────────────
export async function getLabPatients(req: AuthRequest, res: Response) {
  try {
    const lab = await getLabForUser(req.user!.userId);

    const page   = parseInt(String(req.query.page  || '1'));
    const limit  = parseInt(String(req.query.limit || '10'));
    const search = String(req.query.search || '').trim();
    const skip   = (page - 1) * limit;

    // Build a where clause that finds patients who have LabOrders for this lab
    const patientWhere: any = {
      labOrders: {
        some: { labId: lab.id },
      },
    };

    if (search) {
      patientWhere.user = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone:    { contains: search } },
        ],
      };
    }

    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where: patientWhere,
        include: {
          user: true,
          labOrders: {
            where: { labId: lab.id },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { tests: { include: { labTest: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where: patientWhere }),
    ]);

    const orderCountsRaw = await prisma.labOrder.groupBy({
      by: ['patientId'],
      where: {
        labId: lab.id,
        patient: patientWhere.labOrders ? undefined : undefined,
      },
      _count: { _all: true },
    });

    const orderCountMap: Record<string, number> = {};
    orderCountsRaw.forEach((r) => {
      orderCountMap[r.patientId.toString()] = r._count._all;
    });

    const formatted = patients.map((p) => {
      const lastOrder = p.labOrders[0];
      return {
        id:             p.id.toString(),
        userId:         p.userId.toString(),
        fullName:       p.user.fullName || 'Unknown',
        phone:          p.user.phone,
        email:          p.user.email || null,
        profilePhotoUrl: p.user.profilePhotoUrl || null,
        bloodGroup:     p.bloodGroup || null,
        dateOfBirth:    p.dateOfBirth ? p.dateOfBirth.toISOString().split('T')[0] : null,
        address:        p.address || null,
        ordersCount:    orderCountMap[p.id.toString()] ?? 0,
        lastOrderDate:  lastOrder ? lastOrder.createdAt.toISOString() : null,
        lastOrderTests: lastOrder
          ? lastOrder.tests.map((t) => t.labTest.name).join(', ')
          : null,
      };
    });

    return res.json({
      data:  formatted,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err: any) {
    console.error('getLabPatients error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch patients' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/lab/patients/:patientId/history
//  - All lab orders for a specific patient that belong to this lab
// ─────────────────────────────────────────────────────────────────────────────
export async function getPatientHistory(req: AuthRequest, res: Response) {
  try {
    const lab       = await getLabForUser(req.user!.userId);
    const patientId = BigInt(req.params.patientId);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const orders = await prisma.labOrder.findMany({
      where: { patientId, labId: lab.id },
      include: {
        tests:      { include: { labTest: true } },
        labResults: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedOrders = orders.map((order) => ({
      id:          order.id.toString(),
      status:      order.status,
      createdAt:   order.createdAt.toISOString(),
      tests:       order.tests.map((t) => ({
        id:       t.labTestId.toString(),
        name:     t.labTest.name,
        category: t.labTest.category || 'General',
      })),
      labResults: order.labResults.map((r) => ({
        id:            r.id.toString(),
        resultSummary: r.resultSummary,
        fileUrl:       r.fileUrl,
        uploadedAt:    r.uploadedAt.toISOString(),
        uploadedBy:    r.uploadedBy,
      })),
      hasReport: order.labResults.length > 0,
    }));

    return res.json({
      patient: {
        id:             patient.id.toString(),
        fullName:       patient.user.fullName || 'Unknown',
        phone:          patient.user.phone,
        email:          patient.user.email || null,
        profilePhotoUrl: patient.user.profilePhotoUrl || null,
        bloodGroup:     patient.bloodGroup || null,
        dateOfBirth:    patient.dateOfBirth
          ? patient.dateOfBirth.toISOString().split('T')[0]
          : null,
        address:        patient.address || null,
      },
      orders: formattedOrders,
    });
  } catch (err: any) {
    console.error('getPatientHistory error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch patient history' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/lab/pending-uploads
//  - Lab orders that still need reports (status != Reported, != Cancelled)
// ─────────────────────────────────────────────────────────────────────────────
export async function getPendingUploads(req: AuthRequest, res: Response) {
  try {
    const lab = await getLabForUser(req.user!.userId);

    const page  = parseInt(String(req.query.page  || '1'));
    const limit = parseInt(String(req.query.limit || '20'));
    const skip  = (page - 1) * limit;

    const where = {
      labId: lab.id,
      status: { notIn: ['Reported', 'Cancelled'] as any },
    };

    const [orders, total] = await Promise.all([
      prisma.labOrder.findMany({
        where,
        include: {
          patient: { include: { user: true } },
          tests:   { include: { labTest: true } },
          labResults: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.labOrder.count({ where }),
    ]);

    const formatted = orders.map((order) => ({
      id:          order.id.toString(),
      status:      order.status,
      createdAt:   order.createdAt.toISOString(),
      patient: {
        id:       order.patient.id.toString(),
        fullName: order.patient.user.fullName || 'Unknown',
        phone:    order.patient.user.phone,
        profilePhotoUrl: order.patient.user.profilePhotoUrl || null,
      },
      tests: order.tests.map((t) => ({
        name:     t.labTest.name,
        category: t.labTest.category || 'General',
      })),
      hasReport: order.labResults.length > 0,
    }));

    return res.json({ data: formatted, total, page, limit });
  } catch (err: any) {
    console.error('getPendingUploads error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch pending uploads' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lab/upload-report  (multipart/form-data)
//  Body fields: labOrderId, summary, findings, impression, recommendations
//  File field:  file (PDF or image)
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadReport(req: AuthRequest, res: Response) {
  try {
    const lab = await getLabForUser(req.user!.userId);

    const { labOrderId, summary, findings, impression, recommendations } = req.body;

    if (!labOrderId) {
      return res.status(400).json({ error: 'labOrderId is required' });
    }

    const orderId = BigInt(labOrderId);

    // Verify the order belongs to this lab
    const order = await prisma.labOrder.findFirst({
      where: { id: orderId, labId: lab.id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Lab order not found or does not belong to this lab' });
    }

    // Convert uploaded file to base64 data URI
    let fileUrl: string | null = null;
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      const base64 = file.buffer.toString('base64');
      fileUrl = `data:${file.mimetype};base64,${base64}`;
    }

    // Compose the full result summary
    const parts: string[] = [];
    if (summary)         parts.push(`Summary: ${summary}`);
    if (findings)        parts.push(`Findings: ${findings}`);
    if (impression)      parts.push(`Impression: ${impression}`);
    if (recommendations) parts.push(`Recommendations: ${recommendations}`);
    const resultSummary = parts.join('\n\n');

    // Create LabResult and update LabOrder status in a transaction
    const [labResult] = await prisma.$transaction([
      prisma.labResult.create({
        data: {
          labOrderId:    orderId,
          resultSummary: resultSummary || null,
          fileUrl:       fileUrl,
          uploadedBy:    'Lab Staff',
        },
      }),
      prisma.labOrder.update({
        where: { id: orderId },
        data:  { status: 'Reported', updatedAt: new Date() },
      }),
    ]);

    return res.status(201).json({
      success:    true,
      message:    'Report uploaded successfully',
      labResultId: labResult.id.toString(),
      hasFile:    !!fileUrl,
    });
  } catch (err: any) {
    console.error('uploadReport error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload report' });
  }
}
