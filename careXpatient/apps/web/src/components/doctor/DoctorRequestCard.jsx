'use client';

import React from 'react';









/**
 * Displays a single appointment request card with Accept and Decline actions.
 * Used in the 'Today' and 'Pending' filter views.
 */
export default function DoctorRequestCard({ appointment, onAccept, onDecline, disabled = false }) {
  const avatarUrl = appointment.patientAvatarUrl ??
  `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patientName)}&background=e0f2fe&color=0369a1&size=64`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 transition-shadow hover:shadow-sm">

      {/* Patient Avatar */}
      <img
        src={avatarUrl}
        alt={appointment.patientName}
        className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
      

      {/* Patient Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm truncate">{appointment.patientName}</p>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">
            {appointment.type === 'Online' ? '📹 Video' : '🏥 In-person'} &bull; {appointment.timeSlot} &bull; {appointment.date}
          </span>
        </div>
        {appointment.reasonForVisit &&
        <p className="text-xs text-slate-400 mt-1 truncate">{appointment.reasonForVisit}</p>
        }
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onDecline(appointment)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Decline appointment for ${appointment.patientName}`}>
          
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Decline
        </button>

        <button
          onClick={() => onAccept(appointment.id)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Accept appointment for ${appointment.patientName}`}>
          
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Accept
        </button>
      </div>
    </div>);

}