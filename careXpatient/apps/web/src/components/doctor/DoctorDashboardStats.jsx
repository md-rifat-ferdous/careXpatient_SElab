'use client';

import React from 'react';















const STAT_CONFIG = [
{
  key: 'pending',
  label: 'Pending',
  color: 'text-amber-700',
  bgColor: 'bg-amber-50 border-amber-200',
  icon:
  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

},
{
  key: 'confirmed',
  label: 'Confirmed',
  color: 'text-teal-700',
  bgColor: 'bg-teal-50 border-teal-200',
  icon:
  <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

},
{
  key: 'completed',
  label: 'Completed',
  color: 'text-sky-700',
  bgColor: 'bg-sky-50 border-sky-200',
  icon:
  <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>

},
{
  key: 'cancelled',
  label: 'Cancelled',
  color: 'text-rose-700',
  bgColor: 'bg-rose-50 border-rose-200',
  icon:
  <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

}];


const SkeletonCard = () =>
<div className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100" />
      <div className="h-3 w-20 bg-slate-100 rounded" />
    </div>
    <div className="h-7 w-12 bg-slate-100 rounded" />
  </div>;


/**
 * Displays four stat cards (Pending, Confirmed, Completed, Cancelled)
 * for the Doctor Dashboard overview.
 */
export default function DoctorDashboardStats({ stats, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CONFIG.map((s) => <SkeletonCard key={s.key} />)}
      </div>);

  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STAT_CONFIG.map(({ key, label, color, bgColor, icon }) =>
      <div
        key={key}
        className={`${bgColor} border rounded-2xl p-4 transition-transform hover:scale-[1.02]`}>
        
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
              {icon}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>
              {label}
            </span>
          </div>
          <p className={`text-3xl font-bold ${color}`}>{stats[key]}</p>
        </div>
      )}
    </div>);

}