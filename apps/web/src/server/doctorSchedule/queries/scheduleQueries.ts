'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';

async function getAuthenticatedDoctorId(): Promise<bigint> {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get('userId')?.value;
  if (!userIdStr) throw new Error('Not authenticated');
  const userId = BigInt(userIdStr);
  const doctor = await db.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error('Doctor profile not found');
  return doctor.id;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type ClinicData = {
  id: string; // serialized BigInt
  shift: string | null;
  status: string;
  clinic: {
    id: string;
    name: string;
    address: string | null;
  };
};

export type ModificationData = {
  id: string;
  type: string;
  description: string | null;
  dateISO: string;
  status: string;
  clinic: {
    id: string;
    name: string;
    address: string | null;
  };
  replacementClinic?: {
    id: string;
    name: string;
    address: string | null;
  };
  originalModificationId: string | null;
};

// ─── Get Doctor Clinics ───────────────────────────────────────────────────────
export async function getDoctorClinics(): Promise<{ success: boolean; data: ClinicData[]; error?: string }> {
  try {
    const doctorId = await getAuthenticatedDoctorId();
    const clinics = await db.doctorClinic.findMany({
      where: { doctorId },
      include: { clinic: true },
      orderBy: { clinic: { createdAt: 'desc' } },
    });

    return {
      success: true,
      data: clinics.map((dc) => ({
        id: dc.doctorId.toString() + '_' + dc.clinicId.toString(),
        shift: dc.shift,
        status: dc.status,
        clinic: {
          id: dc.clinic.id.toString(),
          name: dc.clinic.name,
          address: dc.clinic.address,
        },
      })),
    };
  } catch (error: any) {
    console.error('[getDoctorClinics]', error.message);
    return { success: false, error: error.message, data: [] };
  }
}

// ─── Get Recent Modifications ─────────────────────────────────────────────────
export async function getRecentModifications(): Promise<{ success: boolean; data: ModificationData[]; error?: string }> {
  try {
    const doctorId = await getAuthenticatedDoctorId();

    const doctorClinics = await db.doctorClinic.findMany({
      where: { doctorId },
      select: { clinicId: true },
    });
    const clinicIds = doctorClinics.map((dc) => dc.clinicId);

    const modifications = await db.scheduleModification.findMany({
      where: {
        OR: [{ clinicId: { in: clinicIds } }, { doctorId }],
      },
      include: {
        clinic: true,
        replacementClinic: true,
        originalModification: true,
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return {
      success: true,
      data: modifications.map((mod) => ({
        id: mod.id.toString(),
        type: mod.type,
        description: mod.description,
        dateISO: mod.date.toISOString(),
        status: mod.status,
        clinic: {
          id: mod.clinic.id.toString(),
          name: mod.clinic.name,
          address: mod.clinic.address,
        },
        replacementClinic: mod.replacementClinic
          ? {
              id: mod.replacementClinic.id.toString(),
              name: mod.replacementClinic.name,
              address: mod.replacementClinic.address,
            }
          : undefined,
        originalModificationId: mod.originalModificationId?.toString() ?? null,
      })),
    };
  } catch (error: any) {
    console.error('[getRecentModifications]', error.message);
    return { success: false, error: error.message, data: [] };
  }
}
