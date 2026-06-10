'use client';

import React, { useState, useEffect } from 'react';

// ─── Types & Constants ────────────────────────────────────────────────────────









const PRESET_REASONS = [
'Doctor Unavailable',
'Incorrect Department',
'Patient No-show',
'Technical Issues',
'Schedule Conflict',
'Emergency Re-scheduling'];


// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Modal dialog for a doctor to decline/cancel an appointment.
 * Requires the doctor to select a preset reason before confirming.
 * An optional free-text note can be appended.
 */
export default function DoctorCancellationModal({
  isOpen,
  patientName,
  onClose,
  onConfirm,
  isLoading = false
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');

  // Reset form state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReason('');
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedReason) return;
    const fullReason = note.trim() ? `${selectedReason}: ${note.trim()}` : selectedReason;
    onConfirm(fullReason);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      
      {/* Modal panel */}
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900">Cancel Appointment</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close modal">
            
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Patient info chip */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">Patient</p>
              <p className="text-sm font-semibold text-slate-800">{patientName ?? 'Unknown Patient'}</p>
            </div>
          </div>

          {/* Reason selector */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2.5">
              Reason for cancellation <span className="text-rose-500">*</span>
            </p>
            <div className="space-y-2">
              {PRESET_REASONS.map((reason) =>
              <label
                key={reason}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                selectedReason === reason ?
                'border-teal-400 bg-teal-50 text-teal-800' :
                'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`
                }>
                
                  <input
                  type="radio"
                  name="cancel-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="accent-teal-600" />
                
                  <span className="text-sm font-medium">{reason}</span>
                </label>
              )}
            </div>
          </div>

          {/* Optional note */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
              Additional notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any extra context for the patient..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none" />
            
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50">
            
            Go Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason || isLoading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            
            {isLoading ?
            <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </> :

            'Confirm Cancellation'
            }
          </button>
        </div>
      </div>
    </div>);

}