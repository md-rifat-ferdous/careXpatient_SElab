'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, FileText, CalendarDays } from 'lucide-react';
import { rollbackOverride } from '@/server/doctorSchedule/actions/scheduleActions';
import { toast } from 'sonner';

export type TimelineItem = {
  id: string;
  type: string;
  date: Date;
  clinicName: string;
  description?: string;
};

const dotColorMap: Record<string, string> = {
  'Cancel Slot':          'bg-red-500',
  'Reschedule':           'bg-teal-500',
  'Replacement Schedule': 'bg-teal-500',
  'Holiday':              'bg-amber-500',
  'Leave':                'bg-purple-500',
  'Slot':                 'bg-blue-500',
  'ACTIVE':               'bg-emerald-500',
};

const borderMap: Record<string, string> = {
  'Cancel Slot':          'border-l-red-500',
  'Reschedule':           'border-l-teal-500',
  'Replacement Schedule': 'border-l-teal-500',
  'Holiday':              'border-l-amber-500',
  'Leave':                'border-l-purple-500',
  'Slot':                 'border-l-blue-500',
  'ACTIVE':               'border-l-emerald-500',
};

export const OverrideTimeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => {
  const handleRollback = async (id: string) => {
    try {
      const res = await rollbackOverride(BigInt(id));
      if (res.success) {
        toast.success('Override rolled back successfully.');
      } else {
        toast.error(res.error ?? 'Failed to rollback override.');
      }
    } catch {
      toast.error('Error rolling back override.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm font-medium">
        No active overrides.
      </div>
    );
  }

  return (
    <div className="relative pl-6 py-2">
      <div className="absolute left-[11px] top-4 w-0.5 h-[calc(100%-2rem)] bg-gray-200/60 rounded-full" />
      <AnimatePresence>
        {items.map((item, index) => {
          const dotColor = dotColorMap[item.type] ?? 'bg-gray-500';
          const borderColor = borderMap[item.type] ?? 'border-l-gray-500';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
              className="mb-6 flex items-start group"
            >
              <div className="relative z-10 flex flex-col items-center mr-4 mt-3">
                <div className={`w-3 h-3 rounded-full ${dotColor} ring-4 ring-white shadow-sm`} />
              </div>

              <div className={`flex-1 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow border-l-4 ${borderColor}`}>
                <div className="p-3.5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-gray-500">{item.type}</div>
                    <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      <CalendarDays size={12} />
                      {item.date.toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: 'numeric', hour12: true,
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRollback(item.id)}
                      title="Rollback"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button title="Audit Log" className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors">
                      <FileText size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="text-sm font-semibold text-gray-800">{item.clinicName}</div>
                  {item.description && (
                    <div className="mt-1.5 text-xs text-gray-600 leading-relaxed bg-gray-50 p-2 rounded-md border border-gray-100">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
