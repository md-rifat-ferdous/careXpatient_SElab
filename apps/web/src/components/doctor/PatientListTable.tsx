'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  ChevronRight,
  Phone,
  Droplets,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { DoctorPatient } from '@/services/doctor.service';

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Avatar Initials ──────────────────────────────────────────────────────────

function PatientAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
      <span className="text-teal-700 font-bold text-sm">{initials}</span>
    </div>
  );
}

// ─── Status Chip for Blood Group ──────────────────────────────────────────────

function BloodGroupBadge({ group }: { group: string | null }) {
  if (!group) return <span className="text-slate-400 text-sm">—</span>;
  return (
    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
      <Droplets size={11} />
      {group}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PatientListTableProps {
  patients: DoctorPatient[];
  loading: boolean;
}

export default function PatientListTable({ patients, loading }: PatientListTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Patient', 'Contact', 'Last Visit', 'Records'].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
          <User size={28} className="text-slate-300" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700">No patients found</p>
          <p className="text-sm text-slate-400 mt-1">Patients will appear here once they book appointments with you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Blood Group</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Visit</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Appointments</th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {patients.map((patient) => (
            <tr
              key={patient.patientId}
              className="hover:bg-slate-50/60 transition-colors group"
            >
              {/* Patient */}
              <td className="px-6 py-4">
                <Link
                  href={`/dashboard/doctor/patients/${patient.patientId}`}
                  className="flex items-center gap-3"
                >
                  <PatientAvatar name={patient.name} avatarUrl={patient.avatarUrl} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">
                      {patient.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      #{patient.patientId.substring(0, 8)}
                    </p>
                  </div>
                </Link>
              </td>

              {/* Contact */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                  <Phone size={13} className="text-slate-400 flex-shrink-0" />
                  {patient.phone}
                </div>
              </td>

              {/* Blood Group */}
              <td className="px-6 py-4">
                <BloodGroupBadge group={patient.bloodGroup} />
              </td>

              {/* Last Visit */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                  <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                  {patient.lastVisit}
                </div>
              </td>

              {/* Total Appointments */}
              <td className="px-6 py-4 text-center">
                <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <ClipboardList size={12} />
                  {patient.totalAppointments}
                </div>
              </td>

              {/* Action */}
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/dashboard/doctor/patients/${patient.patientId}`}
                  className="inline-flex items-center gap-1 text-slate-400 group-hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50"
                >
                  <ChevronRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
