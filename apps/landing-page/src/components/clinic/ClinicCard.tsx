
import React from 'react';

interface ClinicCardProps {
  name: string;
  address: string;
  schedule?: { day: string; time: string }[];
  isClosed?: boolean;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ name, address, schedule, isClosed }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{name}</h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{address}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isClosed ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>
          {isClosed ? 'Closed' : 'Active'}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Schedule</h4>
        {isClosed ? (
          <p className="text-sm text-slate-400 italic">No slots scheduled for this day</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {schedule?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm font-medium text-slate-600">{item.day}</span>
                <span className="text-sm font-bold text-slate-900">{item.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <button className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors">
          Manage Slots
        </button>
        <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-teal-600 hover:border-teal-100 transition-colors">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
      </div>
    </div>
  );
};

export default ClinicCard;
