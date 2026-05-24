"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@my-clinic/ui";
import { 
  Printer, Plus, Edit2, Ban, Plane, 
  Asterisk, RotateCcw, MapPin, ExternalLink, CalendarDays, Bell, Clock, SquarePlus, BedDouble, Check, Trash2
} from "lucide-react";
import { createSlot, cancelSlot, applyHoliday, applyLeave, rescheduleSlot, rollbackOverride } from "@/server/doctorSchedule/actions/scheduleActions";
import { format, addDays, startOfToday, isWithinInterval, parseISO, endOfDay, startOfDay, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
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
};

interface ScheduleManagerClientProps {
  initialClinics: DoctorClinicData[];
  initialModifications: ScheduleModificationData[];
  focusClinicId: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Improved parser to assign shift strings to days
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
  
  // If no days found but it has time, we can assume it's everyday or just put it in a default to prevent empty
  if (days.length === 0) {
    // just for visual completeness if db data is bad
    return ["Monday", "Wednesday", "Saturday"];
  }
  
  return Array.from(new Set(days));
}

// Helper to parse custom slot details from serialized description string
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

// Helper to parse reschedule and note details from the serialized description string
function parseDescription(desc: string | undefined) {
  if (!desc) return null;
  // Match the date range first e.g. [2026-05-26|2026-05-26]
  const cleanDesc = desc.replace(/^\[.*?\]\s*/, ""); // Remove the [start|end] prefix
  
  // CleanDesc example: "Reschedule override | Rescheduled to: Square Hospitals Ltd. on 2026-05-26 â€“ 2026-05-26 | Note: Patient load"
  // CleanDesc example: "Cancel Slot override | Note: Emergency"
  const parts = cleanDesc.split(" | ");
  const mainType = parts[0]?.replace(" override", "");
  
  let rescheduledTo = "";
  let rescheduledOn = "";
  let note = "";
  
  parts.forEach(part => {
    if (part.startsWith("Rescheduled to: ")) {
      const details = part.replace("Rescheduled to: ", ""); // "Square Hospitals Ltd. on 2026-05-26 â€“ 2026-05-26"
      const onIndex = details.lastIndexOf(" on ");
      if (onIndex !== -1) {
        rescheduledTo = details.substring(0, onIndex);
        rescheduledOn = details.substring(onIndex + 4);
      } else {
        rescheduledTo = details;
      }
    } else if (part.startsWith("Note: ")) {
      note = part.replace("Note: ", "");
    }
  });
  
  return {
    mainType,
    rescheduledTo,
    rescheduledOn,
    note
  };
}

// Helper to format the rescheduled date nicely
function formatRescheduledDate(dateStr: string) {
  if (!dateStr) return "";
  const dates = dateStr.split(" â€“ ");
  if (dates.length === 1) {
    try {
      return format(parseISO(dates[0]), "MMM dd, yyyy");
    } catch {
      return dates[0];
    }
  } else if (dates.length === 2) {
    try {
      const d1 = parseISO(dates[0]);
      const d2 = parseISO(dates[1]);
      if (isSameDay(d1, d2)) {
        return format(d1, "MMM dd, yyyy");
      }
      return `${format(d1, "MMM dd")} â€“ ${format(d2, "MMM dd, yyyy")}`;
    } catch {
      return dateStr;
    }
  }
  return dateStr;
}

export function ScheduleManagerClient({ 
  initialClinics, 
  initialModifications,
  focusClinicId 
}: ScheduleManagerClientProps) {
  const today = startOfToday();
  const nextWeekEnd = addDays(today, 7);
  const router = useRouter();

  const activeClinic = initialClinics.find(c => c.clinic.id === focusClinicId) || initialClinics[0];
  const [activeClinicId, setActiveClinicId] = useState(activeClinic?.clinic?.id ?? "");

  // Guard: if no clinics are available, show a helpful empty state
  if (!activeClinic) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4 font-sans p-8">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <CalendarDays className="w-7 h-7 text-gray-400" />
        </div>
        <h2 className="text-xl font-black text-gray-800">No Clinic Found</h2>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          This clinic could not be found or you have no registered clinics. Please go back and register a clinic first.
        </p>
      </div>
    );
  }

  const [overrideType, setOverrideType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [overrideNote, setOverrideNote] = useState("");
  const [rescheduleTargetClinicId, setRescheduleTargetClinicId] = useState("");
  const [rescheduleNewStart, setRescheduleNewStart] = useState("");
  const [rescheduleNewEnd, setRescheduleNewEnd] = useState("");
  const [isPending, startTransition] = useTransition();

  // Add Slot Modal State
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [addSlotDay, setAddSlotDay] = useState("");
  const [addSlotDate, setAddSlotDate] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("09:00");
  const [slotEndTime, setSlotEndTime] = useState("17:00");
  const [consultationType, setConsultationType] = useState("General Consultation");
  const [slotNotes, setSlotNotes] = useState("");

  const handleOpenAddSlot = (dayName: string, dateStr: string) => {
    setAddSlotDay(dayName);
    setAddSlotDate(dateStr);
    setIsAddSlotModalOpen(true);
  };

  const handleAddSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSlot({
        clinicId: activeClinicId,
        date: addSlotDate,
        startTime: slotStartTime,
        endTime: slotEndTime,
        consultationType,
        notes: slotNotes
      });
      if (res.success) {
        toast.success(`Slot successfully added for ${addSlotDay}!`);
        setIsAddSlotModalOpen(false);
        // Reset form
        setSlotStartTime("09:00");
        setSlotEndTime("17:00");
        setConsultationType("General Consultation");
        setSlotNotes("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add slot.");
      }
    });
  };

  const handleOverrideSubmit = async () => {
    if (!activeClinic || !overrideType || !startDate) {
      toast.error("Please select an action and valid dates.");
      return;
    }

    if (overrideType === "Reschedule" && !rescheduleTargetClinicId) {
      toast.error("Please select a target clinic for rescheduling.");
      return;
    }

    const start = parseISO(startDate);
    const effectiveEndDate = overrideType === "Reschedule" ? startDate : endDate;
    const end = endOfDay(parseISO(effectiveEndDate));
    
    if (end < start) {
      toast.error("End date cannot be before start date.");
      return;
    }

    // Optimistic payload construction
    const tempId = `temp-${Date.now()}`;
    
    startTransition(async () => {
      let res;
      if (overrideType === "Cancel Slot") {
        res = await cancelSlot({ clinicId: activeClinic.clinic.id, date: startDate, reason: overrideNote });
      } else if (overrideType === "Holiday") {
        res = await applyHoliday({ startDate, endDate: effectiveEndDate, reason: overrideNote });
      } else if (overrideType === "Leave") {
        res = await applyLeave({ clinicId: activeClinic.clinic.id, startDate, endDate: effectiveEndDate, reason: overrideNote });
      } else if (overrideType === "Reschedule") {
        res = await rescheduleSlot({
          sourceClinicId: activeClinic.clinic.id,
          targetClinicId: rescheduleTargetClinicId,
          originalDate: startDate,
          newStartDate: rescheduleNewStart,
          newEndDate: rescheduleNewEnd,
          reason: overrideNote
        });
      }

      if (!res?.success) {
        toast.error(res?.error || "Failed to post update.");
      } else {
        toast.success(`"${overrideType}" applied successfully!`);
        // We rely on revalidatePath in the server action to refresh the data, 
        // but we can also clear the form here.
        setOverrideType(null);
        setOverrideNote("");
        setRescheduleTargetClinicId("");
        router.refresh();
      }
    });
  };

  const getActionIcon = (type: string, active: boolean) => {
    const colorClass = active ? "text-[#0D8F7B]" : "text-gray-500";
    switch(type) {
      case "Cancel Slot": return <Ban className={cn("w-6 h-6 mb-2", colorClass)} />;
      case "Holiday": return <Plane className={cn("w-6 h-6 mb-2", colorClass)} />;
      case "Leave": return <Asterisk className={cn("w-6 h-6 mb-2", colorClass)} />;
      case "Reschedule": return <RotateCcw className={cn("w-6 h-6 mb-2", colorClass)} />;
      default: return <Ban className={cn("w-6 h-6 mb-2", colorClass)} />;
    }
  };

  // Build the next 7 days starting from today
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(today, i);
      return {
        date: d,
        dayName: format(d, "EEEE"),
        shortDate: format(d, "MMM dd"),
        fullDateStr: format(d, "yyyy-MM-dd")
      };
    });
  }, [today]);

  // Group clinics by day based on their shift strings, strictly scoped to focusClinicId
  const weeklySchedule = useMemo(() => {
    const schedule: Record<string, DoctorClinicData[]> = {};
    DAYS_OF_WEEK.forEach(d => schedule[d] = []);
    
    initialClinics
      .filter(dc => dc.clinic.id === activeClinic.clinic.id)
      .forEach(dc => {
        const days = parseDaysFromShift(dc.shift);
        days.forEach(d => {
          if (schedule[d]) schedule[d].push(dc);
        });
      });
    
    return schedule;
  }, [initialClinics, activeClinic]);

  // Check if a specific clinic is overridden on a specific Date
  const getOverrideForSlot = (clinicId: string, checkDate: Date) => {
    return initialModifications.find(mod => {
      // Global holiday affects all clinics
      if (mod.type === "Holiday") {
        // Just need to match date
        let modStart = startOfDay(new Date(mod.date));
        let modEnd = endOfDay(new Date(mod.date));
        const match = mod.description?.match(/^\[(.*?)\|(.*?)\]/);
        if (match) {
          modStart = startOfDay(parseISO(match[1]));
          modEnd = endOfDay(parseISO(match[2]));
        }
        return isWithinInterval(checkDate, { start: modStart, end: modEnd });
      }

      // Other overrides are clinic-specific
      if (mod.clinic.id !== clinicId) return false;
      
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

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full font-sans bg-[#F9FAFB] min-h-screen">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Doctor Schedule Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your weekly presence across multiple clinics and post temporary routine overrides.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#0D8F7B] text-[#0D8F7B] font-semibold rounded-lg shadow-sm hover:bg-[#F2FAF9] transition-colors">
          <Printer size={18} />
          Export Schedule
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Main Weekly Timeline */}
        <div className="flex-[2] w-full min-w-0 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden pb-4">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-[#0D8F7B]" size={20} />
                <h2 className="font-bold text-gray-900 text-lg">Standard Weekly Routine</h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#0D8F7B]" /> Regular</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#E57A5A]" /> Overridden</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 px-6">
              {weekDays.map((dayObj) => {
                const slots = weeklySchedule[dayObj.dayName] || [];
                const customSlots = initialModifications.filter(mod => 
                  mod.type === "Slot" && 
                  mod.clinic.id === activeClinic.clinic.id && 
                  isSameDay(new Date(mod.date), dayObj.date)
                );
                const hasSlots = slots.length > 0 || customSlots.length > 0;
                
                return (
                  <div key={dayObj.fullDateStr} className="flex flex-col sm:flex-row py-6 gap-6 group">
                    {/* Day Column */}
                    <div className="w-24 shrink-0 pt-2">
                      <h3 className="font-bold text-[11px] uppercase tracking-wider text-gray-500">{dayObj.dayName}</h3>
                      <p className={cn("font-bold text-lg mt-0.5", isSameDay(dayObj.date, today) ? "text-[#0D8F7B]" : "text-gray-900")}>
                        {dayObj.shortDate}
                      </p>
                      {isSameDay(dayObj.date, today) && <span className="text-[10px] font-bold text-[#0D8F7B] uppercase">Today</span>}
                    </div>

                    {/* Slots Column */}
                    <div className="flex-1 space-y-4">
                      {hasSlots ? (
                        <>
                          <AnimatePresence>
                            {slots.map((slot, sIdx) => {
                              const activeOverride = getOverrideForSlot(slot.clinic.id, dayObj.date);
                              const isOverridden = !!activeOverride;
                              const isFocused = slot.clinic.id === activeClinicId;

                              // Parse ID from name roughly or use generic
                              const clinicIdStr = slot.clinic.name.substring(0,2).toUpperCase() + "-DHAKA";
                              const timeSpan = slot.shift.split("|")[1]?.trim() || "09:00 AM - 05:00 PM";
                              
                              let overrideReason = activeOverride ? activeOverride.type : "";
                              let overrideBadgeText = "CANCELLED";
                              let overrideBgClass = "bg-[#C38774]";
                              let overrideBorderClass = "border-[#E8CFC5] bg-[#F6EBE7]";
                              let isRescheduled = activeOverride?.type === "Reschedule";

                              if (isRescheduled) {
                                overrideBadgeText = "RESCHEDULED";
                                overrideBgClass = "bg-[#3B82F6]";
                                overrideBorderClass = "border-[#BFDBFE] bg-[#EFF6FF]";
                              }

                              return (
                                <motion.div 
                                  key={`${dayObj.fullDateStr}-${slot.id}`}
                                  layout
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  onClick={() => {
                                    setActiveClinicId(slot.clinic.id);
                                    setStartDate(dayObj.fullDateStr);
                                    setEndDate(dayObj.fullDateStr);
                                  }}
                                  className={cn(
                                    "relative border rounded-lg p-5 flex flex-col justify-between items-start gap-4 cursor-pointer transition-all",
                                    isOverridden ? overrideBorderClass : "bg-white border-gray-200",
                                    isFocused && !isOverridden ? "border-[#0D8F7B] shadow-md shadow-[#0D8F7B]/10 ring-1 ring-[#0D8F7B]/50" : "hover:border-gray-300"
                                  )}
                                >
                                  {isFocused && !isOverridden && (
                                    <div className="absolute top-2 right-2 text-[#0D8F7B]">
                                      <Check size={16} />
                                    </div>
                                  )}

                                  {isOverridden && (
                                    <div className={cn("absolute top-0 right-0 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg rounded-tr-lg", overrideBgClass)}>
                                      {overrideBadgeText}
                                    </div>
                                  )}
                                  
                                  <div className="flex w-full gap-4">
                                    <div className={cn(
                                      "p-2 rounded-md h-10 w-10 flex items-center justify-center shrink-0", 
                                      isOverridden ? "bg-white text-gray-400 opacity-60" : "bg-[#EAF5F3] text-[#0D8F7B]"
                                    )}>
                                      <SquarePlus className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                          <h4 className={cn("font-bold", isOverridden ? "text-gray-600" : "text-gray-900")}>{slot.clinic.name}</h4>
                                          <span className="text-[11px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-semibold">
                                            [ID: {clinicIdStr}]
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-col sm:flex-row sm:items-start gap-x-6 gap-y-2 mt-3">
                                        <div className={cn(
                                          "flex items-center gap-1.5 shrink-0", 
                                          isOverridden ? "text-gray-400 line-through decoration-gray-400" : "text-[#0D8F7B]"
                                        )}>
                                          <Clock size={16} className={isOverridden ? "text-gray-400" : "text-[#0D8F7B]"} />
                                          <span className="font-bold text-sm">
                                            {timeSpan}
                                          </span>
                                        </div>
                                        <p className="text-gray-500 text-xs leading-relaxed max-w-sm mt-0.5">
                                          {slot.clinic.address}
                                        </p>
                                      </div>
                                      
                                      {isOverridden && (() => {
                                        const parsed = parseDescription(activeOverride?.description);
                                        const displayNote = parsed?.note || activeOverride?.description?.split(" | Note: ")[1] || "";
                                        
                                        if (isRescheduled && parsed) {
                                          return (
                                            <div className="mt-3 bg-blue-50/70 border border-blue-100 rounded-lg p-3 w-full text-xs space-y-1.5 text-blue-900">
                                              <div className="flex items-center gap-1.5 font-bold text-blue-700">
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                <span>Rescheduled Slot Info:</span>
                                              </div>
                                              {parsed.rescheduledTo && (
                                                <div className="flex items-center gap-1">
                                                  <span className="font-semibold text-blue-800">To Clinic:</span>
                                                  <span>{parsed.rescheduledTo}</span>
                                                </div>
                                              )}
                                              {parsed.rescheduledOn && (
                                                <div className="flex items-center gap-1">
                                                  <span className="font-semibold text-blue-800">New Date:</span>
                                                  <span>{formatRescheduledDate(parsed.rescheduledOn)}</span>
                                                </div>
                                              )}
                                              {displayNote && (
                                                <div className="flex items-start gap-1 text-[11px] text-blue-700/80 bg-white/50 px-2 py-1 rounded border border-blue-50 mt-1">
                                                  <span className="font-bold">Note:</span>
                                                  <span className="italic">"{displayNote}"</span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }

                                        const isLeave = activeOverride?.type === "Leave";
                                        const isHoliday = activeOverride?.type === "Holiday";

                                        return (
                                          <div className={cn("mt-3 text-xs font-semibold flex flex-col gap-1", isLeave ? "text-[#7C3AED]" : isHoliday ? "text-[#D97706]" : "text-[#B36247]")}>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-bold">Reason:</span>
                                              <span>{overrideReason}</span>
                                            </div>
                                            {displayNote && (
                                              <div className="text-[11px] font-normal text-gray-500 italic mt-0.5 pl-0.5">
                                                Note: "{displayNote}"
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                            {customSlots.map((mod) => {
                              const parsedSlot = parseSlotDescription(mod.description);
                              if (!parsedSlot) return null;
                              return (
                                <motion.div 
                                  key={mod.id}
                                  layout
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="relative border rounded-lg p-5 flex flex-col justify-between items-start gap-4 bg-[#F2FAF9] border-[#0D8F7B] shadow-md shadow-[#0D8F7B]/10 ring-1 ring-[#0D8F7B]/50 transition-all"
                                >
                                  <div className="absolute top-3 right-3 flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[#0D8F7B] bg-white border border-[#0D8F7B]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Premium Slot
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const confirmed = typeof window !== "undefined" 
                                          ? window.confirm("Are you sure you want to remove this premium slot?")
                                          : true;
                                        if (confirmed) {
                                          startTransition(async () => {
                                            const res = await rollbackOverride(mod.id);
                                            if (res.success) {
                                              toast.success("Premium slot removed successfully!");
                                              router.refresh();
                                            } else {
                                              toast.error(res.error || "Failed to remove slot.");
                                            }
                                          });
                                        }
                                      }}
                                      className="p-1 hover:bg-red-50 text-red-500 rounded-md transition-colors"
                                      title="Remove Slot"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  
                                  <div className="flex w-full gap-4">
                                    <div className="p-2 rounded-md h-10 w-10 flex items-center justify-center shrink-0 bg-[#0D8F7B] text-white">
                                      <SquarePlus className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 pr-24">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                          <h4 className="font-bold text-gray-900">{mod.clinic.name}</h4>
                                          <span className="text-[11px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-semibold">
                                            [ID: {mod.clinic.name.substring(0,2).toUpperCase() + "-DHAKA"}]
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-col sm:flex-row sm:items-start gap-x-6 gap-y-2 mt-3">
                                        <div className="flex items-center gap-1.5 shrink-0 text-[#0D8F7B]">
                                          <Clock size={16} className="text-[#0D8F7B]" />
                                          <span className="font-bold text-sm">
                                            {parsedSlot.startTime} - {parsedSlot.endTime}
                                          </span>
                                        </div>
                                        <p className="text-gray-500 text-xs leading-relaxed max-w-sm mt-0.5">
                                          {parsedSlot.consultationType}
                                        </p>
                                      </div>
                                      {parsedSlot.notes && (
                                        <div className="text-[11px] font-normal text-gray-500 italic mt-2.5">
                                          Note: "{parsedSlot.notes}"
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                          <button 
                            onClick={() => handleOpenAddSlot(dayObj.dayName, dayObj.fullDateStr)}
                            className="w-full py-3.5 border border-dashed border-gray-300 text-gray-500 text-sm font-semibold rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors flex justify-center items-center gap-2"
                          >
                            <Plus size={16} /> Add Slot for {dayObj.dayName}
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="h-full min-h-[100px] border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-semibold text-sm">
                            <BedDouble className="w-5 h-5 mr-2 text-gray-400" /> No slots scheduled for this day
                          </div>
                          <button 
                            onClick={() => handleOpenAddSlot(dayObj.dayName, dayObj.fullDateStr)}
                            className="w-full py-3.5 border border-dashed border-gray-300 text-gray-500 text-sm font-semibold rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors flex justify-center items-center gap-2"
                          >
                            <Plus size={16} /> Add Slot for {dayObj.dayName}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex-[1] w-full xl:max-w-[400px] space-y-6 xl:sticky xl:top-8">
          
          {/* Temporary Override Panel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="text-[#E57A5A] w-5 h-5" />
              <h3 className="font-bold text-lg text-gray-900">Temporary Override</h3>
            </div>
            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed pr-4">
              Instantly update your availability for emergencies or travel without changing your core routine.
            </p>

            <div className="mb-4 text-xs font-semibold text-gray-500">
              Target Clinic: <span className="text-[#0D8F7B]">{activeClinic?.clinic.name || "None Selected"}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {["Cancel Slot", "Holiday", "Leave", "Reschedule"].map((action) => {
                const isActive = overrideType === action;
                return (
                  <button
                    key={action}
                    onClick={() => setOverrideType(action)}
                    disabled={!activeClinicId}
                    className={cn(
                      "flex flex-col items-center justify-center py-5 border rounded-lg transition-all",
                      !activeClinicId ? "opacity-50 cursor-not-allowed" : "",
                      isActive 
                        ? "border-[#0D8F7B] bg-[#F2FAF9] text-[#0D8F7B]" 
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {getActionIcon(action, isActive)}
                    <span className={cn("text-[13px] font-bold", isActive ? "text-[#0D8F7B]" : "text-gray-700")}>{action}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 mb-6">
              {/* Effective Date Range */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  {overrideType === "Reschedule" ? "Original Slot Date" : "Effective Date Range"}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#0D8F7B] transition-colors">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Start Date</p>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-[13px] font-semibold outline-none text-gray-700 w-full" 
                    />
                  </div>
                  {overrideType !== "Reschedule" && (
                    <div className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#0D8F7B] transition-colors">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">End Date</p>
                      <input 
                        type="date" 
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-[13px] font-semibold outline-none text-gray-700 w-full" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Reschedule-specific fields */}
              {overrideType === "Reschedule" && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 border border-blue-100 bg-blue-50 rounded-lg p-4 overflow-hidden"
                  >
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">â†’ Reschedule Details</p>

                    {/* Target Clinic */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Target Clinic</label>
                      <select
                        value={rescheduleTargetClinicId}
                        onChange={(e) => setRescheduleTargetClinicId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors"
                      >
                        <option value="">-- Select target clinic --</option>
                        {initialClinics
                          .filter(c => c.clinic.id !== activeClinicId)
                          .map(c => (
                            <option key={c.clinic.id} value={c.clinic.id}>
                              {c.clinic.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* New Date Range */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">New Date at Target Clinic</label>
                      <div className="flex gap-2">
                        <div className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#0D8F7B] transition-colors">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">From</p>
                          <input
                            type="date"
                            value={rescheduleNewStart}
                            min={startDate}
                            onChange={(e) => setRescheduleNewStart(e.target.value)}
                            className="bg-transparent text-[13px] font-semibold outline-none text-gray-700 w-full"
                          />
                        </div>
                        <div className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#0D8F7B] transition-colors">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">To</p>
                          <input
                            type="date"
                            value={rescheduleNewEnd}
                            min={rescheduleNewStart}
                            onChange={(e) => setRescheduleNewEnd(e.target.value)}
                            className="bg-transparent text-[13px] font-semibold outline-none text-gray-700 w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Note / Reason (all types) */}
              {overrideType && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Reason / Note <span className="font-normal text-gray-400">(optional)</span></label>
                  <textarea
                    rows={2}
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder={`e.g. ${overrideType === "Reschedule" ? "Patient volume too high" : overrideType === "Holiday" ? "National holiday" : overrideType === "Leave" ? "Medical leave" : "Emergency cancellation"}`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors resize-none"
                  />
                </div>
              )}
            </div>

            <button 
              onClick={handleOverrideSubmit}
              disabled={isPending || !overrideType || !activeClinic || (overrideType === "Reschedule" && !rescheduleTargetClinicId)}
              className="w-full bg-[#0D8F7B] text-white font-bold rounded-lg py-3.5 hover:bg-[#0b7a69] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                 <>
                   <RotateCcw className="w-4 h-4 animate-spin" /> Updating...
                 </>
              ) : (
                "Post Update to All Platforms"
              )}
            </button>
          </div>

          {/* Active Overrides */}
          <div className="bg-[#F8FBFB] rounded-xl border border-[#EAF5F3] shadow-sm p-5">
            <div className="flex justify-between items-center mb-5">
               <h3 className="font-bold text-[11px] uppercase tracking-wider text-gray-600">Active Overrides</h3>
               <span className="bg-[#10B981] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Live ({initialModifications.filter(m => (m.clinic.id === activeClinic.clinic.id || m.type === "Holiday") && m.type !== "Slot").length})</span>
            </div>
            
            <div className="space-y-3">
               <AnimatePresence>
                {initialModifications
                  .filter(m => (m.clinic.id === activeClinic.clinic.id || m.type === "Holiday") && m.type !== "Slot")
                  .map(mod => {
                  const isReschedule = mod.type === "Reschedule";
                  const isHoliday   = mod.type === "Holiday";
                  const isLeave     = mod.type === "Leave";
                  const borderColor = isReschedule ? "bg-[#3B82F6]" : isHoliday ? "bg-[#F59E0B]" : isLeave ? "bg-[#8B5CF6]" : "bg-[#E57A5A]";
                  const textColor = isReschedule ? "text-[#3B82F6]" : isHoliday ? "text-[#D97706]" : isLeave ? "text-[#7C3AED]" : "text-[#E57A5A]";
                  
                  let modStart = mod.date;
                  let modEnd = mod.date;
                  
                  const match = mod.description?.match(/^\[(.*?)\|(.*?)\]/);
                  if (match) {
                    modStart = parseISO(match[1]);
                    modEnd = parseISO(match[2]);
                  }

                  const parsed = parseDescription(mod.description);
                  const displayNote = parsed?.note || mod.description?.split(" | Note: ")[1] || "";

                  return (
                    <motion.div 
                      key={mod.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden flex flex-col gap-2.5"
                    >
                      <div className={cn("absolute left-0 top-0 bottom-0 w-1", borderColor)} />
                      <div className="flex justify-between items-start pl-2">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{mod.type}</h4>
                          <p className="text-[11px] text-gray-500 mt-1">From: {mod.clinic.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Expires</p>
                          <p className={cn("text-xs font-bold", textColor)}>{format(modEnd, "MMM dd")}</p>
                        </div>
                      </div>
                      <div className={cn("pl-2 flex items-center gap-1.5 text-[11px] font-semibold", textColor)}>
                        <Clock className="w-3.5 h-3.5" /> 
                        <span>
                          {isReschedule ? "Original Date: " : ""}
                          {isSameDay(modStart, modEnd) 
                            ? `${format(modStart, "MMM dd, yyyy")}`
                            : `${format(modStart, "MMM dd")} to ${format(modEnd, "MMM dd")}`
                          }
                        </span>
                      </div>

                      {isReschedule && parsed && (
                        <div className="pl-2 border-t border-blue-100 pt-2 flex flex-col gap-1 text-[11px] bg-blue-50/50 p-2 rounded border border-blue-50 mt-1">
                          {parsed.rescheduledTo && (
                            <div className="flex items-start gap-1">
                              <span className="font-bold text-blue-700">To Clinic:</span>
                              <span className="text-blue-900">{parsed.rescheduledTo}</span>
                            </div>
                          )}
                          {parsed.rescheduledOn && (
                            <div className="flex items-start gap-1">
                              <span className="font-bold text-blue-700">New Date:</span>
                              <span className="text-blue-900">{formatRescheduledDate(parsed.rescheduledOn)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {displayNote && (
                        <div className="pl-2 text-[11px] text-gray-500 italic mt-0.5 border-t border-gray-100 pt-1.5">
                          Note: "{displayNote}"
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {initialModifications.filter(m => (m.clinic.id === activeClinic.clinic.id || m.type === "Holiday") && m.type !== "Slot").length === 0 && (
                <div className="text-center py-6 text-sm font-semibold text-gray-400">
                  No active overrides in the system.
                </div>
              )}
            </div>
          </div>

          {/* Map context */}
          {activeClinic && (
            <div className="bg-[#E6EEF4] rounded-xl border border-[#D5E1EA] overflow-hidden relative shadow-sm">
              <div className="h-40 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#b3c7d6] to-[#e4edf3]" />
                <div className="absolute top-10 left-10"><MapPin className="text-[#0D8F7B] w-5 h-5 drop-shadow-md" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#E6EEF4] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="bg-[#0D8F7B] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5">
                    Selected Location
                  </div>
                  <h4 className="text-gray-900 font-bold text-sm">{activeClinic.clinic.name}</h4>
                </div>
              </div>
              <div className="px-5 py-4 bg-[#E6EEF4]">
                <p className="text-[11px] text-gray-600 mb-3">{activeClinic.clinic.address}</p>
                <a href="#" className="text-xs font-bold text-[#0D8F7B] flex items-center justify-center gap-1.5 hover:underline">
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Slot Premium Modal */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-100"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Add Premium Slot</h2>
                <p className="text-gray-500 text-sm">Create a new slot for {addSlotDay}, {addSlotDate} at {activeClinic.clinic.name}</p>
              </div>
              <button onClick={() => setIsAddSlotModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSlotSubmit} className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Start Time</label>
                  <input 
                    type="time" 
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:border-[#0D8F7B] outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">End Time</label>
                  <input 
                    type="time" 
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:border-[#0D8F7B] outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Consultation Type</label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:border-[#0D8F7B] outline-none transition-colors"
                >
                  <option value="General Consultation">General Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Specialist Visit">Specialist Visit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Notes (Optional)</label>
                <textarea 
                  rows={2}
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:border-[#0D8F7B] outline-none transition-colors resize-none"
                  placeholder="Any specific notes for this slot..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="flex-1 py-3 font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-[2] bg-[#0D8F7B] hover:bg-[#0b7a69] text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Add Slot"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
