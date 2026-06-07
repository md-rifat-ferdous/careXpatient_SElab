'use client';

import React from 'react';
import {
  Monitor,
  Building2,
  Clock,
  FileText,
  XCircle,
  CheckCircle2,
  Circle,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import { PatientAppointmentEntry, AppointmentStatus } from '@/services/doctor.service';

// ─── Status Config ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  Pending: {
    label: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    Icon: Circle,
  },
  Confirmed: {
    label: 'Confirmed',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    Icon: CheckCircle2,
  },
  Completed: {
    label: 'Completed',
    color: 'text-green-700',
    bg: 'bg-green-50',
    Icon: CheckCircle2,
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    Icon: XCircle,
  },
  NoShow: {
    label: 'No Show',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    Icon: AlertCircle,
  },
};

// ─── Type Icon ─────────────────────────────────────────────────────────────────

function TypeChip({ type }: { type: 'In_person' | 'Online' }) {
  const isOnline = type === 'Online';
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isOnline ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {isOnline ? <Monitor size={11} /> : <Building2 size={11} />}
      {isOnline ? 'Online' : 'In-person'}
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.Pending;
  const { Icon } = cfg;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </div>
  );
}

// ─── Single Appointment Card ───────────────────────────────────────────────────

function AppointmentCard({ appt }: { appt: PatientAppointmentEntry }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Date Block */}
      <div className="flex-shrink-0 w-16 text-center bg-slate-50 rounded-xl py-3 px-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
          {appt.date.split(' ')[1]}
        </p>
        <p className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">
          {appt.date.split(' ')[0]}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {appt.date.split(' ')[2]}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <TypeChip type={appt.type} />
          <StatusBadge status={appt.status} />
          {appt.clinicName && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Building2 size={11} />
              {appt.clinicName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Clock size={12} className="text-slate-400" />
          {appt.timeSlot} · {appt.durationMinutes} min
        </div>

        {appt.reasonForVisit && (
          <div className="flex items-start gap-1.5 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
            <FileText size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="leading-snug">{appt.reasonForVisit}</span>
          </div>
        )}

        {appt.cancellationReason && (
          <div className="flex items-start gap-1.5 text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2 mt-2">
            <XCircle size={13} className="mt-0.5 flex-shrink-0" />
            <span className="leading-snug">Cancelled: {appt.cancellationReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PatientAppointmentHistoryProps {
  appointments: PatientAppointmentEntry[];
}

export default function PatientAppointmentHistory({ appointments }: PatientAppointmentHistoryProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 gap-4">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
          <CalendarDays size={24} className="text-slate-300" />
        </div>
        <p className="text-slate-500 text-sm font-medium">No appointment history with this patient yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appt) => (
        <AppointmentCard key={appt.id} appt={appt} />
      ))}
    </div>
  );
}
