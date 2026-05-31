"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@my-clinic/ui";
import { Plus, MapPin, CalendarDays, Loader2 } from "lucide-react";
import { WeeklyScheduleViewer } from "@/components/ui/WeeklyScheduleViewer";
import { registerClinic } from "@/server/doctorSchedule/scheduleService";
import { toast, Toaster } from "sonner";
import type { DoctorClinicInfo, ModificationInfo } from "@/server/doctorSchedule/scheduleService";

interface ScheduleClientPageProps {
  initialClinics: DoctorClinicInfo[];
  initialModifications: ModificationInfo[];
}

export function ScheduleClientPage({
  initialClinics,
  initialModifications,
}: ScheduleClientPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [shift, setShift] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !shift.trim()) {
      toast.error("Please fill all fields.");
      return;
    }
    startTransition(async () => {
      const res = await registerClinic({ name, address, shift });
      if (res.success) {
        toast.success("Clinic registered successfully!");
        setIsModalOpen(false);
        setName("");
        setAddress("");
        setShift("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to register clinic.");
      }
    });
  };

  return (
    <div className="flex flex-col font-sans">
      <Toaster position="top-right" richColors />
      <main className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground leading-tight">
              My Clinic
            </h2>
            <p className="text-subtle-gray text-base font-medium mt-1">
              Manage your professional schedules across multiple healthcare facilities.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            id="register-clinic-btn"
          >
            <Plus size={18} />
            Register New Clinic
          </button>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col xl:flex-row gap-10 items-start">

          {/* Left: Clinic Directory */}
          <div className="w-full xl:w-[420px] shrink-0 space-y-5">
            <div className="flex items-center gap-3 px-1">
              <CalendarDays className="text-primary" size={20} />
              <h3 className="text-lg font-black text-foreground tracking-tight">My Clinics</h3>
              <span className="ml-auto text-[10px] font-black text-subtle-gray bg-muted px-3 py-1 rounded-full uppercase tracking-widest">
                {initialClinics.length} registered
              </span>
            </div>

            {initialClinics.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-border flex flex-col items-center gap-3">
                <CalendarDays className="w-10 h-10 text-subtle-gray/40" />
                <p className="text-subtle-gray font-bold text-sm">No clinics registered yet.</p>
                <p className="text-subtle-gray text-xs">Click &quot;Register New Clinic&quot; to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {initialClinics.map((dc) => (
                  <div
                    key={dc.id}
                    className="bg-white border border-border rounded-3xl overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                  >
                    <div className="h-44 relative overflow-hidden">
                      <Image
                        alt={dc.clinic.name}
                        src={
                          dc.clinic.image ||
                          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
                        }
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        unoptimized
                      />
                      <div
                        className={cn(
                          "absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest backdrop-blur-md border shadow-sm",
                          dc.status === "Active"
                            ? "bg-green-500/10 text-green-700 border-green-500/20"
                            : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        )}
                      >
                        {dc.status}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-base font-black text-foreground mb-1 tracking-tight group-hover:text-primary transition-colors">
                        {dc.clinic.name}
                      </h3>
                      <div className="flex items-start gap-2 text-subtle-gray mb-5">
                        <MapPin className="text-primary mt-0.5 shrink-0" size={14} />
                        <p className="text-xs leading-relaxed font-semibold">{dc.clinic.address}</p>
                      </div>

                      <div className="mt-auto space-y-3">
                        <div className="flex justify-between items-center pt-3 border-t border-border">
                          <span className="text-subtle-gray text-[10px] font-black uppercase tracking-[0.2em]">
                            Shift
                          </span>
                          <span className="text-foreground font-mono text-xs font-bold bg-muted px-3 py-1 rounded-lg border border-border">
                            {dc.shift}
                          </span>
                        </div>
                        <Link
                          href={`/doctor/schedule/${dc.clinic.id}`}
                          className="w-full py-2.5 border-2 border-primary/20 text-primary font-black text-xs uppercase tracking-[0.15em] rounded-xl hover:bg-primary hover:text-white hover:border-primary active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                        >
                          <CalendarDays size={15} />
                          Manage Schedule
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Weekly Viewer */}
          <div className="flex-1 min-w-0">
            <WeeklyScheduleViewer
              clinics={initialClinics}
              modifications={initialModifications}
            />
          </div>
        </div>
      </main>

      {/* ── Register Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-foreground">Register New Clinic</h2>
                <p className="text-subtle-gray text-sm mt-1">Add a new facility to your workspace.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-subtle-gray hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <Plus className="rotate-45" size={22} />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-subtle-gray block mb-1.5">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. Apollo Hospital"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-subtle-gray block mb-1.5">
                  Address / Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. Block D, Dhaka"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-subtle-gray block mb-1.5">
                  Shift Timing
                </label>
                <input
                  type="text"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. Mon-Fri | 09:00 - 17:00"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 font-bold text-subtle-gray hover:bg-muted rounded-xl transition-all border border-border"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Register Clinic"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
