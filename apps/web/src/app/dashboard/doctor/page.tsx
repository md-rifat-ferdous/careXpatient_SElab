"use client";

import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

/* TODO: Implement role-specific Doctor dashboard features:
 * - My Appointments (today's schedule, upcoming, past)
 * - Write Prescription (patient search, medication, advice)
 * - My Patients (patient list, medical history access)
 * - Consultation Room (video call, notes)
 * - Clinic Management (manage clinic slots, availability)
 * - Earnings & Analytics (revenue, patient count)
 * - Profile & Credentials (update bio, certificates)
 */

export default function DoctorDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const features = [
    { icon: '📅', title: "Today's Schedule", desc: 'View appointments for today', color: 'bg-sky-50 border-sky-100' },
    { icon: '👥', title: 'My Patients', desc: 'Patient list and history', color: 'bg-teal-50 border-teal-100' },
    { icon: '💊', title: 'Prescriptions', desc: 'Write & manage prescriptions', color: 'bg-violet-50 border-violet-100' },
    { icon: '🏥', title: 'My Clinic', desc: 'Manage clinic settings', color: 'bg-rose-50 border-rose-100' },
    { icon: '📊', title: 'Analytics', desc: 'Earnings & patient stats', color: 'bg-amber-50 border-amber-100' },
    { icon: '⚙️', title: 'Profile', desc: 'Update credentials', color: 'bg-slate-50 border-slate-100' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center">
            <span className="text-white font-bold text-xs">cXp</span>
          </div>
          <span className="font-bold text-foreground">care<span className="text-primary">X</span>patient</span>
        </div>
        <button onClick={() => { clearAuth(); router.push('/login'); }}
          className="text-sm text-subtle-gray hover:text-error transition-colors border border-border rounded-lg px-3 py-1.5">
          Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 mb-8 text-white">
          <p className="text-white/70 text-sm mb-1">Doctor Portal 🩺</p>
          <h1 className="text-2xl font-bold">Dr. {user?.fullName || 'Doctor'}</h1>
          <p className="text-white/80 text-sm mt-1">Your patients are waiting for your expertise.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-lg">🚧</span>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Dashboard Under Development</p>
            <p className="text-amber-700 text-xs mt-0.5">Doctor features are being built. Coming soon!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {features.map((f) => (
            <button key={f.title} className={`${f.color} border rounded-xl p-4 text-left transition-all hover:shadow-md`}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-semibold text-foreground text-sm">{f.title}</p>
              <p className="text-xs text-subtle-gray mt-0.5">{f.desc}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
