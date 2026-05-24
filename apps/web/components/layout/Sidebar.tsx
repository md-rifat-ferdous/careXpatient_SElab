'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Activity, 
  FileText, 
  Microscope, 
  Settings,
  HelpCircle,
  LogOut,
  Stethoscope,
  ClipboardList,
  UserCircle,
  Search,
  Menu,
  Bell
} from 'lucide-react';
import { cn } from '@my-clinic/ui';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const NAVIGATION_CONFIG: Record<string, { title: string; items: NavItem[] }> = {
  Patient: {
    title: 'Patient Portal',
    items: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/patient' },
      { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', href: '/dashboard/patient/appointments' },
      { icon: <Activity className="w-5 h-5" />, label: 'Health Trends', href: '/dashboard/patient/vitals' },
      { icon: <FileText className="w-5 h-5" />, label: 'Medical Records', href: '/dashboard/patient/records' },
      { icon: <Microscope className="w-5 h-5" />, label: 'Lab Reports', href: '/dashboard/patient/reports' },
    ]
  },
  Doctor: {
    title: 'DOCTOR PORTAL',
    items: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/doctor' },
      { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', href: '/doctor/appointments' },
      { icon: <Users className="w-5 h-5" />, label: 'My Patients', href: '/doctor/patients' },
      { icon: <FileText className="w-5 h-5" />, label: 'My Clinic', href: '/doctor/schedule' },
      { icon: <Activity className="w-5 h-5" />, label: 'Earnings', href: '/doctor/earnings' },
    ]
  }
};

export function SideNavBar({ role = 'Doctor' }: { role?: string }) {
  const pathname = usePathname();
  const config = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.Doctor;

  return (
    <aside className="fixed left-0 top-0 bottom-0 flex flex-col w-64 hidden md:flex bg-[#F9FAFB] border-r border-border-soft z-40 no-print">
      <div className="flex items-center gap-4 px-6 h-20 border-b border-border-soft">
        <Menu className="w-5 h-5 text-slate-500 cursor-pointer" />
        <div>
          <span className="font-bold text-[15px] tracking-tight leading-none text-[#14B8A6] block">careXpatient</span>
          <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500 mt-0.5 block">{config.title}</span>
        </div>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        {config.items.map((item, i) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link 
              key={i}
              className={cn(
                "flex items-center gap-4 px-6 py-3.5 transition-all text-[14px] font-medium group border-l-4",
                isActive 
                  ? 'bg-[#14B8A6] border-[#0F766E] text-slate-900' 
                  : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              href={item.href}
            >
              <div className={cn(
                "w-5 h-5",
                isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
              )}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pb-6">
        <div className="px-6 mb-4">
          <div className="h-px bg-border-soft w-full"></div>
        </div>
        <div className="space-y-1">
          <Link 
            href="/dashboard/profile"
            className="flex items-center gap-4 px-6 py-3.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium text-[14px]"
          >
            <Settings className="w-5 h-5 text-slate-500" /> Settings
          </Link>
          <button 
            className="w-full flex items-center gap-4 px-6 py-3.5 text-rose-500 hover:bg-rose-50 transition-all font-medium text-[14px]"
          >
            <LogOut className="w-5 h-5 text-rose-500" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export const TopNavBar = ({ role = 'Doctor', title = 'Dashboard' }: { role?: string, title?: string }) => {
  return (
    <nav className="fixed top-0 md:left-64 left-0 right-0 z-30 flex items-center justify-between px-8 h-20 bg-white border-b border-border-soft no-print">
      <div className="flex items-center">
        <h1 className="font-bold text-slate-800 text-[17px]">{title}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" style={{ top: '-1px', right: '1px' }} />
        </button>
        
        <div className="h-8 w-px bg-border-soft"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-[14px] text-slate-800 leading-tight">Dr. Sarah Jenkins</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">CHIEF OF SURGERY</p>
          </div>
          <img 
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-border-soft"
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100&h=100&auto=format&fit=crop" 
          />
        </div>
      </div>
    </nav>
  );
};

