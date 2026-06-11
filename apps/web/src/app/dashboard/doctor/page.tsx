'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import DoctorDashboardStats from '@/components/doctor/DoctorDashboardStats';
import { fetchDoctorStats, fetchDoctorAppointments, DoctorStats, DoctorAppointment } from '@/services/doctor.service';

export default function DoctorDashboardPage() {
  const { user, token } = useAuthStore();

  const [stats, setStats] = useState<DoctorStats>({ pending: 0, confirmed: 0, inConsultation: 0, completed: 0, cancelled: 0 });
  const [nextAppointment, setNextAppointment] = useState<DoctorAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      setLoading(true);
      setError(null);

      const [statsData, confirmedAppts] = await Promise.all([
        fetchDoctorStats(user.id, token),
        fetchDoctorAppointments(user.id, token, 'Confirmed'),
      ]);

      setStats(statsData);
      // The first confirmed appointment is the soonest upcoming one (sorted by date ASC on the backend)
      setNextAppointment(confirmedAppts[0] ?? null);
    } catch {
      setError('Could not load dashboard data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm mb-1">Doctor Portal 🩺</p>
        <h1 className="text-2xl font-bold">
          {greeting()}, Dr. {user?.fullName ?? 'Doctor'}
        </h1>
        <p className="text-white/80 text-sm mt-1">
          Here&apos;s what&apos;s happening in your clinic today.
        </p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      )}

      {/* ── Stats Bar ── */}
      <DoctorDashboardStats stats={stats} loading={loading} />

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {/* Next Appointment Card */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Next Appointment</h2>
            {nextAppointment && (
              <span className="text-xs font-medium bg-teal-50 text-teal-700 rounded-full px-3 py-1">
                Confirmed
              </span>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 w-12 rounded-xl bg-slate-100" />
              <div className="h-4 w-40 bg-slate-100 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
          ) : nextAppointment ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{nextAppointment.patientName}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {nextAppointment.type === 'Online' ? '📹 Video' : '🏥 In-person'} &bull; {nextAppointment.timeSlot} &bull; {nextAppointment.date}
                </p>
                {nextAppointment.reasonForVisit && (
                  <p className="text-xs text-slate-400 mt-1 truncate">{nextAppointment.reasonForVisit}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No upcoming appointments</p>
              <p className="text-xs text-slate-400 mt-1">Pending requests may need your attention</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/dashboard/doctor/appointments"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              View all appointments
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Pending Requests Alert */}
          {stats.pending > 0 && (
            <Link
              href="/dashboard/doctor/appointments?filter=Pending"
              className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-900">
                  {stats.pending} Pending Request{stats.pending !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-rose-600 mt-0.5">Tap to review</p>
              </div>
            </Link>
          )}

          {/* Portal Features */}
          {[
            { icon: '📅', title: "Today's Schedule", desc: 'View appointments', href: '/dashboard/doctor/appointments' },
            { icon: '👥', title: 'My Patients', desc: 'Patient list & history', href: '#' },
            { icon: '💊', title: 'Prescriptions', desc: 'Write & manage', href: '#' },
            { icon: '📊', title: 'Analytics', desc: 'Earnings & stats', href: '#' },
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
    </div>
  );
}
