import React from 'react';

export default function StatCard({ 
  icon = 'science', 
  iconBg = 'bg-primary-container/10', 
  iconColor = 'text-primary-container', 
  label = 'Statistics Card', 
  value = '0', 
  badge, 
  badgeColor = 'bg-slate-100 text-slate-700' 
}) {
  return (
    <div className="bg-surface-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-on-surface-variant text-sm font-semibold">{label}</p>
      <p className="text-3xl font-extrabold mt-1 text-on-surface tracking-tight">{value}</p>
    </div>
  );
}
