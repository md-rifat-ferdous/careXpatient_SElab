'use client';
import React from 'react';

interface Order {
  id: string;
  patientName: string;
  patientPhone: string;
  status: string;
  demoStep: number;
  assignedStaff: string | null;
  tests: { id: string; name: string; price: number }[];
  subtotal: number;
  vat: number;
  homeCollectionFee: number;
  totalAmount: number;
  homeCollection: boolean | null;
  collectionAddress: string | null;
  createdAt: string;
}

interface DetailsModalProps {
  order: Order;
  module: string;
  onClose: () => void;
  onAdvance: (id: string) => void;
  onAssignStaff: (id: string) => void;
  onReject: (id: string) => void;
  onRestore: (id: string) => void;
}

const STEP_LABELS = ['Rejected', 'New Request', 'Accepted', 'Sample Pending', 'Sample Collected', 'Processing', 'Ready for Report', 'Report Writing', 'Report Verified', 'Completed'];

export default function DetailsModal({ order, module, onClose, onAdvance, onAssignStaff, onReject, onRestore }: DetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Order #{order.id}</h2>
            <p className="text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Patient Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-xs text-slate-500">Name</span><p className="text-sm font-medium text-slate-900">{order.patientName}</p></div>
              <div><span className="text-xs text-slate-500">Phone</span><p className="text-sm font-medium text-slate-900">{order.patientPhone}</p></div>
              {order.homeCollection && <div className="col-span-2"><span className="text-xs text-slate-500">Collection Address</span><p className="text-sm font-medium text-slate-900">{order.collectionAddress || 'N/A'}</p></div>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Order Timeline</h3>
            <div className="flex items-center gap-1.5">
              {STEP_LABELS.map((label, i) => {
                const isActive = i <= order.demoStep;
                const isCurrent = i === order.demoStep;
                return (
                  <div key={i} className="flex-1 relative group">
                    <div className={`h-2 rounded-full transition-all ${isActive ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    {isCurrent && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow" />}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-xs px-2 py-1 rounded-lg pointer-events-none z-10">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2">Step {order.demoStep}/9 — {STEP_LABELS[order.demoStep]}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tests</h3>
            <div className="space-y-2">
              {order.tests.map(test => (
                <div key={test.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-4 py-2.5">
                  <span className="text-sm font-medium text-slate-900">{test.name}</span>
                  <span className="text-sm text-slate-500">৳{test.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-700">৳{order.subtotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">VAT (5%)</span><span className="text-slate-700">৳{order.vat}</span></div>
              {order.homeCollectionFee > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Home Collection</span><span className="text-slate-700">৳{order.homeCollectionFee}</span></div>}
              <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2"><span className="text-slate-900">Total</span><span className="text-teal-700">৳{order.totalAmount}</span></div>
            </div>
          </div>

          {order.assignedStaff && (
            <div className="bg-indigo-50 rounded-xl p-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm text-indigo-900">Assigned to: <strong>{order.assignedStaff}</strong></span>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            {module === 'testqueue' && order.demoStep < 9 && (
              <button onClick={() => onAdvance(order.id)} className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors">Advance Step</button>
            )}
            {order.demoStep < 3 && (
              <button onClick={() => onAssignStaff(order.id)} className="flex-1 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors">Assign Staff</button>
            )}
            {order.demoStep <= 1 && (
              <button onClick={() => onReject(order.id)} className="px-4 py-2.5 bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold hover:bg-rose-200 transition-colors">Reject</button>
            )}
            {order.demoStep === 0 && (
              <button onClick={() => onRestore(order.id)} className="px-4 py-2.5 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-200 transition-colors">Restore</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
