"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@my-clinic/ui";
import {
  ArrowLeft, Printer, Plus, Ban, Plane, Asterisk, RotateCcw,
  CalendarDays, Bell, Clock, BedDouble, Check, Trash2, Loader2,
  SquarePlus, ChevronDown
} from "lucide-react";
import {
  createSlot, cancelSlot, applyHoliday, applyLeave, rescheduleSlot, rollbackOverride,
} from "@/server/doctorSchedule/scheduleService";
import type { DoctorClinicInfo, ModificationInfo } from "@/server/doctorSchedule/scheduleService";
import {
  format, addDays, startOfToday, isSameDay, parseISO,
  startOfDay, endOfDay, isWithinInterval,
} from "date-fns";
import { toast, Toaster } from "sonner";

interface Props {
  initialClinics: DoctorClinicInfo[];
  initialModifications: ModificationInfo[];
  focusClinicId: string;
}

const ACTION_TYPES = ["Cancel Slot", "Holiday", "Leave", "Reschedule"] as const;
type ActionType = typeof ACTION_TYPES[number];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function parseDaysFromShift(shiftStr: string): string[] {
  const str = shiftStr.toLowerCase();
  if (str.includes("sun-thu") || str.includes("sun to thu"))
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  if (str.includes("mon-fri") || str.includes("mon to fri"))
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  if (str.includes("mon-wed") || str.includes("mon to wed"))
    return ["Monday", "Tuesday", "Wednesday"];

  const days: string[] = [];
  if (str.includes("mon")) days.push("Monday");
  if (str.includes("tue")) days.push("Tuesday");
  if (str.includes("wed")) days.push("Wednesday");
  if (str.includes("thu")) days.push("Thursday");
  if (str.includes("fri")) days.push("Friday");
  if (str.includes("sat")) days.push("Saturday");
  if (str.includes("sun")) days.push("Sunday");
  return days.length ? Array.from(new Set(days)) : ["Monday", "Wednesday", "Saturday"];
}

function parseSlotDescription(desc: string | null | undefined) {
  if (!desc) return null;
  const m = desc.match(/^\[([^\]|]+)\|([^\]]+)\]\s*(.*?)(?:\s*\|\s*Note:\s*(.*))?$/);
  if (!m) return null;
  return {
    startTime: m[1]?.trim() || "",
    endTime: m[2]?.trim() || "",
    consultationType: m[3]?.trim() || "",
    notes: m[4]?.trim() || "",
  };
}

function getModNote(desc: string | null | undefined): string {
  if (!desc) return "";
  const noteMatch = desc.match(/Note:\s*(.+)$/);
  return noteMatch?.[1]?.trim() || "";
}

function getOverrideForSlot(
  modifications: ModificationInfo[],
  clinicId: string,
  checkDate: Date
): ModificationInfo | undefined {
  return modifications.find((mod) => {
    if (mod.type === "Slot") return false;

    const rangeMatch = mod.description?.match(/^\[([^\]|]+)\|([^\]]+)\]/);
    let modStart: Date;
    let modEnd: Date;

    if (rangeMatch) {
      try {
        modStart = startOfDay(parseISO(rangeMatch[1].trim()));
        modEnd = endOfDay(parseISO(rangeMatch[2].trim()));
      } catch {
        modStart = startOfDay(new Date(mod.dateISO));
        modEnd = endOfDay(new Date(mod.dateISO));
      }
    } else {
      modStart = startOfDay(new Date(mod.dateISO));
      modEnd = endOfDay(new Date(mod.dateISO));
    }

    if (mod.type === "Holiday") {
      return isWithinInterval(checkDate, { start: modStart, end: modEnd });
    }
    if (mod.clinic.id !== clinicId) return false;
    return isWithinInterval(checkDate, { start: modStart, end: modEnd });
  });
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ScheduleManagerClient({
  initialClinics,
  initialModifications,
  focusClinicId,
}: Props) {
  const today = startOfToday();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // The active (focused) clinic — guaranteed non-null because page.tsx validates this
  const activeClinic = initialClinics.find((c) => c.clinic.id === focusClinicId)!;

  // ── Override panel state
  const [overrideType, setOverrideType] = useState<ActionType | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [overrideNote, setOverrideNote] = useState("");
  const [targetClinicId, setTargetClinicId] = useState("");
  const [rescheduleNewStart, setRescheduleNewStart] = useState("");
  const [rescheduleNewEnd, setRescheduleNewEnd] = useState("");

  // ── Add slot modal state
  const [addSlotOpen, setAddSlotOpen] = useState(false);
  const [slotDay, setSlotDay] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("17:00");
  const [slotType, setSlotType] = useState("General Consultation");
  const [slotNote, setSlotNote] = useState("");

  // ── Build 7-day view
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = addDays(today, i);
        return {
          date: d,
          dayName: format(d, "EEEE"),
          shortDate: format(d, "MMM dd"),
          fullDateStr: format(d, "yyyy-MM-dd"),
        };
      }),
    [today]
  );

  // ── Build schedule for this clinic by day
  const weeklySchedule = useMemo(() => {
    const schedule: Record<string, DoctorClinicInfo[]> = {};
    weekDays.forEach((d) => (schedule[d.dayName] = []));
    const shiftDays = parseDaysFromShift(activeClinic.shift);
    shiftDays.forEach((day) => {
      if (schedule[day]) schedule[day].push(activeClinic);
    });
    return schedule;
  }, [activeClinic, weekDays]);

  // ── Handlers

  const openAddSlot = (dayName: string, dateStr: string) => {
    setSlotDay(dayName);
    setSlotDate(dateStr);
    setAddSlotOpen(true);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (slotStart >= slotEnd) {
      toast.error("Invalid Time Range: Start time must be before end time.");
      return;
    }
    startTransition(async () => {
      const res = await createSlot({
        clinicId: focusClinicId,
        date: slotDate,
        startTime: slotStart,
        endTime: slotEnd,
        consultationType: slotType,
        notes: slotNote,
      });
      if (res.success) {
        toast.success(`Slot added for ${slotDay}!`);
        setAddSlotOpen(false);
        setSlotStart("09:00");
        setSlotEnd("17:00");
        setSlotType("General Consultation");
        setSlotNote("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add slot.");
      }
    });
  };

  const handleOverrideSubmit = () => {
    if (!overrideType || !startDate) {
      toast.error("Please select an action and a start date.");
      return;
    }
    if (overrideType === "Reschedule" && !targetClinicId) {
      toast.error("Please select a target clinic.");
      return;
    }
    if (overrideType !== "Reschedule" && overrideType !== "Cancel Slot" && endDate && startDate > endDate) {
      toast.error("End date must be after or equal to start date.");
      return;
    }
    if (overrideType === "Reschedule" && rescheduleNewEnd && rescheduleNewStart > rescheduleNewEnd) {
      toast.error("New end date must be after or equal to new start date.");
      return;
    }

    startTransition(async () => {
      let res: { success: boolean; error?: string } | undefined;

      if (overrideType === "Cancel Slot") {
        res = await cancelSlot({ clinicId: focusClinicId, date: startDate, reason: overrideNote });
      } else if (overrideType === "Holiday") {
        res = await applyHoliday({ startDate, endDate: endDate || startDate, reason: overrideNote });
      } else if (overrideType === "Leave") {
        res = await applyLeave({ clinicId: focusClinicId, startDate, endDate: endDate || startDate, reason: overrideNote });
      } else if (overrideType === "Reschedule") {
        res = await rescheduleSlot({
          sourceClinicId: focusClinicId,
          targetClinicId,
          originalDate: startDate,
          newStartDate: rescheduleNewStart || startDate,
          newEndDate: rescheduleNewEnd || rescheduleNewStart || startDate,
          reason: overrideNote,
        });
      }

      if (!res?.success) {
        toast.error(res?.error || "Action failed.");
      } else {
        toast.success(`"${overrideType}" applied successfully!`);
        setOverrideType(null);
        setStartDate("");
        setEndDate("");
        setOverrideNote("");
        setTargetClinicId("");
        setRescheduleNewStart("");
        setRescheduleNewEnd("");
        router.refresh();
      }
    });
  };

  const handleRemoveSlot = (id: string) => {
    if (!window.confirm("Remove this premium slot?")) return;
    startTransition(async () => {
      const res = await rollbackOverride(id);
      if (res.success) {
        toast.success("Slot removed.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove slot.");
      }
    });
  };

  const otherClinics = initialClinics.filter((c) => c.clinic.id !== focusClinicId);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full font-sans bg-[#F9FAFB] min-h-screen">
      <Toaster position="top-right" richColors />

      {/* Back + Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-start gap-4">
          <Link
            href="/doctor/schedule"
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all mt-1"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{activeClinic.clinic.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {activeClinic.clinic.address} &nbsp;·&nbsp;
              <span className="font-semibold text-[#0D8F7B]">{activeClinic.shift}</span>
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#0D8F7B] text-[#0D8F7B] font-semibold rounded-xl shadow-sm hover:bg-[#F2FAF9] transition-colors text-sm">
          <Printer size={16} />
          Export Schedule
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">

        {/* ── Main Timeline ── */}
        <div className="flex-[2] w-full min-w-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-[#0D8F7B]" size={18} />
                <h2 className="font-bold text-gray-900">Weekly Schedule — Next 7 Days</h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0D8F7B]" /> Regular
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Overridden
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 px-6">
              {weekDays.map((dayObj) => {
                const slots = weeklySchedule[dayObj.dayName] || [];
                const customSlots = initialModifications.filter(
                  (mod) =>
                    mod.type === "Slot" &&
                    mod.clinic.id === focusClinicId &&
                    isSameDay(new Date(mod.dateISO), dayObj.date)
                );
                const hasSlots = slots.length > 0 || customSlots.length > 0;

                return (
                  <div key={dayObj.fullDateStr} className="flex flex-col sm:flex-row py-5 gap-5 group">
                    {/* Day column */}
                    <div className="w-24 shrink-0 pt-1">
                      <h3 className="font-bold text-[11px] uppercase tracking-wider text-gray-500">
                        {dayObj.dayName}
                      </h3>
                      <p className={cn("font-black text-lg mt-0.5", isSameDay(dayObj.date, today) ? "text-[#0D8F7B]" : "text-gray-900")}>
                        {dayObj.shortDate}
                      </p>
                      {isSameDay(dayObj.date, today) && (
                        <span className="text-[10px] font-bold text-[#0D8F7B] uppercase">Today</span>
                      )}
                    </div>

                    {/* Slots column */}
                    <div className="flex-1 space-y-3">
                      {hasSlots ? (
                        <>
                          {slots.map((slot, idx) => {
                            const override = getOverrideForSlot(initialModifications, slot.clinic.id, dayObj.date);
                            const isOverridden = !!override;
                            const timeSpan = slot.shift.split("|")[1]?.trim() || "Scheduled";
                            const note = getModNote(override?.description);

                            const overrideBorderClass =
                              override?.type === "Reschedule"
                                ? "border-blue-200 bg-blue-50/50"
                                : override?.type === "Holiday"
                                ? "border-amber-200 bg-amber-50/50"
                                : override?.type === "Leave"
                                ? "border-purple-200 bg-purple-50/50"
                                : "border-red-200 bg-red-50/50";

                            const overrideBadgeClass =
                              override?.type === "Reschedule"
                                ? "bg-blue-500"
                                : override?.type === "Holiday"
                                ? "bg-amber-500"
                                : override?.type === "Leave"
                                ? "bg-purple-500"
                                : "bg-red-500";

                            return (
                              <div
                                key={`${dayObj.fullDateStr}-${idx}`}
                                className={cn(
                                  "relative border rounded-xl p-5 transition-all",
                                  isOverridden
                                    ? `${overrideBorderClass} opacity-80`
                                    : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                                )}
                              >
                                {isOverridden && (
                                  <div className={cn("absolute top-0 right-0 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-xl", overrideBadgeClass)}>
                                    {override!.type}
                                  </div>
                                )}

                                <div className="flex items-start gap-4">
                                  <div className={cn(
                                    "p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0",
                                    isOverridden ? "bg-gray-100 text-gray-400" : "bg-[#EAF5F3] text-[#0D8F7B]"
                                  )}>
                                    <SquarePlus className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className={cn("font-bold text-sm", isOverridden ? "text-gray-500" : "text-gray-900")}>
                                      {slot.clinic.name}
                                    </h4>
                                    <div className={cn(
                                      "flex items-center gap-1.5 mt-1 text-sm font-semibold",
                                      isOverridden ? "text-gray-400 line-through" : "text-[#0D8F7B]"
                                    )}>
                                      <Clock size={14} />
                                      {timeSpan}
                                    </div>
                                    {isOverridden && note && (
                                      <p className="text-xs text-gray-500 italic mt-1">Note: &quot;{note}&quot;</p>
                                    )}
                                    {!isOverridden && (
                                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                                        <Check size={13} className="text-[#0D8F7B]" />
                                        <span>Active</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {customSlots.map((mod) => {
                            const parsed = parseSlotDescription(mod.description);
                            if (!parsed) return null;
                            return (
                              <div
                                key={mod.id}
                                className="relative border rounded-xl p-5 bg-[#F2FAF9] border-[#0D8F7B]/30 shadow-sm"
                              >
                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-[#0D8F7B] bg-white border border-[#0D8F7B]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Premium Slot
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSlot(mod.id)}
                                    disabled={isPending}
                                    className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                                    title="Remove slot"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                                <div className="flex items-start gap-4 pr-24">
                                  <div className="p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0 bg-[#0D8F7B] text-white">
                                    <SquarePlus className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm text-gray-900">{mod.clinic.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-[#0D8F7B]">
                                      <Clock size={14} />
                                      {parsed.startTime} – {parsed.endTime}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{parsed.consultationType}</p>
                                    {parsed.notes && (
                                      <p className="text-xs text-gray-400 italic mt-0.5">Note: &quot;{parsed.notes}&quot;</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          <button
                            onClick={() => openAddSlot(dayObj.dayName, dayObj.fullDateStr)}
                            className="w-full py-3 border border-dashed border-gray-300 text-gray-500 text-sm font-semibold rounded-xl hover:border-[#0D8F7B] hover:text-[#0D8F7B] transition-colors flex justify-center items-center gap-2"
                          >
                            <Plus size={15} />
                            Add Premium Slot
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="min-h-[90px] border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-semibold text-sm gap-2">
                            <BedDouble className="w-5 h-5" />
                            No slots scheduled
                          </div>
                          <button
                            onClick={() => openAddSlot(dayObj.dayName, dayObj.fullDateStr)}
                            className="w-full py-3 border border-dashed border-gray-300 text-gray-500 text-sm font-semibold rounded-xl hover:border-[#0D8F7B] hover:text-[#0D8F7B] transition-colors flex justify-center items-center gap-2"
                          >
                            <Plus size={15} />
                            Add Premium Slot
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

        {/* ── Right Sidebar: Override Panel ── */}
        <div className="w-full xl:w-[380px] shrink-0 space-y-5 xl:sticky xl:top-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="text-red-400 w-5 h-5" />
              <h3 className="font-bold text-lg text-gray-900">Temporary Override</h3>
            </div>
            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
              Instantly update your availability for this clinic without changing your core routine.
            </p>

            <div className="mb-4 text-xs font-semibold text-gray-500">
              Target Clinic:{" "}
              <span className="text-[#0D8F7B]">{activeClinic.clinic.name}</span>
            </div>

            {/* Action type buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {ACTION_TYPES.map((action) => {
                const isActive = overrideType === action;
                const icons: Record<string, React.ReactNode> = {
                  "Cancel Slot": <Ban className="w-5 h-5 mb-1.5" />,
                  Holiday: <Plane className="w-5 h-5 mb-1.5" />,
                  Leave: <Asterisk className="w-5 h-5 mb-1.5" />,
                  Reschedule: <RotateCcw className="w-5 h-5 mb-1.5" />,
                };
                return (
                  <button
                    key={action}
                    onClick={() => setOverrideType(action)}
                    className={cn(
                      "flex flex-col items-center justify-center py-4 border rounded-xl transition-all text-sm",
                      isActive
                        ? "border-[#0D8F7B] bg-[#F2FAF9] text-[#0D8F7B]"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {icons[action]}
                    <span className={cn("font-bold text-[12px]", isActive ? "text-[#0D8F7B]" : "text-gray-700")}>
                      {action}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Date inputs */}
            {overrideType && (
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    {overrideType === "Reschedule" ? "Original Slot Date" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors"
                  />
                </div>

                {overrideType !== "Reschedule" && overrideType !== "Cancel Slot" && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors"
                    />
                  </div>
                )}

                {overrideType === "Reschedule" && (
                  <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Reschedule Details</p>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Target Clinic</label>
                      <div className="relative">
                        <select
                          value={targetClinicId}
                          onChange={(e) => setTargetClinicId(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors appearance-none pr-8"
                        >
                          <option value="">— Select clinic —</option>
                          {otherClinics.map((c) => (
                            <option key={c.clinic.id} value={c.clinic.id}>
                              {c.clinic.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">New From</label>
                        <input
                          type="date"
                          value={rescheduleNewStart}
                          onChange={(e) => setRescheduleNewStart(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">New To</label>
                        <input
                          type="date"
                          value={rescheduleNewEnd}
                          min={rescheduleNewStart}
                          onChange={(e) => setRescheduleNewEnd(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Reason / Note <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="e.g. Emergency situation..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleOverrideSubmit}
              disabled={!overrideType || !startDate || isPending}
              className="w-full py-3 bg-[#0D8F7B] text-white rounded-xl font-bold text-sm hover:bg-[#0b7a69] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {isPending ? "Applying..." : "Apply Override"}
            </button>
          </div>

          {/* Recent overrides list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Active Overrides for This Clinic</h3>
            {(() => {
              const clinicMods = initialModifications.filter(
                (m) => (m.clinic.id === focusClinicId || m.type === "Holiday") && m.type !== "Slot"
              );
              if (clinicMods.length === 0) {
                return (
                  <p className="text-xs text-gray-400 font-semibold text-center py-4">
                    No active overrides.
                  </p>
                );
              }
              return (
                <div className="space-y-3">
                  {clinicMods.slice(0, 5).map((mod) => (
                    <div key={mod.id} className="flex items-start justify-between gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                          mod.type === "Holiday" ? "bg-amber-100 text-amber-700" :
                          mod.type === "Leave" ? "bg-purple-100 text-purple-700" :
                          mod.type === "Reschedule" ? "bg-blue-100 text-blue-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {mod.type}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {format(new Date(mod.dateISO), "MMM dd, yyyy")}
                          {mod.description && ` · ${getModNote(mod.description) || mod.type}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(mod.id)}
                        disabled={isPending}
                        className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors shrink-0"
                        title="Remove override"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Add Slot Modal ── */}
      {addSlotOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-7 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-black text-gray-900">Add Premium Slot</h2>
                <p className="text-gray-500 text-xs mt-0.5">{slotDay} — {slotDate}</p>
              </div>
              <button onClick={() => setAddSlotOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                  Consultation Type
                </label>
                <div className="relative">
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors appearance-none pr-8"
                  >
                    <option>General Consultation</option>
                    <option>Emergency Consultation</option>
                    <option>Follow-up Visit</option>
                    <option>Specialist Consultation</option>
                    <option>Procedure / Surgery</option>
                    <option>Telemedicine</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                  Note <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={slotNote}
                  onChange={(e) => setSlotNote(e.target.value)}
                  placeholder="e.g. Priority patients only"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-[#0D8F7B] transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSlotOpen(false)}
                  className="flex-1 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-[2] py-2.5 bg-[#0D8F7B] text-white font-bold rounded-xl hover:bg-[#0b7a69] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {isPending ? "Adding..." : "Add Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
