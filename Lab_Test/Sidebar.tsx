import React from 'react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 h-full border-r bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 flex flex-col pt-8 pb-6 shrink-0">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl font-bold">add</span>
          </div>
          <h1 className="text-xl font-bold text-primary">careXpatient</h1>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Patient Portal</p>
      </div>
      <nav className="flex-1 flex flex-col">
        {/* Top Navigation Group */}
        <div className="flex-1 overflow-y-auto">
          <Link className="text-slate-500 dark:text-slate-400 hover:text-teal-600 px-6 py-3.5 flex items-center gap-3 transition-all hover:bg-slate-50" href="#">
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="font-sans text-sm font-semibold">Dashboard</span>
          </Link>
          <Link className="text-slate-500 dark:text-slate-400 hover:text-teal-600 px-6 py-3.5 flex items-center gap-3 transition-all hover:bg-slate-50" href="#">
            <span className="material-symbols-outlined text-xl">calendar_today</span>
            <span className="font-sans text-sm font-semibold">Appointments</span>
          </Link>
          <Link className="bg-teal-50 border-l-4 border-teal-500 text-teal-600 px-6 py-3.5 flex items-center gap-3" href="#">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
            <span className="font-sans text-sm font-bold">Lab Tests</span>
          </Link>
          <Link className="text-slate-500 dark:text-slate-400 hover:text-teal-600 px-6 py-3.5 flex items-center gap-3 transition-all hover:bg-slate-50" href="#">
            <span className="material-symbols-outlined text-xl">description</span>
            <span className="font-sans text-sm font-semibold">Reports</span>
          </Link>
          <Link className="text-slate-500 dark:text-slate-400 hover:text-teal-600 px-6 py-3.5 flex items-center gap-3 transition-all hover:bg-slate-50" href="#">
            <span className="material-symbols-outlined text-xl">prescriptions</span>
            <span className="font-sans text-sm font-semibold">Prescription</span>
          </Link>
        </div>
        {/* Bottom Navigation Group */}
        <div className="mt-auto">
          <div className="px-6 py-4">
            <hr className="border-slate-100 dark:border-slate-800"/>
          </div>
          <Link className="text-slate-500 dark:text-slate-400 hover:text-teal-600 px-6 py-3.5 flex items-center gap-3 transition-all hover:bg-slate-50" href="#">
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-sans text-sm font-semibold">Settings</span>
          </Link>
          <Link className="text-red-500 hover:text-red-600 hover:bg-red-50 px-6 py-3.5 flex items-center gap-3 transition-all" href="#">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="font-sans text-sm font-semibold">Sign Out</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
