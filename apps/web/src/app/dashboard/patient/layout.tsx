"use client";

import React from 'react';
import { SideNavBar, TopNavBar } from '@/components/Navigation';

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideNavBar />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 bg-slate-50 relative">
        <TopNavBar />
        <main className="p-6 pt-24 lg:p-8 lg:pt-24 flex-1 overflow-y-auto relative z-10 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
