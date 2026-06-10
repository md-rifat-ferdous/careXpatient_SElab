'use client';

import React from 'react';






// ─── Status visual configuration ──────────────────────────────────────────────

const STATUS_CONFIG = {
  Confirmed: {
    dot: 'bg-teal-500',
    badge: 'bg-teal-50 text-teal-700',
    label: 'Confirmed'
  },
  Completed: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    label: 'Completed'
  },
  Pending: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700',
    label: 'Pending'
  },
  Cancelled: {
    dot: 'bg-rose-400',
    badge: 'bg-rose-50 text-rose-700',
    label: 'Cancelled'
  },
  NoShow: {
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600',
    label: 'No Show'
  }
};

/**
 * Renders a time-ordered list of appointments as a schedule timeline.
 * Each row shows time, patient name, appointment type, and status badge.
 */
export default function DoctorScheduleTimeline({ appointments }) {
  if (appointments.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500">No appointments in this view</p>
      </div>);

  }

  return (
    <div className="divide-y divide-slate-100">
      {appointments.map((appt, index) => {
        const config = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.Pending;
        const isCurrent = appt.status === 'Confirmed' && index === 0;

        return (
          <div
            key={appt.id}
            className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
            isCurrent ? 'bg-teal-50/60' : 'hover:bg-slate-50/60'}`
            }>
            
            {/* Time */}
            <div className={`w-16 flex-shrink-0 text-xs font-bold tracking-tight ${isCurrent ? 'text-teal-600' : 'text-slate-500'}`}>
              {appt.timeSlot}
            </div>

            {/* Status dot + content */}
            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-teal-800' : 'text-slate-800'}`}>
                  {appt.patientName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {appt.type === 'Online' ? '📹 Video' : '🏥 In-person'}
                  {appt.clinicName ? ` · ${appt.clinicName}` : ''}
                  {` · ${appt.durationMinutes} min`}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <span className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${config.badge}`}>
              {config.label}
            </span>
          </div>);

      })}
    </div>);

}