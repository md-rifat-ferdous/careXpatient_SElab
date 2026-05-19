import { PrismaClient, AppointmentStatus } from '@prisma/client';
import { AuditService } from './audit.service';

const prisma = new PrismaClient();

export class AppointmentService {
  static async updateStatus(appointmentId: bigint, status: AppointmentStatus, actorId: bigint, reason?: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } }
    });

    if (!appointment) throw new Error('Appointment not found');

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status,
        ...(status === AppointmentStatus.Cancelled ? { cancellationReason: reason, cancelledBy: actorId } : {})
      }
    });

    // Create Notification for Patient
    await prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        title: `Appointment ${status}`,
        message: `Your appointment with Dr. ${appointment.doctor.user?.fullName} has been ${status.toLowerCase()}.`,
        type: 'APPOINTMENT',
        link: `/dashboard/patient/appointments/${appointmentId}`
      }
    });

    // Log the action
    await AuditService.log({
      userId: actorId,
      action: `APPOINTMENT_${status}`,
      resource: `Appointment:${appointmentId}`,
      metadata: { previousStatus: appointment.status, newStatus: status, reason }
    });

    return updated;
  }

  static async getDoctorQueue(doctorId: bigint, date: Date) {
    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          equals: date
        },
        status: {
          in: [AppointmentStatus.Pending, AppointmentStatus.Confirmed]
        }
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                profilePhotoUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        timeSlot: 'asc'
      }
    });
  }
}
