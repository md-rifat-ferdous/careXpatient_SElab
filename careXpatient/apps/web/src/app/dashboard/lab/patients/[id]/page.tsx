'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  getPatientHistory,
  type PatientHistoryResponse,
  type PatientOrder,
} from '@/services/lab.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Requested:       'bg-amber-50 text-amber-700 border-amber-200',
    AcceptedByLab:   'bg-sky-50 text-sky-700 border-sky-200',
    SampleCollected: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Processing:      'bg-violet-50 text-violet-700 border-violet-200',
    Reported:        'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled:       'bg-red-50 text-red-600 border-red-200',
  };
  const label: Record<string, string> = {
    Requested:       'Requested',
    AcceptedByLab:   'Accepted',
    SampleCollected: 'Sample Collected',
    Processing:      'Processing',
    Reported:        'Reported',
    Cancelled:       'Cancelled',
  };
  const cls = map[status] ?? 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label[status] ?? status}
    </span>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (url) {
    return <img src={url} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />;
  }
  const colors = ['bg-teal-500', 'bg-violet-500', 'bg-sky-500', 'bg-rose-500', 'bg-amber-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center border-2 border-white shadow`}>
      <span className="text-white text-xl font-bold">{initials}</span>
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: PatientOrder }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Order header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-400">Order #{order.id}</p>
            <p className="text-sm font-semibold text-slate-800">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Tests */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tests Ordered</p>
        <div className="flex flex-wrap gap-2">
          {order.tests.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Reports section */}
      <div className="px-5 pb-4 border-t border-slate-50 pt-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Uploaded Reports</p>

        {order.labResults.length === 0 ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-700 font-medium">Report is not uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {order.labResults.map((r) => (
              <div
                key={r.id}
                className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-emerald-800">Report Uploaded</p>
                    </div>
                    {r.resultSummary && (
                      <p className="text-xs text-emerald-700 mt-1 whitespace-pre-line leading-relaxed">
                        {r.resultSummary}
                      </p>
                    )}
                    <p className="text-xs text-emerald-600 mt-1.5">
                      Uploaded {formatDate(r.uploadedAt)}
                      {r.uploadedBy ? ` by ${r.uploadedBy}` : ''}
                    </p>
                  </div>
                  {r.fileUrl && (
                    <a
                      href={r.fileUrl}
                      download={`report-${order.id}.${r.fileUrl.startsWith('data:application/pdf') ? 'pdf' : 'jpg'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`download-report-${r.id}`}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PatientHistoryPage() {
  const params  = useParams<{ id: string }>();
  const router  = useRouter();
  const { token } = useAuthStore();

  const [data,    setData]    = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!token || !params.id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPatientHistory(token, params.id);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load patient history');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, params.id]);

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg mb-6" />
        <div className="bg-white rounded-2xl h-36 mb-6" />
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-48" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-700 font-semibold mb-2">Error loading history</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-teal-600 text-sm font-medium hover:underline">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { patient, orders } = data;
  const reportedCount = orders.filter((o) => o.hasReport).length;

  return (
    <div className="min-h-full bg-slate-50">
      {/* ── Header band ── */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 pt-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <button
            id="back-btn"
            onClick={() => router.push('/dashboard/lab/patients')}
            className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white text-sm font-medium mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Patients
          </button>
          <p className="text-teal-100 text-sm font-medium">Patient History</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">{patient.fullName}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10 pb-10 space-y-5">
        {/* ── Patient card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-5">
          <Avatar name={patient.fullName} url={patient.profilePhotoUrl} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800">{patient.fullName}</h2>
            <p className="text-slate-500 text-sm">{patient.phone}</p>
            {patient.email && <p className="text-slate-400 text-xs">{patient.email}</p>}
          </div>
          <div className="hidden sm:flex flex-col gap-2 text-right shrink-0">
            {patient.bloodGroup && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Blood Group</p>
                <span className="inline-block px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold">
                  {patient.bloodGroup}
                </span>
              </div>
            )}
            {patient.dateOfBirth && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Date of Birth</p>
                <p className="text-sm text-slate-700">
                  {new Date(patient.dateOfBirth).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Orders', value: orders.length, color: 'text-teal-600 bg-teal-50' },
            { label: 'Reports Uploaded', value: reportedCount, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Pending Reports', value: orders.length - reportedCount, color: 'text-amber-600 bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 text-center">
              <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Orders ── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Previous Tests ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-10 text-center text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium text-slate-500">No test orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
