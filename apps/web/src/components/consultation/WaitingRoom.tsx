'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  doctorAvatar: string;
  patientName: string;
  isDoctorView?: boolean;
  hasPatientJoined?: boolean;
  onJoinCall: () => void;
  canJoin: boolean;
}

export default function WaitingRoom({
  appointmentDate,
  appointmentTime,
  doctorName,
  doctorAvatar,
  patientName,
  isDoctorView = false,
  hasPatientJoined = false,
  onJoinCall,
  canJoin,
}: Props) {
  const [countdown, setCountdown] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const isPM = appointmentTime.includes('PM');
      const hour24 = isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours;

      const apptTime = new Date(appointmentDate);
      apptTime.setHours(hour24, minutes, 0, 0);

      const diff = apptTime.getTime() - now.getTime();
      setTimeLeft(diff);

      if (diff <= 0) {
        setCountdown('Appointment time has arrived.');
        return;
      }

      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [appointmentDate, appointmentTime]);

  const tenMinutesBefore = timeLeft <= 10 * 60 * 1000;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-full max-w-md mx-auto text-center">
        {isDoctorView ? (
          <>
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Waiting Room</h2>
            <p className="text-gray-500 mb-6">{patientName}</p>

            {hasPatientJoined ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-700 font-semibold">Patient is in the waiting room.</p>
                <p className="text-green-600 text-sm mt-1">You can start the consultation now.</p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-700 font-semibold">Waiting for patient to join...</p>
                <p className="text-amber-600 text-sm mt-1">The patient will be notified when you're ready.</p>
              </div>
            )}

            {hasPatientJoined && (
              <button
                onClick={onJoinCall}
                className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
              >
                Start Consultation
              </button>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Doctor</h2>
            <p className="text-gray-500 mb-6">Your appointment is confirmed. The doctor will join soon.</p>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 text-left space-y-3 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <img
                  src={doctorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=14B8A6&color=fff`}
                  alt={doctorName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{doctorName}</p>
                  <p className="text-xs text-gray-500">Your Doctor</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Date</span>
                <span className="font-semibold text-gray-700">{appointmentDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Time</span>
                <span className="font-semibold text-gray-700">{appointmentTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Type</span>
                <span className="font-semibold text-gray-700">Video Consultation</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Countdown to appointment</p>
              <p className={`text-3xl font-mono font-bold ${timeLeft <= 0 ? 'text-teal-600' : 'text-gray-800'}`}>
                {countdown || '--:--:--'}
              </p>
            </div>

            <button
              onClick={onJoinCall}
              disabled={!canJoin || !tenMinutesBefore}
              className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all ${
                canJoin && tenMinutesBefore
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canJoin && tenMinutesBefore ? 'Join Consultation' : 'Join button activates 10 min before appointment'}
            </button>

            {!tenMinutesBefore && timeLeft > 0 && (
              <p className="text-xs text-gray-400 mt-3">
                The join button will be available 10 minutes before your appointment time.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
