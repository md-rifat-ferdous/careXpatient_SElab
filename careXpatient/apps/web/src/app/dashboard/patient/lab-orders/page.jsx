"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STATUS_CONFIG = {
  Requested: { label: 'Requested', color: 'bg-amber-50 text-amber-700 border border-amber-200', step: 0 },
  AcceptedByLab: { label: 'Accepted by Lab', color: 'bg-sky-50 text-sky-700 border border-sky-200', step: 1 },
  SampleCollected: { label: 'Sample Collected', color: 'bg-blue-50 text-blue-700 border border-blue-200', step: 2 },
  Processing: { label: 'Processing', color: 'bg-violet-50 text-violet-700 border border-violet-200', step: 3 },
  Reported: { label: 'Reported', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', step: 4 },
  Cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border border-rose-200', step: -1 }
};

const STEPS = ['Requested', 'AcceptedByLab', 'SampleCollected', 'Processing', 'Reported'];












function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-slate-100 text-slate-700 border border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>);

}

function ProgressTracker({ status }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  if (status === 'Cancelled') return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done ? 'bg-teal-500 border-teal-500 text-white' :
                active ? 'bg-white border-teal-500 text-teal-600' :
                'bg-white border-slate-200 text-slate-300'}`
                }>
                  {done ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] mt-1 font-semibold text-center w-16 leading-tight ${
                done || active ? 'text-teal-600' : 'text-slate-300'}`
                }>
                  {step === 'AcceptedByLab' ? 'Accepted' :
                  step === 'SampleCollected' ? 'Sample' :
                  step}
                </span>
              </div>
              {idx < STEPS.length - 1 &&
              <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all ${done ? 'bg-teal-500' : 'bg-slate-200'}`} />
              }
            </React.Fragment>);

        })}
      </div>
    </div>);

}

function OrderCard({ order, onViewDetails }) {
  const totalCost = order.tests.reduce((sum, t) => sum + t.labTest.price, 0);
  const date = new Date(order.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-200/60 transition-all duration-200 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-teal-500 to-indigo-500" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order #{order.id.slice(-6)}</p>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">
              {order.tests.length === 1 ?
              order.tests[0].labTest.name :
              `${order.tests[0].labTest.name} +${order.tests.length - 1} more`}
            </h3>
            {order.lab && <p className="text-xs text-slate-400 mt-0.5">{order.lab.name}</p>}
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {date}
          </span>
          {order.homeCollection &&
          <span className="flex items-center gap-1 text-teal-600 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home Collection
            </span>
          }
          <span className="ml-auto font-bold text-slate-700">৳ {totalCost.toFixed(2)}</span>
        </div>

        <ProgressTracker status={order.status} />

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => onViewDetails(order)}
            className="flex-1 py-2.5 bg-slate-50 hover:bg-teal-600 text-slate-700 hover:text-white text-sm font-bold rounded-xl transition-all">
            
            View Details
          </button>
          {order.result?.fileUrl &&
          <a
            href={order.result.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-emerald-100"
            title="Download Report">
            
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          }
        </div>
      </div>
    </div>);

}

function OrderDetailModal({ order, onClose }) {
  const totalCost = order.tests.reduce((sum, t) => sum + t.labTest.price, 0);
  const date = new Date(order.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 to-indigo-500" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
              <p className="text-sm text-slate-400">#{order.id.slice(-10)}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Lab info */}
            {order.lab &&
            <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Laboratory</p>
                <p className="font-bold text-slate-800">{order.lab.name}</p>
                {order.lab.address && <p className="text-sm text-slate-500 mt-0.5">{order.lab.address}</p>}
              </div>
            }

            {/* Collection type */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${order.homeCollection ? 'bg-teal-50' : 'bg-slate-50'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.homeCollection ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                {order.homeCollection ? '🏠' : '🏥'}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{order.homeCollection ? 'Home Collection' : 'Lab Visit'}</p>
                {order.homeCollection && order.collectionAddress &&
                <p className="text-xs text-slate-500 mt-0.5">{order.collectionAddress}</p>
                }
              </div>
            </div>

            {/* Tests list */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tests Ordered ({order.tests.length})</p>
              <div className="space-y-2">
                {order.tests.map((t, i) =>
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.labTest.name}</p>
                      {t.labTest.sampleType && <p className="text-xs text-slate-400">{t.labTest.sampleType}</p>}
                    </div>
                    <span className="font-bold text-teal-600 text-sm">৳ {t.labTest.price}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Result summary */}
            {order.result?.resultSummary &&
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Result Summary</p>
                <p className="text-sm text-slate-700">{order.result.resultSummary}</p>
              </div>
            }

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400">Ordered on {date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900">৳ {totalCost.toFixed(2)}</p>
              </div>
            </div>

            {/* Download report */}
            {order.result?.fileUrl &&
            <a
              href={order.result.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all">
              
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Report PDF
              </a>
            }
          </div>
        </div>
      </div>
    </div>);

}

const STATUS_TABS = ['All', 'Requested', 'AcceptedByLab', 'Processing', 'Reported', 'Cancelled'];

export default function LabOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 9;

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ patientId: user.id, page: String(page), limit: String(LIMIT) });
      if (statusFilter !== 'All') params.set('status', statusFilter);
      const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const json = await res.json();
      setOrders(json.data ?? json ?? []);
      setTotal(json.total ?? (json.data ?? json ?? []).length);
    } catch {
      setError('Could not load lab orders. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, statusFilter, page]);

  useEffect(() => {fetchOrders();}, [fetchOrders]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Lab Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Track your test orders, status updates, and download results.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm">
          {STATUS_TABS.map((s) =>
          <button
            key={s}
            onClick={() => {setStatusFilter(s);setPage(1);}}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            statusFilter === s ? 'bg-teal-500 text-white shadow-md shadow-teal-200' : 'text-slate-500 hover:text-teal-600'}`
            }>
            
              {s === 'AcceptedByLab' ? 'Accepted' : s}
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
        { label: 'Total Orders', value: total, icon: '🧪', color: 'bg-teal-50 text-teal-600' },
        { label: 'Pending', value: orders.filter((o) => o.status === 'Requested').length, icon: '⏳', color: 'bg-amber-50 text-amber-600' },
        { label: 'Processing', value: orders.filter((o) => o.status === 'Processing' || o.status === 'SampleCollected').length, icon: '🔬', color: 'bg-violet-50 text-violet-600' },
        { label: 'Reported', value: orders.filter((o) => o.status === 'Reported').length, icon: '✅', color: 'bg-emerald-50 text-emerald-600' }].
        map((stat) =>
        <div key={stat.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error &&
      <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-5 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-bold text-sm">Could not load orders</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button onClick={fetchOrders} className="ml-auto px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700">Retry</button>
        </div>
      }

      {/* Skeleton */}
      {loading &&
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) =>
        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-5 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
              <div className="h-6 bg-slate-100 rounded-full w-24 mb-4" />
              <div className="h-10 bg-slate-100 rounded-xl mt-4" />
            </div>
        )}
        </div>
      }

      {/* Empty state */}
      {!loading && !error && orders.length === 0 &&
      <div className="bg-white border border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-4xl mb-4">🧪</div>
          <h2 className="text-xl font-bold text-slate-800">No Orders Found</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            {statusFilter !== 'All' ? `No orders with status "${statusFilter}"` : "You haven't placed any lab test orders yet. Book a test from the Lab Tests section."}
          </p>
        </div>
      }

      {/* Orders grid */}
      {!loading && !error && orders.length > 0 &&
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) =>
        <OrderCard key={order.id} order={order} onViewDetails={setSelectedOrder} />
        )}
        </div>
      }

      {/* Pagination */}
      {!loading && totalPages > 1 &&
      <div className="flex justify-center items-center gap-2 pt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
        className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-teal-600 hover:text-white hover:border-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
        <button key={p} onClick={() => setPage(p)}
        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${p === page ? 'bg-teal-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-teal-50'}`}>
              {p}
            </button>
        )}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
        className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-teal-600 hover:text-white hover:border-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      }

      {/* Detail modal */}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>);

}