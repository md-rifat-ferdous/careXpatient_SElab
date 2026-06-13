'use client';
import React from 'react';

interface StatusBadgeProps {
  status: string;
  demoStep?: number;
}

const STEP_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
  1: { label: 'New Request', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Accepted', color: 'bg-teal-100 text-teal-700' },
  3: { label: 'Sample Pending', color: 'bg-amber-100 text-amber-700' },
  4: { label: 'Sample Collected', color: 'bg-indigo-100 text-indigo-700' },
  5: { label: 'Processing', color: 'bg-violet-100 text-violet-700' },
  6: { label: 'Ready for Report', color: 'bg-cyan-100 text-cyan-700' },
  7: { label: 'Report in Progress', color: 'bg-orange-100 text-orange-700' },
  8: { label: 'Report Verified', color: 'bg-emerald-100 text-emerald-700' },
  9: { label: 'Completed', color: 'bg-green-100 text-green-700' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  Requested: { label: 'Requested', color: 'bg-blue-100 text-blue-700' },
  AcceptedByLab: { label: 'Accepted', color: 'bg-teal-100 text-teal-700' },
  SampleCollected: { label: 'Sample Collected', color: 'bg-indigo-100 text-indigo-700' },
  Processing: { label: 'Processing', color: 'bg-violet-100 text-violet-700' },
  Reported: { label: 'Reported', color: 'bg-green-100 text-green-700' },
  Cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700' },
};

export default function StatusBadge({ status, demoStep }: StatusBadgeProps) {
  if (demoStep !== undefined && STEP_CONFIG[demoStep]) {
    const config = STEP_CONFIG[demoStep];
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {config.label}
      </span>
    );
  }

  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
