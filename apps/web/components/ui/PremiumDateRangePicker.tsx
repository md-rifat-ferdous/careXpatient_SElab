"use client";

import React, { useState } from "react";
import { format, addDays, startOfToday, isBefore, startOfDay } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "react-day-picker/dist/style.css";
import { cn } from "@my-clinic/ui";

interface PremiumDateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function PremiumDateRangePicker({ dateRange, onDateRangeChange }: PremiumDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const today = startOfToday();

  const handlePreset = (days: number) => {
    onDateRangeChange({
      from: today,
      to: addDays(today, days)
    });
    setIsOpen(false);
  };

  const formattedRange = dateRange?.from 
    ? dateRange.to && dateRange.from !== dateRange.to
      ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
      : format(dateRange.from, "MMM dd, yyyy")
    : "Select Dates";

  return (
    <div className="relative w-full">
      <label className="text-xs font-bold text-gray-700 block mb-2">Effective Date Range</label>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full border rounded-xl px-4 py-3 transition-colors bg-white",
          isOpen ? "border-[#0D8F7B] ring-2 ring-[#0D8F7B]/10" : "border-gray-200 hover:border-gray-300"
        )}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className={cn("w-4 h-4", isOpen ? "text-[#0D8F7B]" : "text-gray-500")} />
          <span className={cn("text-[13px] font-semibold", dateRange?.from ? "text-gray-900" : "text-gray-400")}>
            {formattedRange}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile closing */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-gray-900/10 lg:hidden"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 top-[calc(100%+8px)] left-0 w-[340px] bg-white border border-gray-200 shadow-xl shadow-black/5 rounded-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Select Range</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100">
                <button onClick={() => handlePreset(0)} className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">Today</button>
                <button onClick={() => handlePreset(1)} className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">Tomorrow</button>
                <button onClick={() => handlePreset(7)} className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">Next 7 Days</button>
              </div>

              <div className="p-4 flex justify-center">
                <style>{`
                  .rdp { --rdp-accent-color: #0D8F7B; --rdp-background-color: #EAF5F3; margin: 0; }
                  .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: #0D8F7B; color: white; font-weight: bold; }
                  .rdp-day_selected.rdp-day_range_middle { background-color: #EAF5F3; color: #0D8F7B; }
                  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #F3F4F6; }
                `}</style>
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={onDateRangeChange}
                  disabled={(date) => isBefore(startOfDay(date), today)}
                  showOutsideDays
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
