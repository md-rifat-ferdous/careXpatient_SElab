"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Authentication helper – returns cookie value or falls back to seeded doctor ID
async function getAuthenticatedDoctorId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionDoctorId = cookieStore.get("doctor_id")?.value;
  if (sessionDoctorId) {
    console.log("Resolved doctorId from cookie:", sessionDoctorId);
    return sessionDoctorId;
  }
  // Fallback to seeded doctor (email defined in seed.ts)
  const seededDoctor = await db.user.findUnique({ where: { email: "doctor@carexpatient.com" } });
  const fallbackId = seededDoctor?.id;
  console.log("Resolved doctorId from seed fallback:", fallbackId);
  return fallbackId!; // non-null assertion – seeded doctor should exist
}

// ─── Types ─────────────────────────────────────────────────────────────────────




// ─── Types ─────────────────────────────────────────────────────────────────────

export type ClinicInfo = {
  id: string;
  name: string;
  address: string;
  image: string | null;
};

export type DoctorClinicInfo = {
  id: string;
  shift: string;
  status: string;
  clinic: ClinicInfo;
};

export type ModificationInfo = {
  id: string;
  type: string;
  description: string | null;
  dateISO: string; // serialized as ISO string, never Date
  status: string;
  clinic: ClinicInfo;
  replacementClinic?: ClinicInfo | null;
  originalModificationId?: string | null;
};

// ─── Queries ────────────────────────────────────────────────────────────────────

export async function getDoctorClinics(): Promise<{
  success: boolean;
  data: DoctorClinicInfo[];
  error?: string;
}> {
  try {
  const doctorId = await getAuthenticatedDoctorId();
  const rows = await db.doctorClinic.findMany({
    where: { userId: doctorId },
    include: { clinic: true },
    orderBy: { createdAt: "asc" },
  });

    return {
      success: true,
      data: rows.map((dc) => ({
        id: dc.id,
        shift: dc.shift,
        status: dc.status,
        clinic: {
          id: dc.clinic.id,
          name: dc.clinic.name,
          address: dc.clinic.address,
          image: dc.clinic.image,
        },
      })),
    };
  } catch (err: any) {
    console.error("[getDoctorClinics]", err.message);
    return { success: false, data: [], error: err.message };
  }
}

export async function getRecentModifications(): Promise<{
  success: boolean;
  data: ModificationInfo[];
  error?: string;
}> {
  try {
  const doctorId = await getAuthenticatedDoctorId();
  const doctorClinics = await db.doctorClinic.findMany({
    where: { userId: doctorId },
    select: { clinicId: true },
  });

    const clinicIds = doctorClinics.map((dc) => dc.clinicId);
    if (clinicIds.length === 0) return { success: true, data: [] };

    const rows = await db.scheduleModification.findMany({
      where: {
        OR: [
          { clinicId: { in: clinicIds } },
          { doctorId: doctorId },
        ],
      },
      include: { clinic: true, replacementClinic: true },
      orderBy: { date: "desc" },
      take: 100,
    });

    return {
      success: true,
      data: rows.map((mod) => ({
        id: mod.id,
        type: mod.type,
        description: mod.description,
        dateISO: mod.date.toISOString(), // ← always a string, never a Date
        status: mod.status,
        clinic: {
          id: mod.clinic.id,
          name: mod.clinic.name,
          address: mod.clinic.address,
          image: mod.clinic.image,
        },
        replacementClinic: mod.replacementClinic
          ? {
              id: mod.replacementClinic.id,
              name: mod.replacementClinic.name,
              address: mod.replacementClinic.address,
              image: mod.replacementClinic.image,
            }
          : null,
        originalModificationId: mod.originalModificationId,
      })),
    };
  } catch (err: any) {
    console.error("[getRecentModifications]", err.message);
    return { success: false, data: [], error: err.message };
  }
}

// ─── Actions ────────────────────────────────────────────────────────────────────

function safeRevalidate(paths: string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch (_) {}
  }
}

// ─── Conflict Detection Helpers ──────────────────────────────────────────────────

function startOfOfDay(d: Date): Date {
  const res = new Date(d);
  res.setHours(0, 0, 0, 0);
  return res;
}

function endOfOfDay(d: Date): Date {
  const res = new Date(d);
  res.setHours(23, 59, 59, 999);
  return res;
}

function parseDaysFromShift(shiftStr: string): string[] {
  const str = shiftStr.toLowerCase();
  const days: string[] = [];

  if (str.includes("sun-thu") || str.includes("sun to thu")) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  }
  if (str.includes("mon-fri") || str.includes("mon to fri")) {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  }
  if (str.includes("mon-wed") || str.includes("mon to wed")) {
    return ["Monday", "Tuesday", "Wednesday"];
  }
  if (str.includes("sat-thu") || str.includes("sat to thu")) {
    return ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  }

  if (str.includes("mon")) days.push("Monday");
  if (str.includes("tue")) days.push("Tuesday");
  if (str.includes("wed")) days.push("Wednesday");
  if (str.includes("thu")) days.push("Thursday");
  if (str.includes("fri")) days.push("Friday");
  if (str.includes("sat")) days.push("Saturday");
  if (str.includes("sun")) days.push("Sunday");

  if (days.length === 0) {
    return ["Monday", "Wednesday", "Saturday"];
  }
  return Array.from(new Set(days));
}

function parseTimesFromShift(shiftStr: string): { startMinutes: number; endMinutes: number } | null {
  const str = shiftStr.toLowerCase();
  const timeMatch = str.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const startH = parseInt(timeMatch[1], 10);
    const startM = parseInt(timeMatch[2], 10);
    const endH = parseInt(timeMatch[3], 10);
    const endM = parseInt(timeMatch[4], 10);
    return {
      startMinutes: startH * 60 + startM,
      endMinutes: endH * 60 + endM,
    };
  }

  const ampmMatch = str.match(/(\d{1,2})\s*(am|pm)?\s*to\s*(\d{1,2})\s*(am|pm)?/);
  if (ampmMatch) {
    let startH = parseInt(ampmMatch[1], 10);
    const startAmPm = ampmMatch[2];
    let endH = parseInt(ampmMatch[3], 10);
    const endAmPm = ampmMatch[4];

    if (startAmPm === "pm" && startH < 12) startH += 12;
    if (startAmPm === "am" && startH === 12) startH = 0;
    if (endAmPm === "pm" && endH < 12) endH += 12;
    if (endAmPm === "am" && endH === 12) endH = 0;

    if (!startAmPm && endAmPm) {
      if (endAmPm === "pm") {
        if (startH < 12) {
          if (startH > endH) {
            // keep startH as AM
          } else {
            startH += 12;
          }
        }
      }
    }
    return {
      startMinutes: startH * 60,
      endMinutes: endH * 60,
    };
  }

  if (str.includes("on-call") || str.includes("consultant only")) {
    return { startMinutes: 0, endMinutes: 1440 };
  }
  return null;
}

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(":");
  const h = parseInt(parts[0] || "0", 10);
  const m = parseInt(parts[1] || "0", 10);
  return h * 60 + m;
}

function parseSlotDescription(desc: string | null | undefined) {
  if (!desc) return null;
  const m = desc.match(/^\[([^\]|]+)\|([^\]]+)\]\s*(.*?)(?:\s*\|\s*Note:\s*(.*))?$/);
  if (!m) return null;
  return {
    startTime: m[1]?.trim() || "",
    endTime: m[2]?.trim() || "",
    consultationType: m[3]?.trim() || "",
    notes: m[4]?.trim() || "",
  };
}

async function checkScheduleConflict(
  doctorId: string,
  clinicId: string,
  date: Date,
  startMinutes: number,
  endMinutes: number
): Promise<{ conflict: boolean; message?: string }> {
  const formatEEEE = (d: Date) => {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  };
  const formatMMMdd = (d: Date) => {
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  const dayName = formatEEEE(date);

  const doctorClinics = await db.doctorClinic.findMany({
    where: { userId: doctorId },
    include: { clinic: true }
  });

  const modifications = await db.scheduleModification.findMany({
    where: { doctorId },
    include: { clinic: true }
  });

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  for (const dc of doctorClinics) {
    if (dc.clinicId === clinicId) continue;

    const shiftDays = parseDaysFromShift(dc.shift);
    if (!shiftDays.includes(dayName)) continue;

    const isOverridden = modifications.some(mod => {
      if (mod.clinicId !== dc.clinicId && mod.type !== "Holiday") return false;
      if (mod.type === "Slot" || mod.type === "Replacement Schedule") return false;

      const rangeMatch = mod.description?.match(/^\[([^\]|]+)\|([^\]]+)\]/);
      let modStart: Date;
      let modEnd: Date;
      if (rangeMatch) {
        try {
          modStart = startOfOfDay(new Date(rangeMatch[1].trim()));
          modEnd = endOfOfDay(new Date(rangeMatch[2].trim()));
        } catch {
          modStart = startOfOfDay(mod.date);
          modEnd = endOfOfDay(mod.date);
        }
      } else {
        modStart = startOfOfDay(mod.date);
        modEnd = endOfOfDay(mod.date);
      }
      return date >= modStart && date <= modEnd;
    });

    if (isOverridden) continue;

    const shiftTimes = parseTimesFromShift(dc.shift);
    if (shiftTimes) {
      const overlap = Math.max(startMinutes, shiftTimes.startMinutes) < Math.min(endMinutes, shiftTimes.endMinutes);
      if (overlap) {
        return {
          conflict: true,
          message: `Overlap Conflict: You have an existing shift at "${dc.clinic.name}" on ${dayName} (${dc.shift.split("|")[1]?.trim() || dc.shift}).`
        };
      }
    }
  }

  for (const mod of modifications) {
    if (mod.clinicId === clinicId) continue;

    const isSameDate = isSameDay(mod.date, date);
    if (!isSameDate) {
      const rangeMatch = mod.description?.match(/^\[([^\]|]+)\|([^\]]+)\]/);
      let modStart: Date;
      let modEnd: Date;
      if (rangeMatch) {
        try {
          modStart = startOfOfDay(new Date(rangeMatch[1].trim()));
          modEnd = endOfOfDay(new Date(rangeMatch[2].trim()));
        } catch {
          continue;
        }
        if (!(date >= modStart && date <= modEnd)) continue;
      } else {
        continue;
      }
    }

    if (mod.type === "Slot") {
      const parsed = parseSlotDescription(mod.description);
      if (parsed) {
        const slotStartMin = parseTimeToMinutes(parsed.startTime);
        const slotEndMin = parseTimeToMinutes(parsed.endTime);
        const overlap = Math.max(startMinutes, slotStartMin) < Math.min(endMinutes, slotEndMin);
        if (overlap) {
          return {
            conflict: true,
            message: `Overlap Conflict: You have a custom premium slot at "${mod.clinic.name}" on ${formatMMMdd(date)} (${parsed.startTime} - ${parsed.endTime}).`
          };
        }
      }
    } else if (mod.type === "Replacement Schedule") {
      const parsed = parseSlotDescription(mod.description);
      if (parsed) {
        const repStartMin = parseTimeToMinutes(parsed.startTime);
        const repEndMin = parseTimeToMinutes(parsed.endTime);
        const overlap = Math.max(startMinutes, repStartMin) < Math.min(endMinutes, repEndMin);
        if (overlap) {
          return {
            conflict: true,
            message: `Overlap Conflict: You have a replacement shift at "${mod.clinic.name}" on ${formatMMMdd(date)} (${parsed.startTime} - ${parsed.endTime}).`
          };
        }
      }
    }
  }

  return { conflict: false };
}

// ─── Actions ────────────────────────────────────────────────────────────────────

export async function registerClinic(data: {
  name: string;
  address: string;
  shift: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const proposedDays = parseDaysFromShift(data.shift);
    const proposedTimes = parseTimesFromShift(data.shift);

    if (proposedTimes) {
      const existingDoctorClinics = await db.doctorClinic.findMany({
        where: { userId: doctorId },
        include: { clinic: true },
      });

      for (const dc of existingDoctorClinics) {
        const existingDays = parseDaysFromShift(dc.shift);
        const hasCommonDay = proposedDays.some(day => existingDays.includes(day));
        if (hasCommonDay) {
          const existingTimes = parseTimesFromShift(dc.shift);
          if (existingTimes) {
            const overlap = Math.max(proposedTimes.startMinutes, existingTimes.startMinutes) < Math.min(proposedTimes.endMinutes, existingTimes.endMinutes);
            if (overlap) {
              return {
                success: false,
                error: `Overlap Conflict: Your proposed shift overlaps with your existing shift at "${dc.clinic.name}" (${dc.shift}).`
              };
            }
          }
        }
      }
    }

    const clinic = await db.clinic.create({
      data: { name: data.name.trim(), address: data.address.trim() },
    });
    await db.doctorClinic.create({
      data: {
        userId: doctorId,
        clinicId: clinic.id,
        shift: data.shift.trim(),
        status: "Active",
      },
    });
    safeRevalidate(["/doctor/schedule"]);
    return { success: true };
  } catch (err: any) {
    console.error("[registerClinic]", err.message);
    return { success: false, error: err.message };
  }
}

export async function createSlot(data: {
  clinicId: string;
  date: string;
  startTime: string;
  endTime: string;
  consultationType: string;
  notes?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const slotDate = new Date(data.date);
    const slotStartMin = parseTimeToMinutes(data.startTime);
    const slotEndMin = parseTimeToMinutes(data.endTime);

    if (slotStartMin >= slotEndMin) {
      return { success: false, error: "Invalid Time Range: Start time must be before end time." };
    }

    // Conflict Check
    const conflictCheck = await checkScheduleConflict(
      doctorId,
      data.clinicId,
      slotDate,
      slotStartMin,
      slotEndMin
    );

    if (conflictCheck.conflict) {
      return { success: false, error: conflictCheck.message };
    }

    await db.scheduleModification.create({
      data: {
        type: "Slot",
        clinicId: data.clinicId,
        doctorId: doctorId,
        date: new Date(data.date),
        description: `[${data.startTime}|${data.endTime}] ${data.consultationType}${data.notes ? ` | Note: ${data.notes}` : ""}`,
        status: "Active",
      },
    });
    safeRevalidate(["/doctor/schedule", `/doctor/schedule/${data.clinicId}`]);
    return { success: true };
  } catch (err: any) {
    console.error("[createSlot]", err.message);
    return { success: false, error: err.message };
  }
}

export async function cancelSlot(data: {
  clinicId: string;
  date: string;
  reason?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    await db.scheduleModification.create({
      data: {
        type: "Cancel Slot",
        clinicId: data.clinicId,
        doctorId: doctorId,
        date: new Date(data.date),
        description: `[${data.date}|${data.date}] Cancel Slot override${data.reason ? ` | Note: ${data.reason}` : ""}`,
        status: "Active",
      },
    });
    safeRevalidate(["/doctor/schedule", `/doctor/schedule/${data.clinicId}`]);
    return { success: true };
  } catch (err: any) {
    console.error("[cancelSlot]", err.message);
    return { success: false, error: err.message };
  }
}

export async function applyHoliday(data: {
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const doctorClinics = await db.doctorClinic.findMany({
      where: { userId: doctorId },
    });
    if (doctorClinics.length === 0)
      return { success: false, error: "No clinics found." };

    await Promise.all(
      doctorClinics.map((dc) =>
        db.scheduleModification.create({
          data: {
            type: "Holiday",
            clinicId: dc.clinicId,
            doctorId: doctorId,
            date: new Date(data.startDate),
            description: `[${data.startDate}|${data.endDate}] Holiday | Note: ${data.reason || "Global Holiday"}`,
            status: "Active",
          },
        })
      )
    );
    safeRevalidate(["/doctor/schedule"]);
    return { success: true };
  } catch (err: any) {
    console.error("[applyHoliday]", err.message);
    return { success: false, error: err.message };
  }
}

export async function applyLeave(data: {
  clinicId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    await db.scheduleModification.create({
      data: {
        type: "Leave",
        clinicId: data.clinicId,
        doctorId: doctorId,
        date: new Date(data.startDate),
        description: `[${data.startDate}|${data.endDate}] Leave${data.reason ? ` | Note: ${data.reason}` : ""}`,
        status: "Active",
      },
    });
    safeRevalidate(["/doctor/schedule", `/doctor/schedule/${data.clinicId}`]);
    return { success: true };
  } catch (err: any) {
    console.error("[applyLeave]", err.message);
    return { success: false, error: err.message };
  }
}

export async function rescheduleSlot(data: {
  sourceClinicId: string;
  targetClinicId: string;
  originalDate: string;
  newStartDate: string;
  newEndDate: string;
  reason?: string;
}) {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const targetClinicMapping = await db.doctorClinic.findUnique({
      where: { userId_clinicId: { userId: doctorId, clinicId: data.targetClinicId } },
      include: { clinic: true },
    });

    if (targetClinicMapping) {
      const repDate = new Date(data.newStartDate);
      const shiftTimes = parseTimesFromShift(targetClinicMapping.shift);
      if (shiftTimes) {
        const conflictCheck = await checkScheduleConflict(
          doctorId,
          data.targetClinicId,
          repDate,
          shiftTimes.startMinutes,
          shiftTimes.endMinutes
        );
        if (conflictCheck.conflict) {
          return { success: false, error: conflictCheck.message };
        }
      }
    }

    const sourceMod = await db.scheduleModification.create({
      data: {
        type: "Reschedule",
        clinicId: data.sourceClinicId,
        doctorId: doctorId,
        date: new Date(data.originalDate),
        replacementClinicId: data.targetClinicId,
        description: `[${data.originalDate}|${data.originalDate}] Reschedule | Note: ${data.reason || ""}`,
        status: "Active",
      },
    });

    let repTimeStr = "09:00|17:00";
    if (targetClinicMapping) {
      const times = parseTimesFromShift(targetClinicMapping.shift);
      if (times) {
        const startH = Math.floor(times.startMinutes / 60).toString().padStart(2, '0');
        const startM = (times.startMinutes % 60).toString().padStart(2, '0');
        const endH = Math.floor(times.endMinutes / 60).toString().padStart(2, '0');
        const endM = (times.endMinutes % 60).toString().padStart(2, '0');
        repTimeStr = `${startH}:${startM}|${endH}:${endM}`;
      }
    }

    await db.scheduleModification.create({
      data: {
        type: "Replacement Schedule",
        clinicId: data.targetClinicId,
        doctorId: doctorId,
        date: new Date(data.newStartDate),
        originalModificationId: sourceMod.id,
        description: `[${repTimeStr}] Replacement | Note: ${data.reason || ""}`,
        status: "Active",
      },
    });

    safeRevalidate(["/doctor/schedule"]);
    return { success: true };
  } catch (err: any) {
    console.error("[rescheduleSlot]", err.message);
    return { success: false, error: err.message };
  }
}

export async function rollbackOverride(id: string) {
  try {
    const mod = await db.scheduleModification.findUnique({
      where: { id },
      include: { rescheduleChildren: true },
    });
    if (!mod) return { success: false, error: "Override not found." };

    if (mod.rescheduleChildren.length > 0) {
      await db.scheduleModification.deleteMany({
        where: { originalModificationId: id },
      });
    }
    await db.scheduleModification.delete({ where: { id } });

    safeRevalidate(["/doctor/schedule", `/doctor/schedule/${mod.clinicId}`]);
    return { success: true };
  } catch (err: any) {
    console.error("[rollbackOverride]", err.message);
    return { success: false, error: err.message };
  }
}
