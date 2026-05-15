
import React from 'react';

interface OverrideCardProps {
  title: string;
  clinic: string;
  location: string;
  dateRange: string;
  type: 'Emergency' | 'Adjustment';
}

const OverrideCard: React.FC<OverrideCardProps> = ({ title, clinic, location, dateRange, type }) => {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-amber-400 text-[20px]">notification_important</span>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Active Override</span>
        </div>

        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{clinic} [{location}]</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Effective Range</span>
            <span className="text-sm font-medium">{dateRange}</span>
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
            Cancel Override
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverrideCard;
