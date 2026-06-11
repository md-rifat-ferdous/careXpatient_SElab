"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { fetchPatientAppointments, cancelAppointment, PatientAppointment } from '@/services/doctor.service';
import { getSocket, joinAppointmentRoom } from '@/lib/socket';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-sky-100 text-sky-700',
  Rejected: 'bg-rose-100 text-rose-700',
  Rescheduled: 'bg-violet-100 text-violet-700',
  Confirmed: 'bg-teal-100 text-teal-700',
  Waiting_for_call: 'bg-blue-100 text-blue-700',
  In_consultation: 'bg-purple-100 text-purple-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  NoShow: 'bg-slate-100 text-slate-600',
};

function formatDate(dateStr: string) {
  const normalized = dateStr.includes('T') ? dateStr.substring(0, 10) : dateStr;
  const d = new Date(normalized + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr: string) {
  const d = new Date(timeStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function MyAppointmentsPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  // Socket
  const socket = token ? getSocket(token) : null;

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { appointmentId: string; status: string }) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === data.appointmentId ? { ...a, status: data.status as any } : a))
      );
    };
    socket.on('appointment:status', handler);
    return () => { socket.off('appointment:status', handler); };
  }, [socket]);

  // Cancel state
  const [cancelTarget, setCancelTarget] = useState<PatientAppointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    fetchPatientAppointments(user.id)
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleJoinVideoCall = (appointment: PatientAppointment) => {
    if (token) {
      joinAppointmentRoom(appointment.id, token);
    }
    router.push(`/dashboard/patient/consultation/${appointment.id}`);
  };

  const now = new Date();
  const filtered = appointments.filter((a) => {
    const d = new Date(a.date + 'T00:00:00');
    if (filter === 'upcoming') return d >= now && a.status !== 'Cancelled' && a.status !== 'Completed';
    if (filter === 'past') return d < now || a.status === 'Cancelled' || a.status === 'Completed';
    return true;
  });

  const handleCancelAppointment = async () => {
    if (!cancelTarget || !user) return;
    setIsCancelling(true);
    try {
      await cancelAppointment(cancelTarget.id, user.id, cancelReason || undefined);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelTarget.id
            ? { ...a, status: 'Cancelled' as const, cancellationReason: cancelReason || 'Cancelled by patient' }
            : a
        )
      );
      setCancelTarget(null);
      setCancelReason('');
    } catch (err: any) {
      console.error('Failed to cancel:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <header className="bg-white border-b border-slate-100 px-8 py-5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Appointments</h1>
            <p className="text-sm text-slate-400 font-bold mt-1">
              {isLoading ? 'Loading...' : `${appointments.length} total appointments`}
            </p>
          </div>
          <Link
            href="/dashboard/patient/appointments/book"
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Book New Appointment
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['upcoming', 'past', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-100'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300'
              }`}
            >
              {tab === 'upcoming' ? 'Upcoming' : tab === 'past' ? 'Past' : 'All'}
            </button>
          ))}
        </div>

        {/* Appointment list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800">No appointments found</h3>
            <p className="text-slate-400 font-bold max-w-xs mt-1">
              {filter === 'upcoming' ? 'You have no upcoming appointments. Book one now!' : 'No appointments match this filter.'}
            </p>
            <Link href="/dashboard/patient/appointments/book" className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all">
              Book an Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((apt) => (
              <div key={apt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
                <img
                  src={apt.doctor.user.profilePhotoUrl || 'https://via.placeholder.com/150'}
                  alt={apt.doctor.user.fullName}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800 truncate">{apt.doctor.user.fullName}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLORS[apt.status] || 'bg-slate-100 text-slate-600'}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-xs text-teal-600 font-semibold mb-1">
                    {apt.doctor.specialties[0]?.specialty.name}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatDate(apt.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {formatTime(apt.timeSlot)}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                      {apt.type === 'Online' ? '🎥 Online' : '🏥 In-person'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {apt.status === 'Pending' && (
                    <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg">
                      Awaiting confirmation
                    </span>
                  )}
                  {apt.type === 'Online' && (apt.status === 'Confirmed' || apt.status === 'Waiting_for_call' || apt.status === 'In_consultation') && (
                    <button
                      onClick={() => handleJoinVideoCall(apt)}
                      className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      {apt.status === 'In_consultation' ? 'Join Call' : 'Waiting Room'}
                    </button>
                  )}
                  {(apt.status === 'Pending' || apt.status === 'Approved' || apt.status === 'Confirmed') && (
                    <button
                      onClick={() => setCancelTarget(apt)}
                      className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {apt.status === 'Rescheduled' && (
                    <span className="text-xs text-violet-600 font-bold bg-violet-50 px-3 py-1.5 rounded-lg">
                      Rescheduled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {cancelTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Cancel Appointment</h2>
                <button onClick={() => { setCancelTarget(null); setCancelReason(''); }} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">
                  Cancel appointment with <strong>{cancelTarget.doctor.user.fullName}</strong> on {formatDate(cancelTarget.date)} at {formatTime(cancelTarget.timeSlot)}?
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Reason (optional)</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                    placeholder="Tell us why..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setCancelTarget(null); setCancelReason(''); }}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Keep
                  </button>
                  <button
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
