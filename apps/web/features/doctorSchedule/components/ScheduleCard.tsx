import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { RescheduleInfo } from '../../../components/ui/RescheduleInfo';

export type ScheduleCardProps = {
  clinicName: string;
  doctorAvatarUrl?: string;
  status: string;
  originalStart: Date;
  originalEnd: Date;
  rescheduledStart?: Date;
  rescheduledEnd?: Date;
  replacementClinicName?: string;
  isHistorical?: boolean;
  activeSlotId?: string;
  rescheduledFromClinicName?: string;
  overrideSummary?: string;
  actions?: React.ReactNode;
  selected?: boolean;
};

export const ScheduleCard: React.FC<ScheduleCardProps> = (props) => {
  const { clinicName, doctorAvatarUrl, status, isHistorical, selected, actions } = props;
  const borderColourMap: Record<string, string> = {
    'ACTIVE': '',
    'Cancel Slot': 'border-l-4 border-red-500',
    'Reschedule': 'border-l-4 border-teal-500',
    'Replacement Schedule': 'border-l-4 border-teal-500',
    'Holiday': 'border-l-4 border-amber-500',
    'Leave': 'border-l-4 border-purple-500',
  };
  const baseClasses = `bg-white rounded-2xl shadow-lg overflow-hidden border transition-shadow ${selected ? 'ring-2 ring-primary' : ''}`;
  const historicalClasses = isHistorical ? `bg-gray-50 opacity-90 ${borderColourMap[status] || ''}` : '';

  return (
    <motion.div className={`${baseClasses} ${historicalClasses}`}>
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          {doctorAvatarUrl ? (
            <img src={doctorAvatarUrl} alt="Doctor" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">D</div>
          )}
          <span className="font-medium text-lg">{clinicName}</span>
        </div>
        <StatusBadge status={status} />
      </div>
      {isHistorical && (
        <div className="flex items-center px-4 py-1 text-sm text-gray-600 bg-gray-100">
            <Lock className="w-4 h-4 mr-1 text-gray-500" />
          <span>Archived Audit Record</span>
        </div>
      )}
      {/* Placeholder for RescheduleInfo and other sections */}
      <div className="p-4">
        {/* RescheduleInfo component could be placed here */}
      </div>
      <div className="px-4 py-2 border-t flex items-center justify-between bg-gray-50">
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
};
