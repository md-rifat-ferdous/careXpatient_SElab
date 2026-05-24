"use server";

import { db } from "@/lib/db";

// Hardcoded doctor ID for now
const DOCTOR_ID = "cmp8t673300001dk1emj4wgvr"; // Dr. Sarah Jenkins

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

export async function getRecentModifications() {
  try {
    // We fetch ALL modifications for the doctor's clinics so we can 
    // handle global holidays correctly on the frontend or backend
    const doctorClinics = await db.doctorClinic.findMany({
      where: { userId: DOCTOR_ID },
      select: { clinicId: true },
    });

    const clinicIds = doctorClinics.map((dc) => dc.clinicId);

    const modifications = await db.scheduleModification.findMany({
      where: { 
        OR: [
          { clinicId: { in: clinicIds } }, // Overrides for their clinics
          { doctorId: DOCTOR_ID }          // Global doctor overrides (like Holiday)
        ]
      },
      include: { 
        clinic: true,
        replacementClinic: true,
        originalModification: true
      },
      orderBy: { date: "desc" },
      take: 50,
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
        replacementClinic: mod.replacementClinic ? {
          id: mod.replacementClinic.id,
          name: mod.replacementClinic.name,
          address: mod.replacementClinic.address,
          image: mod.replacementClinic.image,
        } : undefined,
        originalModificationId: mod.originalModificationId
      })),
    };
  } catch (error: any) {
    console.error("Error fetching modifications from DB:", error);
    return { success: false, error: error.message, data: [] };
  }
}
