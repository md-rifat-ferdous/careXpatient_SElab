import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { RescheduleInfo } from './RescheduleInfo';

export type ScheduleCardProps = {
  clinicName: string;
  doctorAvatarUrl?: string;
  status: string;
  originalStart: Date;
  originalEnd: Date;
  rescheduledStart?: Date;
  rescheduledEnd?: Date;
  replacementClinicName?: string;
  // New fields for audit trail
  isHistorical?: boolean;
  activeSlotId?: string; // ID of the newly created active slot (for CTA)
  rescheduledFromClinicName?: string; // for active slot to show origin
  overrideSummary?: string;
  actions?: React.ReactNode;
  selected?: boolean;
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  clinicName,
  doctorAvatarUrl,
  status,
  originalStart,
  originalEnd,
  rescheduledStart,
  rescheduledEnd,
  replacementClinicName,
  isHistorical,
  activeSlotId,
  rescheduledFromClinicName,
  overrideSummary,
  actions,
  selected,
}) => {
  // Determine left border colour based on status for audit cards
  const borderColourMap: Record<string, string> = {
    'ACTIVE': '',
    'Cancel Slot': 'border-l-4 border-red-500',
    'Reschedule': 'border-l-4 border-teal-500',
    'Replacement Schedule': 'border-l-4 border-teal-500',
    'Holiday': 'border-l-4 border-amber-500',
    'Leave': 'border-l-4 border-purple-500',
  };

  // Base container classes
  const baseClasses = `bg-white rounded-2xl shadow-lg overflow-hidden border border-border transition-shadow ${
    selected ? 'ring-2 ring-primary' : ''
  }`;

  // Historical card overrides
  const historicalClasses = isHistorical
    ? `bg-gray-50 opacity-90 ${borderColourMap[status] || ''} `
    : '';

  // Disable hover actions for historical cards
  const hoverProps = isHistorical ? {} : { whileHover: { scale: 1.02 } };

  return (
    <motion.div
      {...hoverProps}
      className={`${baseClasses} ${historicalClasses}`}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gray-50">
        <div className="flex items-center gap-3">
          {doctorAvatarUrl ? (
            <img
              src={doctorAvatarUrl}
              alt="Doctor"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              D
            </div>
          )}
          <span className="font-medium text-lg text-foreground">{clinicName}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Historical lock label */}
      {isHistorical && (
        <div className="flex items-center px-4 py-1 text-sm text-gray-600 bg-gray-100">
          <Lock className="w-5 h-5 text-gray-400 mb-2" />
          <span>Archived Audit Record</span>
        </div>
      )}

      {/* Origin info for active slots that were rescheduled */}
      {!isHistorical && rescheduledFromClinicName && (
        <div className="px-4 pt-2 text-sm text-gray-600">
          Rescheduled from: <strong>{rescheduledFromClinicName}</strong>
        </div>
      )}

      {/* Middle Section */}
      <div className="p-4">
        <RescheduleInfo
          originalStart={originalStart}
          originalEnd={originalEnd}
          rescheduledStart={rescheduledStart}
          rescheduledEnd={rescheduledEnd}
          replacementClinicName={replacementClinicName}
        />
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-2 border-t border-border bg-gray-50 flex items-center justify-between">
        {overrideSummary && (
          <span className="text-sm text-gray-600">{overrideSummary}</span>
        )}
        {/* CTA for historical rescheduled card */}
        {isHistorical && status === 'RESCHEDULED' && activeSlotId && (
          <button
            onClick={() => {
              // navigation handled by parent via router
              const targetUrl = `/doctor/schedule/${replacementClinicName?.toLowerCase() ?? ''}?slot=${activeSlotId}`;
              window.location.href = targetUrl;
            }}
            className="text-sm text-primary hover:underline"
          >
            View Active Slot
          </button>
        )}
        {actions && !isHistorical && <div className="flex gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
};
