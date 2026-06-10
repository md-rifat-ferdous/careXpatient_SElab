import React from 'react';








export default function DoctorCard({ doctor, onBookNow, onViewProfile }) {
  const specialty = doctor.specialties?.[0]?.specialty?.name || 'General Physician';
  const isAvailableToday = true; // For demo purpose

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group">
      {/* Card Header */}
      <div className="p-5 flex gap-4 items-start relative">
        <div className="relative shrink-0">
          <img
            src={doctor.user.profilePhotoUrl || 'https://via.placeholder.com/150'}
            alt={doctor.user.fullName}
            className="w-16 h-16 rounded-2xl object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-300" />
          
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="min-w-0 pr-16"> {/* Space for gender badge */}
          <h3 className="font-bold text-slate-800 truncate text-base">{doctor.user.fullName}</h3>
          <p className="text-xs font-semibold text-teal-600 mt-0.5">{specialty}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate leading-tight">{doctor.qualification}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-xs font-black text-slate-800">{doctor.rating || '0.0'}</span>
            <span className="text-[10px] text-slate-400 font-bold">({doctor.reviewCount || 0})</span>
          </div>
        </div>

        {/* Gender Badge */}
        {doctor.user.gender &&
        <div className={`absolute top-5 right-5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
        doctor.user.gender === 'Female' ?
        'bg-rose-50 text-rose-500 border border-rose-100' :
        'bg-blue-50 text-blue-500 border border-blue-100'}`
        }>
            {doctor.user.gender}
          </div>
        }
      </div>

      <div className="border-t border-slate-50 mx-5" />

      {/* Info Row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span className="text-[11px] text-slate-500 font-bold">{doctor.experienceYears} yrs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isAvailableToday ? '#22C55E' : '#94A3B8'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <span className={`text-[11px] font-bold ${isAvailableToday ? 'text-green-600' : 'text-slate-400'}`}>
              {isAvailableToday ? 'Available Today' : 'Not Today'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-50 mx-5" />

      {/* Fee + Buttons */}
      <div className="flex items-center justify-between px-5 py-4 mt-auto">
        <div>
          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Fee</p>
          <p className="text-xl font-black text-slate-800">৳{doctor.fee}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewProfile(doctor)}
            className="px-4 py-2 border-2 border-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
            
            View Profile
          </button>
          <button
            onClick={() => onBookNow(doctor)}
            className="px-4 py-2 bg-teal-500 text-white rounded-xl text-xs font-black hover:bg-teal-600 active:scale-95 transition-all shadow-lg shadow-teal-500/20">
            
            Book Now
          </button>
        </div>
      </div>
    </div>);

}