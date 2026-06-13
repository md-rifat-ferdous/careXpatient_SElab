'use client';
import React from 'react';

interface FilterTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: Record<string, number>;
}

export default function FilterTabs({ tabs, activeTab, onTabChange, counts }: FilterTabsProps) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === tab
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab}
          {counts && counts[tab] !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'
            }`}>
              {counts[tab]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
