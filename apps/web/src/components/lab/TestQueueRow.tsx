'use client';
import React from 'react';
import StatusBadge from './StatusBadge';

interface Order {
  id: string;
  patientName: string;
  patientPhone: string;
  status: string;
  demoStep: number;
  assignedStaff: string | null;
  tests: { name: string }[];
  totalAmount: number;
  createdAt: string;
  rejection: { reason: string; note: string | null } | null;
}

interface TestQueueRowProps {
  order: Order;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDetails: (order: Order) => void;
  onRestore: (id: string) => void;
  updating: boolean;
}

export default function TestQueueRow({ order, onAccept, onReject, onDetails, onRestore, updating }: TestQueueRowProps) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-slate-900">{order.patientName}</p>
        <p className="text-xs text-slate-500">{order.patientPhone}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-slate-700">{order.tests.map(t => t.name).join(', ')}</p>
      </td>
      <td className="px-4 py-3"><StatusBadge status={order.status} demoStep={order.demoStep} /></td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-slate-900">৳{order.totalAmount}</p>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {order.demoStep === 1 && (
            <button
              onClick={() => onAccept(order.id)}
              disabled={updating}
              className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors"
            >
              Accept
            </button>
          )}
          {order.demoStep <= 1 && order.demoStep !== 0 && (
            <button
              onClick={() => onReject(order.id)}
              disabled={updating}
              className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-200 disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
          )}
          <button
            onClick={() => onDetails(order)}
            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Details
          </button>
          {order.demoStep === 0 && (
            <button
              onClick={() => onRestore(order.id)}
              disabled={updating}
              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-200 disabled:opacity-50 transition-colors"
            >
              Restore
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
