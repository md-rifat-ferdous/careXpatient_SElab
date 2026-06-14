import { Router, Response } from 'express';
import prisma from '../config/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

const serialize = (data: unknown) =>
  JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (time: Date): string =>
  time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const appointmentStatusLabel: Record<string, string> = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Rescheduled: 'Rescheduled',
  Confirmed: 'Confirmed',
  Waiting_for_call: 'Waiting for Call',
  In_consultation: 'In Consultation',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  NoShow: 'No Show',
};

const labOrderStatusLabel: Record<string, string> = {
  Requested: 'Requested',
  AcceptedByLab: 'Accepted',
  SampleCollected: 'Sample Collected',
  Processing: 'Processing',
  Reported: 'Reported',
  Cancelled: 'Cancelled',
};

router.get('/:userId/dashboard', authenticate, authorize(['Patient']), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (req.user?.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot access another user\'s dashboard' });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      upcomingAppointments,
      pendingLabOrders,
      completedAppointments,
      totalAppointments,
      nextAppointment,
      recentAppointments,
      recentLabOrders,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          patientId: patient.id,
          date: { gte: todayStart },
          status: { notIn: ['Cancelled', 'Completed', 'Rejected'] },
        },
      }),
      prisma.labOrder.count({
        where: {
          patientId: patient.id,
          status: { in: ['Requested', 'AcceptedByLab', 'SampleCollected', 'Processing'] },
        },
      }),
      prisma.appointment.count({
        where: { patientId: patient.id, status: 'Completed' },
      }),
      prisma.appointment.count({
        where: { patientId: patient.id },
      }),
      prisma.appointment.findFirst({
        where: {
          patientId: patient.id,
          date: { gte: todayStart },
          status: { notIn: ['Cancelled', 'Completed', 'Rejected'] },
        },
        include: {
          doctor: {
            include: {
              user: { select: { fullName: true, profilePhotoUrl: true } },
              specialties: { include: { specialty: true } },
            },
          },
        },
        orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
      }),
      prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            include: {
              user: { select: { fullName: true } },
              specialties: { include: { specialty: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.labOrder.findMany({
        where: { patientId: patient.id },
        include: {
          tests: { include: { labTest: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const formattedNextAppointment = nextAppointment
      ? {
          id: nextAppointment.id.toString(),
          doctorName: nextAppointment.doctor.user.fullName ?? 'Unknown',
          specialty: nextAppointment.doctor.specialties[0]?.specialty.name ?? 'General',
          type: nextAppointment.type,
          date: formatDate(nextAppointment.date),
          timeSlot: formatTime(nextAppointment.timeSlot),
          status: appointmentStatusLabel[nextAppointment.status] ?? nextAppointment.status,
          profilePhotoUrl: nextAppointment.doctor.user.profilePhotoUrl,
        }
      : null;

    const appointmentActivities = recentAppointments.map((a) => ({
      id: `appt-${a.id}`,
      type: 'appointment' as const,
      title: `Appointment with ${a.doctor.user.fullName ?? 'Doctor'}`,
      description: a.doctor.specialties[0]?.specialty.name ?? 'General',
      status: appointmentStatusLabel[a.status] ?? a.status,
      date: formatDate(a.date),
      rawDate: a.date.getTime(),
    }));

    const labOrderActivities = recentLabOrders.map((o) => ({
      id: `lab-${o.id}`,
      type: 'lab_order' as const,
      title: `Lab Order: ${o.tests.map((t) => t.labTest.name).join(', ') || 'Tests'}`,
      description: '',
      status: labOrderStatusLabel[o.status] ?? o.status,
      date: formatDate(o.createdAt),
      rawDate: o.createdAt.getTime(),
    }));

    const recentActivity = [...appointmentActivities, ...labOrderActivities]
      .sort((a, b) => b.rawDate - a.rawDate)
      .slice(0, 10)
      .map(({ rawDate, ...item }) => item);

    res.json({
      success: true,
      data: {
        upcomingAppointments,
        pendingLabOrders,
        completedAppointments,
        totalAppointments,
        nextAppointment: formattedNextAppointment,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('GET /api/patients/:userId/dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load patient dashboard data.' });
  }
});

export default router;
