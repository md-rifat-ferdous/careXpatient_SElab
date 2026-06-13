'use client';
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
  loading?: boolean;
}

export default function StatCard({ icon, iconBg, iconColor, label, value, badge, badgeColor, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-slate-100 rounded mt-1 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        )}
      </div>
      {badge && (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColor || 'bg-slate-100 text-slate-600'}`}>
          {badge}
        </span>
      )}
    </div>
  );
}
