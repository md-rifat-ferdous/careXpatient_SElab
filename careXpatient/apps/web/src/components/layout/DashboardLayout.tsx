"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/auth.store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const { user, token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user && token) {
      document.cookie = `userId=${user.id}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
    }
  }, [isAuthenticated, user, token]);

  // Pages that manage their own scroll/height (no inner padding)
  const fullHeightPages = ['/dashboard/patient/lab-tests'];
  const isFullHeight = fullHeightPages.some(p => pathname.startsWith(p));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">cXp</span>
            </div>
            <span className="font-bold text-slate-900 text-sm">care<span className="text-teal-600">X</span>patient</span>
          </div>
        </header>

        <main className={`flex-1 overflow-hidden ${isFullHeight ? '' : 'overflow-y-auto p-4 md:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
