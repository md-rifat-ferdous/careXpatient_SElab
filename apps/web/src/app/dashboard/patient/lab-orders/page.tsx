"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { getSocket, joinOrderRoom } from '@/lib/socket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TABS = ['All', 'Active', 'Completed', 'Rejected'] as const;

const STATUS_COLORS: Record<string, string> = {
  Requested: 'bg-amber-100 text-amber-700',
  AcceptedByLab: 'bg-blue-100 text-blue-700',
  SampleCollected: 'bg-violet-100 text-violet-700',
  Processing: 'bg-purple-100 text-purple-700',
  Reported: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
};

const STATUS_LABELS: Record<string, string> = {
  Requested: 'Requested',
  AcceptedByLab: 'Accepted',
  SampleCollected: 'Sample Collected',
  Processing: 'Processing',
  Reported: 'Completed',
  Cancelled: 'Cancelled',
};

interface LabOrderItem {
  id: string;
  labTestId: string;
  price: number;
  labTest: { id: string; name: string; lab: { id: string; name: string } };
}

interface LabOrderRejection {
  reason: string;
  note: string | null;
}

interface LabOrder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  rejection: LabOrderRejection | null;
  items: LabOrderItem[];
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse space-y-4">
      <div className="h-5 w-48 bg-slate-100 rounded" />
      <div className="h-4 w-32 bg-slate-100 rounded" />
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-slate-100 rounded" />
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

export default function LabOrdersPage() {
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');

  const socket = token ? getSocket(token) : null;

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/orders?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data: LabOrder[] = await res.json();
      setOrders(data);
    } catch {
      setError('Could not load lab orders.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Join order rooms and listen for socket events
  useEffect(() => {
    if (!socket || orders.length === 0) return;

    for (const order of orders) {
      joinOrderRoom(order.id, token!);
    }

    const handler = (data: { orderId: string; status: string }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === data.orderId ? { ...o, status: data.status } : o
        )
      );
    };

    socket.on('laborder:status', handler);
    return () => { socket.off('laborder:status', handler); };
  }, [socket, orders.length, token]);

  // Prevent infinite loop - only run socket effect when orders load changes from empty
  // Use a ref to track initial load
  const initialLoadDone = React.useRef(false);
  useEffect(() => {
    if (orders.length > 0 && !initialLoadDone.current) {
      initialLoadDone.current = true;
    }
  }, [orders.length]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'Active') return ['Requested', 'AcceptedByLab', 'SampleCollected', 'Processing'].includes(o.status);
    if (activeTab === 'Completed') return o.status === 'Reported';
    if (activeTab === 'Rejected') return o.status === 'Cancelled';
    return true;
  });

  const tabCounts: Record<string, number> = {
    All: orders.length,
    Active: orders.filter((o) => ['Requested', 'AcceptedByLab', 'SampleCollected', 'Processing'].includes(o.status)).length,
    Completed: orders.filter((o) => o.status === 'Reported').length,
    Rejected: orders.filter((o) => o.status === 'Cancelled').length,
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Lab Orders</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading...' : `${orders.length} total orders`}
          </p>
        </div>
        <Link
          href="/dashboard/patient/lab-tests"
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Book New Tests
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-teal-500 text-white shadow-md shadow-teal-100'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300'
            }`}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span className={`ml-2 text-xs ${activeTab === tab ? 'text-white/80' : 'text-slate-400'}`}>
                ({tabCounts[tab]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800">No orders found</h3>
          <p className="text-slate-400 font-bold max-w-xs mt-1">
            {activeTab === 'All' ? 'You haven\'t placed any lab orders yet.' : `No orders match this filter.`}
          </p>
          <Link href="/dashboard/patient/lab-tests" className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all">
            Book Lab Tests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🧪</span>
                    <p className="font-bold text-slate-800 truncate">
                      {order.items.map((i) => i.labTest.name).join(', ')}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-teal-600 font-semibold mb-2">
                    {order.items[0]?.labTest.lab.name || 'Lab'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      ৳{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {order.status === 'Cancelled' && order.rejection && (
                    <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-rose-700">Rejected: {order.rejection.reason}</p>
                      {order.rejection.note && (
                        <p className="text-xs text-rose-600 mt-0.5">{order.rejection.note}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {order.status === 'Reported' && (
                    <Link
                      href={`/dashboard/patient/reports`}
                      className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      View Report
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
