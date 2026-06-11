import React from 'react';

export const STEP_METADATA = {
  1: { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700 bg-amber-50 border-amber-100', label: 'New Request' },
  2: { dot: 'bg-teal-500',                text: 'text-teal-700 bg-teal-50 border-teal-100',    label: 'Accepted' },
  3: { dot: 'bg-blue-400',                text: 'text-blue-700 bg-blue-50 border-blue-100',    label: 'Assigned Staff' },
  4: { dot: 'bg-indigo-400',             text: 'text-indigo-700 bg-indigo-50 border-indigo-100',  label: 'Collector Arrived' },
  5: { dot: 'bg-blue-500',                text: 'text-blue-700 bg-blue-50 border-blue-100',    label: 'Sample Collected' },
  6: { dot: 'bg-cyan-500',                text: 'text-cyan-700 bg-cyan-50 border-cyan-100',    label: 'Delivered to Lab' },
  7: { dot: 'bg-purple-500',              text: 'text-purple-700 bg-purple-50 border-purple-100',  label: 'Processing' },
  8: { dot: 'bg-purple-600 animate-pulse', text: 'text-violet-700 bg-violet-50 border-violet-100',  label: 'Ready for Report' },
  9: { dot: 'bg-emerald-500',             text: 'text-emerald-700 bg-emerald-50 border-emerald-100', label: 'Completed' },
  0: { dot: 'bg-red-400',                 text: 'text-red-700 bg-red-50 border-red-100',       label: 'Rejected' }
};

export default function StatusBadge({ demoStep = 1, status }) {
  // Fallback to demoStep matching if status is provided
  let step = demoStep;
  if (status) {
    if (status === 'Requested') step = 1;
    else if (status === 'AcceptedByLab') step = 2; // default accepted step
    else if (status === 'SampleCollected') step = 5;
    else if (status === 'Processing') step = 7;
    else if (status === 'Reported') step = 9;
    else if (status === 'Cancelled') step = 0;
    else if (status === 'Rejected') step = 0;
  }

  const meta = STEP_METADATA[step] || STEP_METADATA[1];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${meta.text}`}>
      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
