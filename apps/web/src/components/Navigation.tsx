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
  UserCircle
} from 'lucide-react';
import { cn, Typography, Button } from '@carexpatient/ui';

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
    title: 'Doctor Workspace',
    items: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', href: '/dashboard/doctor' },
      { icon: <ClipboardList className="w-5 h-5" />, label: 'Clinic Queue', href: '/dashboard/doctor/queue' },
      { icon: <Calendar className="w-5 h-5" />, label: 'My Schedule', href: '/dashboard/doctor/schedule' },
      { icon: <Users className="w-5 h-5" />, label: 'Patient Directory', href: '/dashboard/doctor/patients' },
      { icon: <Stethoscope className="w-5 h-5" />, label: 'Consultations', href: '/dashboard/doctor/consultations' },
    ]
  },
  Lab: {
    title: 'Laboratory Portal',
    items: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', href: '/dashboard/lab' },
      { icon: <Microscope className="w-5 h-5" />, label: 'Lab Orders', href: '/dashboard/lab/orders' },
      { icon: <FileText className="w-5 h-5" />, label: 'Results Entry', href: '/dashboard/lab/results' },
      { icon: <Settings className="w-5 h-5" />, label: 'Services', href: '/dashboard/lab/services' },
    ]
  },
  Admin: {
    title: 'Admin Console',
    items: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: 'System Health', href: '/dashboard/admin' },
      { icon: <Users className="w-5 h-5" />, label: 'User Management', href: '/dashboard/admin/users' },
      { icon: <Activity className="w-5 h-5" />, label: 'Audit Logs', href: '/dashboard/admin/logs' },
    ]
  },
  Clinic: {
    title: 'Clinic Workspace',
    items: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Clinic Overview', href: '/dashboard/clinic' },
      { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', href: '/dashboard/clinic/appointments' },
      { icon: <Users className="w-5 h-5" />, label: 'Patient Directory', href: '/dashboard/clinic/patients' },
      { icon: <Stethoscope className="w-5 h-5" />, label: 'Medical Staff', href: '/dashboard/clinic/doctors' },
      { icon: <Settings className="w-5 h-5" />, label: 'Clinic Settings', href: '/dashboard/clinic/profile' },
    ]
  }
};

export const SideNavBar = ({ role = 'Patient' }: { role?: string }) => {
  const pathname = usePathname();
  const config = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.Patient;

  return (
    <aside className="fixed left-0 top-0 bottom-0 flex flex-col py-8 w-64 hidden md:flex bg-white border-r border-border-soft z-40 no-print shadow-sm">
      <div className="mb-10 px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="font-black text-sm">cXp</span>
          </div>
          <div>
            <Typography variant="body" className="font-black text-xl tracking-tighter leading-none text-primary">careXpatient</Typography>
            <Typography variant="small" className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-dark mt-1">{config.title}</Typography>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        <Typography variant="small" className="px-4 mb-4 font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">
          Main Navigation
        </Typography>
        {config.items.map((item, i) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link 
              key={i}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group",
                isActive 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-text-muted hover:bg-surface-muted hover:text-primary'
              )}
              href={item.href}
            >
              <div className={cn(
                "transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "text-text-muted group-hover:text-primary"
              )}>
                {item.icon}
              </div>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/40" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 space-y-2 pt-8 border-t border-border-soft/50">
        <Link 
          href="/dashboard/profile"
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-text-muted hover:bg-surface-muted hover:text-primary transition-all font-bold text-sm"
        >
          <UserCircle className="w-5 h-5" /> Account Settings
        </Link>
        <button 
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      <div className="mt-8 px-6">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden group">
          <HelpCircle className="absolute -right-4 -top-4 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
          <Typography variant="small" className="font-black text-primary uppercase tracking-widest text-[9px] mb-1">Support Center</Typography>
          <Typography variant="small" className="text-primary-dark font-bold leading-relaxed mb-4 block">
            Access documentation or talk to our experts.
          </Typography>
          <Button variant="outline" className="w-full rounded-xl bg-white text-primary border-primary/10 hover:bg-primary/5 h-9 text-[10px] font-black uppercase tracking-widest shadow-sm">
            Help Docs
          </Button>
        </div>
      </div>
    </aside>
  );
};

export const TopNavBar = () => (
  <nav className="fixed top-0 md:left-64 left-0 right-0 z-30 flex items-center justify-between px-8 h-20 bg-white/80 backdrop-blur-xl border-b border-border-soft no-print shadow-sm">
    <div className="flex items-center gap-8">
      <div className="hidden lg:flex items-center bg-surface-muted/50 rounded-2xl px-4 py-2 w-96 border border-border-soft/50 focus-within:border-primary/30 transition-colors">
        <LayoutDashboard className="w-4 h-4 text-text-muted mr-3" />
        <input 
          className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-text-muted font-medium"
          placeholder="Global system search..." 
          type="text" 
        />
        <div className="px-2 py-0.5 bg-white border border-border-soft rounded text-[9px] font-black text-text-muted">⌘ K</div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex gap-1 pr-4 border-r border-border-soft/50">
        <button className="p-2.5 rounded-xl hover:bg-primary/10 text-text-muted hover:text-primary transition-all relative">
          <Calendar className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-xl hover:bg-primary/10 text-text-muted hover:text-primary transition-all relative">
          <Activity className="w-5 h-5" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
        </button>
      </div>
      
      <div className="flex items-center gap-3 pl-2">
        <div className="text-right hidden sm:block">
          <Typography variant="body" className="font-black text-sm text-text leading-tight">Rahim Ali</Typography>
          <Typography variant="small" className="text-[9px] font-black text-primary uppercase tracking-[0.1em]">Patient</Typography>
        </div>
        <img 
          alt="Profile"
          className="w-11 h-11 rounded-2xl object-cover border border-border-soft shadow-soft"
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100&h=100&auto=format&fit=crop" 
        />
      </div>
    </div>
  </nav>
);
