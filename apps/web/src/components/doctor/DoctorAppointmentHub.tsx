'use client';

import React, { useState, useEffect } from 'react';
import { DoctorAppointment } from '@/services/doctor.service';
import DoctorRequestCard from './DoctorRequestCard';
import DoctorScheduleTimeline from './DoctorScheduleTimeline';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'Today' | 'Upcoming' | 'Pending' | 'Online' | 'In-person';

interface Props {
  appointments: DoctorAppointment[];
  loading?: boolean;
  actionLoading?: boolean;
  initialFilter?: string;
  onAccept: (id: string) => void;
  onDecline: (appointment: DoctorAppointment) => void;
  onStartConsultation?: (appointment: DoctorAppointment) => void;
  onComplete?: (appointment: DoctorAppointment) => void;
  onReschedule?: (appointment: DoctorAppointment) => void;
}

const FILTERS: FilterTab[] = ['Today', 'Upcoming', 'Pending', 'Online', 'In-person'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Checks if an appointment's date string matches today's date. */
const isToday = (dateStr: string): boolean => {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return dateStr === today;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl bg-slate-100 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-36 bg-slate-100 rounded" />
      <div className="h-3 w-24 bg-slate-100 rounded" />
    </div>
    <div className="flex gap-2">
      <div className="h-8 w-20 bg-slate-100 rounded-lg" />
      <div className="h-8 w-20 bg-slate-100 rounded-lg" />
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * The main appointment management UI for the Doctor Portal.
 * Handles filter tab switching and delegates rendering to child components.
 */
export default function DoctorAppointmentHub({
  appointments,
  loading = false,
  actionLoading = false,
  initialFilter = 'Today',
  onAccept,
  onDecline,
  onStartConsultation,
  onComplete,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>(
    FILTERS.includes(initialFilter as FilterTab) ? (initialFilter as FilterTab) : 'Today'
  );

  // Sync if the parent changes the initialFilter (e.g., via query param)
  useEffect(() => {
    if (FILTERS.includes(initialFilter as FilterTab)) {
      setActiveFilter(initialFilter as FilterTab);
    }
  }, [initialFilter]);

  // ── Derived Lists ────────────────────────────────────────────────────────────

  const pendingRequests = appointments.filter((a) => {
    if (activeFilter === 'Pending') return a.status === 'Pending';
    if (activeFilter === 'Today') return a.status === 'Pending' && isToday(a.date);
    return false;
  });

  const scheduleList = appointments.filter((a) => {
    if (activeFilter === 'Today') return isToday(a.date) && a.status !== 'Cancelled';
    if (activeFilter === 'Upcoming') return ['Confirmed', 'Waiting_for_call', 'In_consultation'].includes(a.status);
    if (activeFilter === 'Online') return a.type === 'Online' && a.status !== 'Cancelled';
    if (activeFilter === 'In-person') return a.type === 'In_person' && a.status !== 'Cancelled';
    return false;
  });

  const showRequests = activeFilter === 'Today' || activeFilter === 'Pending';
  const showTimeline = activeFilter !== 'Pending';

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFilter === filter
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* ── Content Grid ── */}
      <div className={`grid gap-5 ${showTimeline && showRequests ? 'lg:grid-cols-[1fr_340px]' : 'grid-cols-1'}`}>

        {/* Left Column — Requests or Schedule */}
        <div className="space-y-5">

          {/* Pending Requests Section */}
          {showRequests && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-800">
                  {activeFilter === 'Pending' ? 'All Pending Requests' : 'New Requests Today'}
                </h2>
                {pendingRequests.length > 0 && (
                  <span className="text-xs font-semibold bg-rose-100 text-rose-700 rounded-full px-2.5 py-1">
                    {pendingRequests.length}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <DoctorRequestCard
                      key={req.id}
                      appointment={req}
                      onAccept={onAccept}
                      onDecline={onDecline}
                      disabled={actionLoading}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Upcoming / Filtered Schedule List */}
          {activeFilter === 'Upcoming' && (
            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-3">Future Appointments</h2>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
              ) : scheduleList.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-sm text-slate-500">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduleList.map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{appt.patientName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {appt.type === 'Online' ? '📹 Video' : '🏥 In-person'} &bull; {appt.date} at {appt.timeSlot}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(appt.status === 'Approved' || appt.status === 'Confirmed') && onStartConsultation && (
                          <button
                            onClick={() => onStartConsultation(appt)}
                            className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                          >
                            Consult
                          </button>
                        )}
                        {(appt.status === 'Confirmed' || appt.status === 'In_consultation') && onComplete && (
                          <button
                            onClick={() => onComplete(appt)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        <span className="text-xs font-medium bg-teal-50 text-teal-700 rounded-full px-3 py-1 flex-shrink-0">
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column — Timeline */}
        {showTimeline && activeFilter !== 'Upcoming' && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-800">{activeFilter} Schedule</h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                      <div className="h-3 flex-1 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <DoctorScheduleTimeline appointments={scheduleList} />
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
