"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const DOCTOR_ID = "cmp8t673300001dk1emj4wgvr"; 

export async function createSlot(data: {
  clinicId: string;
  date: string;
  startTime: string;
  endTime: string;
  consultationType: string;
  notes?: string;
}) {
  try {
    const mod = await db.scheduleModification.create({
      data: {
        type: "Slot",
        clinicId: data.clinicId,
        doctorId: DOCTOR_ID,
        date: new Date(data.date),
        description: `[${data.startTime}|${data.endTime}] ${data.consultationType}${data.notes ? ` | Note: ${data.notes}` : ""}`,
        status: "Active"
      }
    });

    await db.auditLog.create({
      data: {
        action: "CREATE",
        model: "Slot",
        modelId: mod.id,
        userId: DOCTOR_ID,
        clinicId: data.clinicId,
        details: `Created ${data.consultationType} slot on ${data.date} from ${data.startTime} to ${data.endTime}. Note: ${data.notes || 'None'}`
      }
    });

    try {
      revalidatePath("/doctor/schedule");
      revalidatePath(`/doctor/schedule/${data.clinicId}`);
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }
    return { success: true, data: mod };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelSlot(data: {
  clinicId: string;
  date: string; // ISO date string
  reason?: string;
}) {
  try {
    const mod = await db.scheduleModification.create({
      data: {
        type: "Cancel Slot",
        clinicId: data.clinicId,
        doctorId: DOCTOR_ID,
        date: new Date(data.date),
        description: data.reason ? `Cancel Slot override | Note: ${data.reason}` : `Cancel Slot override`,
        status: "Active"
      }
    });
    try {
      revalidatePath("/doctor/schedule");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }
    return { success: true, data: mod };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function applyHoliday(data: {
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  try {
    // Get all doctor clinics
    const doctorClinics = await db.doctorClinic.findMany({
      where: { userId: DOCTOR_ID }
    });

    // Create a holiday record for each clinic, or one global one. 
    // According to the new logic, Holiday applies to ALL clinics. We can just create one 
    // record linked to the first clinic but set the doctorId, and the frontend will enforce it everywhere, 
    // or we can create it for ALL clinics to be safe. Let's create it for all clinics to maintain data integrity per clinic.
    
    const creations = doctorClinics.map(dc => {
      return db.scheduleModification.create({
        data: {
          type: "Holiday",
          clinicId: dc.clinicId,
          doctorId: DOCTOR_ID,
          date: new Date(data.startDate), // We could loop through dates if needed, or store range in description
          description: `[${data.startDate}|${data.endDate}] Holiday override | Note: ${data.reason || 'Global Holiday'}`,
          status: "Active"
        }
      });
    });

    await Promise.all(creations);

    try {
      revalidatePath("/doctor/schedule");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function applyLeave(data: {
  clinicId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  try {
    const mod = await db.scheduleModification.create({
      data: {
        type: "Leave",
        clinicId: data.clinicId,
        doctorId: DOCTOR_ID,
        date: new Date(data.startDate),
        description: `[${data.startDate}|${data.endDate}] Leave override | Note: ${data.reason || ''}`,
        status: "Active"
      }
    });
    try {
      revalidatePath("/doctor/schedule");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }
    return { success: true, data: mod };
  } catch (error: any) {
    return { success: false, error: error.message };
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
    // DUAL-RECORD LOGIC
    
    // 1. Create Source Clinic Override (CANCEL_SLOT functionally, but labeled "Reschedule" with target details)
    const sourceMod = await db.scheduleModification.create({
      data: {
        type: "Reschedule",
        clinicId: data.sourceClinicId,
        doctorId: DOCTOR_ID,
        date: new Date(data.originalDate),
        replacementClinicId: data.targetClinicId,
        description: `Moved to Target Clinic | Note: ${data.reason || ''}`,
        status: "Active"
      },
      include: { replacementClinic: true }
    });

    // 2. Create Target Clinic Replacement Record
    const targetMod = await db.scheduleModification.create({
      data: {
        type: "Replacement Schedule",
        clinicId: data.targetClinicId,
        doctorId: DOCTOR_ID,
        date: new Date(data.newStartDate),
        originalModificationId: sourceMod.id,
        description: `Replacement Schedule for ${data.originalDate} | Note: ${data.reason || ''}`,
        status: "Active"
      }
    });

    try {
      revalidatePath("/doctor/schedule");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }
    return { success: true, sourceData: sourceMod, targetData: targetMod };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rollbackOverride(id: string) {
  try {
    // Find the override
    const mod = await db.scheduleModification.findUnique({
      where: { id },
      include: { rescheduleChildren: true }
    });

    if (!mod) return { success: false, error: "Not found" };

    // If it has children (target reschedules), delete them too
    if (mod.rescheduleChildren && mod.rescheduleChildren.length > 0) {
      await db.scheduleModification.deleteMany({
        where: { originalModificationId: id }
      });
    }

    // Delete the original
    await db.scheduleModification.delete({
      where: { id }
    });

    try {
      revalidatePath("/doctor/schedule");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
