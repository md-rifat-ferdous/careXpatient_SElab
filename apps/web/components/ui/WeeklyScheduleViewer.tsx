"use client";

import React from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Printer, MapPin, Clock, Calendar, Ban, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@my-clinic/ui";
import type { DoctorClinicInfo, ModificationInfo } from "@/server/doctorSchedule/scheduleService";

interface WeeklyScheduleViewerProps {
  clinics: DoctorClinicInfo[];
  modifications: ModificationInfo[];
}

function parseDaysFromShift(shiftStr: string): string[] {
  const str = shiftStr.toLowerCase();
  const days: string[] = [];

  // Range patterns first
  if (str.includes("sun-thu") || str.includes("sun to thu")) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  }
  if (str.includes("mon-fri") || str.includes("mon to fri")) {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  }
  if (str.includes("mon-wed") || str.includes("mon to wed")) {
    return ["Monday", "Tuesday", "Wednesday"];
  }
  if (str.includes("sat-thu") || str.includes("sat to thu")) {
    return ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  }

  // Individual days
  if (str.includes("mon")) days.push("Monday");
  if (str.includes("tue")) days.push("Tuesday");
  if (str.includes("wed")) days.push("Wednesday");
  if (str.includes("thu")) days.push("Thursday");
  if (str.includes("fri")) days.push("Friday");
  if (str.includes("sat")) days.push("Saturday");
  if (str.includes("sun")) days.push("Sunday");

  if (days.length === 0) {
    // Fallback: assume Mon/Wed/Sat for invalid data
    return ["Monday", "Wednesday", "Saturday"];
  }

  return Array.from(new Set(days));
}

function parseSlotDescription(desc: string | null | undefined) {
  if (!desc) return null;
  const match = desc.match(/^\[([^\]|]+)\|([^\]]+)\]\s*(.*?)(?:\s*\|\s*Note:\s*(.*))?$/);
  if (match) {
    return {
      startTime: match[1]?.trim() || "",
      endTime: match[2]?.trim() || "",
      consultationType: match[3]?.trim() || "",
      notes: match[4]?.trim() || "",
    };
  }
  return null;
}

function getOverrideForDay(
  modifications: ModificationInfo[],
  clinicId: string,
  checkDate: Date
): ModificationInfo | undefined {
  return modifications.find((mod) => {
    if (mod.type === "Slot") return false; // Slots are additions, not overrides

    const dateRangeMatch = mod.description?.match(/^\[([^\]|]+)\|([^\]]+)\]/);
    let modStart: Date;
    let modEnd: Date;

    if (dateRangeMatch) {
      try {
        modStart = startOfDay(parseISO(dateRangeMatch[1].trim()));
        modEnd = endOfDay(parseISO(dateRangeMatch[2].trim()));
      } catch {
        modStart = startOfDay(new Date(mod.dateISO));
        modEnd = endOfDay(new Date(mod.dateISO));
      }
    } else {
      modStart = startOfDay(new Date(mod.dateISO));
      modEnd = endOfDay(new Date(mod.dateISO));
    }

    if (mod.type === "Holiday") {
      // Holiday affects all clinics
      return isWithinInterval(checkDate, { start: modStart, end: modEnd });
    }

    // Other overrides are clinic-specific
    if (mod.clinic.id !== clinicId) return false;
    return isWithinInterval(checkDate, { start: modStart, end: modEnd });
  });
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
      fullDateStr: format(d, "yyyy-MM-dd"),
    };
  });

  return (
    <div className="bg-white border border-border rounded-3xl shadow-xl overflow-hidden w-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-teal-500/5 to-sky-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <Calendar size={14} />
            <span>Weekly Operations</span>
          </div>
          <h3 className="text-2xl font-black text-foreground tracking-tight">Weekly Schedule</h3>
          <p className="text-subtle-gray text-sm font-medium">All registered clinic routines &amp; custom premium slots</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm shrink-0"
        >
          <Printer size={15} />
          Print
        </button>
      </div>

      {/* Week Grid */}
      <div className="p-6 divide-y divide-border">
        {weekDays.map((dayObj) => {
          const isToday = isSameDay(dayObj.date, today);

          const dayClinics = clinics.filter((dc) => {
            const days = parseDaysFromShift(dc.shift);
            return days.includes(dayObj.dayName);
          });

          const dayCustomSlots = modifications.filter(
            (mod) =>
              mod.type === "Slot" &&
              isSameDay(new Date(mod.dateISO), dayObj.date)
          );

          const hasContent = dayClinics.length > 0 || dayCustomSlots.length > 0;

          return (
            <div
              key={dayObj.fullDateStr}
              className={cn(
                "py-5 flex flex-col md:flex-row gap-5 items-start rounded-2xl px-3 -mx-3 transition-colors",
                isToday ? "bg-primary/5" : "hover:bg-muted/30"
              )}
            >
              {/* Day label */}
              <div className="w-full md:w-32 shrink-0">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", isToday ? "text-primary" : "text-subtle-gray")}>
                  {dayObj.dayName}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h4 className={cn("text-lg font-black tracking-tight", isToday ? "text-primary" : "text-foreground")}>
                    {dayObj.shortDate}
                  </h4>
                  {isToday && (
                    <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full space-y-3">
                {hasContent ? (
                  <>
                    {dayClinics.map((dc) => {
                      const override = getOverrideForDay(modifications, dc.clinic.id, dayObj.date);
                      const isOverridden = !!override;
                      const timeSpan = dc.shift.split("|")[1]?.trim() || "Scheduled";

                      return (
                        <div
                          key={dc.id}
                          className={cn(
                            "p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all bg-white",
                            isOverridden
                              ? "border-dashed border-border opacity-70 bg-muted/10"
                              : "border-border shadow-sm"
                          )}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-foreground text-sm">{dc.clinic.name}</h5>
                              <span className="text-[10px] font-semibold text-subtle-gray bg-muted px-2 py-0.5 rounded">
                                Regular Shift
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-subtle-gray flex-wrap">
                              <div className="flex items-center gap-1">
                                <Clock size={13} className="text-primary" />
                                <span>{timeSpan}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={13} className="text-primary" />
                                <span className="truncate max-w-[180px]">{dc.clinic.address}</span>
                              </div>
                            </div>
                          </div>

                          {isOverridden ? (
                            <div
                              className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0",
                                override!.type === "Holiday"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : override!.type === "Leave"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : override!.type === "Reschedule"
                                  ? "bg-teal-100 text-teal-800 border border-teal-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              )}
                            >
                              {override!.type === "Reschedule" ? (
                                <RotateCcw size={11} />
                              ) : (
                                <Ban size={11} />
                              )}
                              <span>{override!.type}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {dayCustomSlots.map((mod) => {
                      const parsed = parseSlotDescription(mod.description);
                      if (!parsed) return null;
                      return (
                        <div
                          key={mod.id}
                          className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-foreground text-sm">{mod.clinic.name}</h5>
                              <span className="text-[9px] font-black text-primary bg-white border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Sparkles size={9} className="fill-primary" />
                                Premium Slot
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
                              <div className="flex items-center gap-1 text-primary">
                                <Clock size={13} />
                                <span>{parsed.startTime} – {parsed.endTime}</span>
                              </div>
                              <span className="text-foreground/70">{parsed.consultationType}</span>
                            </div>
                            {parsed.notes && (
                              <p className="text-[11px] text-subtle-gray italic">Note: &quot;{parsed.notes}&quot;</p>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-primary bg-white border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                            Active
                          </span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="py-5 text-center border border-dashed border-border rounded-xl bg-muted/5">
                    <p className="text-subtle-gray text-xs font-bold">No clinics or slots scheduled</p>
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
