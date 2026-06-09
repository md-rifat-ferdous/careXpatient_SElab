import React from 'react';

const statusStyleMap: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'ACTIVE':                { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active' },
  'Cancel Slot':           { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Cancelled' },
  'Reschedule':            { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    label: 'Rescheduled' },
  'Replacement Schedule':  { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    label: 'Replacement' },
  'Holiday':               { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Holiday' },
  'Leave':                 { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  label: 'Leave' },
  'Slot':                  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    label: 'Custom Slot' },
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const style = statusStyleMap[status] ?? { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
};
