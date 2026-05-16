"use client";
import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';

export const Topbar = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search patients, reports, or appointments..."
            className="w-full pl-10 pr-4 py-2 bg-background border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-text-muted hover:bg-gray-50 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-100 mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-text leading-tight">{user?.fullName || 'Dr. Specialist'}</p>
            <p className="text-xs text-text-muted">{user?.role === 'Doctor' ? 'Specialist' : user?.role}</p>
          </div>
          <Avatar
            src={user?.profilePhotoUrl || "https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=100&h=100"}
            fallback={user?.fullName?.substring(0, 2).toUpperCase() || "DR"}
            className="w-10 h-10 border-2 border-secondary"
          />
        </div>
      </div>
    </header>
  );
};
