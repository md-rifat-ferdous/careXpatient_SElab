import React from 'react';
import StatusBadge from './StatusBadge';

const PRIORITY_BADGE = {
  Urgent: 'bg-red-50 text-red-600 border border-red-100',
  Normal: 'bg-slate-100 text-slate-500 border border-slate-200',
};

/**
 * TestQueueRow — handles steps 0, 1, 2 only.
 *
 * Step 1 (New Request)  → Accept + Reject buttons
 * Step 2 (Accepted)     → Read-only "Accepted" chip + Details
 * Step 0 (Rejected)     → Red "Rejected" chip + rejection reason tooltip + Details
 */
export default function TestQueueRow({ order, onDetails, onAccept, onReject, onRestore, updatingId }) {
  const currentStep = order.demo_step ?? 1;
  const isUpdating = updatingId === order.id;

  return (
    <tr className="hover:bg-primary-container/5 transition-colors">

      {/* Request ID */}
      <td className="px-6 py-5 font-bold text-sm text-on-surface">
        #{String(order.id).padStart(4, '0')}
      </td>

      {/* Patient Name & Tests */}
      <td className="px-6 py-5">
        <p className="font-bold text-on-surface">{order.patient_name}</p>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
          {(order.test_names || []).join(', ') || '—'}
        </p>
        {/* Rejection reason inline (step 0) */}
        {currentStep === 0 && order.rejection_reason && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="material-symbols-outlined text-[13px] text-red-500">info</span>
            <p className="text-[11px] text-red-600 font-semibold">{order.rejection_reason}</p>
          </div>
        )}
      </td>

      {/* Collection Type */}
      <td className="px-6 py-5 text-sm">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">
            {order.home_collection ? 'home' : 'medical_services'}
          </span>
          {order.home_collection ? 'Home Collection' : 'Lab Visit'}
        </div>
      </td>

      {/* Created At */}
      <td className="px-6 py-5 text-sm text-on-surface-variant">
        {new Date(order.created_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}
      </td>

      {/* Priority */}
      <td className="px-6 py-5">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${order.home_collection ? PRIORITY_BADGE.Urgent : PRIORITY_BADGE.Normal}`}>
          {order.home_collection ? 'Urgent' : 'Normal'}
        </span>
      </td>

      {/* Status Badge */}
      <td className="px-6 py-5">
        <StatusBadge demoStep={currentStep} />
      </td>

      {/* Actions */}
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">

          {/* Step 1 — New Request: Accept + Reject */}
          {currentStep === 1 && (
            <>
              <button
                onClick={() => onReject && onReject(order)}
                disabled={isUpdating}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                Reject
              </button>
              <button
                onClick={() => onAccept && onAccept(order.id)}
                disabled={isUpdating}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary-container text-white hover:bg-primary transition-colors disabled:opacity-60"
              >
                {isUpdating ? '...' : 'Accept'}
              </button>
            </>
          )}

          {/* Step 2 — Accepted: read-only chip */}
          {currentStep === 2 && (
            <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              ✓ Accepted
            </span>
          )}

          {/* Step 0 — Rejected: View Reason + Restore */}
          {currentStep === 0 && (
            <>
              <button
                onClick={() => onDetails && onDetails(order)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition-colors"
              >
                View Reason
              </button>
              <button
                onClick={() => onRestore && onRestore(order.id)}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg border border-teal-200 transition-colors disabled:opacity-60"
              >
                {isUpdating ? '...' : 'Restore'}
              </button>
            </>
          )}

          {/* Details always visible */}
          <button
            onClick={() => onDetails && onDetails(order)}
            className="px-3 py-1.5 bg-background-off-white text-on-surface-variant text-xs font-bold rounded-lg border border-outline-variant hover:bg-outline-variant/40 transition-colors"
          >
            Details
          </button>
        </div>
      </td>
    </tr>
  );
}
