import React from 'react';

const colourMap: Record<string, string> = {
  'ACTIVE': 'bg-emerald-500 text-white',
  'Cancel Slot': 'bg-red-200 text-red-800',
  'Reschedule': 'bg-teal-500 text-white',
  'Replacement Schedule': 'bg-teal-500 text-white',
  'Holiday': 'bg-amber-500 text-white',
  'Leave': 'bg-purple-500 text-white',
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${colourMap[status] || 'bg-gray-200 text-gray-800'}`}>
    {status}
  </span>
);
