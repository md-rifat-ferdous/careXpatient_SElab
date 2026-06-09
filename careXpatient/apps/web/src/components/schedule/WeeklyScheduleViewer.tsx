'use client';

import React, { useMemo } from 'react';
import {
  format, startOfWeek, addDays, isSameDay, isToday,
} from 'date-fns';
import { Clock, MapPin, Sparkles, Ban, RotateCcw, Printer } from 'lucide-react';
import type { ClinicData, ModificationData } from '@/server/doctorSchedule/queries/scheduleQueries';

type Props = {
  clinics: ClinicData[];
  modifications: ModificationData[];
  weekStart?: Date;
};

function parseDaysFromShift(shift: string | null): string[] {
  if (!shift) return [];
  const dayStr = shift.split('|')[0]?.trim() ?? '';
  return dayStr.split(',').map((d) => d.trim());
}

function getOverrideForDay(modifications: ModificationData[], clinicId: string, date: Date) {
  return modifications.find(
    (mod) =>
      mod.clinic.id === clinicId &&
      isSameDay(new Date(mod.dateISO), date) &&
      ['Cancel Slot', 'Reschedule', 'Holiday', 'Leave'].includes(mod.type)
  );
}

function parseSlotDescription(description?: string | null) {
  if (!description) return null;
  const match = description.match(/\[(\d{2}:\d{2})\|(\d{2}:\d{2})\]\s*(.+?)(?:\s*\|\s*Note:\s*(.+))?$/);
  if (!match) return null;
  return { startTime: match[1], endTime: match[2], consultationType: match[3]?.trim() ?? '', notes: match[4]?.trim() ?? null };
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export function WeeklyScheduleViewer({ clinics, modifications, weekStart }: Props) {
  const today = new Date();
  const weekStartDate = weekStart ?? startOfWeek(today, { weekStartsOn: 0 });

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStartDate, i);
      return {
        date,
        dayName: format(date, 'EEE').toUpperCase(),
        shortDate: format(date, 'MMM d'),
        fullDateStr: format(date, 'yyyy-MM-dd'),
      };
    }), [weekStartDate]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Weekly Schedule</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {format(weekStartDate, 'MMM d')} – {format(addDays(weekStartDate, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Printer size={15} />
          Print
        </button>
      </div>

      {/* Week Grid */}
      <div className="p-6 divide-y divide-gray-50">
        {weekDays.map((dayObj) => {
          const todayFlag = isToday(dayObj.date);
          const dayClinics = clinics.filter((dc) => {
            const days = parseDaysFromShift(dc.shift);
            return days.includes(dayObj.dayName);
          });
          const dayCustomSlots = modifications.filter(
            (mod) => mod.type === 'Slot' && isSameDay(new Date(mod.dateISO), dayObj.date)
          );
          const hasContent = dayClinics.length > 0 || dayCustomSlots.length > 0;

          return (
            <div
              key={dayObj.fullDateStr}
              className={cn(
                'py-5 flex flex-col md:flex-row gap-5 items-start rounded-2xl px-3 -mx-3 transition-colors',
                todayFlag ? 'bg-blue-50/60' : 'hover:bg-gray-50/50'
              )}
            >
              {/* Day label */}
              <div className="w-full md:w-32 shrink-0">
                <span className={cn('text-[10px] font-black uppercase tracking-widest', todayFlag ? 'text-blue-600' : 'text-gray-400')}>
                  {dayObj.dayName}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h4 className={cn('text-lg font-black tracking-tight', todayFlag ? 'text-blue-600' : 'text-gray-900')}>
                    {dayObj.shortDate}
                  </h4>
                  {todayFlag && (
                    <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
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
                      const timeSpan = dc.shift?.split('|')[1]?.trim() ?? 'Scheduled';

                      return (
                        <div
                          key={dc.id}
                          className={cn(
                            'p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all bg-white',
                            isOverridden ? 'border-dashed border-gray-200 opacity-70' : 'border-gray-200 shadow-sm'
                          )}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-gray-900 text-sm">{dc.clinic.name}</h5>
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Regular Shift</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Clock size={13} className="text-blue-600" />
                                <span>{timeSpan}</span>
                              </div>
                              {dc.clinic.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin size={13} className="text-blue-600" />
                                  <span className="truncate max-w-[180px]">{dc.clinic.address}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {isOverridden ? (
                            <div className={cn(
                              'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0',
                              override!.type === 'Holiday' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              override!.type === 'Leave' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              override!.type === 'Reschedule' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            )}>
                              {override!.type === 'Reschedule' ? <RotateCcw size={11} /> : <Ban size={11} />}
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
                          className="p-4 rounded-xl border border-blue-200/50 bg-blue-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-gray-900 text-sm">{mod.clinic.name}</h5>
                              <span className="text-[9px] font-black text-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Sparkles size={9} className="fill-blue-600" />
                                Custom Slot
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
                              <div className="flex items-center gap-1 text-blue-600">
                                <Clock size={13} />
                                <span>{parsed.startTime} – {parsed.endTime}</span>
                              </div>
                              <span className="text-gray-600">{parsed.consultationType}</span>
                            </div>
                            {parsed.notes && <p className="text-[11px] text-gray-500 italic">Note: &quot;{parsed.notes}&quot;</p>}
                          </div>
                          <span className="text-[10px] font-black text-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                            Active
                          </span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="py-5 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                    <p className="text-gray-400 text-xs font-bold">No clinics or slots scheduled</p>
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
