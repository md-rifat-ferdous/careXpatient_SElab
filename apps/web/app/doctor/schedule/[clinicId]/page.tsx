import React from "react";
import { SideNavBar, TopNavBar } from "@/components/layout/Sidebar";
import { ScheduleManagerClient } from "./ScheduleManagerClient";
import { getDoctorClinics, getRecentModifications } from "@/server/doctorSchedule/queries/scheduleQueries";

// Force dynamic since we want to see live db updates
export const dynamic = 'force-dynamic';

export default async function DoctorScheduleManagerPage({ params }: { params: Promise<{ clinicId: string }> }) {
  const resolvedParams = await params;
  const clinicId = resolvedParams.clinicId;
  
  const clinicsResponse = await getDoctorClinics();
  const modificationsResponse = await getRecentModifications();

  const clinics = clinicsResponse.success && clinicsResponse.data ? clinicsResponse.data : [];
  const modifications = modificationsResponse.success && modificationsResponse.data ? modificationsResponse.data : [];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SideNavBar role="Doctor" />

      {/* Main Content Canvas */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen relative bg-background">
        <TopNavBar role="Doctor" title="Dashboard" />
        <main className="flex-1 overflow-y-auto pt-20">
          <ScheduleManagerClient 
            initialClinics={clinics as any} 
            initialModifications={modifications as any} 
            focusClinicId={clinicId}
          />
        </main>
      </div>
    </div>
  );
}
