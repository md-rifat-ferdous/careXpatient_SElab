import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, CalendarDays } from 'lucide-react';

type RescheduleInfoProps = {
  originalStart: Date;
  originalEnd: Date;
  rescheduledStart?: Date;
  rescheduledEnd?: Date;
  replacementClinicName?: string;
  sourceClinicName?: string; // Add source clinic if available
};

export const RescheduleInfo: React.FC<RescheduleInfoProps> = ({
  originalStart,
  originalEnd,
  rescheduledStart,
  rescheduledEnd,
  replacementClinicName,
  sourceClinicName = "Original Clinic",
}) => {
  const hasReschedule = rescheduledStart && rescheduledEnd;

  return (
    <div className="flex flex-col space-y-4 py-2">
      {/* Original Schedule Card */}
      <div className="relative rounded-xl border border-gray-100 bg-gray-50 p-4 opacity-75">
        <div className="absolute -left-px top-1/2 h-8 w-1 -translate-y-1/2 bg-gray-300 rounded-r-md"></div>
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Original Schedule</h4>
        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            <span className="line-through decoration-gray-400">{format(originalStart, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span className="line-through decoration-gray-400">{format(originalStart, 'hh:mm a')} - {format(originalEnd, 'hh:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{sourceClinicName}</span>
          </div>
        </div>
      </div>

      {hasReschedule && (
        <>
          {/* Connector */}
          <div className="flex justify-center -my-3 relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-teal-50 border-2 border-white rounded-full p-2 shadow-sm text-teal-600"
            >
              <ArrowRight size={20} className="rotate-90 sm:rotate-0" />
            </motion.div>
          </div>

          {/* New Schedule Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-xl border border-teal-100 bg-teal-50/30 p-4 shadow-sm"
          >
            <div className="absolute -left-px top-1/2 h-8 w-1 -translate-y-1/2 bg-teal-500 rounded-r-md"></div>
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-600 mb-2">Rescheduled To</h4>
            <div className="space-y-1.5 text-sm font-medium text-gray-800">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-teal-500" />
                <span>{format(rescheduledStart!, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-teal-500" />
                <span>{format(rescheduledStart!, 'hh:mm a')} - {format(rescheduledEnd!, 'hh:mm a')}</span>
              </div>
              {replacementClinicName && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-teal-500" />
                  <span>{replacementClinicName}</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

