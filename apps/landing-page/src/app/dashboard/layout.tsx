'use client';

import React from 'react';
import { TopNavBar, SideNavBar } from '@/components/reports/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <TopNavBar />
      <div className="flex pt-16 min-h-screen">
        <SideNavBar />
        <main className="flex-1 md:ml-64 p-6 lg:p-10 max-w-[1280px] mx-auto w-full">
          {children}
        </main>
      </div>
      
      {/* Mobile Nav Bar (Visible only on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around z-50 no-print">
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[10px] font-bold uppercase">Appt</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">description</span>
          <span className="text-[10px] font-bold uppercase">Reports</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">medication</span>
          <span className="text-[10px] font-bold uppercase">Med</span>
        </button>
      </div>

      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
}
