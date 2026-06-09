'use client';

import React from 'react';
import { Doctor } from '../../types/doctor';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookNow: (doctor: Doctor) => void;
}

const DUMMY_REVIEWS = [
  { id: 1, name: 'Farzana Y.', avatar: 'https://i.pravatar.cc/150?u=r1', rating: 5, comment: 'Extremely professional and empathetic. Explained everything clearly.', date: '2 days ago' },
  { id: 2, name: 'Tanvir H.', avatar: 'https://i.pravatar.cc/150?u=r2', rating: 5, comment: 'Best doctor I have visited. Highly recommended!', date: '1 week ago' },
  { id: 3, name: 'Sumaiya K.', avatar: 'https://i.pravatar.cc/150?u=r3', rating: 4, comment: 'Very knowledgeable. The appointment was smooth and on time.', date: '2 weeks ago' },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
          fill={i <= rating ? '#FACC15' : 'none'} stroke="#FACC15" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function DoctorProfileModal({ doctor, onClose, onBookNow }: DoctorProfileModalProps) {
  if (!doctor) return null;

  const handleBook = () => {
    onClose();
    onBookNow(doctor);
  };

  const specialty = doctor.specialties?.[0]?.specialty?.name || 'General Physician';

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <div className="h-28 bg-gradient-to-r from-teal-500 to-teal-400 rounded-t-2xl overflow-hidden"></div>
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="absolute -bottom-10 left-6">
              <img src={doctor.user.profilePhotoUrl || 'https://via.placeholder.com/150'} alt={doctor.user.fullName} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
            </div>
          </div>

          <div className="h-12" />

          <div className="px-6 pb-6 space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-800">{doctor.user.fullName}</h2>
                  <p className="text-sm font-semibold text-teal-600 mt-0.5">{specialty}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{doctor.qualification}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 font-bold">★</span>
                    <span className="font-black text-slate-800">{doctor.rating || '0.0'}</span>
                  </div>
                  <span className="text-xs text-slate-400">{doctor.reviewCount || 0} reviews</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Experience', value: `${doctor.experienceYears} yrs`, icon: '🏥' },
                { label: 'Patients', value: `${(doctor.reviewCount || 0) * 2}+`, icon: '👥' },
                { label: 'Fee', value: `৳${doctor.fee}`, icon: '💳' },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <span className="text-xl">{s.icon}</span>
                  <p className="font-black text-slate-800 text-sm mt-1">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2">About</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{doctor.about}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Patient Reviews</h3>
              <div className="space-y-3">
                {DUMMY_REVIEWS.map((r) => (
                  <div key={r.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img src={r.avatar} alt={r.name} className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-sm font-semibold text-slate-700">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRow rating={r.rating} />
                        <span className="text-xs text-slate-400">{r.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3 rounded-b-2xl">
            <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl text-sm">Close</button>
            <button onClick={handleBook} className="flex-1 py-3 bg-teal-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-600 active:scale-95 transition-all">Book Appointment</button>
          </div>
        </div>
      </div>
    </>
  );
}
