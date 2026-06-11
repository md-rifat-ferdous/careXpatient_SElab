'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import DoctorAppointmentHub from '@/components/doctor/DoctorAppointmentHub';
import DoctorCancellationModal from '@/components/doctor/DoctorCancellationModal';
import DoctorConsultationModal from '@/components/doctor/DoctorConsultationModal';
import { getSocket, joinAppointmentRoom } from '@/lib/socket';
import {
  fetchDoctorAppointments,
  acceptAppointment,
  declineAppointment,
  completeAppointment,
  DoctorAppointment,
} from '@/services/doctor.service';

function DoctorAppointmentsContent() {
  const { user, token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFilter = (searchParams.get('filter') ?? 'Today') as string;

  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decline modal state
  const [declineTarget, setDeclineTarget] = useState<DoctorAppointment | null>(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

  // Consultation modal state
  const [consultTarget, setConsultTarget] = useState<DoctorAppointment | null>(null);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  // ── Socket ─────────────────────────────────────────────────────────────────

  const socket = token ? getSocket(token) : null;

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { appointmentId: string; status: string }) => {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === data.appointmentId ? { ...a, status: data.status as any } : a
        )
      );
    };
    socket.on('appointment:status', handler);
    return () => { socket.off('appointment:status', handler); };
  }, [socket]);

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

  const handleAccept = async (appointmentId: string) => {
    if (!token) return;
    try {
      setActionLoading(true);
      await acceptAppointment(appointmentId, token);
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'Approved' as const } : a))
      );
    } catch (err: any) {
      setError(err.message ?? 'Failed to accept appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Decline Handlers ───────────────────────────────────────────────────────

  const handleDeclineClick = (appointment: DoctorAppointment) => {
    setDeclineTarget(appointment);
    setIsDeclineModalOpen(true);
  };

  const handleDeclineConfirm = async (reason: string) => {
    if (!declineTarget || !token || !user?.id) return;
    try {
      setActionLoading(true);
      await declineAppointment(declineTarget.id, reason, user.id, token);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === declineTarget.id
            ? { ...a, status: 'Rejected' as const, cancellationReason: reason }
            : a
        )
      );
      setIsDeclineModalOpen(false);
      setDeclineTarget(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to decline appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Start Consultation (text-based) ───────────────────────────────────────

  const handleStartConsultation = (appointment: DoctorAppointment) => {
    setConsultTarget(appointment);
    setIsConsultModalOpen(true);
  };

  // ── Video Call ────────────────────────────────────────────────────────────

  const handleVideoCall = (appointment: DoctorAppointment) => {
    if (token) {
      joinAppointmentRoom(appointment.id, token);
    }
    router.push(`/dashboard/doctor/consultation/${appointment.id}`);
  };

  // ── Complete Appointment ───────────────────────────────────────────────────

  const handleComplete = async (appointment?: DoctorAppointment) => {
    const target = appointment || consultTarget;
    if (!target || !token) return;
    try {
      setActionLoading(true);
      await completeAppointment(target.id, token);
      setAppointments((prev) =>
        prev.map((a) => (a.id === target.id ? { ...a, status: 'Completed' as const } : a))
      );
      setIsConsultModalOpen(false);
      setConsultTarget(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to complete appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filter appointments to include video call button ──────────────────────

  const appointmentsWithVideo = appointments.map((a) => ({
    ...a,
    onVideoCall: a.type === 'Online' && (a.status === 'Confirmed' || a.status === 'Waiting_for_call' || a.status === 'In_consultation')
      ? () => handleVideoCall(a)
      : undefined,
  }));

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Appointments</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your schedule and patient requests.</p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-rose-500 flex-shrink-0">⚠️</span>
          <p className="text-rose-800 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-rose-400 hover:text-rose-600 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Appointment Hub ── */}
      <DoctorAppointmentHub
        appointments={appointmentsWithVideo}
        loading={loading}
        actionLoading={actionLoading}
        initialFilter={initialFilter}
        onAccept={handleAccept}
        onDecline={handleDeclineClick}
        onStartConsultation={handleStartConsultation}
        onComplete={handleComplete}
      />

      {/* ── Video Call Button Area ── */}
      {appointments.filter((a) => a.type === 'Online' && (a.status === 'Confirmed' || a.status === 'Waiting_for_call' || a.status === 'In_consultation')).length > 0 && (
        <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-teal-800 mb-2">Active Video Consultations</p>
          <div className="space-y-2">
            {appointments.filter((a) => a.type === 'Online' && (a.status === 'Confirmed' || a.status === 'Waiting_for_call' || a.status === 'In_consultation')).map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-teal-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{a.patientName}</p>
                  <p className="text-xs text-gray-500">{a.date} at {a.timeSlot} &bull; {a.status.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => handleVideoCall(a)}
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
                >
                  {a.status === 'In_consultation' ? 'Rejoin Call' : 'Video Call'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cancellation Modal ── */}
      <DoctorCancellationModal
        isOpen={isDeclineModalOpen}
        patientName={declineTarget?.patientName ?? null}
        onClose={() => { setIsDeclineModalOpen(false); setDeclineTarget(null); }}
        onConfirm={handleDeclineConfirm}
        isLoading={actionLoading}
      />

      {/* ── Consultation Modal ── */}
      <DoctorConsultationModal
        isOpen={isConsultModalOpen}
        appointment={consultTarget}
        token={token || ''}
        onClose={() => { setIsConsultModalOpen(false); setConsultTarget(null); }}
        onComplete={() => handleComplete()}
      />
    </div>
  );
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
    </Suspense>
  );
}
