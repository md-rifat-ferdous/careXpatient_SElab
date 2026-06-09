'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  Droplets,
  MapPin,
  Calendar,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { fetchPatientDetail, DoctorPatientDetail } from '@/services/doctor.service';

// ─── Info Chip ─────────────────────────────────────────────────────────────────

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-600">
      <Icon size={14} className="text-slate-400 flex-shrink-0" />
      <span className="text-slate-400 text-xs">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function PatientHeaderAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
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
        className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 shadow-sm"
      />
    );
  }

  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
      <span className="text-white font-bold text-2xl">{initials}</span>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function PatientFolderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = use(params);
  const { user, token } = useAuthStore();

  const [patient, setPatient] = useState<DoctorPatientDetail | null>(null);
  const [loadingHeader, setLoadingHeader] = useState(true);

  useEffect(() => {
    if (!user?.id || !token) return;
    fetchPatientDetail(user.id, patientId, token)
      .then(setPatient)
      .catch(() => setPatient(null))
      .finally(() => setLoadingHeader(false));
  }, [user?.id, token, patientId]);

  if (loadingHeader) {
    return (
      <div className="max-w-5xl mx-auto py-10 flex justify-center">
        <Loader2 size={28} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-5xl mx-auto py-10 text-center">
        <p className="text-rose-500 font-semibold">Patient not found.</p>
        <Link href="/dashboard/doctor/patients" className="text-teal-600 text-sm mt-2 inline-block hover:underline">
          ← Back to My Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6 animate-fade-in">

      {/* ── Back Link ── */}
      <Link
        href="/dashboard/doctor/patients"
        className="flex items-center gap-1.5 text-teal-600 hover:text-teal-800 font-semibold text-sm transition-colors w-fit group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to My Patients
      </Link>

      {/* ── Patient Header Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

          <PatientHeaderAvatar name={patient.name} avatarUrl={patient.avatarUrl} />

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">#{patient.patientId.substring(0, 12)}</p>

            {/* Info chips */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
              <InfoChip icon={Phone} label="Phone" value={patient.phone} />
              <InfoChip icon={Mail} label="Email" value={patient.email} />
              <InfoChip icon={Droplets} label="Blood" value={patient.bloodGroup} />
              <InfoChip icon={MapPin} label="Address" value={patient.address} />
              <InfoChip icon={Calendar} label="DOB" value={patient.dateOfBirth} />
            </div>
          </div>

          {/* Stats */}
          <div className="flex sm:flex-col gap-3 sm:gap-2 flex-shrink-0">
            <div className="text-center bg-teal-50 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold text-teal-700">{patient.totalAppointments}</p>
              <p className="text-[10px] font-semibold text-teal-500 uppercase tracking-wider mt-0.5">
                <ClipboardList size={10} className="inline mr-0.5" />
                Visits
              </p>
            </div>
            {patient.lastVisit && (
              <div className="text-center bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-slate-700">{patient.lastVisit}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Last Visit</p>
              </div>
            )}
          </div>
        </div>

        {/* Medical notes */}
        {(patient.allergies || patient.medicalHistory) && (
          <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
            {patient.allergies && (
              <div className="bg-amber-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">⚠️ Allergies</p>
                <p className="text-sm text-amber-800">{patient.allergies}</p>
              </div>
            )}
            {patient.medicalHistory && (
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">📋 Medical History</p>
                <p className="text-sm text-slate-700">{patient.medicalHistory}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Page Content ── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Appointment History</h2>
        {children}
      </div>
    </div>
  );
}
