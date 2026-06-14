'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { fetchPatientDashboard, PatientDashboardData } from '@/services/patient.service';

const STAT_COLORS: Record<string, { label: string; bg: string; iconBg: string; iconColor: string; icon: React.ReactNode }> = {
  upcomingAppointments: {
    label: 'Upcoming Appointments',
    bg: 'bg-teal-50 border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  pendingLabOrders: {
    label: 'Pending Lab Orders',
    bg: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  completedAppointments: {
    label: 'Completed Appointments',
    bg: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  totalAppointments: {
    label: 'Total Appointments',
    bg: 'bg-violet-50 border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
};

const ACTIVITY_STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-sky-100 text-sky-700',
  Rejected: 'bg-rose-100 text-rose-700',
  Rescheduled: 'bg-violet-100 text-violet-700',
  Confirmed: 'bg-teal-100 text-teal-700',
  Accepted: 'bg-teal-100 text-teal-700',
  Waiting_for_call: 'bg-blue-100 text-blue-700',
  'Waiting for Call': 'bg-blue-100 text-blue-700',
  In_consultation: 'bg-purple-100 text-purple-700',
  'In Consultation': 'bg-purple-100 text-purple-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  NoShow: 'bg-slate-100 text-slate-600',
  'No Show': 'bg-slate-100 text-slate-600',
  Requested: 'bg-amber-100 text-amber-700',
  'Sample Collected': 'bg-blue-100 text-blue-700',
  Processing: 'bg-violet-100 text-violet-700',
  Reported: 'bg-emerald-100 text-emerald-700',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ACTIVITY_STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
      <div className="h-7 w-12 bg-slate-100 rounded" />
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-xl animate-pulse ${className || ''}`} />;
}

export default function PatientDashboardPage() {
  const { user, token } = useAuthStore();
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await fetchPatientDashboard(user.id, token);
      setData(dashboardData);
    } catch {
      setError('Could not load dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statsEntries = data
    ? ([
        { key: 'upcomingAppointments' as const, value: data.upcomingAppointments },
        { key: 'pendingLabOrders' as const, value: data.pendingLabOrders },
        { key: 'completedAppointments' as const, value: data.completedAppointments },
        { key: 'totalAppointments' as const, value: data.totalAppointments },
      ] as const)
    : [];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-r from-teal-500 to-sky-500 rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm mb-1">Patient Portal 👋</p>
        <h1 className="text-2xl font-bold">
          {greeting()}, {user?.fullName ?? 'Patient'}
        </h1>
        <p className="text-white/80 text-sm mt-1">
          Here&apos;s your health overview at a glance.
        </p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Object.keys(STAT_COLORS).map((k) => <SkeletonCard key={k} />)
          : statsEntries.map(({ key, value }) => {
              const cfg = STAT_COLORS[key];
              return (
                <div
                  key={key}
                  className={`${cfg.bg} border rounded-2xl p-4 transition-transform hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center ${cfg.iconColor}`}>
                      {cfg.icon}
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.iconColor}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${cfg.iconColor}`}>{value}</p>
                </div>
              );
            })}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {/* Next Appointment Card */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-800">Next Appointment</h2>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 w-12 rounded-xl bg-slate-100" />
              <div className="h-4 w-40 bg-slate-100 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
          ) : data?.nextAppointment ? (
            <>
              <div className="flex items-center gap-4">
                <img
                  src={data.nextAppointment.profilePhotoUrl || 'https://via.placeholder.com/48'}
                  alt={data.nextAppointment.doctorName}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{data.nextAppointment.doctorName}</p>
                  <p className="text-xs text-teal-600 font-semibold">{data.nextAppointment.specialty}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {data.nextAppointment.type === 'Online' ? '📹 Video' : '🏥 In-person'} &bull; {data.nextAppointment.timeSlot} &bull; {data.nextAppointment.date}
                  </p>
                </div>
                <StatusBadge status={data.nextAppointment.status} />
              </div>
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href="/dashboard/patient/appointments"
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                >
                  View all appointments
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No upcoming appointments</p>
              <p className="text-xs text-slate-400 mt-1">Book your next visit with a doctor</p>
              <Link
                href="/dashboard/patient/appointments/book"
                className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors"
              >
                Book Now
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-2 flex flex-col gap-3">
          {[
            { icon: '📅', title: 'Book Appointment', desc: 'Find & book a doctor', href: '/dashboard/patient/appointments/book' },
            { icon: '🧪', title: 'Lab Tests', desc: 'Order tests & view results', href: '/dashboard/patient/lab-tests' },
            { icon: '📋', title: 'My Reports', desc: 'View lab reports', href: '/dashboard/patient/reports' },
            { icon: '💊', title: 'Prescriptions', desc: 'Your prescriptions', href: '/dashboard/patient/prescription' },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 hover:border-teal-200 hover:bg-teal-50/30 transition-all group"
            >
              <span className="text-xl">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-teal-400 transition-colors ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Activity</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="space-y-1">
            {data.recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.type === 'appointment' ? '🩺' : '🧪'}</span>
                    <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 ml-7 truncate">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">No recent activity</p>
            <p className="text-xs text-slate-400 mt-1">Your appointments and lab orders will show here</p>
          </div>
        )}
      </div>

    </div>
  );
}
