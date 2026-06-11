import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { generateChannelName, generateRtcToken } from '../services/agora.service';
import { emitStatusChange } from '../services/socket.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Serializes BigInt values to strings for JSON responses.
 * Consistent with the serialization pattern used across the project.
 */
const serialize = (data: unknown) =>
  JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));

/**
 * Resolves the Doctor record from a User ID.
 * Callers (frontend) always know their User ID from the auth store,
 * so we resolve the Doctor profile here on the backend.
 */
const resolveDoctorFromUserId = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: BigInt(userId) },
  });
  return doctor;
};

// ─── Format helpers ────────────────────────────────────────────────────────────

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (time: Date): string =>
  time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

// ─── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/doctors/:userId/appointments
 * Returns all appointments for the authenticated doctor, optionally filtered
 * by ?status=Pending|Confirmed|Completed|Cancelled
 */
export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const doctor = await resolveDoctorFromUserId(userId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Build the Prisma where clause
    const statusFilter = status && typeof status === 'string'
      ? { status: status as any }
      : {};

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        ...statusFilter,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        clinic: {
          select: { name: true, address: true },
        },
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' },
      ],
    });

    const formatted = appointments.map((appt) => ({
      id: appt.id,
      patientName: appt.patient.user.fullName ?? 'Unknown Patient',
      patientPhone: appt.patient.user.phone,
      patientAvatarUrl: appt.patient.user.profilePhotoUrl,
      type: appt.type,
      status: appt.status,
      date: formatDate(appt.date),
      timeSlot: formatTime(appt.timeSlot),
      durationMinutes: appt.durationMinutes ?? 30,
      reasonForVisit: appt.reasonForVisit,
      cancellationReason: appt.cancellationReason,
      clinicName: appt.clinic?.name ?? null,
    }));

    res.json({ success: true, data: serialize(formatted) });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/doctors/:userId/stats
 * Returns aggregate counts of appointment statuses for the dashboard.
 */
export const getDoctorStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const doctor = await resolveDoctorFromUserId(userId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const [pending, confirmed, inConsultation, completed, cancelled] = await Promise.all([
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'Pending' } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'Confirmed' } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'In_consultation' } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'Completed' } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'Cancelled' } }),
    ]);

    res.json({
      success: true,
      data: { pending, confirmed, inConsultation, completed, cancelled },
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/appointments/:id/accept
 * Transitions an appointment from Pending → Confirmed.
 * For Online appointments, auto-generates Agora channel and token.
 */
export const acceptAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept an appointment with status '${appointment.status}'.`,
      });
    }

    const updateData: any = { status: 'Confirmed' };

    if (appointment.type === 'Online') {
      const channelName = generateChannelName(id);
      const { token, expirationTime } = generateRtcToken(channelName, '0');
      updateData.agoraChannelName = channelName;
      updateData.agoraToken = token;
      updateData.tokenExpirationTime = expirationTime;
    }

    const updated = await prisma.appointment.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    emitStatusChange(id, 'Confirmed');

    res.json({
      success: true,
      message: 'Appointment confirmed successfully.',
      data: serialize(updated),
    });
  } catch (error) {
    console.error('Error accepting appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/appointments/:id/decline
 * Transitions an appointment to Rejected and records the reason.
 * Body: { reason: string, cancelledByUserId: string }
 */
export const declineAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, cancelledByUserId } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'A rejection reason is required.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.status === 'Rejected' || appointment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot decline an appointment with status '${appointment.status}'.`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: BigInt(id) },
      data: {
        status: 'Rejected',
        cancellationReason: reason.trim(),
        cancelledBy: cancelledByUserId ? BigInt(cancelledByUserId) : null,
      },
    });

    emitStatusChange(id, 'Rejected');

    res.json({
      success: true,
      message: 'Appointment rejected.',
      data: serialize(updated),
    });
  } catch (error) {
    console.error('Error declining appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/doctors/:userId/patients
 * Returns a distinct list of patients who have had ≥1 appointment with this doctor.
 * Supports optional ?search= (matches on patient name or phone).
 */
export const getDoctorPatients = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { search } = req.query;

    const doctor = await resolveDoctorFromUserId(userId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Fetch all appointments for this doctor with patient info, newest first
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Derive unique patients — first occurrence per patientId is the most recent
    const patientMap = new Map<string, {
      patientId: string;
      name: string;
      phone: string;
      avatarUrl: string | null;
      bloodGroup: string | null;
      lastVisit: string;
      totalAppointments: number;
    }>();

    for (const appt of appointments) {
      const pid = appt.patientId.toString();
      if (!patientMap.has(pid)) {
        patientMap.set(pid, {
          patientId: pid,
          name: appt.patient.user.fullName ?? 'Unknown Patient',
          phone: appt.patient.user.phone,
          avatarUrl: appt.patient.user.profilePhotoUrl ?? null,
          bloodGroup: appt.patient.bloodGroup ?? null,
          lastVisit: formatDate(appt.date),
          totalAppointments: 1,
        });
      } else {
        patientMap.get(pid)!.totalAppointments += 1;
      }
    }

    let patients = Array.from(patientMap.values());

    // Apply optional search filter
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      patients = patients.filter(
        (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q)
      );
    }

    // Sort alphabetically by name
    patients.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ success: true, data: serialize(patients) });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/doctors/:userId/patients/:patientId
 * Returns patient profile info + all shared appointments (doctor ↔ patient).
 */
export const getDoctorPatientDetail = async (req: Request, res: Response) => {
  try {
    const { userId, patientId } = req.params;

    const doctor = await resolveDoctorFromUserId(userId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: BigInt(patientId) },
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        patientId: BigInt(patientId),
      },
      include: {
        clinic: { select: { name: true, address: true } },
      },
      orderBy: [{ date: 'desc' }, { timeSlot: 'desc' }],
    });

    const formattedAppointments = appointments.map((appt) => ({
      id: appt.id.toString(),
      type: appt.type,
      status: appt.status,
      date: formatDate(appt.date),
      timeSlot: formatTime(appt.timeSlot),
      durationMinutes: appt.durationMinutes ?? 30,
      reasonForVisit: appt.reasonForVisit ?? null,
      cancellationReason: appt.cancellationReason ?? null,
      clinicName: appt.clinic?.name ?? null,
    }));

    const result = {
      patientId: patient.id.toString(),
      name: patient.user.fullName ?? 'Unknown Patient',
      phone: patient.user.phone,
      email: patient.user.email ?? null,
      avatarUrl: patient.user.profilePhotoUrl ?? null,
      bloodGroup: patient.bloodGroup ?? null,
      address: patient.address ?? null,
      dateOfBirth: patient.dateOfBirth?.toISOString().split('T')[0] ?? null,
      allergies: patient.allergies ?? null,
      medicalHistory: patient.medicalHistory ?? null,
      appointments: formattedAppointments,
      totalAppointments: formattedAppointments.length,
      lastVisit: formattedAppointments[0]?.date ?? null,
    };

    res.json({ success: true, data: serialize(result) });
  } catch (error) {
    console.error('Error fetching patient detail:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
