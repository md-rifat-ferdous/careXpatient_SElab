"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Hardcoded doctor ID — replace with actual auth session later
const DOCTOR_ID = "cmp8t673300001dk1emj4wgvr"; // Dr. Sarah Jenkins

/**
 * Fetch all clinics associated with the logged-in doctor
 */
export async function getDoctorClinics() {
  try {
    const clinics = await db.doctorClinic.findMany({
      where: { userId: DOCTOR_ID },
      include: {
        clinic: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: clinics.map((dc) => ({
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
  } catch (error: any) {
    console.error("Error fetching clinics from DB:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Register a new clinic and associate it with the doctor
 */
export async function registerClinic(data: {
  name: string;
  address: string;
  shift: string;
}) {
  try {
    // Create clinic first
    const clinic = await db.clinic.create({
      data: {
        name: data.name,
        address: data.address,
      },
    });

    // Link doctor to clinic
    await db.doctorClinic.create({
      data: {
        userId: DOCTOR_ID,
        clinicId: clinic.id,
        shift: data.shift,
        status: "Active",
      },
    });

    try {
      revalidatePath("/doctor/schedule");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }
    return { success: true, data: clinic };
  } catch (error: any) {
    console.error("Error registering clinic in DB:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch recent schedule modifications for clinics linked to the doctor
 */
export async function getRecentModifications() {
  try {
    // Get all clinic IDs for this doctor
    const doctorClinics = await db.doctorClinic.findMany({
      where: { userId: DOCTOR_ID },
      select: { clinicId: true },
    });

    const clinicIds = doctorClinics.map((dc) => dc.clinicId);

    const modifications = await db.scheduleModification.findMany({
      where: { clinicId: { in: clinicIds } },
      include: { clinic: true },
      orderBy: { date: "desc" },
      take: 20,
    });

    return {
      success: true,
      data: modifications.map((mod) => ({
        id: mod.id,
        type: mod.type,
        description: mod.description,
        date: mod.date,
        status: mod.status,
        clinic: {
          id: mod.clinic.id,
          name: mod.clinic.name,
          address: mod.clinic.address,
          image: mod.clinic.image,
        },
      })),
    };
  } catch (error: any) {
    console.error("Error fetching modifications from DB:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Add a new schedule modification log
 */
export async function addScheduleModification(data: {
  clinicId: string;
  type: string;
  description: string;
}) {
  try {
    const modification = await db.scheduleModification.create({
      data: {
        clinicId: data.clinicId,
        type: data.type,
        description: data.description,
        date: new Date(),
        status: "Pending",
      },
    });

    try {
      revalidatePath("/doctor/schedule");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }
    return { success: true, data: modification };
  } catch (error: any) {
    console.error("Error adding modification in DB:", error);
    return { success: false, error: error.message };
  }
}
