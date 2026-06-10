'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

// ─── Nav Definitions ──────────────────────────────────────────────────────────

const PATIENT_NAV: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/patient',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: 'Appointments',
    href: '/dashboard/patient/appointments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Lab Tests',
    href: '/dashboard/patient/lab-tests',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    name: 'Reports',
    href: '/dashboard/patient/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Prescription',
    href: '/dashboard/patient/prescription',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Payment & Receipt',
    href: '/dashboard/patient/payment-receipt',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/dashboard/patient/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const DOCTOR_NAV: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/doctor',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: 'Appointments',
    href: '/dashboard/doctor/appointments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'My Patients',
    href: '/dashboard/doctor/patients',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'My Schedule',
    href: '/dashboard/doctor/schedule',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6" />
      </svg>
    ),
  },
  {
    name: 'My Clinic',
    href: '/dashboard/doctor/clinic',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: 'Earnings',
    href: '/dashboard/doctor/earnings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/dashboard/doctor/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const LAB_NAV: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/lab',
    icon: <span className="material-symbols-outlined">dashboard</span>,
  },
  {
    name: 'Test Queue',
    href: '/dashboard/lab/test-queue',
    icon: <span className="material-symbols-outlined">queue</span>,
  },
  {
    name: 'Sample Collection',
    href: '/dashboard/lab/sample-collection',
    icon: <span className="material-symbols-outlined">biotech</span>,
  },
  {
    name: 'Patients',
    href: '/dashboard/lab/patients',
    icon: <span className="material-symbols-outlined">groups</span>,
  },
  {
    name: 'Upload Reports',
    href: '/dashboard/lab/upload-reports',
    icon: <span className="material-symbols-outlined">upload_file</span>,
  },
  {
    name: 'Test Management',
    href: '/dashboard/lab/test-management',
    icon: <span className="material-symbols-outlined">settings_applications</span>,
  },
  {
    name: 'Earnings',
    href: '/dashboard/lab/earnings',
    icon: <span className="material-symbols-outlined">payments</span>,
  },
  {
    name: 'Settings',
    href: '/dashboard/lab/settings',
    icon: <span className="material-symbols-outlined">settings</span>,
  },
  {
    name: 'Logout',
    href: '/login',
    icon: <span className="material-symbols-outlined">logout</span>,
  },
];


// ─── Role badge config ─────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  Doctor:  { label: 'Doctor Portal',  color: 'text-sky-500' },
  Patient: { label: 'Patient Portal', color: 'text-teal-500' },
  Lab:     { label: 'Lab Portal',     color: 'text-violet-500' },
};

// ─── Sidebar Component ────────────────────────────────────────────────────────

const Sidebar = () => {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const isLab = user?.role === 'Lab';

  // Select nav items based on the logged-in user's role
  const navItems: NavItem[] =
    user?.role === 'Doctor' ? DOCTOR_NAV :
    user?.role === 'Lab'    ? LAB_NAV    :
    PATIENT_NAV;
  const roleBadge = ROLE_BADGE[user?.role ?? 'Patient'] ?? ROLE_BADGE.Patient;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-[#bbcac6]/30 z-50 flex flex-col w-64 py-6 px-4`}
    >
      {/* ── Header ── */}
      {isLab ? (
        <div className="flex items-center gap-2 mb-10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#14b8a6] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#00423b]" style={{ fontSize: 20 }}>science</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#111c2d] tracking-tight leading-none">careXpatient</h1>
            <p className="text-sm text-[#94A3B8] leading-none mt-1">Lab Portal</p>
          </div>
        </div>
      ) : (
        <div className="p-5 flex items-center justify-between overflow-hidden border-b border-slate-100 shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-[10px] uppercase">cXp</span>
              </div>
              <span className="font-bold text-slate-900 whitespace-nowrap">
                care<span className="text-teal-600">X</span>patient
              </span>
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-widest ml-11 ${roleBadge.color}`}>
              {roleBadge.label}
            </span>
          </div>
        </div>
      )}

      {/* ── Navigation (main 7 items) ── */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        {navItems.slice(0, 7).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard/patient' &&
              item.href !== '/dashboard/doctor' &&
              item.href !== '/dashboard/lab' &&
              pathname.startsWith(item.href));

          const activeClass = 'text-[#006b5f] bg-[#006b5f]/10 font-bold border-l-4 border-[#006b5f]';
          const inactiveClass = 'text-[#3c4947] hover:text-[#006b5f] hover:bg-[#f0f3ff] border-l-4 border-transparent';

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 py-2 px-2 rounded-lg transition-all group ${isActive ? activeClass : inactiveClass}`}
            >
              <div className={`shrink-0 transition-colors ${isActive ? 'text-[#006b5f]' : 'text-[#3c4947] group-hover:text-[#006b5f]'}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </div>
              <span className="sidebar-text truncate text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: Settings, Logout, Profile ── */}
      {isLab ? (
        <div className="mt-auto pt-4 border-t border-[#bbcac6]/50 flex flex-col gap-1">
          {/* Settings */}
          <Link
            href="/dashboard/lab/settings"
            className={`flex items-center gap-2 py-2 px-2 rounded-lg transition-all group border-l-4 border-transparent text-[#3c4947] hover:text-[#006b5f] hover:bg-[#f0f3ff] ${pathname === '/dashboard/lab/settings' ? 'text-[#006b5f] bg-[#006b5f]/10 font-bold border-l-4 border-[#006b5f]' : ''}`}
          >
            <span className="material-symbols-outlined shrink-0 text-[#3c4947] group-hover:text-[#006b5f]">settings</span>
            <span className="sidebar-text truncate text-sm">Settings</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-2 rounded-lg transition-all group border-l-4 border-transparent text-[#3c4947] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/20 w-full text-left"
          >
            <span className="material-symbols-outlined shrink-0">logout</span>
            <span className="sidebar-text truncate text-sm">Logout</span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 mt-4 px-2">
            <img
              src={
                user?.profilePhotoUrl ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? 'Dr. S. Rahman')}&background=14B8A6&color=fff`
              }
              alt={user?.fullName ?? 'Pathologist Profile'}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#bbcac6]"
            />
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-[#111c2d] truncate">
                {user?.fullName ?? 'Dr. S. Rahman'}
              </p>
              <p className="text-sm text-[#94A3B8] truncate">
                Lead Pathologist
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
            <img
              src={
                user?.profilePhotoUrl ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? 'User')}&background=14B8A6&color=fff`
              }
              alt={user?.fullName ?? 'User'}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.role === 'Doctor' ? `Dr. ${user?.fullName ?? 'Doctor'}` : (user?.fullName ?? 'User')}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all group"
          >
            <div className="shrink-0 text-slate-400 group-hover:text-rose-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="font-medium whitespace-nowrap">Sign out</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
