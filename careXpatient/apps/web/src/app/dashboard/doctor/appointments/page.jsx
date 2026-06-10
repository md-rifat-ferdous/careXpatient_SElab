'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import DoctorAppointmentHub from '@/components/doctor/DoctorAppointmentHub';
import DoctorCancellationModal from '@/components/doctor/DoctorCancellationModal';
import {
  fetchDoctorAppointments,
  acceptAppointment,
  declineAppointment } from

'@/services/doctor.service';

function DoctorAppointmentsContent() {
  const { user, token } = useAuthStore();
  const searchParams = useSearchParams();

  // Honour ?filter= query param from dashboard quick links
  const initialFilter = searchParams.get('filter') ?? 'Today';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Decline modal state
  const [declineTarget, setDeclineTarget] = useState(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const loadAppointments = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDoctorAppointments(user.id, token);
      setAppointments(data);
    } catch {
      setError('Could not load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // ── Accept Handler ─────────────────────────────────────────────────────────

  const handleAccept = async (appointmentId) => {
    if (!token) return;
    try {
      setActionLoading(true);
      await acceptAppointment(appointmentId, token);
      // Optimistically update local state
      setAppointments((prev) =>
      prev.map((a) => a.id === appointmentId ? { ...a, status: 'Confirmed' } : a)
      );
    } catch (err) {
      setError(err.message ?? 'Failed to accept appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Decline Handlers ───────────────────────────────────────────────────────

  const handleDeclineClick = (appointment) => {
    setDeclineTarget(appointment);
    setIsDeclineModalOpen(true);
  };

  const handleDeclineConfirm = async (reason) => {
    if (!declineTarget || !token || !user?.id) return;
    try {
      setActionLoading(true);
      await declineAppointment(declineTarget.id, reason, user.id, token);
      // Optimistically update local state
      setAppointments((prev) =>
      prev.map((a) =>
      a.id === declineTarget.id ?
      { ...a, status: 'Cancelled', cancellationReason: reason } :
      a
      )
      );
      setIsDeclineModalOpen(false);
      setDeclineTarget(null);
    } catch (err) {
      setError(err.message ?? 'Failed to decline appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Appointments</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your schedule and patient requests.</p>
      </div>

      {/* ── Error Banner ── */}
      {error &&
      <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-rose-500 flex-shrink-0">⚠️</span>
          <p className="text-rose-800 text-sm">{error}</p>
          <button
          onClick={() => setError(null)}
          className="ml-auto text-rose-400 hover:text-rose-600 transition-colors"
          aria-label="Dismiss">
          
            ✕
          </button>
        </div>
      }

      {/* ── Appointment Hub ── */}
      <DoctorAppointmentHub
        appointments={appointments}
        loading={loading}
        actionLoading={actionLoading}
        initialFilter={initialFilter}
        onAccept={handleAccept}
        onDecline={handleDeclineClick} />
      

      {/* ── Cancellation Modal ── */}
      <DoctorCancellationModal
        isOpen={isDeclineModalOpen}
        patientName={declineTarget?.patientName ?? null}
        onClose={() => {setIsDeclineModalOpen(false);setDeclineTarget(null);}}
        onConfirm={handleDeclineConfirm}
        isLoading={actionLoading} />
      
    </div>);

}

export default function DoctorAppointmentsPage() {
  return (
    <Suspense fallback={
    <div className="max-w-5xl mx-auto py-6">
        <h1 className="text-xl font-bold text-slate-900">Appointments</h1>
        <p className="text-sm text-slate-500 mt-0.5">Loading appointments schedule...</p>
      </div>
    }>
      <DoctorAppointmentsContent />
    </Suspense>);

}