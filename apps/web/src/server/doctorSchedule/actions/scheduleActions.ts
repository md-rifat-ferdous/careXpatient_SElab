'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// ─── Auth Helper ─────────────────────────────────────────────────────────────
// Reads doctorId from the session cookie set by the backend JWT auth
async function getAuthenticatedDoctorId(): Promise<bigint> {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get('userId')?.value;
  if (!userIdStr) throw new Error('Not authenticated');
  const userId = BigInt(userIdStr);

  const doctor = await db.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error('Doctor profile not found');
  return doctor.id;
}

function safeRevalidate(paths: string[]) {
  try {
    paths.forEach((p) => revalidatePath(p));
  } catch (e) {
    console.warn('[safeRevalidate]', e);
  }
}

// ─── Time Helpers ─────────────────────────────────────────────────────────────
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function parseTimesFromShift(shift: string) {
  const timeStr = shift.split('|')[1]?.trim();
  if (!timeStr) return null;
  const [startStr, endStr] = timeStr.split('-').map((s) => s.trim());
  if (!startStr || !endStr) return null;
  return {
    startMinutes: parseTimeToMinutes(startStr),
    endMinutes: parseTimeToMinutes(endStr),
  };
}

export function parseSlotDescription(description?: string | null) {
  if (!description) return null;
  const match = description.match(/\[(\d{2}:\d{2})\|(\d{2}:\d{2})\]\s*(.+?)(?:\s*\|\s*Note:\s*(.+))?$/);
  if (!match) return null;
  return {
    startTime: match[1],
    endTime: match[2],
    consultationType: match[3]?.trim() ?? '',
    notes: match[4]?.trim() ?? null,
  };
}

// ─── Conflict Check ────────────────────────────────────────────────────────────
async function checkScheduleConflict(
  doctorId: bigint,
  clinicId: bigint,
  date: Date,
  startMinutes: number,
  endMinutes: number
) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  const existingMods = await db.scheduleModification.findMany({
    where: {
      doctorId,
      date: { gte: dateStart, lte: dateEnd },
      status: 'Active',
      OR: [{ type: 'Slot' }, { type: 'Replacement Schedule' }],
    },
    include: { clinic: true },
  });

  for (const mod of existingMods) {
    const parsed = parseSlotDescription(mod.description);
    if (parsed) {
      const existStart = parseTimeToMinutes(parsed.startTime);
      const existEnd = parseTimeToMinutes(parsed.endTime);
      const overlap = Math.max(startMinutes, existStart) < Math.min(endMinutes, existEnd);
      if (overlap) {
        return {
          conflict: true,
          message: `Overlap Conflict: You already have a slot at "${mod.clinic.name}" (${parsed.startTime} - ${parsed.endTime}) on this day.`,
        };
      }
    }
  }
  return { conflict: false };
}

// ─── Register Clinic ──────────────────────────────────────────────────────────
export async function registerClinic(data: {
  name: string;
  address: string;
  shift: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();

    // Check for overlapping shift time on same days
    const existing = await db.doctorClinic.findMany({
      where: { doctorId },
      include: { clinic: true },
    });

    const newShiftTimes = parseTimesFromShift(data.shift);
    if (newShiftTimes) {
      for (const dc of existing) {
        const existingTimes = parseTimesFromShift(dc.shift ?? '');
        if (existingTimes) {
          const overlap =
            Math.max(newShiftTimes.startMinutes, existingTimes.startMinutes) <
            Math.min(newShiftTimes.endMinutes, existingTimes.endMinutes);
          if (overlap) {
            return {
              success: false,
              error: `Overlap Conflict: Your proposed shift overlaps with your existing shift at "${dc.clinic.name}" (${dc.shift}).`,
            };
          }
        }
      }
    }

    const clinic = await db.clinic.create({
      data: { name: data.name.trim(), address: data.address.trim() },
    });

    await db.doctorClinic.create({
      data: {
        doctorId,
        clinicId: clinic.id,
        shift: data.shift.trim(),
        status: 'Active',
      },
    });

    safeRevalidate(['/dashboard/doctor/schedule']);
    return { success: true };
  } catch (err: any) {
    console.error('[registerClinic]', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Create Slot ──────────────────────────────────────────────────────────────
export async function createSlot(data: {
  clinicId: bigint;
  date: string;
  startTime: string;
  endTime: string;
  consultationType: string;
  notes?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const slotDate = new Date(data.date);
    const startMin = parseTimeToMinutes(data.startTime);
    const endMin = parseTimeToMinutes(data.endTime);

    if (startMin >= endMin) {
      return { success: false, error: 'Invalid Time Range: Start time must be before end time.' };
    }

    const conflictCheck = await checkScheduleConflict(doctorId, data.clinicId, slotDate, startMin, endMin);
    if (conflictCheck.conflict) return { success: false, error: conflictCheck.message };

    await db.scheduleModification.create({
      data: {
        type: 'Slot',
        clinicId: data.clinicId,
        doctorId,
        date: slotDate,
        description: `[${data.startTime}|${data.endTime}] ${data.consultationType}${data.notes ? ` | Note: ${data.notes}` : ''}`,
        status: 'Active',
      },
    });

    safeRevalidate(['/dashboard/doctor/schedule']);
    return { success: true };
  } catch (err: any) {
    console.error('[createSlot]', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Cancel Slot ──────────────────────────────────────────────────────────────
export async function cancelSlot(data: {
  clinicId: bigint;
  date: string;
  reason?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    await db.scheduleModification.create({
      data: {
        type: 'Cancel Slot',
        clinicId: data.clinicId,
        doctorId,
        date: new Date(data.date),
        description: data.reason ? `Cancel Slot override | Note: ${data.reason}` : 'Cancel Slot override',
        status: 'Active',
      },
    });
    safeRevalidate(['/dashboard/doctor/schedule']);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Apply Holiday ────────────────────────────────────────────────────────────
export async function applyHoliday(data: {
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const doctorClinics = await db.doctorClinic.findMany({ where: { doctorId } });
    if (doctorClinics.length === 0) return { success: false, error: 'No clinics found.' };

    await Promise.all(
      doctorClinics.map((dc) =>
        db.scheduleModification.create({
          data: {
            type: 'Holiday',
            clinicId: dc.clinicId,
            doctorId,
            date: new Date(data.startDate),
            description: `[${data.startDate}|${data.endDate}] Holiday override | Note: ${data.reason ?? 'Global Holiday'}`,
            status: 'Active',
          },
        })
      )
    );

    safeRevalidate(['/dashboard/doctor/schedule']);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Apply Leave ──────────────────────────────────────────────────────────────
export async function applyLeave(data: {
  clinicId: bigint;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    await db.scheduleModification.create({
      data: {
        type: 'Leave',
        clinicId: data.clinicId,
        doctorId,
        date: new Date(data.startDate),
        description: `[${data.startDate}|${data.endDate}] Leave override | Note: ${data.reason ?? ''}`,
        status: 'Active',
      },
    });
    safeRevalidate(['/dashboard/doctor/schedule']);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Reschedule Slot ──────────────────────────────────────────────────────────
export async function rescheduleSlot(data: {
  sourceClinicId: bigint;
  targetClinicId: bigint;
  originalDate: string;
  newStartDate: string;
  newEndDate: string;
  reason?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const targetClinicMapping = await db.doctorClinic.findUnique({
      where: { doctorId_clinicId: { doctorId, clinicId: data.targetClinicId } },
      include: { clinic: true },
    });

    if (targetClinicMapping) {
      const repDate = new Date(data.newStartDate);
      const shiftTimes = parseTimesFromShift(targetClinicMapping.shift ?? '');
      if (shiftTimes) {
        const conflictCheck = await checkScheduleConflict(
          doctorId,
          data.targetClinicId,
          repDate,
          shiftTimes.startMinutes,
          shiftTimes.endMinutes
        );
        if (conflictCheck.conflict) return { success: false, error: conflictCheck.message };
      }
    }

    const sourceMod = await db.scheduleModification.create({
      data: {
        type: 'Reschedule',
        clinicId: data.sourceClinicId,
        doctorId,
        date: new Date(data.originalDate),
        replacementClinicId: data.targetClinicId,
        description: `Moved to Target Clinic | Note: ${data.reason ?? ''}`,
        status: 'Active',
      },
    });

    let repTimeStr = '09:00|17:00';
    if (targetClinicMapping) {
      const times = parseTimesFromShift(targetClinicMapping.shift ?? '');
      if (times) {
        const fmtH = (m: number) => Math.floor(m / 60).toString().padStart(2, '0');
        const fmtM = (m: number) => (m % 60).toString().padStart(2, '0');
        repTimeStr = `${fmtH(times.startMinutes)}:${fmtM(times.startMinutes)}|${fmtH(times.endMinutes)}:${fmtM(times.endMinutes)}`;
      }
    }

    await db.scheduleModification.create({
      data: {
        type: 'Replacement Schedule',
        clinicId: data.targetClinicId,
        doctorId,
        date: new Date(data.newStartDate),
        originalModificationId: sourceMod.id,
        description: `[${repTimeStr}] Replacement | Note: ${data.reason ?? ''}`,
        status: 'Active',
      },
    });

    safeRevalidate(['/dashboard/doctor/schedule']);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Rollback Override ────────────────────────────────────────────────────────
export async function rollbackOverride(id: bigint) {
  try {
    const mod = await db.scheduleModification.findUnique({
      where: { id },
      include: { rescheduleChildren: true },
    });
    if (!mod) return { success: false, error: 'Override not found.' };

    if (mod.rescheduleChildren.length > 0) {
      await db.scheduleModification.deleteMany({ where: { originalModificationId: id } });
    }
    await db.scheduleModification.delete({ where: { id } });

    safeRevalidate(['/dashboard/doctor/schedule']);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
