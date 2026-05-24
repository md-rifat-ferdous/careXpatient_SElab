"use client";

import React from "react";
import Image from "next/image";
import { Search, Bell } from "lucide-react";

interface ScheduleHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ScheduleHeader({ searchQuery, setSearchQuery }: ScheduleHeaderProps) {
  return (
    <header className="flex justify-between items-center h-16 w-full px-6 bg-surface dark:bg-inverse-surface border-b border-border-soft dark:border-outline-variant sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-md text-[14px] leading-[20px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search clinics or locations..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors relative">
          <Bell className="text-on-surface-variant" size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-alert-critical rounded-full"></span>
        </button>
        <div className="h-8 w-[1px] bg-border-soft mx-2"></div>
        <Image
          alt="Dr. Sarah Jenkins"
          className="w-8 h-8 rounded-full border border-primary-container object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXFCwa8ostA1oJZv82ekk4hjd-qgsJXFzUeosYHBreqFGc7HtuQFdyEy0MvbJKiMAGTWL2v_vlEzVWBd7P4tJfnjaCNVYe5KOAbe6GgOjbHUvO53uGfD9uQwrPaDBedVnE84ud6g11S6vTuMdZNSbSM5uIggy6MFV-oixzNbi9UAA9Oq74qpOYN13ZmtBddPyWYGdmt7VuaoAk9IA7rjpWn0gwPWbtLRyolOxEak1WMoxGuybX3msfj7pbxlw-h3owVHQT9C2GdIRd"
          width={32}
          height={32}
        />
      </div>
    </header>
  );
}
