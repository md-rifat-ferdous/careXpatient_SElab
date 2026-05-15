'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const TopNavBar = () => (
  <nav className="fixed top-0 md:left-64 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 font-inter text-sm antialiased no-print">
    <div className="flex items-center gap-8">
      <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-64 lg:w-96">
        <span className="material-symbols-outlined text-slate-400 text-lg mr-2">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400"
          placeholder="Search records..." 
          type="text" 
        />
      </div>
      <Link href="/" className="md:hidden text-xl font-bold tracking-tight text-teal-600">careXpatient</Link>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 rounded-full hover:bg-slate-50 hover:text-teal-700 transition-all text-slate-500">
        <span className="material-symbols-outlined">notifications</span>
      </button>
      <button className="p-2 rounded-full hover:bg-slate-50 hover:text-teal-700 transition-all text-slate-500">
        <span className="material-symbols-outlined">settings</span>
      </button>
      <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-slate-900 leading-tight">Mr. Rahim Ali</p>
          <p className="text-[11px] text-slate-500">Premium Member</p>
        </div>
        <img 
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border-2 border-teal-50"
          src="https://i.pravatar.cc/150?u=rahim" 
        />
      </div>
    </div>
  </nav>
);

export const SideNavBar = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/dashboard/patient' },
    { icon: 'calendar_today', label: 'Appointments', href: '/dashboard/patient/appointments' },
    { icon: 'biotech', label: 'Lab Tests', href: '/dashboard/patient/lab-tests' },
    { icon: 'description', label: 'Reports', href: '/dashboard/patient/reports' },
    { icon: 'medication', label: 'Prescriptions', href: '/dashboard/patient/prescriptions' },
    { icon: 'group', label: 'Family Profile', href: '/dashboard/patient/family' }
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 flex flex-col py-6 w-64 hidden md:flex bg-white border-r border-slate-100 font-inter text-sm font-medium z-40 no-print">
      <div className="mb-8 px-6 mt-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-black text-teal-600">careXpatient</Link>
        </div>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Patient Portal</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item, i) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={i}
                className={`mx-2 px-4 py-3 flex items-center gap-3 transition-colors ${
                  isActive 
                    ? 'bg-teal-50 text-teal-600 rounded-lg' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
                }`}
                href={item.href}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="mt-auto px-6">
        <div className="bg-teal-600 rounded-xl p-4 text-white">
          <p className="font-bold text-sm mb-1">Need help?</p>
          <p className="text-xs text-white/80 mb-3 leading-relaxed">Our support team is available 24/7 for you.</p>
          <button className="bg-white text-teal-600 w-full py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
};
