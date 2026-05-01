import React from 'react';
import { Doctor } from '../types/doctor';

interface DoctorCardProps {
  doctor: Doctor;
  onBookNow: (doctor: Doctor) => void;
  onViewProfile: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onBookNow, onViewProfile }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden group">
      {/* Card Header */}
      <div className="p-5 flex gap-4 items-start">
        <div className="relative shrink-0">
          <img src={doctor.photo} alt={doctor.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-300" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 truncate">{doctor.name}</h3>
          <p className="text-xs font-semibold text-teal-600 mt-0.5">{doctor.specialty}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{doctor.qualification}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-yellow-400 text-sm leading-none">★</span>
            <span className="text-xs font-bold text-slate-700">{doctor.rating}</span>
            <span className="text-xs text-slate-400">({doctor.reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-50 mx-5" />

      {/* Stats */}
      <div className="flex items-center gap-4 px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </span>
          <span className="text-xs text-slate-500 font-medium">{doctor.experience} yrs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${doctor.availableToday ? 'bg-green-50' : 'bg-slate-100'}`}>
            {doctor.availableToday ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )}
          </span>
          <span className={`text-xs font-medium ${doctor.availableToday ? 'text-green-600' : 'text-slate-400'}`}>
            {doctor.availableToday ? 'Available Today' : 'Not Today'}
          </span>
        </div>
        <div className="ml-auto">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${doctor.gender === 'Female' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
            {doctor.gender}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-50 mx-5" />

      {/* Fee + Buttons */}
      <div className="flex items-center justify-between px-5 py-4 mt-auto">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Fee</p>
          <p className="text-xl font-black text-slate-800">${doctor.fee}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewProfile(doctor)}
            className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
          >
            View Profile
          </button>
          <button
            onClick={() => onBookNow(doctor)}
            className="px-4 py-2 bg-teal-500 text-white rounded-xl text-xs font-bold hover:bg-teal-600 active:scale-95 transition-all shadow-sm shadow-teal-200"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
