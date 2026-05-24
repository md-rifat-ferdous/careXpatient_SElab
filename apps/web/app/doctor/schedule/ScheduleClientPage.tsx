"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@my-clinic/ui";
import { Plus, MapPin, CalendarDays } from "lucide-react";
import { WeeklyScheduleViewer } from "@/components/ui/WeeklyScheduleViewer";
import { registerClinic } from "@/app/actions/schedule";

type ClinicData = {
  id: string;
  name: string;
  address: string;
  image: string | null;
};

type DoctorClinicData = {
  id: string;
  shift: string;
  status: string;
  clinic: ClinicData;
};

type ScheduleModificationData = {
  id: string;
  type: string;
  description: string;
  date: Date;
  status: string;
  clinic: ClinicData;
  rescheduledStart?: Date;
  rescheduledEnd?: Date;
  replacementClinic?: ClinicData;
};

interface ScheduleClientPageProps {
  initialClinics: DoctorClinicData[];
  initialModifications: ScheduleModificationData[];
  focusClinicId?: string;
}

export function ScheduleClientPage({ initialClinics, initialModifications, focusClinicId }: ScheduleClientPageProps) {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // Find current clinic for header when scoped
  const currentClinic = focusClinicId ? initialClinics.find(c => c.clinic.id === focusClinicId) : null;
  
  // Registration Form State
  const [newClinicName, setNewClinicName] = useState("");
  const [newClinicLocation, setNewClinicLocation] = useState("");
  const [newClinicShift, setNewClinicShift] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Determine the clinic to display (if scoped)
  const displayedClinics = focusClinicId
    ? initialClinics.filter(c => c.clinic.id === focusClinicId)
    : initialClinics;

  // All clinics are shown (no search filter in new layout)
  const filteredClinics = displayedClinics;

  const handleRegisterClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    
    await registerClinic({
      name: newClinicName,
      address: newClinicLocation,
      shift: newClinicShift
    });
    
    setIsRegistering(false);
    setIsRegisterModalOpen(false);
    setNewClinicName("");
    setNewClinicLocation("");
    setNewClinicShift("");
  };

  return (
    <div className="flex flex-col font-sans">

      <main className="p-10 max-w-[1600px] mx-auto w-full space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tight text-foreground leading-tight">
              {focusClinicId && currentClinic ? `${currentClinic.clinic.name} Schedule Management` : 'Clinic Directory'}
            </h2>
            <p className="text-subtle-gray text-lg font-medium">
              {focusClinicId && currentClinic ? `Manage schedules for ${currentClinic.clinic.name}.` : 'Manage your professional schedules across multiple healthcare facilities.'}
            </p>
          </div>
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
            id="register-clinic-btn"
          >
            <Plus size={20} />
            Register New Clinic
          </button>
        </div>

        {/* Two-Column Layout: Clinic Directory + Weekly Schedule Viewer */}
        <div className="flex flex-col xl:flex-row gap-10 items-start" id="main-schedule-layout">
          
          {/* Left Column: Clinic Directory */}
          <div className="w-full xl:w-[420px] shrink-0 space-y-6" id="clinic-directory-column">
            <div className="flex items-center gap-3 px-1">
              <CalendarDays className="text-primary" size={22} />
              <h3 className="text-xl font-black text-foreground tracking-tight">My Clinics</h3>
              <span className="ml-auto text-[10px] font-black text-subtle-gray bg-muted px-3 py-1 rounded-full uppercase tracking-widest">
                {filteredClinics.length} registered
              </span>
            </div>

            {filteredClinics.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-[2rem] border border-dashed border-border">
                <p className="text-subtle-gray font-bold">No clinics found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {filteredClinics.map((dc) => (
                  <div key={dc.id} className="bg-white border border-border rounded-[2rem] overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                    <div className="h-44 relative overflow-hidden">
                      <Image
                        alt={dc.clinic.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={dc.clinic.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"}
                        fill
                      />
                      <div className={cn(
                        "absolute top-4 right-4 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest backdrop-blur-md border shadow-sm",
                        dc.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                      )}>
                        {dc.status}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-black text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors">
                        {dc.clinic.name}
                      </h3>
                      <div className="flex items-start gap-2 text-subtle-gray mb-6">
                        <MapPin className="text-primary mt-0.5 shrink-0" size={15} />
                        <p className="text-xs leading-relaxed font-semibold">
                          {dc.clinic.address}
                        </p>
                      </div>
                      
                      <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-center pt-4 border-t border-border">
                          <span className="text-subtle-gray text-[10px] font-black uppercase tracking-[0.2em]">Shift</span>
                          <span className="text-foreground font-mono text-xs font-bold bg-muted px-3 py-1 rounded-xl border border-border">{dc.shift}</span>
                        </div>
                        <Link 
                          href={`/doctor/schedule/${dc.clinic.id}`}
                          className="w-full py-3 border-2 border-primary/20 text-primary font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-white hover:border-primary active:scale-[0.99] transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
                        >
                          <CalendarDays size={16} className="group-hover/btn:scale-110 transition-transform" />
                          Manage Schedule
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Weekly Schedule Viewer */}
          <div className="flex-1 min-w-0" id="weekly-schedule-column">
            <WeeklyScheduleViewer 
              clinics={initialClinics}
              modifications={initialModifications}
            />
          </div>
        </div>
      </main>
      
      {/* Footer Spacer */}
      <div className="h-20"></div>

      {/* Register Clinic Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl border border-border animate-scale-in">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-2">Register New Clinic</h2>
                <p className="text-subtle-gray text-sm font-medium">Add a new facility to your workspace.</p>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-subtle-gray hover:text-foreground">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterClinic} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-subtle-gray ml-1">Clinic Name</label>
                <input 
                  type="text" 
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  className="cx-input"
                  placeholder="e.g. Apollo Hospital"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-subtle-gray ml-1">Location / Address</label>
                <input 
                  type="text" 
                  value={newClinicLocation}
                  onChange={(e) => setNewClinicLocation(e.target.value)}
                  className="cx-input"
                  placeholder="e.g. Block D, Dhaka"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-subtle-gray ml-1">Shift Timing</label>
                <input 
                  type="text" 
                  value={newClinicShift}
                  onChange={(e) => setNewClinicShift(e.target.value)}
                  className="cx-input"
                  placeholder="e.g. Mon-Fri | 09:00 - 17:00"
                  required
                />
              </div>
              <div className="flex gap-4 mt-10">
                <button 
                  type="button" 
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="flex-1 py-4 font-bold text-subtle-gray hover:bg-muted rounded-2xl transition-all"
                  disabled={isRegistering}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isRegistering}
                  className="flex-[2] cx-btn-primary"
                >
                  {isRegistering ? "Saving..." : "Register Clinic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
