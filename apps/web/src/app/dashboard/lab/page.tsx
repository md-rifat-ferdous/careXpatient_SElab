"use client";

import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

/* TODO: Implement role-specific Lab dashboard features:
 * - Lab Orders (incoming orders, accept/reject, status update)
 * - Sample Collection (mark sample collected, collection slots)
 * - Processing Queue (tests in process, assign technician)
 * - Results Upload (upload PDF result, notify patient/doctor)
 * - Reports & Analytics (monthly reports, revenue, test count)
 * - Lab Profile (update lab info, services offered, pricing)
 * - DGHS Compliance (license renewal, audit logs)
 */

export default function LabDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const features = [
    { icon: '📋', title: 'Lab Orders', desc: 'Manage incoming test orders', color: 'bg-emerald-50 border-emerald-100' },
    { icon: '🧪', title: 'Processing Queue', desc: 'Tests under processing', color: 'bg-teal-50 border-teal-100' },
    { icon: '📤', title: 'Upload Results', desc: 'Submit test results', color: 'bg-sky-50 border-sky-100' },
    { icon: '📊', title: 'Reports', desc: 'Analytics & revenue', color: 'bg-violet-50 border-violet-100' },
    { icon: '🏢', title: 'Lab Profile', desc: 'Update lab information', color: 'bg-amber-50 border-amber-100' },
    { icon: '⚙️', title: 'Settings', desc: 'Account & preferences', color: 'bg-slate-50 border-slate-100' },
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
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-8 text-white">
          <p className="text-white/70 text-sm mb-1">Lab Portal 🏥</p>
          <h1 className="text-2xl font-bold">{user?.fullName || 'Lab Admin'}</h1>
          <p className="text-white/80 text-sm mt-1">Accuracy and trust, every report.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-lg">🚧</span>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Dashboard Under Development</p>
            <p className="text-amber-700 text-xs mt-0.5">Lab features are coming soon!</p>
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
