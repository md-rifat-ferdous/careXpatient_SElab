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
  homeCollection: boolean | null;
  collectionAddress: string | null;
  createdAt: string;
}

interface SampleCollectionRowProps {
  order: Order;
  onAdvance: (id: string) => void;
  onAssign: (id: string) => void;
  onDetails: (order: Order) => void;
  updating: boolean;
}

export default function SampleCollectionRow({ order, onAdvance, onAssign, onDetails, updating }: SampleCollectionRowProps) {
  const getNextAction = () => {
    switch (order.demoStep) {
      case 3: return { label: 'Mark Arrived', color: 'bg-blue-500 hover:bg-blue-600' };
      case 4: return { label: 'Collect Sample', color: 'bg-indigo-500 hover:bg-indigo-600' };
      case 5: return { label: 'Start Processing', color: 'bg-violet-500 hover:bg-violet-600' };
      case 6: return { label: 'Ready for Report', color: 'bg-cyan-500 hover:bg-cyan-600' };
      default: return null;
    }
  };

  const nextAction = getNextAction();

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
        {order.homeCollection ? (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Home</span>
        ) : (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">In-Lab</span>
        )}
      </td>
      <td className="px-4 py-3">
        {order.assignedStaff ? (
          <span className="text-xs text-slate-600">{order.assignedStaff}</span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {nextAction && (
            <button
              onClick={() => onAdvance(order.id)}
              disabled={updating}
              className={`px-3 py-1.5 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors ${nextAction.color}`}
            >
              {nextAction.label}
            </button>
          )}
          {!order.assignedStaff && (
            <button
              onClick={() => onAssign(order.id)}
              disabled={updating}
              className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200 disabled:opacity-50 transition-colors"
            >
              Assign
            </button>
          )}
          <button
            onClick={() => onDetails(order)}
            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Details
          </button>
        </div>
      </td>
    </tr>
  );
}
