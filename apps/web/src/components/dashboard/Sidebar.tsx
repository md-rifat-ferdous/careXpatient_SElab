"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Calendar,
  Settings,
  LayoutDashboard,
  FileText,
  ClipboardList,
  LogOut
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/dashboard/doctor', icon: LayoutDashboard },
  { name: 'My Patients', href: '/dashboard/doctor/patients', icon: Users },
  { name: 'Appointments', href: '/dashboard/doctor/appointments', icon: Calendar },
  { name: 'Settings', href: '/dashboard/doctor/settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-50 flex flex-col">
      <div className="p-6">
        <div className="mb-8">
          <span className="text-xl font-bold text-primary tracking-tight">careXpatient</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard/doctor'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-secondary text-primary font-medium'
                    : 'text-text-muted hover:bg-gray-50 hover:text-text'
                  }`}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-text-muted'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <div className="flex items-center gap-3 px-4 py-3 text-text-muted cursor-pointer hover:text-red-500 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
};
