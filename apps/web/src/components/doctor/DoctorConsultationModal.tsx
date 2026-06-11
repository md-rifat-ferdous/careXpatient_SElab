'use client';

import React, { useState } from 'react';
import { DoctorAppointment, startConsultation, createPrescription } from '@/services/doctor.service';

interface Props {
  isOpen: boolean;
  appointment: DoctorAppointment | null;
  token: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function DoctorConsultationModal({ isOpen, appointment, token, onClose, onComplete }: Props) {
  const [step, setStep] = useState<'start' | 'prescription' | 'done'>('start');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicinesText, setMedicinesText] = useState('');
  const [adviceText, setAdviceText] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !appointment) return null;

  const handleStartConsultation = async () => {
    setLoading(true);
    setError('');
    try {
      await startConsultation(appointment.id, token);
      setStep('prescription');
    } catch (err: any) {
      setError(err.message || 'Failed to start consultation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!diagnosis && !medicinesText) {
      setError('At least diagnosis or medicines is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createPrescription(appointment.id, { diagnosis, medicinesText, adviceText, notes }, token);
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Failed to create prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 'start' && 'Start Consultation'}
            {step === 'prescription' && 'Create Prescription'}
            {step === 'done' && 'Consultation Done'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* Patient Info */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
          <img
            src={appointment.patientAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patientName)}&background=14B8A6&color=fff`}
            alt={appointment.patientName}
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <p className="font-semibold text-sm text-gray-900">{appointment.patientName}</p>
            <p className="text-xs text-gray-500">{appointment.date} at {appointment.timeSlot}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">{error}</div>
          )}

          {step === 'start' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm mb-6">Start the consultation session for this appointment.</p>
              <button
                onClick={handleStartConsultation}
                disabled={loading}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Consultation'}
              </button>
            </div>
          )}

          {step === 'prescription' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Diagnosis</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  placeholder="Enter diagnosis..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Medicines (one per line — format: Medicine|Dosage|Frequency|Duration)</label>
                <textarea
                  value={medicinesText}
                  onChange={(e) => setMedicinesText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  placeholder="Amoxicillin|500mg|3x daily|7 days"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Advice</label>
                <textarea
                  value={adviceText}
                  onChange={(e) => setAdviceText(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  placeholder="Rest, hydration, follow-up in 1 week..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Consultation Notes (internal)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  placeholder="Doctor's private notes..."
                />
              </div>
              <button
                onClick={handleSavePrescription}
                disabled={loading}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Prescription'}
              </button>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm mb-2">Prescription saved successfully.</p>
              <p className="text-gray-400 text-xs mb-6">You can now mark this appointment as completed.</p>
              <button
                onClick={onComplete}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
