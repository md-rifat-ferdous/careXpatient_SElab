"use server";

import { db } from "@/lib/db";

export async function getLatestPrescription() {
  try {
    const prescription = await db.prescription.findFirst({
      include: {
        patient: true,
        user: true,
        clinic: true,
        medicines: true
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    return { success: true, data: prescription };
  } catch (error: any) {
    console.error("Error fetching prescription:", error);
    return { success: false, error: error.message };
  }
}

export async function getPrescriptionById(id: string) {
  try {
    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        user: true,
        clinic: true,
        medicines: true
      }
    });

    return { success: true, data: prescription };
  } catch (error: any) {
    console.error("Error fetching prescription:", error);
    return { success: false, error: error.message };
  }
}
