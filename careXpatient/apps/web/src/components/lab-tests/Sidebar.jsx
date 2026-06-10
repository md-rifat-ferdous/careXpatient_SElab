"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cartStore';

const navItems = [
{ label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
{ label: 'Appointments', icon: 'calendar_today', href: '/dashboard/appointments' },
{ label: 'Lab Tests', icon: 'biotech', href: '/dashboard/lab-tests' },
{ label: 'Reports', icon: 'description', href: '/dashboard/reports' },
{ label: 'Prescription', icon: 'prescriptions', href: '/dashboard/prescription' }];


export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);

  const handleSignOut = () => {
    clearAuth();
    clearCart();
    router.push('/');
  };

  return (
    <aside className="w-64 h-full border-r bg-white border-slate-100 flex flex-col pt-8 pb-6 shrink-0">
      {/* Logo */}
      <div className="px-6 mb-8">
        <Link href="/" className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl font-bold">add</span>
          </div>
          <h1 className="text-xl font-bold text-primary">careXpatient</h1>
        </Link>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Patient Portal</p>
      </div>

      {/* User info */}
      {user &&
      <div className="px-6 mb-6">
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user.fullName?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-on-surface truncate">{user.fullName}</p>
              <p className="text-xs text-subtle-gray truncate">{user.phone}</p>
            </div>
          </div>
        </div>
      }

      <nav className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Group */}
        <div className="flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || item.href !== '/dashboard' && pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-3.5 flex items-center gap-3 transition-all group ${
                isActive ?
                'bg-teal-50 border-l-4 border-teal-500 text-teal-600' :
                'text-slate-500 hover:text-teal-600 hover:bg-slate-50'}`
                }>
                
                <span
                  className="material-symbols-outlined text-xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  
                  {item.icon}
                </span>
                <span className={`font-sans text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {item.label}
                </span>
              </Link>);

          })}
        </div>

        {/* Bottom Navigation Group */}
        <div className="mt-auto">
          <div className="px-6 py-4">
            <hr className="border-slate-100" />
          </div>
          <Link
            href="#"
            className="text-slate-500 hover:text-teal-600 px-6 py-3.5 flex items-center gap-3 transition-all hover:bg-slate-50">
            
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-sans text-sm font-semibold">Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 px-6 py-3.5 flex items-center gap-3 transition-all">
            
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="font-sans text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>);

}