import React from "react";
import { SideNavBar, TopNavBar } from "@/components/layout/Sidebar";
import { ScheduleManagerClient } from "./ScheduleManagerClient";
import { getDoctorClinics, getRecentModifications } from "@/server/doctorSchedule/scheduleService";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClinicScheduleManagerPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  const [clinicsRes, modsRes] = await Promise.all([
    getDoctorClinics(),
    getRecentModifications(),
  ]);

  const clinics = clinicsRes.success ? clinicsRes.data : [];
  const modifications = modsRes.success ? modsRes.data : [];

  // Check if this clinic actually belongs to the doctor
  const targetClinic = clinics.find((c) => c.clinic.id === clinicId);

  if (!targetClinic) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SideNavBar role="Doctor" />
        <div className="flex-1 md:ml-64 flex flex-col h-screen bg-background">
          <TopNavBar role="Doctor" title="Schedule Manager" />
          <main className="flex-1 overflow-y-auto pt-20 flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <h2 className="text-2xl font-black text-gray-800">Clinic Not Found</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                This clinic doesn&apos;t exist or is not registered under your profile.
              </p>
              <Link
                href="/doctor/schedule"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                <ArrowLeft size={16} />
                Back to My Clinics
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SideNavBar role="Doctor" />
      <div className="flex-1 md:ml-64 flex flex-col h-screen bg-background">
        <TopNavBar role="Doctor" title={targetClinic.clinic.name} />
        <main className="flex-1 overflow-y-auto pt-20">
          <ScheduleManagerClient
            initialClinics={clinics}
            initialModifications={modifications}
            focusClinicId={clinicId}
          />
        </main>
      </div>
    </div>
  );
}
