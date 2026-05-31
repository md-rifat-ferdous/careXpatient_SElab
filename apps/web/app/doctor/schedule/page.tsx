import React from "react";
import { SideNavBar, TopNavBar } from "@/components/layout/Sidebar";
import { ScheduleClientPage } from "./ScheduleClientPage";
import { getDoctorClinics, getRecentModifications } from "@/server/doctorSchedule/scheduleService";

export const dynamic = "force-dynamic";

export default async function DoctorSchedulePage() {
  const [clinicsRes, modsRes] = await Promise.all([
    getDoctorClinics(),
    getRecentModifications(),
  ]);

  const clinics = clinicsRes.success ? clinicsRes.data : [];
  const modifications = modsRes.success ? modsRes.data : [];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SideNavBar role="Doctor" />
      <div className="flex-1 md:ml-64 flex flex-col h-screen bg-background">
        <TopNavBar role="Doctor" title="My Clinic" />
        <main className="flex-1 overflow-y-auto pt-20">
          <ScheduleClientPage
            initialClinics={clinics}
            initialModifications={modifications}
          />
        </main>
      </div>
    </div>
  );
}
