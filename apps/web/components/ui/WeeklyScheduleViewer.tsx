"use client";

import React from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Printer, MapPin, Clock, Calendar, ShieldAlert, Sparkles, Ban, RotateCcw } from "lucide-react";
import { cn } from "@my-clinic/ui";

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
  replacementClinic?: ClinicData;
};

interface WeeklyScheduleViewerProps {
  clinics: DoctorClinicData[];
  modifications: ScheduleModificationData[];
}

function parseDaysFromShift(shiftStr: string): string[] {
  const str = shiftStr.toLowerCase();
  const days: string[] = [];
  
  if (str.includes("mon")) days.push("Monday");
  if (str.includes("tue")) days.push("Tuesday");
  if (str.includes("wed")) days.push("Wednesday");
  if (str.includes("thu")) days.push("Thursday");
  if (str.includes("fri")) days.push("Friday");
  if (str.includes("sat")) days.push("Saturday");
  if (str.includes("sun")) days.push("Sunday");
  
  if (str.includes("mon-wed") || str.includes("mon to wed")) {
    days.push("Monday", "Tuesday", "Wednesday");
  }
  if (str.includes("sun-thu")) {
    days.push("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday");
  }
  
  if (days.length === 0) {
    return ["Monday", "Wednesday", "Saturday"];
  }
  
  return Array.from(new Set(days));
}

function parseSlotDescription(desc: string | undefined) {
  if (!desc) return null;
  const match = desc.match(/^\[(.*?)\|(.*?)\]\s*(.*?)(?:\s*\|\s*Note:\s*(.*))?$/);
  if (match) {
    return {
      startTime: match[1],
      endTime: match[2],
      consultationType: match[3],
      notes: match[4] || ""
    };
  }
  return null;
}

export function WeeklyScheduleViewer({ clinics, modifications }: WeeklyScheduleViewerProps) {
  const today = new Date();
  const startOfWeekMonday = startOfWeek(today, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(startOfWeekMonday, i);
    return {
      date: d,
      dayName: format(d, "EEEE"),
      shortDate: format(d, "MMM dd"),
      fullDateStr: format(d, "yyyy-MM-dd")
    };
  });

  const getOverrideForDay = (clinicId: string, checkDate: Date) => {
    return modifications.find(mod => {
      if (mod.type === "Holiday") {
        let modStart = startOfDay(new Date(mod.date));
        let modEnd = endOfDay(new Date(mod.date));
        const match = mod.description?.match(/^\[(.*?)\|(.*?)\]/);
        if (match) {
          modStart = startOfDay(parseISO(match[1]));
          modEnd = endOfDay(parseISO(match[2]));
        }
        return isWithinInterval(checkDate, { start: modStart, end: modEnd });
      }

      if (mod.clinic.id !== clinicId) return false;
      if (mod.type === "Slot") return false; // Added slots are not overrides

      let modStart = startOfDay(new Date(mod.date));
      let modEnd = endOfDay(new Date(mod.date));
      const match = mod.description?.match(/^\[(.*?)\|(.*?)\]/);
      if (match) {
        modStart = startOfDay(parseISO(match[1]));
        modEnd = endOfDay(parseISO(match[2]));
      }

      return isWithinInterval(checkDate, { start: modStart, end: modEnd });
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="weekly-schedule-viewer" className="bg-white border border-border rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 w-full">
      {/* Header */}
      <div className="p-8 border-b border-border bg-gradient-to-r from-teal-500/5 to-sky-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Calendar size={14} />
            <span>Weekly Operations</span>
          </div>
          <h3 className="text-2xl font-black text-foreground tracking-tight">Weekly Schedule</h3>
          <p className="text-subtle-gray text-sm font-medium">All registered clinic routines & custom premium slots</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-white border-2 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary rounded-xl font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all shadow-sm shrink-0"
        >
          <Printer size={16} />
          Download Page
        </button>
      </div>

      {/* Week Grid */}
      <div className="p-8 divide-y divide-border">
        {weekDays.map((dayObj) => {
          const isToday = isSameDay(dayObj.date, today);
          
          // Regular clinic shifts for this day of week
          const dayClinics = clinics.filter(dc => {
            const days = parseDaysFromShift(dc.shift);
            return days.includes(dayObj.dayName);
          });

          // Custom premium slots added for this exact date
          const dayCustomSlots = modifications.filter(mod => 
            mod.type === "Slot" && 
            isSameDay(new Date(mod.date), dayObj.date)
          );

          const hasRoutines = dayClinics.length > 0 || dayCustomSlots.length > 0;

          return (
            <div key={dayObj.fullDateStr} className={cn(
              "py-6 flex flex-col md:flex-row gap-6 items-start transition-colors rounded-2xl px-4 -mx-4",
              isToday ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/50"
            )}>
              {/* Day info column */}
              <div className="w-full md:w-36 shrink-0">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isToday ? "text-primary" : "text-subtle-gray"
                )}>
                  {dayObj.dayName}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h4 className={cn(
                    "text-lg font-black tracking-tight",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {dayObj.shortDate}
                  </h4>
                  {isToday && (
                    <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Routine & Slots items column */}
              <div className="flex-1 w-full space-y-4">
                {hasRoutines ? (
                  <>
                    {/* Render Regular Clinics */}
                    {dayClinics.map((dc) => {
                      const override = getOverrideForDay(dc.clinic.id, dayObj.date);
                      const isOverridden = !!override;
                      const timeSpan = dc.shift.split("|")[1]?.trim() || "09:00 AM - 05:00 PM";

                      return (
                        <div key={dc.id} className={cn(
                          "p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all bg-white",
                          isOverridden ? "border-dashed border-border opacity-70 bg-muted/20" : "border-border shadow-sm"
                        )}>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-foreground text-sm leading-tight">{dc.clinic.name}</h5>
                              <span className="text-[10px] font-semibold text-subtle-gray bg-muted px-2 py-0.5 rounded">
                                Regular Shift
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-subtle-gray">
                              <div className="flex items-center gap-1">
                                <Clock size={14} className="text-primary" />
                                <span>{timeSpan}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-primary" />
                                <span className="truncate max-w-[200px]">{dc.clinic.address}</span>
                              </div>
                            </div>
                          </div>

                          {/* Override Status indicator */}
                          {isOverridden ? (
                            <div className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5",
                              override.type === "Holiday" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                              override.type === "Leave" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                              override.type === "Reschedule" ? "bg-teal-100 text-teal-800 border border-teal-200" :
                              "bg-red-100 text-red-800 border border-red-200"
                            )}>
                              {override.type === "Reschedule" ? <RotateCcw size={12} /> : <Ban size={12} />}
                              <span>{override.type}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Render Custom Premium Slots */}
                    {dayCustomSlots.map((mod) => {
                      const parsed = parseSlotDescription(mod.description);
                      if (!parsed) return null;

                      return (
                        <div key={mod.id} className="p-4 rounded-xl border border-[#0D8F7B]/20 bg-[#F2FAF9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-foreground text-sm leading-tight">{mod.clinic.name}</h5>
                              <span className="text-[9px] font-black text-[#0D8F7B] bg-white border border-[#0D8F7B]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Sparkles size={10} className="fill-[#0D8F7B]" />
                                Premium Slot
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-subtle-gray">
                              <div className="flex items-center gap-1 text-[#0D8F7B]">
                                <Clock size={14} className="text-[#0D8F7B]" />
                                <span>{parsed.startTime} - {parsed.endTime}</span>
                              </div>
                              <span className="text-gray-600 font-bold bg-white/70 px-2 py-0.5 rounded border border-[#0D8F7B]/10">
                                {parsed.consultationType}
                              </span>
                            </div>
                            {parsed.notes && (
                              <p className="text-[11px] font-medium text-gray-500 italic">
                                Note: "{parsed.notes}"
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-[#0D8F7B] bg-white border border-[#0D8F7B]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="py-4 text-center border border-dashed border-border rounded-xl bg-muted/10">
                    <p className="text-subtle-gray text-xs font-bold">No clinics or custom slots scheduled</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
