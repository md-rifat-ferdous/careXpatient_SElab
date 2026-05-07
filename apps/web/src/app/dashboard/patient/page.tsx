"use client";

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

/* TODO: Implement role-specific Patient dashboard features:
 * - Book Appointment (search doctors, select slot, confirm)
 * - My Appointments (upcoming, past, cancel/reschedule)
 * - Medical Records (prescriptions, lab results, history)
 * - Lab Orders (request test, track status, view results)
 * - Profile Management (update info, change password)
 * - Notifications (appointment reminders, lab results ready)
 */

export default function PatientDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const features = [
    { icon: '📅', title: 'Book Appointment', desc: 'Find and book doctors near you', color: 'bg-teal-50 border-teal-100', soon: false, href: '/dashboard/patient/appointments' },
    { icon: '🧪', title: 'Lab Orders', desc: 'Order tests & view results', color: 'bg-sky-50 border-sky-100', soon: true },
    { icon: '📋', title: 'Medical Records', desc: 'Prescriptions and history', color: 'bg-violet-50 border-violet-100', soon: true },
    { icon: '💊', title: 'Medications', desc: 'Track your medications', color: 'bg-amber-50 border-amber-100', soon: true },
    { icon: '🏥', title: 'My Doctors', desc: 'Your care team', color: 'bg-rose-50 border-rose-100', soon: true },
    { icon: '⚙️', title: 'Settings', desc: 'Profile & preferences', color: 'bg-slate-50 border-slate-100', soon: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center">
            <span className="text-white font-bold text-xs">cXp</span>
          </div>
          <span className="font-bold text-foreground">care<span className="text-primary">X</span>patient</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.fullName || 'Patient'}</p>
            <p className="text-xs text-subtle-gray">{user?.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-subtle-gray hover:text-error transition-colors border border-border rounded-lg px-3 py-1.5"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-teal-500 to-sky-500 rounded-2xl p-6 mb-8 text-white">
          <p className="text-white/70 text-sm mb-1">Welcome back 👋</p>
          <h1 className="text-2xl font-bold">{user?.fullName || 'Patient'}</h1>
          <p className="text-white/80 text-sm mt-1">How are you feeling today?</p>
        </div>

        {/* Coming Soon banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">🚧</span>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Dashboard Under Development</p>
            <p className="text-amber-700 text-xs mt-0.5">Full features are being built. Check back soon!</p>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((f) => (
            <Link 
              key={f.title} 
              href={f.href || '#'}
              className={`${f.color} border rounded-xl p-4 text-left transition-all hover:shadow-md relative overflow-hidden flex flex-col`}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-semibold text-foreground text-sm">{f.title}</p>
              <p className="text-xs text-subtle-gray mt-0.5">{f.desc}</p>
              {f.soon && (
                <span className="absolute top-2 right-2 text-xs bg-white/80 text-subtle-gray rounded-full px-2 py-0.5 font-medium">Soon</span>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
