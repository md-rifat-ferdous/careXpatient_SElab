import React from 'react';

export default function FilterTabs({ 
  tabs = [], 
  activeTab = '', 
  onTabChange, 
  counts = {} 
}) {
  return (
    <div className="flex bg-background-off-white p-1 rounded-xl w-fit overflow-x-auto gap-1 border border-outline-variant/30">
      {tabs.map((tab) => {
        const count = counts[tab];
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange && onTabChange(tab)}
            className={`
              px-4 py-2 text-sm rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5
              ${isActive 
                ? 'bg-surface-white text-primary-container shadow-sm font-bold' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/30'}
            `}
          >
            <span>{tab}</span>
            {count !== undefined && (
              <span className={`
                text-[10px] px-1.5 py-0.5 rounded-full font-bold
                ${isActive ? 'bg-primary-container/10 text-primary-container' : 'bg-outline-variant/30 text-on-surface-variant'}
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
