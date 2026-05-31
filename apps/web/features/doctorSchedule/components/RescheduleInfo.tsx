import React from 'react';
import { format } from 'date-fns';

type RescheduleInfoProps = {
  originalStart: Date;
  originalEnd: Date;
  rescheduledStart?: Date;
  rescheduledEnd?: Date;
  replacementClinicName?: string;
};

export const RescheduleInfo: React.FC<RescheduleInfoProps> = ({
  originalStart,
  originalEnd,
  rescheduledStart,
  rescheduledEnd,
  replacementClinicName,
}) => {
  const original = `${format(originalStart, 'hh:mm a')} – ${format(
    originalEnd,
    'hh:mm a'
  )}`;
  const hasReschedule = rescheduledStart && rescheduledEnd;
  const rescheduled = hasReschedule
    ? `${format(rescheduledStart!, 'MMM dd, yyyy')}\n${format(
        rescheduledStart!,
        'hh:mm a'
      )} – ${format(rescheduledEnd!, 'hh:mm a')}`
    : null;

  return (
    <div className="text-sm text-gray-700">
      <div className="line-through opacity-70">{original}</div>
      {hasReschedule && (
        <div className="mt-2 border-t border-gray-200 pt-2">
          <div className="flex items-center space-x-2 text-teal-600 font-medium">
            <span className="text-xs">↓</span>
            <span>Rescheduled →</span>
          </div>
          <div className="whitespace-pre-line text-base font-medium mt-1">
            {rescheduled}
          </div>
          {replacementClinicName && (
            <div className="mt-1 text-gray-600 text-sm">
              {replacementClinicName}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
