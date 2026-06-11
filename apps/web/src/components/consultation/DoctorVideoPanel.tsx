'use client';

import React from 'react';

interface Props {
  patientName: string;
  patientAvatar: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationDuration: number;
  onEndConsultation: () => void;
  isEnding: boolean;
}

export default function DoctorVideoPanel({
  patientName,
  patientAvatar,
  appointmentDate,
  appointmentTime,
  consultationDuration,
  onEndConsultation,
  isEnding,
}: Props) {
  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-3">
        <img
          src={patientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=14B8A6&color=fff`}
          alt={patientName}
          className="w-10 h-10 rounded-xl object-cover"
        />
        <div>
          <p className="font-semibold text-sm text-gray-900">{patientName}</p>
          <p className="text-xs text-gray-500">{appointmentDate} at {appointmentTime}</p>
        </div>
      </div>

      <div className="bg-teal-50 rounded-lg p-3 text-center">
        <p className="text-xs text-teal-600 font-semibold">Consultation Duration</p>
        <p className="text-xl font-mono font-bold text-teal-800">{formatDuration(consultationDuration)}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase">Quick Actions</p>
        <button
          onClick={onEndConsultation}
          disabled={isEnding}
          className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isEnding ? 'Ending...' : 'End Consultation'}
        </button>
      </div>
    </div>
  );
}
